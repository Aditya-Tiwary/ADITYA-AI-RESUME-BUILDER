
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { motion } from "framer-motion";
import Sidebar from "../Sidebar";
import useAIEnhancer from "../service";
import ContextMenu from "../components/ContextMenu";
import HamburgerMenu from "../components/HamburgerMenu";
import MobileAIModal from "../components/MobileAIModal";
import { useAuth } from "../context/AuthContext";
import Login from "../components/Login";
import Signup from "../components/Signup";
import { resumeService } from "../services/resumeService";
import { useLocation, Link } from "wouter";


const ResumeTemplate3 = () => {

  const createSafeOnBlur = (updateFunction) => (e) => {
    try {
      if (
        e &&
        e.currentTarget &&
        typeof e.currentTarget.textContent === "string"
      ) {
        updateFunction(e.currentTarget.textContent.trim());
      }
    } catch (error) {

      return;
    }
  };

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const [showResumeNameModal, setShowResumeNameModal] = useState(false);
  const [resumeNameInput, setResumeNameInput] = useState('');
  
  const [showMobileAIModal, setShowMobileAIModal] = useState(false);
  
  const handleMobileAIEnhancement = () => {
    setShowMobileAIModal(true);
  };
  
  const { user, isAuthenticated, logout } = useAuth();
  
  const [location, setLocation] = useLocation();
  
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  
  const [resumeTitle, setResumeTitle] = useState('');
  
  const [isSharedResume, setIsSharedResume] = useState(false);
  
  const [currentTheme, setCurrentTheme] = useState("blue");
  
  const getBackendThemeName = useCallback((template3Theme) => {
    const themeMapping = {
      'blue': 'blue',
      'purple': 'purple',
      'emerald': 'green',
      'rose': 'red'
    };
    return themeMapping[template3Theme] || 'blue';
  }, []);
  
  const getUserInitial = () => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      resumeId: params.get('resumeId')
    };
  };
  const attemptResumeLoadAfterLogin = () => {
    const { resumeId } = getQueryParams();
    console.log('Template3 - Attempting resume load after login:', resumeId);
    
    if (resumeId) {
      setIsLoadingResume(true);
      
      resumeService.getResume(resumeId)
        .then(resume => {
          console.log('Template3 - Resume data loaded after login:', resume);
          const mappedResumeData = {
            name: resume.name || '',
            role: resume.role || '',
            phone: resume.phone || '',
            email: resume.email || '',
            linkedin: resume.linkedin || '',
            location: resume.location || '',
            summary: resume.summary || '',
            experience: resume.experience?.map(exp => ({
              title: exp.title || '',
              companyName: exp.company || '',
              date: exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : '',
              companyLocation: exp.location || '',
              accomplishment: exp.description || exp.accomplishments || ''
            })) || [],
            education: resume.education?.map(edu => ({
              degree: edu.degree || '',
              institution: edu.institution || '',
              duration: edu.duration || (edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : ''),
              location: edu.location || ''
            })) || [],
            achievements: resume.achievements?.map(ach => ({
              keyAchievements: ach.keyAchievements || ach.title || '',
              describe: ach.describe || ach.description || ''
            })) || [],
            languages: resume.languages?.map(lang => {
              if (typeof lang === 'string') {
                const match = lang.match(/^(.+?)\s*\((.+)\)$/);
                if (match) {
                  const [, name, level] = match;
                  return {
                    name: name.trim(),
                    level: level.trim(),
                    dots: (() => {
                      const levelLower = level.trim().toLowerCase();
                      if (levelLower === 'native') return 5;
                      if (levelLower === 'advanced') return 4;
                      if (levelLower === 'intermediate') return 3;
                      if (levelLower === 'elementary') return 2;
                      if (levelLower === 'beginner') return 1;
                      if (levelLower === 'nativo' || levelLower === 'nativa') return 5;
                      if (levelLower === 'avanzado' || levelLower === 'avanzada') return 4;
                      if (levelLower === 'intermedio' || levelLower === 'intermedia') return 3;
                      if (levelLower === 'básico' || levelLower === 'básica') return 2;
                      if (levelLower === 'principiante') return 1;
                      if (levelLower === 'fluido' || levelLower === 'fluida' || levelLower === 'fluent') return 4;
                      if (levelLower === 'conversacional') return 3;
                      if (levelLower === 'competente') return 3;
                      return 1;
                    })()
                  };
                } else {
                  return {
                    name: lang,
                    level: 'Beginner',
                    dots: 1
                  };
                }
              } else if (typeof lang === 'object') {
                return {
                  name: lang.name || '',
                  level: lang.level || lang.proficiency || 'Beginner',
                  dots: lang.dots || (lang.proficiency === 'Native' ? 5 : 
                        lang.proficiency === 'Advanced' ? 4 : 
                        lang.proficiency === 'Intermediate' ? 3 : 
                        lang.proficiency === 'Elementary' ? 2 : 1)
                };
              } else {
                return {
                  name: '',
                  level: 'Beginner',
                  dots: 1
                };
              }
            }) || [],
            skills: (() => {
              if (Array.isArray(resume.skills)) {
                return resume.skills.map(skill => ({
                  category: skill.category || 'Skills',
                  items: Array.isArray(skill.items) ? skill.items : []
                }));
              } else if (resume.skills && resume.skills.technical && Array.isArray(resume.skills.technical)) {
                return resume.skills.technical.map(skill => ({
                  category: skill.category || 'Skills',
                  items: Array.isArray(skill.items) ? skill.items : []
                }));
              } else {
                return [{
                  category: 'Skills',
                  items: []
                }];
              }
            })()
          };
          
          console.log('Template3 - Setting mapped resume data after login:', mappedResumeData);
          setResumeData(mappedResumeData);
          setCurrentResumeId(resumeId);
        })
        .catch(error => {
          console.error('Template3 - Error loading resume after login:', error);
        })
        .finally(() => {
          setIsLoadingResume(false);
        });
    }
  };

  const [resumeData, setResumeData] = useState({
    name: "ADITYA",
    role: "Full Stack Developer | Tech Lead | Digital Innovation",
    phone: "+1 415-555-0199",
    email: "aditya@email.com",
    linkedin: "linkedin.com/in/aditya",
    location: "San Francisco, CA",
    summary:
      "Innovative Full Stack Developer with 6+ years of experience building scalable web applications and leading cross-functional teams. Proven track record of delivering high-impact solutions that drive business growth and user engagement. Expertise in modern technologies including React, Node.js, and cloud platforms.",
    experience: [
      {
        title: "Senior Full Stack Developer",
        companyName: "TechCorp Solutions",
        date: "2021 - Present",
        companyLocation: "San Francisco, CA",
        accomplishment:
          "• Architected and developed microservices handling 1M+ daily transactions with 99.9% uptime.\n" +
          "• Led a team of 8 developers in migrating legacy systems to modern cloud infrastructure.\n" +
          "• Implemented automated testing and CI/CD pipelines reducing deployment time by 80%.",
      },
      {
        title: "Frontend Developer",
        companyName: "StartupVenture",
        date: "2019 - 2021",
        companyLocation: "Palo Alto, CA",
        accomplishment:
          "• Built responsive web applications using React and TypeScript serving 500K+ users.\n" +
          "• Collaborated with UX/UI designers to implement pixel-perfect, accessible interfaces.\n" +
          "• Optimized application performance resulting in 40% faster load times and improved SEO.",
      },
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "Stanford University",
        duration: "2015 - 2019",
        location: "Stanford, CA",
      },
    ],
    achievements: [
      {
        keyAchievements: "Technical Leadership",
        describe:
          "Led the development of a real-time collaboration platform that increased team productivity by 45% and won the company's Innovation Award 2023.",
      },
      {
        keyAchievements: "Open Source Contributions",
        describe:
          "Contributed to 15+ open source projects with over 10K GitHub stars combined. Maintainer of a popular React component library with 50K+ weekly downloads.",
      },
    ],
    languages: [
      { name: "English", level: "Native", dots: 5 },
      { name: "Spanish", level: "Fluent", dots: 4 },
      { name: "French", level: "Intermediate", dots: 3 },
    ],
    skills: [
      {
        category: "Frontend Development",
        items: ["React", "TypeScript", "Vue", "Next"],
      },
      {
        category: "Backend Development",
        items: ["Node", "Python", "PostgreSQL", "MongoDB"],
      },
      {
        category: "DevOps & Cloud",
        items: ["Docker", "AWS", "Kubernetes", "CI/CD", "Git"],
      },
    ],

  });

  const [showButtons, setShowButtons] = useState(true);

  const [photo] = useState(null);

  const [branding, setBranding] = useState(true);

  const [showShareNotification, setShowShareNotification] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDownloadNotification, setShowDownloadNotification] = useState(false);
  const [hasSeenDownloadNotification, setHasSeenDownloadNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAIErrorPopup, setShowAIErrorPopup] = useState(false);
  const [showUploadErrorPopup, setShowUploadErrorPopup] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const resumeRef = useRef(null);

  useEffect(() => {
    window.aiModalOpenCallback = setAiModalOpen;
    return () => {
      window.aiModalOpenCallback = null;
    };
  }, []);


  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${resumeData.name} - Resume`,
          text: `Check out ${resumeData.name}'s professional resume - ${resumeData.role}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareNotification(true);
        setTimeout(() => setShowShareNotification(false), 3000);
      }
    } catch (error) {
      console.log("Share failed or was cancelled:", error);
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 3000);
    }
  }, [resumeData.name, resumeData.role]);

  const handleBrandingToggle = useCallback(() => {
    setBranding((prev) => !prev);
  }, []);

  const handleUploadResume = useCallback(() => {
    alert("Resume upload functionality would be implemented here");
  }, []);

  const handleColorPicker = useCallback(() => {
    setShowColorPicker((prev) => !prev);
  }, []);
  const handleSaveResume = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (currentResumeId && !isSharedResume) {
      const saveTitle = resumeTitle || 'My Resume';
      
      setIsLoading(true);
      
      try {
        const resumeDataForSave = {
          ...resumeData,
          skills: resumeData.skills
        };

        const response = await resumeService.updateResume(currentResumeId, resumeDataForSave, saveTitle, "template3", getBackendThemeName(currentTheme));
        
        setResumeTitle(saveTitle);
        
        const newUrl = `/templates/3?resumeId=${currentResumeId}`;
        setLocation(newUrl);
        
        setShowSaveNotification(true);
        setTimeout(() => setShowSaveNotification(false), 3000);
      } catch (error) {
        console.error('Error saving resume:', error);
        
        if (error.message.includes('Access denied') || error.message.includes('No token provided') || error.message.includes('Invalid token')) {
          alert('Your session has expired. Please log in again to save your resume.');
          setShowLoginModal(true);
        } else {
          alert(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      const defaultName = isSharedResume 
        ? `Copy of ${resumeTitle}` 
        : `${resumeData.name}'s Resume`;
      setResumeNameInput(defaultName);
      setShowResumeNameModal(true);
    }
  }, [resumeData, currentResumeId, isAuthenticated, resumeTitle, setLocation, currentTheme, getBackendThemeName, isSharedResume]);

  const confirmSaveResume = useCallback(async () => {
    if (!resumeNameInput || resumeNameInput.trim() === "") {
      return;
    }

    setShowResumeNameModal(false);

    setIsLoading(true);
    
    try {
      const resumeDataForSave = {
        ...resumeData,
        skills: resumeData.skills
      };

      const response = (currentResumeId && !isSharedResume)
        ? await resumeService.updateResume(currentResumeId, resumeDataForSave, resumeNameInput.trim(), "template3", getBackendThemeName(currentTheme))
        : await resumeService.saveResume(resumeDataForSave, resumeNameInput.trim(), "template3", getBackendThemeName(currentTheme));
      
      let savedResumeId = currentResumeId;
      if ((!currentResumeId || isSharedResume) && response.resume?._id) {
        savedResumeId = response.resume._id;
      }
      
      if (isSharedResume) {
        sessionStorage.setItem('newResumeData', JSON.stringify({
          resumeId: savedResumeId,
          title: resumeNameInput.trim(),
          theme: getBackendThemeName(currentTheme),
          data: resumeDataForSave
        }));
        
        setCurrentResumeId(savedResumeId);
        setResumeTitle(resumeNameInput.trim());
        
        const newUrl = `/templates/3?resumeId=${savedResumeId}`;
        setLocation(newUrl);
      } else {
        setCurrentResumeId(savedResumeId);
        setResumeTitle(resumeNameInput.trim());
        
        const newUrl = `/templates/3?resumeId=${savedResumeId}`;
        setLocation(newUrl);
      }
      
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    } catch (error) {
      console.error('Error saving resume:', error);
      
      if (error.message.includes('Access denied') || error.message.includes('No token provided') || error.message.includes('Invalid token')) {
        alert('Your session has expired. Please log in again to save your resume.');
        setShowLoginModal(true);
      } else {
        setErrorMessage(error.message);
        setShowErrorNotification(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [resumeNameInput, resumeData, currentResumeId, isAuthenticated, currentTheme, isSharedResume, getBackendThemeName, setLocation]);

  const [sectionSettings, setSectionSettings] = useState({
    header: {
      showTitle: true,
      showPhone: true,
      showLink: true,
      showEmail: true,
      showLocation: true,
      uppercaseName: true,
      showPhoto: true,
    },
    summary: { showSummary: true },
    experience: { showExperience: true },
    education: { showEducation: true },
    achievements: { showAchievements: true },
    languages: { showLanguages: true },
    skills: { showSkills: true },

  });

  const [activeSection, setActiveSection] = useState(null);

  const [sectionsOrder, setSectionsOrder] = useState([
    "summary",
    "skills",
    "experience",
    "education",
    "achievements",
    "languages",

  ]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('[data-profile-menu]')) {
        setShowUserDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColorPicker && !event.target.closest('[data-color-picker]')) {
        setShowColorPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  useEffect(() => {
    const storedResumeData = sessionStorage.getItem('newResumeData');
    if (storedResumeData) {
      try {
        const { resumeId, title, theme, data } = JSON.parse(storedResumeData);
        console.log('Template3 - Loading from sessionStorage:', { resumeId, title });
        
        setResumeData(data);
        setCurrentResumeId(resumeId);
        setResumeTitle(title);
        setIsSharedResume(false);
        
        const backendToTemplate3Theme = {
          'blue': 'blue',
          'purple': 'purple',
          'green': 'emerald',
          'red': 'rose'
        };
        if (theme && backendToTemplate3Theme[theme]) {
          setCurrentTheme(backendToTemplate3Theme[theme]);
        }
        
        sessionStorage.removeItem('newResumeData');
        
        setShowSaveNotification(true);
        setTimeout(() => setShowSaveNotification(false), 3000);
        
        return;
      } catch (error) {
        console.error('Error loading from sessionStorage:', error);
        sessionStorage.removeItem('newResumeData');
      }
    }
    
    const { resumeId } = getQueryParams();
    const hasToken = !!localStorage.getItem('authToken');
    console.log('Template3 - Resume loading check:', { 
      resumeId, 
      isAuthenticated, 
      hasToken,
      location: window.location.href
    });
    
    if (resumeId) {
      if (isAuthenticated || hasToken) {
        console.log('Template3 - Starting resume load for ID:', resumeId);
        setIsLoadingResume(true);
        
        resumeService.getResume(resumeId)
          .then(resume => {
            console.log('Template3 - Resume data received:', resume);
            const mappedResumeData = {
              name: resume.name || '',
              role: resume.role || '',
              phone: resume.phone || '',
              email: resume.email || '',
              linkedin: resume.linkedin || '',
              location: resume.location || '',
              summary: resume.summary || '',
              experience: resume.experience?.map(exp => ({
                title: exp.title || '',
                companyName: exp.company || '',
                date: exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : '',
                companyLocation: exp.location || '',
                accomplishment: exp.description || exp.accomplishments || ''
              })) || [],
              education: resume.education?.map(edu => ({
                degree: edu.degree || '',
                institution: edu.institution || '',
                duration: edu.duration || (edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : ''),
                location: edu.location || ''
              })) || [],
              achievements: resume.achievements?.map(ach => ({
                keyAchievements: ach.keyAchievements || ach.title || '',
                describe: ach.describe || ach.description || ''
              })) || [],
              languages: resume.languages?.map(lang => {
                if (typeof lang === 'string') {
                  const match = lang.match(/^(.+?)\s*\((.+)\)$/);
                  if (match) {
                    const [, name, level] = match;
                    return {
                      name: name.trim(),
                      level: level.trim(),
                      dots: (() => {
                        const levelLower = level.trim().toLowerCase();
                        if (levelLower === 'native') return 5;
                        if (levelLower === 'advanced') return 4;
                        if (levelLower === 'intermediate') return 3;
                        if (levelLower === 'elementary') return 2;
                        if (levelLower === 'beginner') return 1;
                        if (levelLower === 'nativo' || levelLower === 'nativa') return 5;
                        if (levelLower === 'avanzado' || levelLower === 'avanzada') return 4;
                        if (levelLower === 'intermedio' || levelLower === 'intermedia') return 3;
                        if (levelLower === 'básico' || levelLower === 'básica') return 2;
                        if (levelLower === 'principiante') return 1;
                        if (levelLower === 'fluido' || levelLower === 'fluida' || levelLower === 'fluent') return 4;
                        if (levelLower === 'conversacional') return 3;
                        if (levelLower === 'competente') return 3;
                        return 1;
                      })()
                    };
                  } else {
                    return {
                      name: lang,
                      level: 'Beginner',
                      dots: 1
                    };
                  }
                } else if (typeof lang === 'object') {
                  return {
                    name: lang.name || '',
                    level: lang.level || lang.proficiency || 'Beginner',
                    dots: lang.dots || (lang.proficiency === 'Native' ? 5 : 
                          lang.proficiency === 'Advanced' ? 4 : 
                          lang.proficiency === 'Intermediate' ? 3 : 
                          lang.proficiency === 'Elementary' ? 2 : 1)
                  };
                } else {
                  return {
                    name: '',
                    level: 'Beginner',
                    dots: 1
                  };
                }
              }) || [],
              skills: (() => {
                if (Array.isArray(resume.skills)) {
                  return resume.skills.map(skill => ({
                    category: skill.category || 'Skills',
                    items: Array.isArray(skill.items) ? skill.items : []
                  }));
                } else if (resume.skills && resume.skills.technical && Array.isArray(resume.skills.technical)) {
                  return resume.skills.technical.map(skill => ({
                    category: skill.category || 'Skills',
                    items: Array.isArray(skill.items) ? skill.items : []
                  }));
                } else {
                  return [{
                    category: 'Skills',
                    items: []
                  }];
                }
              })()
            };
            
            console.log('Template3 - Mapped resume data:', mappedResumeData);
            setResumeData(mappedResumeData);
            setCurrentResumeId(resumeId);
            setResumeTitle(resume.title || 'My Resume');
            const backendToTemplate3Theme = {
              'blue': 'blue',
              'purple': 'purple', 
              'green': 'emerald',
              'red': 'rose'
            };
            if (resume.theme && backendToTemplate3Theme[resume.theme]) {
              setCurrentTheme(backendToTemplate3Theme[resume.theme]);
            }

            if (isAuthenticated) {
              resumeService.checkOwnership(resumeId)
                .then(ownsResume => {
                  setIsSharedResume(!ownsResume);
                  console.log('Template3 - Ownership check:', ownsResume ? 'User owns resume' : 'Shared resume from another user');
                })
                .catch(error => {
                  console.error('Error checking ownership:', error);
                  setIsSharedResume(true);
                });
            } else {
              setIsSharedResume(true);
            }
          })
          .catch(error => {
            console.error('Template3 - Error loading resume:', error);
            if (error.message.includes('Access denied')) {
              console.log('Template3 - Access denied, prompting user to login');
              setShowLoginModal(true);
            } else {
              console.log('Template3 - Setting default data structure due to error');
              setResumeData(prev => ({
                ...prev,
                achievements: prev.achievements.length > 0 ? prev.achievements : [{
                  keyAchievements: 'Loading...',
                  describe: 'Please authenticate to load your achievements.'
                }]
              }));
            }
          })
          .finally(() => {
            setIsLoadingResume(false);
          });
      } else {
        console.log('Template3 - Resume ID found but user not authenticated, loading resume for viewing');
        setIsLoadingResume(true);
        
        resumeService.getResume(resumeId)
          .then(resume => {
            console.log('Template3 - Resume data received (unauthenticated):', resume);
            const mappedResumeData = {
              name: resume.name || '',
              role: resume.role || '',
              phone: resume.phone || '',
              email: resume.email || '',
              linkedin: resume.linkedin || '',
              location: resume.location || '',
              summary: resume.summary || '',
              experience: resume.experience?.map(exp => ({
                title: exp.title || '',
                companyName: exp.company || '',
                date: exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : '',
                companyLocation: exp.location || '',
                accomplishment: exp.description || exp.accomplishments || ''
              })) || [],
              education: resume.education?.map(edu => ({
                degree: edu.degree || '',
                institution: edu.institution || '',
                duration: edu.duration || (edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : ''),
                location: edu.location || ''
              })) || [],
              achievements: resume.achievements?.map(ach => ({
                keyAchievements: ach.keyAchievements || ach.title || '',
                describe: ach.describe || ach.description || ''
              })) || [],
              languages: resume.languages?.map(lang => {
                if (typeof lang === 'string') {
                  const match = lang.match(/^(.+?)\s*\((.+)\)$/);
                  if (match) {
                    const [, name, level] = match;
                    return {
                      name: name.trim(),
                      level: level.trim(),
                      dots: (() => {
                        const levelLower = level.trim().toLowerCase();
                        if (levelLower === 'native') return 5;
                        if (levelLower === 'advanced') return 4;
                        if (levelLower === 'intermediate') return 3;
                        if (levelLower === 'elementary') return 2;
                        if (levelLower === 'beginner') return 1;
                        return 1;
                      })()
                    };
                  } else {
                    return {
                      name: lang,
                      level: 'Beginner',
                      dots: 1
                    };
                  }
                } else if (typeof lang === 'object') {
                  return lang;
                }
                return { name: '', level: 'Beginner', dots: 1 };
              }) || [],
              skills: resume.skills?.technical?.map(skillGroup => ({
                category: skillGroup.category || '',
                items: skillGroup.items || []
              })) || []
            };
            
            setResumeData(mappedResumeData);
            setCurrentResumeId(resumeId);
            setResumeTitle(resume.title || 'My Resume');
            
            const backendToTemplate3Theme = {
              'blue': 'blue',
              'purple': 'purple', 
              'green': 'emerald',
              'red': 'rose'
            };
            if (resume.theme && backendToTemplate3Theme[resume.theme]) {
              setCurrentTheme(backendToTemplate3Theme[resume.theme]);
            }
            
            setIsSharedResume(true);
          })
          .catch(error => {
            console.error('Template3 - Failed to load resume (unauthenticated):', error);
          })
          .finally(() => {
            setIsLoadingResume(false);
          });
      }
    }
  }, [isAuthenticated, location]);

  const themes = {
    blue: {
      name: "Ocean Blue",
      primary: "rgb(14, 165, 233)",
      secondary: "rgb(56, 189, 248)",
      accent: "rgb(2, 132, 199)",
      gradient: "linear-gradient(135deg, rgb(14, 165, 233), rgb(56, 189, 248))",
      light: "rgb(240, 249, 255)",
    },
    purple: {
      name: "Royal Purple",
      primary: "rgb(168, 85, 247)",
      secondary: "rgb(196, 181, 253)",
      accent: "rgb(147, 51, 234)",
      gradient:
        "linear-gradient(135deg, rgb(168, 85, 247), rgb(196, 181, 253))",
      light: "rgb(250, 245, 255)",
    },
    emerald: {
      name: "Forest Green",
      primary: "rgb(34, 197, 94)",
      secondary: "rgb(74, 222, 128)",
      accent: "rgb(21, 128, 61)",
      gradient: "linear-gradient(135deg, rgb(34, 197, 94), rgb(74, 222, 128))",
      light: "rgb(240, 253, 244)",
    },
    rose: {
      name: "Sunset Rose",
      primary: "rgb(251, 113, 133)",
      secondary: "rgb(252, 165, 165)",
      accent: "rgb(225, 29, 72)",
      gradient:
        "linear-gradient(135deg, rgb(251, 113, 133), rgb(252, 165, 165))",
      light: "rgb(255, 241, 242)",
    },
  };

  const { isEnhancing, error } = useAIEnhancer();
  const aiAnimationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 0.8; }
    }
    
    @keyframes shimmer {
      0% { background-position: 100% 0%; }
      50% { background-position: 0% 100%; }
      100% { background-position: 100% 0%; }
    }
    
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    
    .ai-modal-overlay {
      animation: fadeIn 0.3s ease-out;
    }
    
    .ai-modal-content {
      animation: slideUp 0.3s ease-out;
    }
    
    .ai-enhancement-modal {
      position: relative !important;
      z-index: 999999 !important;
    }
    
    .animate-pulse-ai {
      animation: pulse 2s infinite;
    }
    
    .animate-shimmer {
      animation: shimmer 3s infinite;
    }
    
    .animate-blob {
      animation: blob 10s infinite;
    }
    
    .neon-glow {
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.6),
                  0 0 30px rgba(59, 130, 246, 0.4),
                  0 0 45px rgba(59, 130, 246, 0.2);
      transition: box-shadow 0.3s ease;
    }
    
    .neon-glow:hover {
      box-shadow: 0 0 25px rgba(59, 130, 246, 0.8),
                  0 0 50px rgba(59, 130, 246, 0.6),
                  0 0 75px rgba(59, 130, 246, 0.4);
    }
  `;

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = aiAnimationStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const updateResumeData = useCallback((newData) => {
    setResumeData(newData);
  }, []);

  const updateField = (field, value) => {
    setResumeData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const updateExperience = (index, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp,
      ),
    }));
  };

  const updateEducation = (index, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu,
      ),
    }));
  };

  const updateAchievement = (index, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      achievements: prev.achievements.map((ach, i) =>
        i === index ? { ...ach, [field]: value } : ach,
      ),
    }));
  };

  const updateSkill = (categoryIndex, skillIndex, value) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((category, i) =>
        i === categoryIndex
          ? {
              ...category,
              items: category.items.map((skill, j) =>
                j === skillIndex ? value : skill,
              ),
            }
          : category,
      ),
    }));
  };

  const updateLanguage = (index, field, value) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang, i) =>
        i === index ? { ...lang, [field]: value } : lang,
      ),
    }));
  };
  const addExperience = useCallback(() => {
    const newExperience = {
      title: "New Position",
      companyName: "Company Name",
      date: "2023 - Present",
      companyLocation: "Location",
      accomplishment: "• Key accomplishment\n• Another accomplishment",
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExperience],
    }));
  }, []);

  const removeExperience = useCallback((index) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, []);

  const addEducation = useCallback(() => {
    const newEducation = {
      degree: "New Degree",
      institution: "Institution Name",
      duration: "2023 - 2024",
      location: "Location",
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEducation],
    }));
  }, []);

  const removeEducation = useCallback((index) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, []);

  const addAchievement = useCallback(() => {
    const newAchievement = {
      keyAchievements: "New Achievement",
      describe: "Description of the achievement",
    };
    setResumeData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, newAchievement],
    }));
  }, []);

  const removeAchievement = useCallback((index) => {
    setResumeData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  }, []);

  const addLanguage = useCallback(() => {
    const newLanguage = {
      name: "New Language",
      level: "Beginner",
      dots: 1,
    };
    setResumeData((prev) => ({
      ...prev,
      languages: [...prev.languages, newLanguage],
    }));
  }, []);

  const removeLanguage = useCallback((index) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  }, []);

  const addSkillCategory = useCallback(() => {
    const newSkillCategory = {
      category: "New Skill Category",
      items: ["New Skill", "Another Skill"],
    };
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkillCategory],
    }));
  }, []);

  const removeSkillCategory = useCallback((index) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }, []);

  const performDownload = useCallback(async () => {
    if (!resumeRef.current) return;

    setShowButtons(false);
    setIsDownloading(true);

    const originalTitle = document.title;
    document.title = "resume";

    try {
      const sidebar = document.querySelector(".sidebar");
      const buttons = document.querySelectorAll(".print-hide");
      const editableElements = document.querySelectorAll(
        '[contenteditable="true"]',
      );

      const originalDisplays = [];

      if (sidebar) {
        originalDisplays.push({
          element: sidebar,
          display: sidebar.style.display,
        });
        sidebar.style.display = "none";
      }

      buttons.forEach((button) => {
        originalDisplays.push({
          element: button,
          display: button.style.display,
        });
        button.style.display = "none";
      });

      editableElements.forEach((element) => {
        element.removeAttribute("contenteditable");
      });
      const printStyles = document.createElement("style");
      printStyles.id = "print-styles-template3";
      printStyles.textContent = `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page {
            size: A4;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-headers-and-footers: none !important;
            -webkit-print-background: exact !important;
            print-background: exact !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: auto !important;
          }

          .sidebar,
          .print-hide,
          .print-hide *,
          .fixed,
          button,
          .opacity-0,
          .group-hover\\:opacity-100 {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }

          .bg-gray-100 {
            background: white !important;
          }

          .p-4, .lg\\:p-8 {
            padding: 0 !important;
          }

          .flex-1 {
            flex: 1 !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .min-h-screen {
            min-height: auto !important;
          }

          .overflow-auto {
            overflow: visible !important;
          }

          .max-w-3xl {
            width: 100% !important;
            max-width: none !important;
            margin: 0 auto !important;
            box-shadow: none !important;
          }

          .modern-resume {
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
            background: white !important;
          }

          .px-8 {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }

          .py-8 {
            padding-top: 1.5rem !important;
            padding-bottom: 1rem !important;
          }

          .py-4 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }

          .lg\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            display: grid !important;
          }

          .space-y-6 > * + * {
            margin-top: 0.75rem !important;
          }

          .space-y-4 > * + * {
            margin-top: 0.5rem !important;
          }

          .space-y-3 > * + * {
            margin-top: 0.375rem !important;
          }

          .mb-6 {
            margin-bottom: 0.75rem !important;
          }

          .mb-3 {
            margin-bottom: 0.375rem !important;
          }

          .mb-2 {
            margin-bottom: 0.25rem !important;
          }

          .mb-1 {
            margin-bottom: 0.125rem !important;
          }

          .gap-4 {
            gap: 0.5rem !important;
          }

          .gap-3 {
            gap: 0.375rem !important;
          }

          .gap-2 {
            gap: 0.25rem !important;
          }

          .gap-1 {
            gap: 0.125rem !important;
          }

          .text-3xl {
            font-size: 2.75rem !important;
            line-height: 1.2 !important;
          }

          .text-2xl {
            font-size: 1.5rem !important;
            line-height: 1.3 !important;
          }

          .text-xl {
            font-size: 1.25rem !important;
            line-height: 1.4 !important;
          }

          .text-lg {
            font-size: 1.125rem !important;
            line-height: 1.5 !important;
          }

          .text-base {
            font-size: 1rem !important;
            line-height: 1.5 !important;
          }

          .font-bold {
            font-weight: 700 !important;
          }

          .font-semibold {
            font-weight: 600 !important;
          }

          .leading-relaxed {
            line-height: 1.5 !important;
          }

          .whitespace-pre-line {
            white-space: pre-line !important;
          }

          .w-6 {
            width: 1.5rem !important;
          }

          .h-0\\.5 {
            height: 0.125rem !important;
          }

          .w-2 {
            width: 0.5rem !important;
          }

          .h-2 {
            height: 0.5rem !important;
          }

          .w-1\\.5 {
            width: 0.375rem !important;
          }

          .h-1\\.5 {
            height: 0.375rem !important;
          }

          .w-4 {
            width: 1rem !important;
          }

          .h-4 {
            height: 1rem !important;
          }

          .w-3 {
            width: 0.75rem !important;
          }

          .h-3 {
            height: 0.75rem !important;
          }

          .pl-8 {
            padding-left: 2rem !important;
          }

          .left-0 {
            left: 0 !important;
          }

          .top-2 {
            top: 0.5rem !important;
          }

          .border-4 {
            border-width: 4px !important;
          }

          .border-white {
            border-color: white !important;
          }

          .p-4 {
            padding: 1rem !important;
          }

          .p-3 {
            padding: 0.75rem !important;
          }

          .px-4 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }

          .py-1 {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }

          .px-3 {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }

          .py-0\\.5 {
            padding-top: 0.125rem !important;
            padding-bottom: 0.125rem !important;
          }

          .px-2 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }

          .py-2 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }

          .text-sm {
            font-size: 0.875rem !important;
            line-height: 1.25rem !important;
          }

          .text-xs {
            font-size: 0.75rem !important;
            line-height: 1rem !important;
          }

          .rounded-full {
            border-radius: 9999px !important;
          }

          .rounded-xl {
            border-radius: 0.75rem !important;
          }

          .rounded-2xl {
            border-radius: 1rem !important;
          }

          .flex {
            display: flex !important;
          }

          .flex-wrap {
            flex-wrap: wrap !important;
          }

          .items-center {
            align-items: center !important;
          }

          .justify-center {
            justify-content: center !important;
          }

          .mt-3 {
            margin-top: 1.5rem !important;
          }

          [style*="background"] {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `;

      document.head.appendChild(printStyles);

      await new Promise((resolve) => setTimeout(resolve, 500));
      const printConfigCSS = document.createElement("style");
      printConfigCSS.textContent = `
        @media print {
          @page {
            margin: 0 !important;
            size: A4 !important;
          }
          
          html {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `;
      document.head.appendChild(printConfigCSS);

      setTimeout(() => {
        window.print();
        
        setTimeout(() => {
          if (printConfigCSS.parentNode) {
            printConfigCSS.parentNode.removeChild(printConfigCSS);
          }
        }, 1000);
      }, 100);

      setTimeout(() => {
        const printStylesElement = document.getElementById(
          "print-styles-template3",
        );
        if (printStylesElement) {
          printStylesElement.remove();
        }

        originalDisplays.forEach(({ element, display }) => {
          element.style.display = display;
        });

        editableElements.forEach((element) => {
          element.setAttribute("contenteditable", "true");
        });

        document.title = originalTitle;

        setShowButtons(true);
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error("Error during PDF export:", error);

      const printStylesElement = document.getElementById(
        "print-styles-template3",
      );
      if (printStylesElement) {
        printStylesElement.remove();
      }

      document.title = originalTitle;
      setShowButtons(true);
      setIsDownloading(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!resumeRef.current) return;

    if (!isAuthenticated && !hasSeenDownloadNotification) {
      setShowDownloadNotification(true);
      setHasSeenDownloadNotification(true);
      return;
    }

    if (!isAuthenticated && hasSeenDownloadNotification) {
      await performDownload();
      return;
    }

    try {
      const resumeDataForSave = {
        ...resumeData,
        skills: resumeData.skills
      };

      const response = currentResumeId 
        ? await resumeService.updateResume(currentResumeId, resumeDataForSave, "My Resume", "template3", getBackendThemeName(currentTheme))
        : await resumeService.saveResume(resumeDataForSave, "My Resume", "template3", getBackendThemeName(currentTheme));
      
      if (!currentResumeId && response.resume?._id) {
        setCurrentResumeId(response.resume._id);
      }
    } catch (error) {
      console.error('Error auto-saving resume during download:', error);
    }

    await performDownload();
  }, [isAuthenticated, resumeData, currentResumeId, performDownload, hasSeenDownloadNotification, currentTheme, getBackendThemeName]);

  const exportToPDF = handleDownload;
  if (isLoadingResume) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Resume...</h2>
          <p className="text-gray-500 mt-2">Please wait while we load your resume data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-gray-100">
      <div className="hidden xl:block">
        <Sidebar
          setActiveSection={setActiveSection}
          handleShare={handleShare}
          branding={branding}
          handleBrandingToggle={handleBrandingToggle}
          handleUploadResume={handleUploadResume}
          handleColorPicker={handleColorPicker}
          handleSaveResume={handleSaveResume}
          handleDownload={handleDownload}
          isLoading={isLoading || isEnhancing}
          setIsLoading={setIsLoading}
          resumeData={resumeData}
          setResumeData={setResumeData}
          sectionSettings={sectionSettings}
          setSectionSettings={setSectionSettings}
          sectionsOrder={sectionsOrder}
          setSectionsOrder={setSectionsOrder}
          activeSection={activeSection}
          selectedTheme={currentTheme}
          setSelectedTheme={setCurrentTheme}
          themes={themes}
          templateName="Modern"
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div className="flex-1 overflow-auto p-4 xl:p-8 xl:ml-72 main-content">
        {(isLoading || isEnhancing) && !aiModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 ai-modal-overlay">
            <div className="bg-white p-5 rounded-lg shadow-xl flex flex-col items-center ai-modal-content neon-glow">
              <div className="w-12 h-12 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4 animate-pulse-ai"></div>
              <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
                {isEnhancing
                  ? "Enhancing your resume with AI..."
                  : "Loading..."}
              </p>
            </div>
          </div>
        )}

        {showAIErrorPopup && !aiModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 ai-modal-overlay">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md ai-modal-content">
              <h3 className="text-xl font-bold mb-4 text-red-600 animate-pulse-ai">
                AI Enhancement Error
              </h3>
              <p className="mb-4">
                There was an error enhancing your resume. Please try again
                later.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAIErrorPopup(false)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition neon-glow"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showUploadErrorPopup && !aiModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 ai-modal-overlay">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md ai-modal-content">
              <h3 className="text-xl font-bold mb-4 text-red-600 animate-pulse-ai">
                Upload Error
              </h3>
              <p className="mb-4">
                There was an error uploading your resume. Please try again with
                a supported format.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowUploadErrorPopup(false)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition neon-glow"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showShareNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50"
          >
            Link copied to clipboard!
          </motion.div>
        )}

        {showSaveNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">Your resume has been saved successfully.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSaveNotification(false)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Continue
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        {showErrorNotification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Failed!</h3>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowErrorNotification(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                OK
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {showColorPicker && (
          <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-xl z-50" data-color-picker>
            <h3 className="font-bold mb-2">Choose Theme Color</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: "blue", color: "#0ea5e9", name: "Ocean Blue", backendTheme: "blue" },
                { key: "purple", color: "#a855f7", name: "Royal Purple", backendTheme: "purple" },
                { key: "emerald", color: "#22c55e", name: "Forest Green", backendTheme: "green" },
                { key: "rose", color: "#fb7185", name: "Sunset Rose", backendTheme: "red" },
              ].map((theme) => (
                <div
                  key={theme.key}
                  className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition ${
                    currentTheme === theme.key
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : ""
                  }`}
                  style={{ backgroundColor: theme.color }}
                  onClick={() => {
                    setCurrentTheme(theme.key);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, rotate: -2, y: 30 }}
          animate={{ opacity: 1, rotate: 0, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            type: "spring",
            stiffness: 100,
          }}
        >

          
          <div
            ref={resumeRef}
            className="modern-resume resume-container bg-white shadow-2xl rounded-2xl overflow-hidden relative"
          >
            <div
              className="relative bg-white border-b-4"
              style={{ borderColor: themes[currentTheme].primary }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-1/3 h-full opacity-5 transform rotate-12"
                  style={{ background: themes[currentTheme].gradient }}
                />
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10"
                  style={{ background: themes[currentTheme].primary }}
                />
                <div
                  className="absolute top-20 right-20 w-16 h-16 rounded-full opacity-10"
                  style={{ background: themes[currentTheme].secondary }}
                />
              </div>

              <div className="relative z-10 px-8 py-8">
                <div className="flex items-center justify-between">
                  <motion.div
                    className="flex-1"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <motion.h1
                      className="text-3xl font-black mb-2 tracking-tight"
                      style={{ color: themes[currentTheme].accent }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={createSafeOnBlur((value) =>
                        updateField("name", value),
                      )}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      {resumeData.name}
                    </motion.h1>
                    <motion.div
                      className="inline-block px-4 py-1 rounded-full text-white text-sm font-semibold tracking-wide"
                      style={{ background: themes[currentTheme].gradient }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                    >
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={createSafeOnBlur((value) =>
                          updateField("role", value),
                        )}
                      >
                        {resumeData.role}
                      </span>
                    </motion.div>
                  </motion.div>

                  <div className="flex flex-col space-y-1 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: themes[currentTheme].primary,
                        }}
                      />
                      <span
                        className="text-gray-700 font-medium text-sm"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={createSafeOnBlur((value) =>
                          updateField("phone", value),
                        )}
                      >
                        {resumeData.phone}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: themes[currentTheme].primary,
                        }}
                      />
                      <span
                        className="text-gray-700 font-medium text-sm"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={createSafeOnBlur((value) =>
                          updateField("email", value),
                        )}
                      >
                        {resumeData.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: themes[currentTheme].primary,
                        }}
                      />
                      <span
                        className="text-gray-700 font-medium text-sm"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={createSafeOnBlur((value) =>
                          updateField("linkedin", value),
                        )}
                      >
                        {resumeData.linkedin}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: themes[currentTheme].primary,
                        }}
                      />
                      <span
                        className="text-gray-700 font-medium text-sm"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={createSafeOnBlur((value) =>
                          updateField("location", value),
                        )}
                      >
                        {resumeData.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-4">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-6 h-0.5 rounded-full"
                    style={{ backgroundColor: themes[currentTheme].primary }}
                  />
                  <h2 className="text-lg font-bold text-gray-800">
                    Professional Summary
                  </h2>
                </div>
                <div
                  className="p-4 rounded-xl border-l-3 shadow-sm"
                  style={{
                    borderColor: themes[currentTheme].primary,
                    backgroundColor: themes[currentTheme].light,
                  }}
                >
                  <p
                    className="text-gray-700 leading-tight text-sm"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={createSafeOnBlur((value) =>
                      updateField("summary", value),
                    )}
                  >
                    {resumeData.summary}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-6 h-0.5 rounded-full"
                      style={{ backgroundColor: themes[currentTheme].primary }}
                    />
                    <h2 className="text-lg font-bold text-gray-800">
                      Work Experience
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {resumeData.experience.map((exp, index) => (
                      <ContextMenu
                        key={index}
                        sectionType="Experience"
                        onAdd={addExperience}
                        onRemove={() => removeExperience(index)}
                        canRemove={resumeData.experience.length > 1}
                      >
                        <div className="relative">
                          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3
                                  className="text-base font-bold mb-1"
                                  style={{ color: themes[currentTheme].accent }}
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((value) =>
                                    updateExperience(index, "title", value),
                                  )}
                                >
                                  {exp.title}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-600 mb-2 text-sm">
                                  <span
                                    className="font-semibold"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={createSafeOnBlur((value) =>
                                      updateExperience(
                                        index,
                                        "companyName",
                                        value,
                                      ),
                                    )}
                                  >
                                    {exp.companyName}
                                  </span>
                                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                  <span
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={createSafeOnBlur((value) =>
                                      updateExperience(
                                        index,
                                        "companyLocation",
                                        value,
                                      ),
                                    )}
                                  >
                                    {exp.companyLocation}
                                  </span>
                                </div>
                              </div>
                              <div
                                className="px-3 py-1 rounded-full text-xs font-bold text-white ml-2"
                                style={{
                                  backgroundColor: themes[currentTheme].primary,
                                }}
                              >
                                <span
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((value) =>
                                    updateExperience(index, "date", value),
                                  )}
                                >
                                  {exp.date}
                                </span>
                              </div>
                            </div>
                            <div
                              className="text-gray-700 leading-tight whitespace-pre-line text-sm"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={createSafeOnBlur((value) =>
                                updateExperience(
                                  index,
                                  "accomplishment",
                                  value,
                                ),
                              )}
                            >
                              {exp.accomplishment}
                            </div>
                          </div>
                        </div>
                      </ContextMenu>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-6 h-0.5 rounded-full"
                          style={{
                            backgroundColor: themes[currentTheme].primary,
                          }}
                        />
                        <h2 className="text-lg font-bold text-gray-800">
                          Skills
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {resumeData.skills.map(
                          (skillCategory, categoryIndex) => (
                            <ContextMenu
                              key={categoryIndex}
                              sectionType="Skill Category"
                              onAdd={addSkillCategory}
                              onRemove={() =>
                                removeSkillCategory(categoryIndex)
                              }
                              canRemove={resumeData.skills.length > 1}
                            >
                              <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                                <h3
                                  className="text-sm font-bold mb-2"
                                  style={{ color: themes[currentTheme].accent }}
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((value) =>
                                    setResumeData((prev) => ({
                                      ...prev,
                                      skills: prev.skills.map((cat, i) =>
                                        i === categoryIndex
                                          ? { ...cat, category: value }
                                          : cat,
                                      ),
                                    })),
                                  )}
                                >
                                  {skillCategory.category}
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                  {skillCategory.items.map(
                                    (skill, skillIndex) => (
                                      <span
                                        key={skillIndex}
                                        className="px-2 py-0.5 rounded-full text-xs font-medium text-white shadow-sm"
                                        style={{
                                          backgroundColor:
                                            themes[currentTheme].secondary,
                                        }}
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={createSafeOnBlur((value) =>
                                          setResumeData((prev) => ({
                                            ...prev,
                                            skills: prev.skills.map(
                                              (cat, catIndex) =>
                                                catIndex === categoryIndex
                                                  ? {
                                                      ...cat,
                                                      items: cat.items.map(
                                                        (item, itemIndex) =>
                                                          itemIndex ===
                                                          skillIndex
                                                            ? value
                                                            : item,
                                                      ),
                                                    }
                                                  : cat,
                                            ),
                                          })),
                                        )}
                                      >
                                        {skill}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            </ContextMenu>
                          ),
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-6 h-0.5 rounded-full"
                          style={{
                            backgroundColor: themes[currentTheme].primary,
                          }}
                        />
                        <h2 className="text-lg font-bold text-gray-800">
                          Education
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {resumeData.education.map((edu, index) => (
                          <ContextMenu
                            key={index}
                            sectionType="Education"
                            onAdd={addEducation}
                            onRemove={() => removeEducation(index)}
                            canRemove={resumeData.education.length > 1}
                          >
                            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                              <div className="flex justify-between items-start mb-1">
                                <h3
                                  className="text-sm font-bold flex-1"
                                  style={{ color: themes[currentTheme].accent }}
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((value) =>
                                    updateEducation(index, "degree", value),
                                  )}
                                >
                                  {edu.degree}
                                </h3>
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-bold text-white ml-2"
                                  style={{
                                    backgroundColor:
                                      themes[currentTheme].primary,
                                  }}
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((value) =>
                                    updateEducation(index, "duration", value),
                                  )}
                                >
                                  {edu.duration}
                                </span>
                              </div>
                              <div className="text-gray-600 font-medium text-xs">
                                <span
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((value) =>
                                    updateEducation(index, "institution", value),
                                  )}
                                >
                                  {edu.institution}
                                </span>
                                <span className="mx-1">•</span>
                                <span
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((value) =>
                                    updateEducation(index, "location", value),
                                  )}
                                >
                                  {edu.location}
                                </span>
                              </div>
                            </div>
                          </ContextMenu>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-6 h-0.5 rounded-full"
                          style={{
                            backgroundColor: themes[currentTheme].primary,
                          }}
                        />
                        <h2 className="text-lg font-bold text-gray-800">
                          Key Achievements
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {resumeData.achievements.map((achievement, index) => (
                          <ContextMenu
                            key={index}
                            sectionType="Achievement"
                            onAdd={addAchievement}
                            onRemove={() => removeAchievement(index)}
                            canRemove={resumeData.achievements.length > 1}
                          >
                            <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                              <h3
                                className="text-sm font-bold mb-2"
                                style={{ color: themes[currentTheme].accent }}
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={createSafeOnBlur((value) =>
                                  updateAchievement(
                                    index,
                                    "keyAchievements",
                                    value,
                                  ),
                                )}
                              >
                                {achievement.keyAchievements}
                              </h3>
                              <p
                                className="text-gray-700 leading-tight text-xs"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={createSafeOnBlur((value) =>
                                  updateAchievement(index, "describe", value),
                                )}
                              >
                                {achievement.describe}
                              </p>
                            </div>
                          </ContextMenu>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-6 h-0.5 rounded-full"
                          style={{
                            backgroundColor: themes[currentTheme].primary,
                          }}
                        />
                        <h2 className="text-lg font-bold text-gray-800">
                          Languages
                        </h2>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                        <div className="space-y-3">
                          {resumeData.languages.map((language, index) => (
                            <ContextMenu
                              key={index}
                              sectionType="Language"
                              onAdd={addLanguage}
                              onRemove={() => removeLanguage(index)}
                              canRemove={resumeData.languages.length > 1}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className="font-bold text-sm"
                                  style={{ color: themes[currentTheme].accent }}
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((value) =>
                                    updateLanguage(index, "name", value),
                                  )}
                                >
                                  {language.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs font-medium text-gray-600"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={createSafeOnBlur((value) =>
                                      updateLanguage(index, "level", value),
                                    )}
                                  >
                                    {language.level}
                                  </span>
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <div
                                        key={i}
                                        className="w-2 h-2 rounded-full cursor-pointer"
                                        style={{
                                          backgroundColor:
                                            i < language.dots
                                              ? themes[currentTheme].primary
                                              : "#e5e7eb",
                                        }}
                                        onClick={() => {
                                          const updatedLanguages = [
                                            ...resumeData.languages,
                                          ];
                                          updatedLanguages[index] = {
                                            ...updatedLanguages[index],
                                            dots: i + 1,
                                            level: (() => {
                                                const currentLang = updatedLanguages[index];
                                              const isSpanishContext = currentLang?.name?.toLowerCase().includes('español') || 
                                                                     currentLang?.name?.toLowerCase().includes('spanish') ||
                                                                     currentLang?.level?.toLowerCase().includes('nativo') ||
                                                                     currentLang?.level?.toLowerCase().includes('avanzado') ||
                                                                     currentLang?.level?.toLowerCase().includes('intermedio') ||
                                                                     currentLang?.level?.toLowerCase().includes('básico') ||
                                                                     currentLang?.level?.toLowerCase().includes('principiante');
                                              
                                              if (isSpanishContext) {
                                                return i === 0 ? "Principiante" : 
                                                       i === 1 ? "Básico" : 
                                                       i === 2 ? "Intermedio" : 
                                                       i === 3 ? "Avanzado" : "Nativo";
                                              } else {
                                                return i === 0 ? "Beginner" : 
                                                       i === 1 ? "Elementary" : 
                                                       i === 2 ? "Intermediate" : 
                                                       i === 3 ? "Advanced" : "Native";
                                              }
                                            })(),
                                          };
                                          setResumeData((prev) => ({
                                            ...prev,
                                            languages: updatedLanguages,
                                          }));
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </ContextMenu>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {branding && (
              <div className="bg-white border-t border-gray-100 px-8 py-2 mt-3">
                <div className="flex items-center justify-center text-gray-600">
                  <span className="text-xs font-medium">
                    Aditya Resume Builder • Developed by Aditya
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {showLoginModal && (
        <Login
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={attemptResumeLoadAfterLogin}
        />
      )}

      {showSignupModal && (
        <Signup
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
          onClose={() => setShowSignupModal(false)}
        />
      )}

      {showResumeNameModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#e0f7fa' }}>
                <svg className="w-8 h-8" fill="none" stroke="#00bcd4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Save Resume</h3>
              <p className="text-gray-600">Give your resume a memorable name</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Resume Name</label>
              <input
                type="text"
                value={resumeNameInput}
                onChange={(e) => setResumeNameInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    confirmSaveResume();
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 text-gray-800 placeholder-gray-400"
                style={{
                  '--tw-ring-color': '#00bcd4',
                  '--tw-ring-opacity': '0.5'
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
                  e.target.style.borderColor = '#00bcd4';
                  e.target.style.boxShadow = '0 0 0 2px rgba(0, 188, 212, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter resume name..."
                autoFocus
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResumeNameModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveResume}
                disabled={!resumeNameInput.trim()}
                className="flex-1 px-6 py-3 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                style={{
                  backgroundColor: !resumeNameInput.trim() ? '#d1d5db' : '#00acc1',
                }}
                onMouseEnter={(e) => {
                  if (resumeNameInput.trim()) {
                    e.target.style.backgroundColor = '#00838f';
                  }
                }}
                onMouseLeave={(e) => {
                  if (resumeNameInput.trim()) {
                    e.target.style.backgroundColor = '#00acc1';
                  }
                }}
              >
                Save Resume
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <HamburgerMenu
        handleDownload={exportToPDF}
        handleShare={handleShare}
        handleColorPicker={() => setShowColorPicker(true)}
        handleSaveResume={handleSaveResume}
        branding={branding}
        handleBrandingToggle={handleBrandingToggle}
        setShowAIModal={handleMobileAIEnhancement}
        setShowLoginModal={setShowLoginModal}
        setShowSignupModal={setShowSignupModal}
        isAuthenticated={isAuthenticated}
        resumeTitle={resumeTitle}
        currentResumeId={currentResumeId}
      />

      {isAuthenticated ? (
        <div className="fixed z-50 hidden xl:block" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999 }} data-profile-menu>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            {getUserInitial()}
          </button>
          
          {showUserDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-72 xl:w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.firstName || user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              {resumeTitle && currentResumeId && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-800">{resumeTitle}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Current Resume
                    </span>
                  </div>
                </div>
              )}
              <Link href="/dashboard">
                <button
                  onClick={() => setShowUserDropdown(false)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Resumes
                </button>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setShowUserDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="fixed z-50 flex space-x-2 hidden xl:flex" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999 }}>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-4 py-2 bg-white bg-opacity-20 text-gray-800 rounded-lg font-medium hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-50"
          >
            Login
          </button>
          <button
            onClick={() => setShowSignupModal(true)}
            className="px-4 py-2 bg-blue-400 text-white rounded-lg font-medium hover:bg-blue-500 transition-all duration-200 shadow-lg"
          >
            Sign Up
          </button>
        </div>
      )}

      {showDownloadNotification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Resume Not Saved</h3>
            <p className="text-gray-600 mb-6">Your resume is being downloaded, but it hasn't been saved to your account. Sign in to automatically save your resume whenever you download it.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDownloadNotification(false);
                  setShowLoginModal(true);
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={async () => {
                  setShowDownloadNotification(false);
                  await performDownload();
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Okay
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <MobileAIModal
        showAIModal={showMobileAIModal}
        setShowAIModal={setShowMobileAIModal}
        resumeData={resumeData}
        setResumeData={setResumeData}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      {false && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 xl:hidden"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enhancement Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="full">Full Resume Enhancement</option>
                    <option value="summary">Professional Summary</option>
                    <option value="experience">Work Experience</option>
                    <option value="skills">Skills Section</option>
                    <option value="achievements">Achievements</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    defaultValue={resumeData?.role || ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Technology, Healthcare, Finance"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-green-900 mb-1">AI Enhancement</h4>
                      <p className="text-sm text-green-700">
                        Our AI will analyze your resume content and suggest improvements to make it more compelling and ATS-friendly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex space-x-3">
              <button
                onClick={() => setShowAIModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAIModal(false);
                  console.log('AI Enhancement triggered from mobile modal');
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-teal-700 transition-all duration-200"
              >
                Enhance Resume
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeTemplate3;
