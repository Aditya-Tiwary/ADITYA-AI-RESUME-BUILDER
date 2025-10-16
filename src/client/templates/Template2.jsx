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

const ResumeTemplate2 = () => {
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
  const [isSharedResume, setIsSharedResume] = useState(false);
  
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
    console.log('Template2 - Attempting resume load after login:', resumeId);
    
    if (resumeId) {
      setIsLoadingResume(true);
      
      resumeService.getResume(resumeId)
        .then(resume => {
          console.log('Template2 - Resume data loaded after login:', resume);
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
                  category: 'Design Tools',
                  items: ['Adobe', 'Figma', 'Sketch', 'Principle']
                }, {
                  category: 'Development', 
                  items: ['HTML', 'JavaScript', 'React', 'Systems']
                }, {
                  category: 'Specialties',
                  items: ['UX', 'Branding', 'Motion', 'Prototyping']
                }];
              }
            })()
          };
          
          console.log('Template2 - Setting mapped resume data after login:', mappedResumeData);
          setResumeData(mappedResumeData);
          setCurrentResumeId(resumeId);
          setResumeTitle(resume.title || 'My Resume');
        })
        .catch(error => {
          console.error('Template2 - Error loading resume after login:', error);
        })
        .finally(() => {
          setIsLoadingResume(false);
        });
    }
  };

  const [resumeData, setResumeData] = useState({
    name: "ADITYA",
    role: "Creative UI/UX Designer | Visual Storyteller | Brand Strategist",
    phone: "+1 555-0123",
    email: "aditya@aditya.design",
    linkedin: "linkedin.com/in/aditya",
    location: "San Francisco, CA, USA",
    summary:
      "Award-winning creative professional with 8+ years of experience transforming complex ideas into compelling visual narratives. Specialized in user-centered design, brand identity, and digital experiences that drive engagement and conversion. Led design teams for Fortune 500 companies, resulting in 40% increase in user engagement and multiple design awards.",
    experience: [
      {
        title: "Senior Creative Director",
        companyName: "Adobe Creative Studio",
        date: "2020 - Present",
        companyLocation: "San Francisco, CA",
        accomplishment:
          "• Led a team of 12 designers to rebrand 3 major product lines, resulting in 40% increase in brand recognition.\n" +
          "• Spearheaded the design of an award-winning mobile app with over 2M downloads in the first quarter.\n" +
          "• Implemented design systems that reduced production time by 35% while maintaining design consistency across platforms.",
      },
      {
        title: "UX/UI Designer",
        companyName: "Spotify",
        date: "2018 - 2020",
        companyLocation: "New York, NY",
        accomplishment:
          "• Designed user interfaces for premium features, contributing to 25% growth in premium subscriptions.\n" +
          "• Conducted user research and usability testing, leading to 30% improvement in user satisfaction scores.\n" +
          "• Collaborated with product teams to launch 5 major feature updates used by millions of users globally.",
      },
    ],
    education: [
      {
        degree: "Bachelor of Fine Arts in Graphic Design",
        institution: "Rhode Island School of Design",
        duration: "2014 - 2018",
        location: "Providence, RI, USA",
      },
    ],
    achievements: [
      {
        keyAchievements: "Design Excellence Awards",
        describe:
          "Winner of the Red Dot Design Award 2023 and Adobe Design Achievement Award for innovative mobile app interface design.",
      },
      {
        keyAchievements: "Industry Recognition",
        describe:
          "Featured in Design Week Magazine as '30 Under 30 Creatives to Watch' and speaker at 5 international design conferences.",
      },
    ],
    languages: [
      { name: "English", level: "Native", dots: 5 },
      { name: "Mandarin", level: "Native", dots: 5 },
      { name: "Spanish", level: "Intermedio", dots: 3 },
    ],
    skills: [
      {
        category: "Design Tools",
        items: ["Adobe", "Figma", "Sketch", "Principle"],
      },
      {
        category: "Development",
        items: ["HTML", "JavaScript", "React", "Systems"],
      },
      {
        category: "Specialties",
        items: [
          "UX",
          "Branding",
          "Motion",
          "Prototyping",
        ],
      },
    ],
    projects: [],
  });

  const [showButtons, setShowButtons] = useState(true);

  const [photo] = useState(null);

  const [branding, setBranding] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDownloadNotification, setShowDownloadNotification] = useState(false);
  const [hasSeenDownloadNotification, setHasSeenDownloadNotification] = useState(false);

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

  const [selectedTheme, setSelectedTheme] = useState("rose");
  const getBackendThemeName = useCallback((template2Theme) => {
    const themeMapping = {
      'rose': 'red',
      'purple': 'purple',
      'teal': 'teal',
      'orange': 'orange'
    };
    return themeMapping[template2Theme] || 'red';
  }, []);

  const [showColorPicker, setShowColorPicker] = useState(false);

  const resumeRef = useRef(null);

  const { isEnhancing, error } = useAIEnhancer();

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
        console.log('Template2 - Loading from sessionStorage:', { resumeId, title });
        
        setResumeData(data);
        setCurrentResumeId(resumeId);
        setResumeTitle(title);
        setIsSharedResume(false);
        
        const template2ToBackendTheme = {
          'rose': 'red',
          'purple': 'purple', 
          'teal': 'teal',
          'orange': 'orange'
        };
        const reverseThemeMap = Object.fromEntries(
          Object.entries(template2ToBackendTheme).map(([k, v]) => [v, k])
        );
        if (theme && reverseThemeMap[theme]) {
          setSelectedTheme(reverseThemeMap[theme]);
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
    console.log('Template2 - Resume loading check:', { 
      resumeId, 
      isAuthenticated, 
      hasToken: !!localStorage.getItem('authToken'),
      location: window.location.href
    });
    
    if (resumeId) {
      if (isAuthenticated) {
        console.log('Template2 - Starting resume load for ID:', resumeId);
        setIsLoadingResume(true);
        
        resumeService.getResume(resumeId)
          .then(resume => {
            console.log('Template2 - Resume data received:', resume);
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
                    category: 'Design Tools',
                    items: ['Adobe', 'Figma', 'Sketch', 'Principle']
                  }, {
                    category: 'Development', 
                    items: ['HTML', 'JavaScript', 'React', 'Systems']
                  }, {
                    category: 'Specialties',
                    items: ['UX', 'Branding', 'Motion', 'Prototyping']
                  }];
                }
              })()
            };
            
            console.log('Template2 - Mapped resume data:', mappedResumeData);
            setResumeData(mappedResumeData);
            setCurrentResumeId(resumeId);
            setResumeTitle(resume.title || 'My Resume');
            const backendToTemplate2Theme = {
              'red': 'rose',
              'purple': 'purple',
              'teal': 'teal',
              'orange': 'orange'
            };
            if (resume.theme && backendToTemplate2Theme[resume.theme]) {
              setSelectedTheme(backendToTemplate2Theme[resume.theme]);
            }
            if (isAuthenticated) {
              resumeService.checkOwnership(resumeId)
                .then(ownsResume => {
                  setIsSharedResume(!ownsResume);
                  console.log('Template2 - Ownership check:', ownsResume ? 'User owns resume' : 'Shared resume from another user');
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
            console.error('Template2 - Error loading resume:', error);
            if (error.message.includes('Access denied')) {
              console.log('Template2 - Access denied, prompting user to login');
              setShowLoginModal(true);
            } else {
              console.log('Template2 - Setting default data structure due to error');
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
        console.log('Template2 - Resume ID found but user not authenticated, loading resume for viewing');
        setIsLoadingResume(true);
        
        resumeService.getResume(resumeId)
          .then(resume => {
            console.log('Template2 - Resume data received (unauthenticated):', resume);
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
                accomplishment: exp.description || ''
              })) || [],
              education: resume.education?.map(edu => ({
                degree: edu.degree || '',
                institution: edu.institution || '',
                duration: edu.duration || '',
                location: edu.location || ''
              })) || [],
              skills: resume.skills?.technical?.map(skillGroup => ({
                category: skillGroup.category || '',
                items: skillGroup.items || []
              })) || [],
              achievements: resume.achievements?.map(achievement => ({
                keyAchievements: achievement.keyAchievements || '',
                describe: achievement.describe || ''
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
              }) || []
            };
            
            setResumeData(mappedResumeData);
            setCurrentResumeId(resumeId);
            setResumeTitle(resume.title || 'My Resume');
            
            if (resume.theme) {
              const themeMapping = {
                'blue': '#2563eb',
                'purple': '#7c3aed', 
                'green': '#059669',
                'orange': '#ea580c',
                'red': '#dc2626',
                'teal': '#0891b2',
                'pink': '#db2777',
                'indigo': '#4f46e5',
                'gray': '#4b5563'
              };
              const color = themeMapping[resume.theme] || '#2563eb';
              setThemeColor(color);
            }
          })
          .catch(error => {
            console.error('Template2 - Failed to load resume (unauthenticated):', error);
          })
          .finally(() => {
            setIsLoadingResume(false);
          });
      }
    }
  }, [isAuthenticated, location]);
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
  `;

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = aiAnimationStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const themes = {
    rose: {
      name: "Creative Rose",
      primary: "from-red-500 to-red-500",
      secondary: "from-red-100 to-red-100",
      accent: "red-500",
      text: "red-700",
      bg: "red-50",
      border: "red-200",
    },
    purple: {
      name: "Creative Purple",
      primary: "from-purple-500 to-violet-600",
      secondary: "from-purple-100 to-violet-100",
      accent: "purple-500",
      text: "purple-700",
      bg: "purple-50",
      border: "purple-200",
    },
    teal: {
      name: "Creative Teal",
      primary: "from-teal-500 to-cyan-600",
      secondary: "from-teal-100 to-cyan-100",
      accent: "teal-500",
      text: "teal-700",
      bg: "teal-50",
      border: "teal-200",
    },
    orange: {
      name: "Creative Orange",
      primary: "from-orange-500 to-red-500",
      secondary: "from-orange-100 to-red-100",
      accent: "orange-500",
      text: "orange-700",
      bg: "orange-50",
      border: "orange-200",
    },
  };

  const currentTheme = themes[selectedTheme];
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
      items: ["New Skill"],
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

        const response = await resumeService.updateResume(currentResumeId, resumeDataForSave, saveTitle, "template2", getBackendThemeName(selectedTheme));
        
        setResumeTitle(saveTitle);
        
        const newUrl = `/templates/2?resumeId=${currentResumeId}`;
        setLocation(newUrl);
        
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
    } else {
      const defaultName = isSharedResume 
        ? `Copy of ${resumeTitle}` 
        : `${resumeData.name}'s Resume`;
      setResumeNameInput(defaultName);
      setShowResumeNameModal(true);
    }
  }, [resumeData, currentResumeId, isAuthenticated, resumeTitle, setLocation, selectedTheme, getBackendThemeName, isSharedResume]);

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
        ? await resumeService.updateResume(currentResumeId, resumeDataForSave, resumeNameInput.trim(), "template2", getBackendThemeName(selectedTheme))
        : await resumeService.saveResume(resumeDataForSave, resumeNameInput.trim(), "template2", getBackendThemeName(selectedTheme));
      
      let savedResumeId = currentResumeId;
      if ((!currentResumeId || isSharedResume) && response.resume?._id) {
        savedResumeId = response.resume._id;
      }
      
      if (isSharedResume) {
        sessionStorage.setItem('newResumeData', JSON.stringify({
          resumeId: savedResumeId,
          title: resumeNameInput.trim(),
          theme: getBackendThemeName(selectedTheme),
          data: resumeDataForSave
        }));
        
        setCurrentResumeId(savedResumeId);
        setResumeTitle(resumeNameInput.trim());
        
        const newUrl = `/templates/2?resumeId=${savedResumeId}`;
        setLocation(newUrl);
      } else {
        setCurrentResumeId(savedResumeId);
        setResumeTitle(resumeNameInput.trim());
        
        const newUrl = `/templates/2?resumeId=${savedResumeId}`;
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
  }, [resumeNameInput, resumeData, currentResumeId, isAuthenticated, selectedTheme, getBackendThemeName, isSharedResume, setLocation]);

  const handleUploadResume = useCallback(() => {
    alert("Resume upload functionality would be implemented here");
  }, []);

  const performDownload = useCallback(async () => {
    if (!resumeRef.current) return;

    setShowButtons(false);

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
      printStyles.id = "print-styles";
      printStyles.textContent = `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
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
            border: none !important;
            background: white !important;
          }

          .creative-resume {
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            transform: none !important;
            transform-origin: initial !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
          }

          .rounded-2xl, .shadow-2xl {
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          .creative-header {
            padding: 1rem 1.2rem !important;
            margin: 0 !important;
            background: linear-gradient(135deg, var(--creative-primary-start), var(--creative-primary-end)) !important;
            color: white !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible !important;
          }

          .creative-header * {
            color: white !important;
          }

          .creative-header h1 {
            font-size: 1.5rem !important;
            line-height: 1.2 !important;
            margin-bottom: 0.3rem !important;
            font-weight: 700 !important;
          }

          .creative-header p {
            font-size: 0.95rem !important;
            line-height: 1.2 !important;
            margin-bottom: 0.4rem !important;
          }

          .creative-header .flex {
            gap: 0.8rem !important;
            flex-wrap: wrap !important;
          }

          .creative-header .text-xs {
            font-size: 0.8rem !important;
            line-height: 1.1 !important;
          }

          .creative-header .flex.flex-wrap {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }

          .creative-header .flex.items-center {
            display: flex !important;
            align-items: center !important;
          }

          .creative-resume .p-4 {
            padding: 0.8rem !important;
          }
          .grid.lg\\:grid-cols-2 {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1rem !important;
          }

          .grid.lg\\:grid-cols-2 > * {
          }


          .text-xl {
            font-size: 1.25rem !important;
            line-height: 1.5rem !important;
          }

          .lg\\:text-2xl {
            font-size: 1.5rem !important;
            line-height: 2rem !important;
          }

          .text-4xl {
            font-size: 2.25rem !important;
            line-height: 2.5rem !important;
          }

          .lg\\:text-5xl {
            font-size: 3rem !important;
            line-height: 1 !important;
          }

          .text-sm {
            font-size: 0.9rem !important;
            line-height: 1.3rem !important;
          }

          .text-base {
            font-size: 1rem !important;
            line-height: 1.5rem !important;
          }

          .lg\\:text-base {
            font-size: 1rem !important;
            line-height: 1.5rem !important;
          }

          .lg\\:text-lg {
            font-size: 1.125rem !important;
            line-height: 1.75rem !important;
          }

          .text-xs {
            font-size: 0.75rem !important;
            line-height: 1rem !important;
          }

          .font-bold {
            font-weight: 700 !important;
          }

          .font-medium {
            font-weight: 500 !important;
          }

          .font-light {
            font-weight: 300 !important;
          }


          .space-y-3 > * + * {
            margin-top: 0.7rem !important;
          }

          .space-y-2 > * + * {
            margin-top: 0.5rem !important;
          }

          .mb-4 {
            margin-bottom: 0.9rem !important;
          }

          .mb-3 {
            margin-bottom: 0.7rem !important;
          }

          .mb-2 {
            margin-bottom: 0.5rem !important;
          }

          .mb-1 {
            margin-bottom: 0.3rem !important;
          }

          .gap-3 {
            gap: 0.75rem !important;
          }

          .gap-4 {
            gap: 1rem !important;
          }

          .gap-6 {
            gap: 1.5rem !important;
          }


          .text-white {
            color: white !important;
          }

          .text-gray-700 {
            color: #374151 !important;
          }

          .text-gray-600 {
            color: #4b5563 !important;
          }

          .text-gray-800 {
            color: #1f2937 !important;
          }

          .bg-gray-50 {
            background-color: #f9fafb !important;
          }

          .bg-gray-200 {
            background-color: #e5e7eb !important;
          }


          .bg-gradient-to-br {
            background: linear-gradient(135deg, var(--creative-primary-start), var(--creative-primary-end)) !important;
          }


          .rounded-full {
            border-radius: 9999px !important;
          }

          .rounded-lg {
            border-radius: 0.5rem !important;
          }

          .rounded {
            border-radius: 0.375rem !important;
          }


          .w-1 {
            width: 0.25rem !important;
          }

          .w-2 {
            width: 0.5rem !important;
          }

          .h-4 {
            height: 1rem !important;
          }

          .h-2 {
            height: 0.5rem !important;
          }


          .flex {
            display: flex !important;
          }

          .flex-col {
            display: flex !important;
            flex-direction: column !important;
          }

          .lg\\:flex-row {
            display: flex !important;
            flex-direction: row !important;
          }

          .items-center {
            display: flex !important;
            align-items: center !important;
          }

          .items-start {
            align-items: flex-start !important;
          }

          .justify-between {
            justify-content: space-between !important;
          }

          .justify-center {
            justify-content: center !important;
          }

          .flex-wrap {
            display: flex !important;
            flex-wrap: wrap !important;
          }


          .grid {
            display: grid !important;
          }

          .grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
          }


          .border-transparent,
          .hover\\:border-white,
          .hover\\:border-gray-300,
          .focus\\:border-gray-400,
          .focus\\:border-white {
            border: none !important;
          }


          .absolute {
            position: relative !important;
            opacity: 0.1 !important;
          }




          .creative-header {
            position: relative !important;
            z-index: 1 !important;
            display: block !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .creative-header .relative {
            position: relative !important;
            z-index: 10 !important;
          }


          .creative-header .absolute {
            position: absolute !important;
            opacity: 0.1 !important;
            z-index: 1 !important;
          }
        }
      `;
      document.head.appendChild(printStyles);

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
        document.title = originalTitle;

        originalDisplays.forEach(({ element, display }) => {
          element.style.display = display;
        });

        editableElements.forEach((element) => {
          element.setAttribute("contenteditable", "true");
        });
        const printStylesElement = document.getElementById("print-styles");
        if (printStylesElement) {
          printStylesElement.remove();
        }

        setShowButtons(true);
      }, 1000);
    } catch (error) {
      console.error("Error preparing PDF:", error);
      document.title = originalTitle;
      setShowButtons(true);
    }
  }, []);

  const exportToPDF = useCallback(async () => {
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
        ? await resumeService.updateResume(currentResumeId, resumeDataForSave, "My Resume", "template2", getBackendThemeName(selectedTheme))
        : await resumeService.saveResume(resumeDataForSave, "My Resume", "template2", getBackendThemeName(selectedTheme));
      
      if (!currentResumeId && response.resume?._id) {
        setCurrentResumeId(response.resume._id);
      }
    } catch (error) {
      console.error('Error auto-saving resume during download:', error);
    }

    await performDownload();
  }, [isAuthenticated, resumeData, currentResumeId, performDownload, hasSeenDownloadNotification, selectedTheme, getBackendThemeName]);
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${resumeData.name}'s Resume`,
          text: `Check out ${resumeData.name}'s professional resume`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Resume link copied to clipboard!");
    }
  }, [resumeData.name]);

  const handleColorPicker = useCallback(() => {
    setShowColorPicker((prev) => !prev);
  }, []);

  const handleBrandingToggle = useCallback(() => {
    setBranding((prev) => !prev);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    const themeColors = {
      rose: {
        start: "#ef4444",
        end: "#ef4444",
        accent: "#ef4444",
        bg: "#fef2f2",
      },
      purple: {
        start: "#a855f7",
        end: "#8b5cf6",
        accent: "#a855f7",
        bg: "#faf5ff",
      },
      teal: {
        start: "#14b8a6",
        end: "#06b6d4",
        accent: "#14b8a6",
        bg: "#f0fdfa",
      },
      orange: {
        start: "#f97316",
        end: "#ef4444",
        accent: "#f97316",
        bg: "#fff7ed",
      },
    };

    const colors = themeColors[selectedTheme] || themeColors.rose;
    root.style.setProperty("--creative-primary-start", colors.start);
    root.style.setProperty("--creative-primary-end", colors.end);
    root.style.setProperty("--creative-accent", colors.accent);
    root.style.setProperty("--creative-bg", colors.bg);

    const styleElement = document.createElement("style");
    styleElement.id = "creative-theme-styles";
    styleElement.innerHTML = `
      .creative-header {
        background: linear-gradient(135deg, ${colors.start}, ${colors.end}) !important;
        color: white !important;
      }
      .creative-header * {
        color: white !important;
      }
      .theme-gradient {
        background: linear-gradient(135deg, ${colors.start}, ${colors.end}) !important;
      }
      .theme-text {
        color: ${colors.accent} !important;
      }
      .theme-accent {
        background-color: ${colors.accent} !important;
      }
    `;

    const oldStyle = document.getElementById("creative-theme-styles");
    if (oldStyle) {
      document.head.removeChild(oldStyle);
    }

    document.head.appendChild(styleElement);

    return () => {
      const styleToRemove = document.getElementById("creative-theme-styles");
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, [selectedTheme]);
  const renderSkillItems = (items, skillGroupIndex) => {
    return items.map((skill, skillIndex) => (
      <span
        key={skillIndex}
        className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm border border-transparent hover:border-gray-300 focus:outline-none focus:border-gray-400 cursor-pointer"
        contentEditable
        suppressContentEditableWarning
        onBlur={createSafeOnBlur((newText) => {
          const updatedSkills = [...resumeData.skills];
          const updatedItems = [...updatedSkills[skillGroupIndex].items];
          updatedItems[skillIndex] = newText || updatedItems[skillIndex];
          updatedSkills[skillGroupIndex] = {
            ...updatedSkills[skillGroupIndex],
            items: updatedItems,
          };
          setResumeData((prev) => ({
            ...prev,
            skills: updatedSkills,
          }));
        })}
      >
        {skill}
      </span>
    ));
  };

  const renderLanguageDots = (dots, languageIndex) => {
    const themeColors = {
      rose: { accent: "#ef4444", border: "#fecaca" },
      purple: { accent: "#a855f7", border: "#ddd6fe" },
      teal: { accent: "#14b8a6", border: "#99f6e4" },
      orange: { accent: "#f97316", border: "#fed7aa" },
    };

    const colors = themeColors[selectedTheme] || themeColors.rose;

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className="w-2 h-2 rounded-full cursor-pointer"
            style={{
              backgroundColor: dot <= dots ? colors.accent : colors.border,
            }}
            onClick={() => {
              const updatedLanguages = [...resumeData.languages];
              updatedLanguages[languageIndex] = {
                ...updatedLanguages[languageIndex],
                dots: dot,
                level: (() => {
                  const currentLang = updatedLanguages[languageIndex];
                  const isSpanishContext = currentLang?.name?.toLowerCase().includes('español') || 
                                         currentLang?.name?.toLowerCase().includes('spanish') ||
                                         currentLang?.level?.toLowerCase().includes('nativo') ||
                                         currentLang?.level?.toLowerCase().includes('avanzado') ||
                                         currentLang?.level?.toLowerCase().includes('intermedio') ||
                                         currentLang?.level?.toLowerCase().includes('básico') ||
                                         currentLang?.level?.toLowerCase().includes('principiante');
                  
                  if (isSpanishContext) {
                    return dot === 1 ? "Principiante" : 
                           dot === 2 ? "Básico" : 
                           dot === 3 ? "Intermedio" : 
                           dot === 4 ? "Avanzado" : "Nativo";
                  } else {
                    return dot === 1 ? "Beginner" : 
                           dot === 2 ? "Elementary" : 
                           dot === 3 ? "Intermediate" : 
                           dot === 4 ? "Advanced" : "Native";
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
    );
  };

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
          handleDownload={exportToPDF}
          handleShare={handleShare}
          branding={branding}
          handleBrandingToggle={handleBrandingToggle}
          handleUploadResume={handleUploadResume}
          handleColorPicker={handleColorPicker}
          handleSaveResume={handleSaveResume}
          isLoading={isLoading || isEnhancing}
          setIsLoading={setIsLoading}
          resumeData={resumeData}
          setResumeData={setResumeData}
          isAuthenticated={isAuthenticated}
        />
      </div>


      <div className="flex-1 p-4 xl:p-8 xl:ml-72 overflow-auto main-content">

        {(isLoading || isEnhancing) && (
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
        
        <div className="max-w-3xl mx-auto">

          

          <motion.div
            ref={resumeRef}
            className="creative-resume resume-container bg-white shadow-2xl rounded-2xl overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >

            <div
              className={`creative-header bg-gradient-to-br ${currentTheme.primary} text-white p-4 relative overflow-hidden`}
            >

              <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <pattern
                      id="creative-pattern"
                      x="0"
                      y="0"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="2"
                        fill="currentColor"
                        opacity="0.3"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="200"
                    height="200"
                    fill="url(#creative-pattern)"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                  <div className="flex-1">
                    {sectionSettings.header.showPhoto && photo && (
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 lg:hidden">
                        <img
                          src={photo}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <motion.h1
                      className={`text-xl lg:text-2xl font-bold mb-1 ${sectionSettings.header.uppercaseName ? "uppercase" : ""} tracking-wide p-1 border border-transparent hover:border-white hover:border-opacity-50 rounded focus:outline-none focus:border-white focus:border-opacity-75`}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={createSafeOnBlur((newText) => {
                        setResumeData((prev) => ({
                          ...prev,
                          name: newText || prev.name,
                        }));
                      })}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                    >
                      {resumeData.name}
                    </motion.h1>

                    {sectionSettings.header.showTitle && (
                      <motion.p
                        className="text-sm lg:text-base font-light mb-2 opacity-90 p-1 border border-transparent hover:border-white hover:border-opacity-50 rounded focus:outline-none focus:border-white focus:border-opacity-75"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={createSafeOnBlur((newText) => {
                          setResumeData((prev) => ({
                            ...prev,
                            role: newText || prev.role,
                          }));
                        })}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                      >
                        {resumeData.role}
                      </motion.p>
                    )}


                    <div
                      className="flex flex-wrap gap-4 text-xs"
                      style={{
                        opacity: 1,
                        visibility: "visible",
                        display: "flex",
                      }}
                    >
                      {sectionSettings.header.showPhone && (
                        <div
                          className="flex items-center space-x-2"
                          style={{ opacity: 1, display: "flex" }}
                        >
                          <span style={{ fontSize: "16px", opacity: 1 }}>
                            📞
                          </span>
                          <span
                            className="p-1 border border-transparent hover:border-white hover:border-opacity-50 rounded focus:outline-none focus:border-white focus:border-opacity-75 text-white"
                            style={{
                              color: "white",
                              opacity: 1,
                              display: "inline-block",
                            }}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={createSafeOnBlur((newText) => {
                              setResumeData((prev) => ({
                                ...prev,
                                phone: newText || prev.phone,
                              }));
                            })}
                          >
                            {resumeData.phone}
                          </span>
                        </div>
                      )}

                      {sectionSettings.header.showEmail && (
                        <div
                          className="flex items-center space-x-2"
                          style={{ opacity: 1, display: "flex" }}
                        >
                          <span style={{ fontSize: "16px", opacity: 1 }}>
                            📧
                          </span>
                          <span
                            className="p-1 border border-transparent hover:border-white hover:border-opacity-50 rounded focus:outline-none focus:border-white focus:border-opacity-75 text-white"
                            style={{
                              color: "white",
                              opacity: 1,
                              display: "inline-block",
                            }}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={createSafeOnBlur((newText) => {
                              setResumeData((prev) => ({
                                ...prev,
                                email: newText || prev.email,
                              }));
                            })}
                          >
                            {resumeData.email}
                          </span>
                        </div>
                      )}

                      <div
                        className="flex items-center space-x-2"
                        style={{ opacity: 1, display: "flex" }}
                      >
                        <span style={{ fontSize: "16px", opacity: 1 }}>🔗</span>
                        <span
                          className="p-1 border border-transparent hover:border-white hover:border-opacity-50 rounded focus:outline-none focus:border-white focus:border-opacity-75 text-white"
                          style={{
                            color: "white",
                            opacity: 1,
                            display: "inline-block",
                          }}
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={createSafeOnBlur((newText) => {
                            setResumeData((prev) => ({
                              ...prev,
                              linkedin: newText || prev.linkedin,
                            }));
                          })}
                        >
                          {resumeData.linkedin || "linkedin.com/in/alexchen"}
                        </span>
                      </div>

                      <div
                        className="flex items-center space-x-2"
                        style={{ opacity: 1, display: "flex" }}
                      >
                        <span style={{ fontSize: "16px", opacity: 1 }}>📍</span>
                        <span
                          className="p-1 border border-transparent hover:border-white hover:border-opacity-50 rounded focus:outline-none focus:border-white focus:border-opacity-75 text-white"
                          style={{
                            color: "white",
                            opacity: 1,
                            display: "inline-block",
                          }}
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={createSafeOnBlur((newText) => {
                            setResumeData((prev) => ({
                              ...prev,
                              location: newText || prev.location,
                            }));
                          })}
                        >
                          {resumeData.location || "San Francisco, CA, USA"}
                        </span>
                      </div>
                    </div>
                  </div>


                  {sectionSettings.header.showPhoto && photo && (
                    <div className="hidden lg:block w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ml-8">
                      <img
                        src={photo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>


            <div className="p-4">

              {sectionSettings.summary &&
                Object.values(sectionSettings.summary)[0] !== false && (
                  <motion.div
                    className="mb-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  >
                    <div className="flex items-center mb-2">
                      <div className="w-1 h-4 theme-gradient rounded-full mr-2"></div>
                      <h2 className="text-xl font-bold theme-text">
                        Professional Summary
                      </h2>
                    </div>
                    <p
                      className="text-gray-700 leading-snug text-sm p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={createSafeOnBlur((newText) => {
                        setResumeData((prev) => ({
                          ...prev,
                          summary: newText || prev.summary,
                        }));
                      })}
                    >
                      {resumeData.summary}
                    </p>
                  </motion.div>
                )}


              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

                <div className="space-y-3">

                  {sectionSettings.experience &&
                    Object.values(sectionSettings.experience)[0] !== false &&
                    resumeData.experience.length > 0 && (
                      <motion.div
                        className="work-experience-section"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-1 h-4 theme-gradient rounded-full mr-2"></div>
                          <h2 className="text-xl font-bold theme-text">
                            Work Experience
                          </h2>
                        </div>
                        <div className="space-y-2">
                          {resumeData.experience.map((exp, index) => (
                            <ContextMenu
                              key={index}
                              sectionType="Experience"
                              onAdd={addExperience}
                              onRemove={() => removeExperience(index)}
                              canRemove={resumeData.experience.length > 1}
                            >
                              <div className="mb-2">
                                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-1">
                                  <div>
                                    <h3
                                      className="text-base font-bold text-gray-800 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={createSafeOnBlur((newText) => {
                                        const updatedExperience = [
                                          ...resumeData.experience,
                                        ];
                                        updatedExperience[index] = {
                                          ...updatedExperience[index],
                                          title:
                                            newText ||
                                            updatedExperience[index].title,
                                        };
                                        setResumeData((prev) => ({
                                          ...prev,
                                          experience: updatedExperience,
                                        }));
                                      })}
                                    >
                                      {exp.title}
                                    </h3>
                                    <p
                                      className="text-xs text-gray-600 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={createSafeOnBlur((newText) => {
                                        const updatedExperience = [
                                          ...resumeData.experience,
                                        ];
                                        updatedExperience[index] = {
                                          ...updatedExperience[index],
                                          companyName:
                                            newText ||
                                            updatedExperience[index]
                                              .companyName,
                                        };
                                        setResumeData((prev) => ({
                                          ...prev,
                                          experience: updatedExperience,
                                        }));
                                      })}
                                    >
                                      {exp.companyName}
                                    </p>
                                    <p
                                      className="text-xs text-gray-500 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={createSafeOnBlur((newText) => {
                                        const updatedExperience = [
                                          ...resumeData.experience,
                                        ];
                                        updatedExperience[index] = {
                                          ...updatedExperience[index],
                                          companyLocation:
                                            newText ||
                                            updatedExperience[index]
                                              .companyLocation,
                                        };
                                        setResumeData((prev) => ({
                                          ...prev,
                                          experience: updatedExperience,
                                        }));
                                      })}
                                    >
                                      {exp.companyLocation}
                                    </p>
                                  </div>
                                  <span
                                    className="text-gray-600 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={createSafeOnBlur((newText) => {
                                      const updatedExperience = [
                                        ...resumeData.experience,
                                      ];
                                      updatedExperience[index] = {
                                        ...updatedExperience[index],
                                        date:
                                          newText ||
                                          updatedExperience[index].date,
                                      };
                                      setResumeData((prev) => ({
                                        ...prev,
                                        experience: updatedExperience,
                                      }));
                                    })}
                                  >
                                    {exp.date}
                                  </span>
                                </div>
                                <div
                                  className="text-gray-700 leading-tight whitespace-pre-line text-sm p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((newText) => {
                                    const updatedExperience = [
                                      ...resumeData.experience,
                                    ];
                                    updatedExperience[index] = {
                                      ...updatedExperience[index],
                                      accomplishment:
                                        newText ||
                                        updatedExperience[index].accomplishment,
                                    };
                                    setResumeData((prev) => ({
                                      ...prev,
                                      experience: updatedExperience,
                                    }));
                                  })}
                                >
                                  {exp.accomplishment}
                                </div>
                              </div>
                            </ContextMenu>
                          ))}
                        </div>
                      </motion.div>
                    )}


                  {sectionSettings.languages &&
                    Object.values(sectionSettings.languages)[0] !== false &&
                    resumeData.languages.length > 0 && (
                      <motion.div
                        className=""
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-1 h-4 theme-gradient rounded-full mr-2"></div>
                          <h2 className="text-xl font-bold theme-text">
                            Languages
                          </h2>
                        </div>
                        <div className="space-y-2">
                          {resumeData.languages.map((lang, index) => (
                            <ContextMenu
                              key={index}
                              sectionType="Language"
                              onAdd={addLanguage}
                              onRemove={() => removeLanguage(index)}
                              canRemove={resumeData.languages.length > 1}
                            >
                              <div className="flex items-center justify-between py-1">
                                <div className="flex-1">
                                  <span
                                    className="font-medium text-gray-800 text-xs p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={createSafeOnBlur((newText) => {
                                      const updatedLanguages = [
                                        ...resumeData.languages,
                                      ];
                                      updatedLanguages[index] = {
                                        ...updatedLanguages[index],
                                        name:
                                          newText ||
                                          updatedLanguages[index].name,
                                      };
                                      setResumeData((prev) => ({
                                        ...prev,
                                        languages: updatedLanguages,
                                      }));
                                    })}
                                  >
                                    {lang.name}
                                  </span>
                                  <span className="text-gray-600 text-xs ml-2">
                                    (
                                    <span
                                      className="p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                      contentEditable
                                      suppressContentEditableWarning
                                      onBlur={createSafeOnBlur((newText) => {
                                        const updatedLanguages = [
                                          ...resumeData.languages,
                                        ];
                                        updatedLanguages[index] = {
                                          ...updatedLanguages[index],
                                          level:
                                            newText ||
                                            updatedLanguages[index].level,
                                        };
                                        setResumeData((prev) => ({
                                          ...prev,
                                          languages: updatedLanguages,
                                        }));
                                      })}
                                    >
                                      {lang.level}
                                    </span>
                                    )
                                  </span>
                                </div>
                                <div className="flex items-center ml-2">
                                  {renderLanguageDots(lang.dots, index)}
                                </div>
                              </div>
                            </ContextMenu>
                          ))}
                        </div>
                      </motion.div>
                    )}
                </div>


                <div className="space-y-3">

                  {sectionSettings.skills &&
                    Object.values(sectionSettings.skills)[0] !== false &&
                    resumeData.skills.length > 0 && (
                      <motion.div
                        className=""
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-1 h-4 theme-gradient rounded-full mr-2"></div>
                          <h2 className="text-xl font-bold theme-text">
                            Skills
                          </h2>
                        </div>
                        <div className="space-y-2">
                          {resumeData.skills.map((skillGroup, index) => (
                            <ContextMenu
                              key={index}
                              sectionType="Skill Category"
                              onAdd={addSkillCategory}
                              onRemove={() => removeSkillCategory(index)}
                              canRemove={resumeData.skills.length > 1}
                            >
                              <div className="mb-2">
                                <h3
                                  className="font-bold mb-1 text-sm p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((newText) => {
                                    const updatedSkills = [
                                      ...resumeData.skills,
                                    ];
                                    updatedSkills[index] = {
                                      ...updatedSkills[index],
                                      category:
                                        newText ||
                                        updatedSkills[index].category,
                                    };
                                    setResumeData((prev) => ({
                                      ...prev,
                                      skills: updatedSkills,
                                    }));
                                  })}
                                >
                                  {skillGroup.category}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {renderSkillItems(skillGroup.items, index)}
                                </div>
                              </div>
                            </ContextMenu>
                          ))}
                        </div>
                      </motion.div>
                    )}


                  {sectionSettings.education &&
                    Object.values(sectionSettings.education)[0] !== false &&
                    resumeData.education.length > 0 && (
                      <motion.div
                        className=""
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-1 h-4 theme-gradient rounded-full mr-2"></div>
                          <h2 className="text-xl font-bold theme-text">
                            Education
                          </h2>
                        </div>
                        <div className="space-y-2">
                          {resumeData.education.map((edu, index) => (
                            <ContextMenu
                              key={index}
                              sectionType="Education"
                              onAdd={addEducation}
                              onRemove={() => removeEducation(index)}
                              canRemove={resumeData.education.length > 1}
                            >
                              <div className="mb-2">
                                <div className="flex flex-col md:flex-row md:justify-between">
                                  <h3
                                    className="font-bold text-sm p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={createSafeOnBlur((newText) => {
                                      const updatedEducation = [
                                        ...resumeData.education,
                                      ];
                                      updatedEducation[index] = {
                                        ...updatedEducation[index],
                                        degree:
                                          newText ||
                                          updatedEducation[index].degree,
                                      };
                                      setResumeData((prev) => ({
                                        ...prev,
                                        education: updatedEducation,
                                      }));
                                    })}
                                  >
                                    {edu.degree}
                                  </h3>
                                  <span
                                    className="text-gray-600 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={createSafeOnBlur((newText) => {
                                      const updatedEducation = [
                                        ...resumeData.education,
                                      ];
                                      updatedEducation[index] = {
                                        ...updatedEducation[index],
                                        duration:
                                          newText ||
                                          updatedEducation[index].duration,
                                      };
                                      setResumeData((prev) => ({
                                        ...prev,
                                        education: updatedEducation,
                                      }));
                                    })}
                                  >
                                    {edu.duration}
                                  </span>
                                </div>
                                <div className="flex flex-col md:flex-row md:justify-between">
                                  <h4
                                    className="font-medium text-sm text-gray-700 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={createSafeOnBlur((newText) => {
                                      const updatedEducation = [
                                        ...resumeData.education,
                                      ];
                                      updatedEducation[index] = {
                                        ...updatedEducation[index],
                                        institution:
                                          newText ||
                                          updatedEducation[index].institution,
                                      };
                                      setResumeData((prev) => ({
                                        ...prev,
                                        education: updatedEducation,
                                      }));
                                    })}
                                  >
                                    {edu.institution}
                                  </h4>
                                  <span
                                    className="text-gray-600 text-xs p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={createSafeOnBlur((newText) => {
                                      const updatedEducation = [
                                        ...resumeData.education,
                                      ];
                                      updatedEducation[index] = {
                                        ...updatedEducation[index],
                                        location:
                                          newText ||
                                          updatedEducation[index].location,
                                      };
                                      setResumeData((prev) => ({
                                        ...prev,
                                        education: updatedEducation,
                                      }));
                                    })}
                                  >
                                    {edu.location}
                                  </span>
                                </div>
                              </div>
                            </ContextMenu>
                          ))}
                        </div>
                      </motion.div>
                    )}


                  {sectionSettings.achievements &&
                    Object.values(sectionSettings.achievements)[0] !== false &&
                    resumeData.achievements.length > 0 && (
                      <motion.div
                        className=""
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3, duration: 0.6 }}
                      >
                        <div className="flex items-center mb-2">
                          <div className="w-1 h-4 theme-gradient rounded-full mr-2"></div>
                          <h2 className="text-xl font-bold theme-text">
                            Achievements
                          </h2>
                        </div>
                        <div className="space-y-2">
                          {resumeData.achievements.map((achievement, index) => (
                            <ContextMenu
                              key={index}
                              sectionType="Achievement"
                              onAdd={addAchievement}
                              onRemove={() => removeAchievement(index)}
                              canRemove={resumeData.achievements.length > 1}
                            >
                              <div className="mb-2">
                                <h3
                                  className="font-bold text-sm p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((newText) => {
                                    const updatedAchievements = [
                                      ...resumeData.achievements,
                                    ];
                                    updatedAchievements[index] = {
                                      ...updatedAchievements[index],
                                      keyAchievements:
                                        newText ||
                                        updatedAchievements[index]
                                          .keyAchievements,
                                    };
                                    setResumeData((prev) => ({
                                      ...prev,
                                      achievements: updatedAchievements,
                                    }));
                                  })}
                                >
                                  {achievement.keyAchievements}
                                </h3>
                                <p
                                  className="text-gray-700 leading-tight text-xs p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={createSafeOnBlur((newText) => {
                                    const updatedAchievements = [
                                      ...resumeData.achievements,
                                    ];
                                    updatedAchievements[index] = {
                                      ...updatedAchievements[index],
                                      describe:
                                        newText ||
                                        updatedAchievements[index].describe,
                                    };
                                    setResumeData((prev) => ({
                                      ...prev,
                                      achievements: updatedAchievements,
                                    }));
                                  })}
                                >
                                  {achievement.describe}
                                </p>
                              </div>
                            </ContextMenu>
                          ))}
                        </div>
                      </motion.div>
                    )}
                </div>
              </div>
            </div>


            {branding && (
              <div className="bg-gray-50 p-2 text-center border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Developed by{" "}
                  <span className={`font-semibold text-${currentTheme.accent}`}>
                    Aditya
                  </span>{" "}
                  for Aditya Resume Builder
                </p>
              </div>
            )}
          </motion.div>
        </div>


        {showColorPicker && (
          <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-xl z-50" data-color-picker>
            <h3 className="font-bold mb-2">Choose Theme Color</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: "rose", color: "#f43f5e", name: "Rose" },
                { key: "purple", color: "#a855f7", name: "Purple" },
                { key: "teal", color: "#14b8a6", name: "Teal" },
                { key: "orange", color: "#f97316", name: "Orange" },
              ].map((theme) => (
                <div
                  key={theme.key}
                  className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition ${
                    selectedTheme === theme.key
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : ""
                  }`}
                  style={{ backgroundColor: theme.color }}
                  onClick={() => {
                    setSelectedTheme(theme.key);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          </div>
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
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
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
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
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
            className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
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
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200 shadow-lg"
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={async () => {
                  setShowDownloadNotification(false);
                  await performDownload();
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
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
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
              </div>
              <button
                onClick={() => setShowMobileAIModal(false)}
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
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-red-900 mb-1">AI Enhancement</h4>
                      <p className="text-sm text-red-700">
                        Our AI will analyze your resume content and suggest improvements to make it more compelling and ATS-friendly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="px-6 py-4 border-t border-gray-100 flex space-x-3">
              <button
                onClick={() => setShowMobileAIModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowMobileAIModal(false);
                  console.log('AI Enhancement triggered from mobile modal');
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-200"
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

export default ResumeTemplate2;
