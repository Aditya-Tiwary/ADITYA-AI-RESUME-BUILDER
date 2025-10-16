const express = require('express');
const Resume = require('../database/models/Resume');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { checkDatabaseConnection } = require('../middleware/database');
const router = express.Router();

router.use(checkDatabaseConnection);

router.get('/', authenticateToken, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ lastModified: -1 })
      .select('-__v');
    
    res.json({ resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).select('-__v');
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({ resume });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

router.post('/save', authenticateToken, async (req, res) => {
  try {
    console.log('=== RESUME SAVE DEBUG START ===');
    console.log('Save request received - User:', req.user?.username, 'ID:', req.user?._id);
    console.log('Save request body keys:', Object.keys(req.body));
    console.log('Save request body size:', JSON.stringify(req.body).length);
    
    const { resumeData, title, template, theme } = req.body;

    if (!resumeData) {
      console.log('Save failed - No resume data provided');
      return res.status(400).json({ error: 'Resume data is required' });
    }

    const resumeTitle = title || 'My Resume';
    const existingResume = await Resume.findOne({ 
      userId: req.user._id, 
      title: resumeTitle 
    });
    
    if (existingResume) {
      console.log('Save failed - Title already exists:', resumeTitle);
      return res.status(400).json({ 
        error: 'Resume title already exists' 
      });
    }

    console.log('Resume data structure received:');
    console.log('- Personal info:', { 
      name: resumeData.name, 
      role: resumeData.role, 
      email: resumeData.email 
    });
    console.log('- Experience count:', resumeData.experience?.length || 0);
    console.log('- Education count:', resumeData.education?.length || 0);
    console.log('- Skills type:', Array.isArray(resumeData.skills) ? 'array' : typeof resumeData.skills);
    console.log('- Achievements count:', resumeData.achievements?.length || 0);
    
    if (resumeData.experience?.length > 0) {
      console.log('First experience item keys:', Object.keys(resumeData.experience[0]));
    }
    if (resumeData.skills && Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
      console.log('First skill group:', resumeData.skills[0]);
    }

    const mappedExperience = (resumeData.experience || []).map(exp => ({
      title: exp.title || '',
      company: exp.companyName || '',
      location: exp.companyLocation || exp.location || '',
      startDate: exp.startDate || (exp.date ? exp.date.split(' - ')[0] : ''),
      endDate: exp.endDate || (exp.date ? exp.date.split(' - ')[1] : ''),
      description: exp.accomplishment || exp.description || ''
    }));

    const mappedEducation = (resumeData.education || []).map(edu => ({
      degree: edu.degree || '',
      institution: edu.institution || edu.school || '',
      location: edu.location || '',
      duration: edu.duration || ''
    }));

    let mappedSkills = {
      technical: []
    };

    if (resumeData.skills) {
      if (Array.isArray(resumeData.skills)) {
        mappedSkills.technical = resumeData.skills.map(skillGroup => ({
          category: skillGroup.category || '',
          items: skillGroup.items || []
        }));
      } else if (typeof resumeData.skills === 'object' && resumeData.skills.technical) {
        mappedSkills.technical = resumeData.skills.technical || [];
      }
    }

    const mappedAchievements = (resumeData.achievements || []).map(achievement => {
      if (typeof achievement === 'string') {
        return {
          keyAchievements: achievement,
          describe: ''
        };
      } else if (typeof achievement === 'object') {
        return {
          keyAchievements: achievement.keyAchievements || achievement.title || '',
          describe: achievement.describe || achievement.description || ''
        };
      }
      return {
        keyAchievements: '',
        describe: ''
      };
    });

    const mappedLanguages = (resumeData.languages || []).map(language => {
      if (typeof language === 'string') {
        return language;
      } else if (typeof language === 'object' && language.name) {
        if (language.level) {
          return `${language.name} (${language.level})`;
        }
        return language.name;
      }
      return '';
    }).filter(lang => lang.trim() !== '');

    console.log('Creating resume with mapped data:');
    console.log('- Mapped experience:', JSON.stringify(mappedExperience, null, 2));
    console.log('- Mapped skills:', JSON.stringify(mappedSkills, null, 2));
    console.log('- Mapped achievements:', JSON.stringify(mappedAchievements, null, 2));
    console.log('- Mapped languages:', JSON.stringify(mappedLanguages, null, 2));
    
    const resume = new Resume({
      userId: req.user._id,
      title: title || 'My Resume',
      template: template || 'template1',
      theme: theme || 'blue',
      name: resumeData.name || '',
      role: resumeData.role || '',
      email: resumeData.email || '',
      phone: resumeData.phone || '',
      location: resumeData.location || '',
      linkedin: resumeData.linkedin || '',
      summary: resumeData.summary || '',
      experience: mappedExperience,
      education: mappedEducation,
      skills: mappedSkills,
      achievements: mappedAchievements,
      languages: mappedLanguages
    });

    console.log('Attempting to save resume to database...');
    const savedResume = await resume.save();
    console.log('✅ Resume saved successfully with ID:', savedResume._id);

    res.status(201).json({
      message: 'Resume saved successfully',
      resume: resume.toObject()
    });

  } catch (error) {
    console.error('=== RESUME SAVE ERROR ===');
    console.error('Save resume error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
        value: error.errors[key].value
      }));
      console.error('Detailed validation errors:', validationErrors);
      
      const errorFields = validationErrors.map(err => `${err.field}: ${err.message}`).join(', ');
      return res.status(400).json({ 
        error: `Validation failed: ${errorFields}`,
        details: validationErrors 
      });
    }
    
    if (error.code === 11000) {
      console.error('Duplicate key error - likely duplicate resume');
      return res.status(409).json({ error: 'Duplicate resume found' });
    }
    
    if (error.name === 'CastError') {
      console.error('Cast error - data type mismatch:', error.path, error.value);
      return res.status(400).json({ 
        error: `Invalid data type for field: ${error.path}` 
      });
    }
    
    console.error('=== END RESUME SAVE ERROR ===');
    res.status(500).json({ error: 'Failed to save resume' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { resumeData, title, template, theme } = req.body;
    const resumeId = req.params.id;

    const resume = await Resume.findOne({ 
      _id: resumeId, 
      userId: req.user._id 
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (title !== undefined && title !== resume.title) {
      const existingResume = await Resume.findOne({ 
        userId: req.user._id, 
        title: title,
        _id: { $ne: resumeId }
      });
      
      if (existingResume) {
        return res.status(400).json({ 
          error: 'A resume with this title already exists. Please choose a different title.' 
        });
      }
    }

    if (title !== undefined) resume.title = title;
    if (template !== undefined) resume.template = template;
    if (theme !== undefined) resume.theme = theme;
    
    if (resumeData) {
      if (resumeData.name !== undefined) resume.name = resumeData.name;
      if (resumeData.role !== undefined) resume.role = resumeData.role;
      if (resumeData.email !== undefined) resume.email = resumeData.email;
      if (resumeData.phone !== undefined) resume.phone = resumeData.phone;
      if (resumeData.location !== undefined) resume.location = resumeData.location;
      if (resumeData.linkedin !== undefined) resume.linkedin = resumeData.linkedin;
      
      if (resumeData.summary !== undefined) resume.summary = resumeData.summary;
      
      if (resumeData.experience !== undefined) {
        resume.experience = resumeData.experience.map(exp => ({
          title: exp.title || '',
          company: exp.companyName || exp.company || '',
          location: exp.companyLocation || exp.location || '',
          startDate: exp.startDate || (exp.date ? exp.date.split(' - ')[0] : ''),
          endDate: exp.endDate || (exp.date ? exp.date.split(' - ')[1] : ''),
          description: exp.accomplishment || exp.description || ''
        }));
      }
      
      if (resumeData.education !== undefined) {
        resume.education = resumeData.education.map(edu => ({
          degree: edu.degree || '',
          institution: edu.institution || edu.school || '',
          location: edu.location || '',
          duration: edu.duration || ''
        }));
      }
      
      if (resumeData.skills !== undefined) {
        let mappedSkills = {
          technical: []
        };

        if (Array.isArray(resumeData.skills)) {
          mappedSkills.technical = resumeData.skills.map(skillGroup => ({
            category: skillGroup.category || '',
            items: skillGroup.items || []
          }));
        } else if (typeof resumeData.skills === 'object' && resumeData.skills.technical) {
          mappedSkills.technical = resumeData.skills.technical || [];
        }
        
        resume.skills = mappedSkills;
      }
      

      
      if (resumeData.achievements !== undefined) {
        resume.achievements = resumeData.achievements.map(achievement => {
          if (typeof achievement === 'string') {
            return {
              keyAchievements: achievement,
              describe: ''
            };
          } else if (typeof achievement === 'object') {
            return {
              keyAchievements: achievement.keyAchievements || achievement.title || '',
              describe: achievement.describe || achievement.description || ''
            };
          }
          return {
            keyAchievements: '',
            describe: ''
          };
        });
      }
      
      if (resumeData.languages !== undefined) {
        resume.languages = resumeData.languages.map(language => {
          if (typeof language === 'string') {
            return language;
          } else if (typeof language === 'object' && language.name) {
            if (language.level) {
              return `${language.name} (${language.level})`;
            }
            return language.name;
          }
          return '';
        }).filter(lang => lang.trim() !== '');
      }
    }

    await resume.save();

    res.json({
      message: 'Resume updated successfully',
      resume: resume.toObject()
    });

  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ message: 'Resume deleted successfully' });

  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const originalResume = await Resume.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!originalResume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    let copyTitle = `${originalResume.title} - Copy`;
    let counter = 1;
    
    while (await Resume.findOne({ userId: req.user._id, title: copyTitle })) {
      counter++;
      copyTitle = `${originalResume.title} - Copy (${counter})`;
    }

    const resumeCopy = new Resume({
      ...originalResume.toObject(),
      _id: undefined,
      title: copyTitle,
      createdAt: undefined,
      updatedAt: undefined,
      lastModified: new Date()
    });

    await resumeCopy.save();

    res.status(201).json({
      message: 'Resume duplicated successfully',
      resume: resumeCopy.toObject()
    });

  } catch (error) {
    console.error('Duplicate resume error:', error);
    res.status(500).json({ error: 'Failed to duplicate resume' });
  }
});

router.post('/auto-save', authenticateToken, async (req, res) => {
  try {
    const { resumeData, resumeId, title, template, theme } = req.body;

    let resume;

    if (resumeId) {
      resume = await Resume.findOne({ 
        _id: resumeId, 
        userId: req.user._id 
      });

      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }
    } else {
      const resumeTitle = title || 'Auto-saved Resume';
      
      const existingResume = await Resume.findOne({ 
        userId: req.user._id, 
        title: resumeTitle 
      });
      
      if (existingResume) {
        return res.status(400).json({ 
          error: 'A resume with this title already exists. Please choose a different title.' 
        });
      }
      
      resume = new Resume({
        userId: req.user._id,
        title: resumeTitle
      });
    }

    if (resumeData) {
      resume.name = resumeData.name || resume.name;
      resume.role = resumeData.role || resume.role;
      resume.email = resumeData.email || resume.email;
      resume.phone = resumeData.phone || resume.phone;
      resume.location = resumeData.location || resume.location;
      resume.linkedin = resumeData.linkedin || resume.linkedin;
      resume.summary = resumeData.summary || resume.summary;
      
      if (resumeData.experience) {
        resume.experience = resumeData.experience.map(exp => ({
          title: exp.title || '',
          company: exp.companyName || exp.company || '',
          location: exp.companyLocation || exp.location || '',
          startDate: exp.startDate || (exp.date ? exp.date.split(' - ')[0] : ''),
          endDate: exp.endDate || (exp.date ? exp.date.split(' - ')[1] : ''),
          description: exp.accomplishment || exp.description || ''
        }));
      }
      
      if (resumeData.education) {
        resume.education = resumeData.education.map(edu => ({
          degree: edu.degree || '',
          institution: edu.institution || edu.school || '',
          location: edu.location || '',
          duration: edu.duration || ''
        }));
      }
      
      if (resumeData.skills) {
        let mappedSkills = {
          technical: []
        };

        if (Array.isArray(resumeData.skills)) {
          mappedSkills.technical = resumeData.skills.map(skillGroup => ({
            category: skillGroup.category || '',
            items: skillGroup.items || []
          }));
        } else if (typeof resumeData.skills === 'object' && resumeData.skills.technical) {
          mappedSkills.technical = resumeData.skills.technical || [];
        }
        
        resume.skills = mappedSkills;
      }
      

      
      if (resumeData.achievements) {
        resume.achievements = resumeData.achievements.map(achievement => {
          if (typeof achievement === 'string') {
            return {
              keyAchievements: achievement,
              describe: ''
            };
          } else if (typeof achievement === 'object') {
            return {
              keyAchievements: achievement.keyAchievements || achievement.title || '',
              describe: achievement.describe || achievement.description || ''
            };
          }
          return {
            keyAchievements: '',
            describe: ''
          };
        });
      }
      
      if (resumeData.languages) {
        resume.languages = resumeData.languages.map(language => {
          if (typeof language === 'string') {
            return language;
          } else if (typeof language === 'object' && language.name) {
            if (language.level) {
              return `${language.name} (${language.level})`;
            }
            return language.name;
          }
          return '';
        }).filter(lang => lang.trim() !== '');
      }
      
      resume.template = template || resume.template;
      resume.theme = theme || resume.theme;
    }

    await resume.save();

    res.json({
      message: 'Resume auto-saved successfully',
      resumeId: resume._id,
      lastModified: resume.lastModified
    });

  } catch (error) {
    console.error('Auto-save resume error:', error);
    res.status(500).json({ error: 'Failed to auto-save resume' });
  }
});

router.get('/:id/ownership', authenticateToken, async (req, res) => {
  try {
    const resumeId = req.params.id;
    
    const resume = await Resume.findOne({ 
      _id: resumeId, 
      userId: req.user._id 
    });

    res.json({
      ownsResume: !!resume
    });

  } catch (error) {
    console.error('Ownership check error:', error);
    res.status(500).json({ error: 'Failed to check ownership' });
  }
});

module.exports = router;