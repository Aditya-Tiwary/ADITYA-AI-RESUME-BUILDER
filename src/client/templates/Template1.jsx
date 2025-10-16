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

const ResumeTemplate1 = () => {
  const sidebarRef = useRef(null);

  const [resumeData, setResumeData] = useState({
    name: "ADITYA",
    role: "Experienced Project Manager | IT | Leadership | Cost Management",
    phone: "+1 541-754-3010",
    email: "help@aditya.com",
    linkedin: "linkedin.com",
    location: "New York, NY, USA",
    summary:
      "With over 12 years of experience in project management, Aditya brings a wealth of expertise in managing complex IT projects, particularly in cloud technology. He has a proven ability to enhance efficiency, having managed a $2M project portfolio, resulting in significant cost reductions. His proficiency in project management software tools and data analysis complements his strong leadership and creative problem-solving skills.",
    experience: [
      {
        title: "Senior IT Project Manager",
        companyName: "IBM",
        date: "2018 - 2023",
        companyLocation: "New York, NY, USA",
        accomplishment:
          "• Oversaw a $2M project portfolio resulting in a 15% reduction in costs through strategic resource allocation.\n" +
          "• Initiated and successfully implemented refined processes leading to a 20% increase in project delivery efficiency.\n" +
          "• Managed a cross-functional team of 15 professionals across diverse areas for effective project execution.",
      },
    ],
    education: [
      {
        degree: "Master's Degree in Computer Science",
        institution: "Massachusetts Institute of Technology",
        duration: "2012 - 2013",
        location: "Cambridge, MA, USA",
      },
    ],
    achievements: [
      {
        keyAchievements: "Creative Problem Solving",
        describe:
          "Utilize creative solutions to tackle challenges, evident in the 20% increase in project delivery efficiency at IBM.",
      },
    ],
    languages: [
      { name: "English", level: "Native", dots: 5 },
      { name: "Spanish", level: "Advanced", dots: 4 },
      { name: "Arabic", level: "Beginner", dots: 1 },
    ],
    skills: [
      {
        category: "Project Management",
        items: ["Management", "Leadership", "Analytics"],
      },
    ],
  });

  const [showButtons, setShowButtons] = useState(true);

  const [photo] = useState(null);

  const [branding, setBranding] = useState(true);

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
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDownloadNotification, setShowDownloadNotification] =
    useState(false);
  const [hasSeenDownloadNotification, setHasSeenDownloadNotification] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAIErrorPopup, setShowAIErrorPopup] = useState(false);
  const [showUploadErrorPopup, setShowUploadErrorPopup] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColor, setActiveColor] = useState("#1e40af");
  const resumeRef = useRef(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSharedResume, setIsSharedResume] = useState(false);

  const [showResumeNameModal, setShowResumeNameModal] = useState(false);
  const [resumeNameInput, setResumeNameInput] = useState("");

  const [showMobileAIModal, setShowMobileAIModal] = useState(false);

  const handleMobileAIEnhancement = () => {
    setShowMobileAIModal(true);
  };

  const { user, isAuthenticated, logout } = useAuth();

  const [location, setLocation] = useLocation();

  const [isLoadingResume, setIsLoadingResume] = useState(false);

  const [resumeTitle, setResumeTitle] = useState("");

  const getThemeNameFromColor = useCallback((hexColor) => {
    const colorToTheme = {
      "#1e40af": "blue",
      "#047857": "green",
      "#7c3aed": "purple",
      "#b91c1c": "red",
      "#0369a1": "teal",
      "#ea580c": "orange",
      "#4b5563": "gray",
      "#dc2626": "red",
      "#059669": "green",
      "#ea580c": "orange",
      "#0891b2": "teal",
    };
    return colorToTheme[hexColor] || "blue";
  }, []);

  const getUserInitial = () => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return "U";
  };

  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      resumeId: params.get("resumeId"),
    };
  };

  useEffect(() => {
    const storedResumeData = sessionStorage.getItem("newResumeData");
    if (storedResumeData) {
      try {
        const { resumeId, title, theme, data } = JSON.parse(storedResumeData);
        console.log("🔥 Template1 - Loading from sessionStorage:", {
          resumeId,
          title,
        });

        setResumeData(data);
        setCurrentResumeId(resumeId);
        setResumeTitle(title);
        setIsSharedResume(false);

        if (theme) {
          const themeColors = {
            blue: "#1e40af",
            red: "#dc2626",
            green: "#059669",
            purple: "#7c3aed",
            orange: "#ea580c",
            teal: "#0891b2",
            gray: "#4b5563",
          };
          setActiveColor(themeColors[theme] || "#1e40af");
        }

        sessionStorage.removeItem("newResumeData");

        setShowSaveNotification(true);
        setTimeout(() => setShowSaveNotification(false), 3000);

        return;
      } catch (error) {
        console.error("Error loading from sessionStorage:", error);
        sessionStorage.removeItem("newResumeData");
      }
    }

    const { resumeId } = getQueryParams();
    console.log(
      "🔥 Template1 - ResumeId from URL:",
      resumeId,
      "isAuthenticated:",
      isAuthenticated,
    );

    if (resumeId) {
      setIsLoadingResume(true);

      resumeService
        .getResume(resumeId)
        .then((resume) => {
          const mappedResumeData = {
            name: resume.name || "",
            role: resume.role || "",
            phone: resume.phone || "",
            email: resume.email || "",
            linkedin: resume.linkedin || "",
            location: resume.location || "",
            summary: resume.summary || "",
            experience:
              resume.experience?.map((exp) => ({
                title: exp.title || "",
                companyName: exp.company || "",
                date:
                  exp.startDate && exp.endDate
                    ? `${exp.startDate} - ${exp.endDate}`
                    : "",
                companyLocation: exp.location || "",
                accomplishment: exp.description || "",
              })) || [],
            education:
              resume.education?.map((edu) => ({
                degree: edu.degree || "",
                institution: edu.institution || "",
                duration: edu.duration || "",
                location: edu.location || "",
              })) || [],
            skills:
              resume.skills?.technical?.map((skillGroup) => ({
                category: skillGroup.category || "",
                items: skillGroup.items || [],
              })) || [],
            achievements:
              resume.achievements?.map((achievement) => ({
                keyAchievements: achievement.keyAchievements || "",
                describe: achievement.describe || "",
              })) || [],
            languages:
              resume.languages?.map((lang) => {
                if (typeof lang === "string") {
                  const match = lang.match(/^(.+?)\s*\((.+)\)$/);
                  if (match) {
                    const [, name, level] = match;
                    return {
                      name: name.trim(),
                      level: level.trim(),
                      dots: (() => {
                        const levelLower = level.trim().toLowerCase();
                        if (levelLower === "native") return 5;
                        if (levelLower === "advanced") return 4;
                        if (levelLower === "intermediate") return 3;
                        if (levelLower === "elementary") return 2;
                        if (levelLower === "beginner") return 1;
                        if (levelLower === "nativo" || levelLower === "nativa")
                          return 5;
                        if (
                          levelLower === "avanzado" ||
                          levelLower === "avanzada"
                        )
                          return 4;
                        if (
                          levelLower === "intermedio" ||
                          levelLower === "intermedia"
                        )
                          return 3;
                        if (levelLower === "básico" || levelLower === "básica")
                          return 2;
                        if (levelLower === "principiante") return 1;
                        if (
                          levelLower === "fluido" ||
                          levelLower === "fluida" ||
                          levelLower === "fluent"
                        )
                          return 4;
                        if (levelLower === "conversacional") return 3;
                        if (levelLower === "competente") return 3;
                        return 1;
                      })(),
                    };
                  } else {
                    return {
                      name: lang,
                      level: "Beginner",
                      dots: 1,
                    };
                  }
                } else if (typeof lang === "object") {
                  return {
                    name: lang.name || "",
                    level: lang.level || lang.proficiency || "Beginner",
                    dots:
                      lang.dots ||
                      (lang.proficiency === "Native"
                        ? 5
                        : lang.proficiency === "Advanced"
                          ? 4
                          : lang.proficiency === "Intermediate"
                            ? 3
                            : lang.proficiency === "Elementary"
                              ? 2
                              : 1),
                  };
                } else {
                  return {
                    name: "",
                    level: "Beginner",
                    dots: 1,
                  };
                }
              }) || [],
          };

          setResumeData(mappedResumeData);
          setCurrentResumeId(resumeId);
          console.log(
            "🔥 Template1 - Setting resume title:",
            resume.title || "My Resume",
          );
          setResumeTitle(resume.title || "My Resume");

          if (resume.theme) {
            const themeColors = {
              blue: "#1e40af",
              red: "#dc2626",
              green: "#059669",
              purple: "#7c3aed",
              orange: "#ea580c",
              teal: "#0891b2",
              gray: "#4b5563",
            };
            setActiveColor(themeColors[resume.theme] || "#1e40af");
          }

          if (isAuthenticated) {
            resumeService
              .checkOwnership(resumeId)
              .then((ownsResume) => {
                setIsSharedResume(!ownsResume);
                console.log(
                  "🔥 Template1 - Ownership check:",
                  ownsResume
                    ? "User owns resume"
                    : "Shared resume from another user",
                );
              })
              .catch((error) => {
                console.error("Error checking ownership:", error);
                setIsSharedResume(true);
              });
          } else {
            setIsSharedResume(true);
          }
        })
        .catch((error) => {
          console.error("Error loading resume:", error);
        })
        .finally(() => {
          setIsLoadingResume(false);
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    window.aiModalOpenCallback = setAiModalOpen;
    return () => {
      window.aiModalOpenCallback = null;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest("[data-profile-menu]")) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColorPicker && !event.target.closest("[data-color-picker]")) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorPicker]);

  const { isEnhancing, error } = useAIEnhancer();

  const performDownload = useCallback(async () => {
    if (!resumeRef.current) return;

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
          
          .flex {
            display: flex !important;
          }
          
          .flex-1 {
            flex: 1 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .flex-col {
            display: flex !important;
            flex-direction: column !important;
          }
          
          .md\\:flex-row {
            display: flex !important;
            flex-direction: row !important;
          }
          
          .md\\:justify-between {
            justify-content: space-between !important;
          }
          
          .flex-wrap {
            display: flex !important;
            flex-wrap: wrap !important;
          }
          
          .items-center {
            display: flex !important;
            align-items: center !important;
          }
          
          .text-center {
            text-align: center !important;
          }
          
          .text-left {
            text-align: left !important;
          }
          
          .text-right {
            text-align: right !important;
          }
          
          .max-w-3xl {
            width: 100% !important;
            max-width: none !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            min-height: auto !important;
            position: relative !important;
          }
          
          .sidebar,
          .print-hide,
          .print-hide *,
          .fixed,
          .absolute,
          button,
          .opacity-0,
          .group-hover\\:opacity-100 {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
          
          .overflow-auto {
            overflow: visible !important;
          }
          
          .bg-gray-100 {
            background: white !important;
          }
          
          .p-4, .md\\:p-8 {
            padding: 0 !important;
          }
          
          .flex-1.p-4, .flex-1.md\\:p-8 {
            padding: 0 !important;
          }
          
          .min-h-screen {
            min-height: auto !important;
          }
          
          .resume-container > div {
            page-break-inside: avoid;
          }
          
          .resume-container {
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          
          .mb-6 > * {
            page-break-inside: avoid !important;
          }
          
          .resume-container, .max-w-3xl {
            transform: none !important;
            transform-origin: initial !important;
            position: relative !important;
          }
          
          .mb-6 {
            margin-bottom: 0.75rem !important;
          }
          
          .mb-3 {
            margin-bottom: 0.25rem !important;
          }
          
          .mb-2 {
            margin-bottom: 0.125rem !important;
          }
          
          .pb-6 {
            padding-bottom: 0.5rem !important;
          }
          
          .text-3xl {
            font-size: 1.75rem !important;
            line-height: 1.3 !important;
          }
          
          .text-xl {
            font-size: 1.125rem !important;
            line-height: 1.4 !important;
          }
          
          .text-lg {
            font-size: 1rem !important;
            line-height: 1.4 !important;
          }
          
          .text-sm {
            font-size: 0.875rem !important;
            line-height: 1.4 !important;
          }
          
          p, span, div {
            line-height: 1.3 !important;
          }
          
          .gap-3 {
            gap: 0.75rem !important;
          }
          
          .mt-2 {
            margin-top: 0.5rem !important;
          }
          
          .mr-1 {
            margin-right: 0.25rem !important;
          }
          
          .ml-2 {
            margin-left: 0.5rem !important;
          }
          
          .language-dot {
            width: 6px !important;
            height: 6px !important;
          }
          
          .language-dots {
            display: inline-flex !important;
            gap: 2px !important;
          }
          
          .language-dot {
            width: 8px !important;
            height: 8px !important;
            border-radius: 50% !important;
            display: inline-block !important;
            margin: 0 1px !important;
          }
          
          *:hover {
            border: none !important;
          }
          
          .container {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .p-8 {
            padding: 1rem !important;
          }
          
          .shadow-xl {
            box-shadow: none !important;
          }
          
          .rounded-lg {
            border-radius: 0 !important;
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

        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error("Error preparing PDF:", error);
      document.title = originalTitle;
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

    setIsDownloading(true);
    try {
      const resumeDataForSave = {
        ...resumeData,
        skills: resumeData.skills,
      };

      const currentTheme = getThemeNameFromColor(activeColor);
      const response =
        currentResumeId && !isSharedResume
          ? await resumeService.updateResume(
              currentResumeId,
              resumeDataForSave,
              "My Resume",
              "template1",
              currentTheme,
            )
          : await resumeService.saveResume(
              resumeDataForSave,
              "My Resume",
              "template1",
              currentTheme,
            );

      if ((!currentResumeId || isSharedResume) && response.resume?._id) {
        setCurrentResumeId(response.resume._id);
        setIsSharedResume(false);
      }
    } catch (error) {
      console.error("Error auto-saving resume during download:", error);
    }

    await performDownload();
  }, [
    isAuthenticated,
    resumeData,
    currentResumeId,
    performDownload,
    hasSeenDownloadNotification,
    activeColor,
    getThemeNameFromColor,
    isSharedResume,
  ]);

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
      const saveTitle = resumeTitle || "My Resume";

      setIsLoading(true);

      try {
        const resumeDataForSave = {
          ...resumeData,

          skills: resumeData.skills,
        };

        const currentTheme = getThemeNameFromColor(activeColor);
        const response = await resumeService.updateResume(
          currentResumeId,
          resumeDataForSave,
          saveTitle,
          "template1",
          currentTheme,
        );

        setResumeTitle(saveTitle);

        const newUrl = `/templates/1?resumeId=${currentResumeId}`;
        setLocation(newUrl);

        setShowSaveNotification(true);
        setTimeout(() => setShowSaveNotification(false), 3000);
      } catch (error) {
        console.error("Error saving resume:", error);

        if (
          error.message.includes("Access denied") ||
          error.message.includes("No token provided") ||
          error.message.includes("Invalid token")
        ) {
          alert(
            "Your session has expired. Please log in again to save your resume.",
          );
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
  }, [
    resumeData,
    currentResumeId,
    isAuthenticated,
    resumeTitle,
    setLocation,
    activeColor,
    getThemeNameFromColor,
    isSharedResume,
  ]);

  const confirmSaveResume = useCallback(async () => {
    if (!resumeNameInput || resumeNameInput.trim() === "") {
      return;
    }

    setShowResumeNameModal(false);

    setIsLoading(true);

    try {
      const resumeDataForSave = {
        ...resumeData,
        skills: resumeData.skills,
      };

      const currentTheme = getThemeNameFromColor(activeColor);
      const response =
        currentResumeId && !isSharedResume
          ? await resumeService.updateResume(
              currentResumeId,
              resumeDataForSave,
              resumeNameInput.trim(),
              "template1",
              currentTheme,
            )
          : await resumeService.saveResume(
              resumeDataForSave,
              resumeNameInput.trim(),
              "template1",
              currentTheme,
            );

      let savedResumeId = currentResumeId;
      if ((!currentResumeId || isSharedResume) && response.resume?._id) {
        savedResumeId = response.resume._id;
      }

      if (isSharedResume) {
        sessionStorage.setItem(
          "newResumeData",
          JSON.stringify({
            resumeId: savedResumeId,
            title: resumeNameInput.trim(),
            theme: currentTheme,
            data: resumeDataForSave,
          }),
        );

        setCurrentResumeId(savedResumeId);
        setResumeTitle(resumeNameInput.trim());

        const newUrl = `/templates/1?resumeId=${savedResumeId}`;
        setLocation(newUrl);
      } else {
        setCurrentResumeId(savedResumeId);
        setResumeTitle(resumeNameInput.trim());

        const newUrl = `/templates/1?resumeId=${savedResumeId}`;
        setLocation(newUrl);
      }

      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    } catch (error) {
      console.error("Error saving resume:", error);

      if (
        error.message.includes("Access denied") ||
        error.message.includes("No token provided") ||
        error.message.includes("Invalid token")
      ) {
        alert(
          "Your session has expired. Please log in again to save your resume.",
        );
        setShowLoginModal(true);
      } else {
        setErrorMessage(error.message);
        setShowErrorNotification(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    resumeNameInput,
    resumeData,
    currentResumeId,
    isAuthenticated,
    activeColor,
    getThemeNameFromColor,
    isSharedResume,
    setLocation,
  ]);
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
      category: "New Category",
      items: ["Skill 1", "Skill 2"],
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

  const renderSection = useCallback(
    (sectionName) => {
      switch (sectionName) {
        case "summary":
          return (
            sectionSettings.summary.showSummary && (
              <div className="mb-6">
                <h2
                  className="text-xl font-bold mb-3"
                  style={{ color: activeColor }}
                >
                  Professional Summary
                </h2>
                <p
                  className="text-gray-700 p-2 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newValue = e.currentTarget.textContent;
                    setResumeData((prev) => ({
                      ...prev,
                      summary: newValue,
                    }));
                  }}
                >
                  {resumeData.summary}
                </p>
              </div>
            )
          );
        case "experience":
          return (
            sectionSettings.experience.showExperience && (
              <div className="mb-6">
                <h2
                  className="text-xl font-bold mb-3"
                  style={{ color: activeColor }}
                >
                  Work Experience
                </h2>
                {resumeData.experience.map((exp, index) => (
                  <ContextMenu
                    key={index}
                    sectionType="Experience"
                    onAdd={addExperience}
                    onRemove={() => removeExperience(index)}
                    canRemove={resumeData.experience.length > 1}
                  >
                    <div className="mb-4">
                      <div className="flex flex-col md:flex-row md:justify-between">
                        <h3
                          className="font-bold p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newValue = e.currentTarget.textContent;
                            const updatedExperience = [
                              ...resumeData.experience,
                            ];
                            updatedExperience[index] = {
                              ...updatedExperience[index],
                              title: newValue,
                            };
                            setResumeData((prev) => ({
                              ...prev,
                              experience: updatedExperience,
                            }));
                          }}
                        >
                          {exp.title}
                        </h3>
                        <span
                          className="text-gray-600 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newValue = e.currentTarget.textContent;
                            const updatedExperience = [
                              ...resumeData.experience,
                            ];
                            updatedExperience[index] = {
                              ...updatedExperience[index],
                              date: newValue,
                            };
                            setResumeData((prev) => ({
                              ...prev,
                              experience: updatedExperience,
                            }));
                          }}
                        >
                          {exp.date}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between">
                        <h4
                          className="font-medium text-gray-700 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newValue = e.currentTarget.textContent;
                            const updatedExperience = [
                              ...resumeData.experience,
                            ];
                            updatedExperience[index] = {
                              ...updatedExperience[index],
                              companyName: newValue,
                            };
                            setResumeData((prev) => ({
                              ...prev,
                              experience: updatedExperience,
                            }));
                          }}
                        >
                          {exp.companyName}
                        </h4>
                        <span
                          className="text-gray-600 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newValue = e.currentTarget.textContent;
                            const updatedExperience = [
                              ...resumeData.experience,
                            ];
                            updatedExperience[index] = {
                              ...updatedExperience[index],
                              companyLocation: newValue,
                            };
                            setResumeData((prev) => ({
                              ...prev,
                              experience: updatedExperience,
                            }));
                          }}
                        >
                          {exp.companyLocation}
                        </span>
                      </div>
                      <p
                        className="mt-2 text-gray-700 whitespace-pre-line p-2 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newValue = e.currentTarget.textContent;
                          const updatedExperience = [...resumeData.experience];
                          updatedExperience[index] = {
                            ...updatedExperience[index],
                            accomplishment: newValue,
                          };
                          setResumeData((prev) => ({
                            ...prev,
                            experience: updatedExperience,
                          }));
                        }}
                      >
                        {exp.accomplishment}
                      </p>
                    </div>
                  </ContextMenu>
                ))}
              </div>
            )
          );
        case "education":
          return (
            sectionSettings.education.showEducation && (
              <div className="mb-6">
                <h2
                  className="text-xl font-bold mb-3"
                  style={{ color: activeColor }}
                >
                  Education
                </h2>
                {resumeData.education.map((edu, index) => (
                  <ContextMenu
                    key={index}
                    sectionType="Education"
                    onAdd={addEducation}
                    onRemove={() => removeEducation(index)}
                    canRemove={resumeData.education.length > 1}
                  >
                    <div className="mb-3">
                      <div className="flex flex-col md:flex-row md:justify-between">
                        <h3
                          className="font-bold p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newValue = e.currentTarget.textContent;
                            const updatedEducation = [...resumeData.education];
                            updatedEducation[index] = {
                              ...updatedEducation[index],
                              degree: newValue,
                            };
                            setResumeData((prev) => ({
                              ...prev,
                              education: updatedEducation,
                            }));
                          }}
                        >
                          {edu.degree}
                        </h3>
                        <span
                          className="text-gray-600 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newValue = e.currentTarget.textContent;
                            const updatedEducation = [...resumeData.education];
                            updatedEducation[index] = {
                              ...updatedEducation[index],
                              duration: newValue,
                            };
                            setResumeData((prev) => ({
                              ...prev,
                              education: updatedEducation,
                            }));
                          }}
                        >
                          {edu.duration}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between">
                        <h4
                          className="font-medium text-gray-700 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newValue = e.currentTarget.textContent;
                            const updatedEducation = [...resumeData.education];
                            updatedEducation[index] = {
                              ...updatedEducation[index],
                              institution: newValue,
                            };
                            setResumeData((prev) => ({
                              ...prev,
                              education: updatedEducation,
                            }));
                          }}
                        >
                          {edu.institution}
                        </h4>
                        <span
                          className="text-gray-600 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newValue = e.currentTarget.textContent;
                            const updatedEducation = [...resumeData.education];
                            updatedEducation[index] = {
                              ...updatedEducation[index],
                              location: newValue,
                            };
                            setResumeData((prev) => ({
                              ...prev,
                              education: updatedEducation,
                            }));
                          }}
                        >
                          {edu.location}
                        </span>
                      </div>
                    </div>
                  </ContextMenu>
                ))}
              </div>
            )
          );
        case "skills":
          return (
            sectionSettings.skills.showSkills && (
              <div className="mb-6">
                <h2
                  className="text-xl font-bold mb-3"
                  style={{ color: activeColor }}
                >
                  Skills
                </h2>
                {resumeData.skills.map((skillGroup, index) => (
                  <ContextMenu
                    key={index}
                    sectionType="Skill Category"
                    onAdd={addSkillCategory}
                    onRemove={() => removeSkillCategory(index)}
                    canRemove={resumeData.skills.length > 1}
                  >
                    <div className="mb-3">
                      <h3
                        className="font-bold mb-1 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newValue = e.currentTarget.textContent;
                          const updatedSkills = [...resumeData.skills];
                          updatedSkills[index] = {
                            ...updatedSkills[index],
                            category: newValue,
                          };
                          setResumeData((prev) => ({
                            ...prev,
                            skills: updatedSkills,
                          }));
                        }}
                      >
                        {skillGroup.category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skillGroup.items.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 text-sm border border-transparent hover:border-gray-300 focus:outline-none focus:border-gray-400"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const newValue = e.currentTarget.textContent;
                              const updatedSkills = [...resumeData.skills];
                              const updatedItems = [
                                ...updatedSkills[index].items,
                              ];
                              updatedItems[idx] = newValue;
                              updatedSkills[index] = {
                                ...updatedSkills[index],
                                items: updatedItems,
                              };
                              setResumeData((prev) => ({
                                ...prev,
                                skills: updatedSkills,
                              }));
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </ContextMenu>
                ))}
              </div>
            )
          );
        case "achievements":
          return (
            sectionSettings.achievements.showAchievements && (
              <div className="mb-6">
                <h2
                  className="text-xl font-bold mb-3"
                  style={{ color: activeColor }}
                >
                  Achievements
                </h2>
                {resumeData.achievements.map((achievement, index) => (
                  <ContextMenu
                    key={index}
                    sectionType="Achievement"
                    onAdd={addAchievement}
                    onRemove={() => removeAchievement(index)}
                    canRemove={resumeData.achievements.length > 1}
                  >
                    <div className="mb-3">
                      <h3
                        className="font-bold p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newValue = e.currentTarget.textContent;
                          const updatedAchievements = [
                            ...resumeData.achievements,
                          ];
                          updatedAchievements[index] = {
                            ...updatedAchievements[index],
                            keyAchievements: newValue,
                          };
                          setResumeData((prev) => ({
                            ...prev,
                            achievements: updatedAchievements,
                          }));
                        }}
                      >
                        {achievement.keyAchievements}
                      </h3>
                      <p
                        className="text-gray-700 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newValue = e.currentTarget.textContent;
                          const updatedAchievements = [
                            ...resumeData.achievements,
                          ];
                          updatedAchievements[index] = {
                            ...updatedAchievements[index],
                            describe: newValue,
                          };
                          setResumeData((prev) => ({
                            ...prev,
                            achievements: updatedAchievements,
                          }));
                        }}
                      >
                        {achievement.describe}
                      </p>
                    </div>
                  </ContextMenu>
                ))}
              </div>
            )
          );
        case "languages":
          return (
            sectionSettings.languages.showLanguages && (
              <div className="mb-6">
                <h2
                  className="text-xl font-bold mb-3"
                  style={{ color: activeColor }}
                >
                  Languages
                </h2>
                {resumeData.languages.map((language, index) => (
                  <ContextMenu
                    key={index}
                    sectionType="Language"
                    onAdd={addLanguage}
                    onRemove={() => removeLanguage(index)}
                    canRemove={resumeData.languages.length > 1}
                  >
                    <div className="mb-2 flex items-center">
                      <span
                        className="font-medium w-24 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newValue = e.currentTarget.textContent;
                          const updatedLanguages = [...resumeData.languages];
                          updatedLanguages[index] = {
                            ...updatedLanguages[index],
                            name: newValue,
                          };
                          setResumeData((prev) => ({
                            ...prev,
                            languages: updatedLanguages,
                          }));
                        }}
                      >
                        {language.name}
                      </span>
                      <div className="flex ml-2 language-dots">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full mx-1 language-dot ${
                              i < language.dots ? "bg-gray-700" : "bg-gray-300"
                            } cursor-pointer`}
                            onClick={() => {
                              const updatedLanguages = [
                                ...resumeData.languages,
                              ];
                              updatedLanguages[index] = {
                                ...updatedLanguages[index],
                                dots: i + 1,
                                level: (() => {
                                  const currentLang = updatedLanguages[index];
                                  const isSpanishContext =
                                    currentLang?.name
                                      ?.toLowerCase()
                                      .includes("español") ||
                                    currentLang?.name
                                      ?.toLowerCase()
                                      .includes("spanish") ||
                                    currentLang?.level
                                      ?.toLowerCase()
                                      .includes("nativo") ||
                                    currentLang?.level
                                      ?.toLowerCase()
                                      .includes("avanzado") ||
                                    currentLang?.level
                                      ?.toLowerCase()
                                      .includes("intermedio") ||
                                    currentLang?.level
                                      ?.toLowerCase()
                                      .includes("básico") ||
                                    currentLang?.level
                                      ?.toLowerCase()
                                      .includes("principiante");

                                  if (isSpanishContext) {
                                    return i + 1 === 1
                                      ? "Principiante"
                                      : i + 1 === 2
                                        ? "Básico"
                                        : i + 1 === 3
                                          ? "Intermedio"
                                          : i + 1 === 4
                                            ? "Avanzado"
                                            : "Nativo";
                                  } else {
                                    return i + 1 === 1
                                      ? "Beginner"
                                      : i + 1 === 2
                                        ? "Elementary"
                                        : i + 1 === 3
                                          ? "Intermediate"
                                          : i + 1 === 4
                                            ? "Advanced"
                                            : "Native";
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
                      <span
                        className="ml-2 text-gray-600 text-sm p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newValue = e.currentTarget.textContent;
                          const updatedLanguages = [...resumeData.languages];
                          updatedLanguages[index] = {
                            ...updatedLanguages[index],
                            level: newValue,
                          };
                          setResumeData((prev) => ({
                            ...prev,
                            languages: updatedLanguages,
                          }));
                        }}
                      >
                        {language.level}
                      </span>
                    </div>
                  </ContextMenu>
                ))}
              </div>
            )
          );
        default:
          return null;
      }
    },
    [resumeData, sectionSettings, activeColor],
  );

  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;

      const items = Array.from(sectionsOrder);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setSectionsOrder(items);
      setActiveSection(null);
    },
    [sectionsOrder],
  );

  if (isLoadingResume) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Loading Resume...
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we load your resume data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row min-h-screen bg-gray-100">
      <div className="hidden xl:block">
        <Sidebar
          setActiveSection={setActiveSection}
          handleDownload={handleDownload}
          handleShare={handleShare}
          branding={branding}
          handleBrandingToggle={handleBrandingToggle}
          handleUploadResume={handleUploadResume}
          handleColorPicker={handleColorPicker}
          handleSaveResume={handleSaveResume}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          resumeData={resumeData}
          setResumeData={setResumeData}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div className="xl:hidden">
        <div style={{ display: "none" }}>
          <Sidebar
            setActiveSection={setActiveSection}
            handleDownload={handleDownload}
            handleShare={handleShare}
            branding={branding}
            handleBrandingToggle={handleBrandingToggle}
            handleUploadResume={handleUploadResume}
            handleColorPicker={handleColorPicker}
            handleSaveResume={handleSaveResume}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            resumeData={resumeData}
            setResumeData={setResumeData}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      <div className="flex-1 p-4 xl:p-8 xl:ml-72 overflow-auto main-content">
        {(isLoading || isDownloading || isEnhancing) && !aiModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white p-5 rounded-lg shadow-xl flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
              <p className="text-xl font-semibold">
                {isEnhancing
                  ? "Enhancing your resume with AI..."
                  : isDownloading
                    ? "Generating PDF..."
                    : "Loading..."}
              </p>
            </div>
          </div>
        )}

        {showAIErrorPopup && !aiModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
              <h3 className="text-xl font-bold mb-4 text-red-600">
                AI Enhancement Error
              </h3>
              <p className="mb-4">
                There was an error enhancing your resume. Please try again
                later.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAIErrorPopup(false)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showUploadErrorPopup && !aiModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
              <h3 className="text-xl font-bold mb-4 text-red-600">
                Upload Error
              </h3>
              <p className="mb-4">
                There was an error uploading your resume. Please try again with
                a supported format.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowUploadErrorPopup(false)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
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
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">
                Your resume has been saved successfully.
              </p>
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
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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
          <div
            className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-xl z-40"
            data-color-picker
          >
            <h3 className="font-bold mb-2">Choose Theme Color</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                "#1e40af",
                "#047857",
                "#7c3aed",
                "#b91c1c",
                "#0369a1",
                "#ea580c",
                "#4b5563",
              ].map((color) => (
                <div
                  key={color}
                  className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition ${
                    activeColor === color
                      ? "ring-2 ring-offset-2 ring-gray-400"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setActiveColor(color);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <motion.div
          className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden resume-container relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div
            className="p-8"
            ref={resumeRef}
            style={{ minHeight: "297mm", width: "100%" }}
          >
            {sectionSettings.header.showTitle && (
              <motion.div
                className="mb-6 border-b pb-6"
                style={{ borderColor: activeColor }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.h1
                  className={`text-3xl font-bold ${
                    sectionSettings.header.uppercaseName ? "uppercase" : ""
                  } p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400`}
                  style={{ color: activeColor }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newValue = e.currentTarget.textContent;
                    setResumeData((prev) => ({
                      ...prev,
                      name: newValue,
                    }));
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  {resumeData.name}
                </motion.h1>
                <motion.h2
                  className="text-xl text-gray-700 p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newValue = e.currentTarget.textContent;
                    setResumeData((prev) => ({
                      ...prev,
                      role: newValue,
                    }));
                  }}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  {resumeData.role}
                </motion.h2>

                <div className="flex flex-wrap mt-2 text-sm gap-3">
                  {sectionSettings.header.showPhone && (
                    <div className="flex items-center">
                      <span className="mr-1">📞</span>
                      <span
                        className="p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newValue = e.currentTarget.textContent;
                          setResumeData((prev) => ({
                            ...prev,
                            phone: newValue,
                          }));
                        }}
                      >
                        {resumeData.phone}
                      </span>
                    </div>
                  )}

                  {sectionSettings.header.showEmail && (
                    <div className="flex items-center">
                      <span className="mr-1">✉️</span>
                      <span
                        className="p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newValue = e.currentTarget.textContent;
                          setResumeData((prev) => ({
                            ...prev,
                            email: newValue,
                          }));
                        }}
                      >
                        {resumeData.email}
                      </span>
                    </div>
                  )}

                  {sectionSettings.header.showLink && (
                    <div className="flex items-center">
                      <span className="mr-1">🔗</span>
                      <span
                        className="p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newValue = e.currentTarget.textContent;
                          setResumeData((prev) => ({
                            ...prev,
                            linkedin: newValue,
                          }));
                        }}
                      >
                        {resumeData.linkedin}
                      </span>
                    </div>
                  )}

                  {sectionSettings.header.showLocation && (
                    <div className="flex items-center">
                      <span className="mr-1">📍</span>
                      <span
                        className="p-1 border border-transparent hover:border-gray-300 rounded focus:outline-none focus:border-gray-400"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newValue = e.currentTarget.textContent;
                          setResumeData((prev) => ({
                            ...prev,
                            location: newValue,
                          }));
                        }}
                      >
                        {resumeData.location}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {sectionsOrder.map((section) => (
              <div key={section}>{renderSection(section)}</div>
            ))}

            {branding && (
              <div className="mt-10 text-center text-sm text-gray-400 font-medium transition-all duration-300 hover:text-gray-600 hover:drop-shadow-lg">
                <div className="flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-indigo-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span className="text-indigo-400 font-semibold">
                    Aditya Resume Builder
                  </span>
                  <span className="ml-2">
                    Developed by{" "}
                    <span className="text-black font-semibold">Aditya</span>
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Save Resume
              </h3>
              <p className="text-gray-600">Give your resume a memorable name</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Name
              </label>
              <input
                type="text"
                value={resumeNameInput}
                onChange={(e) => setResumeNameInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    confirmSaveResume();
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
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
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
              >
                Save Resume
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <HamburgerMenu
        handleDownload={handleDownload}
        handleShare={handleShare}
        handleColorPicker={handleColorPicker}
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
        <div
          className="fixed z-50 hidden xl:block"
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 9999,
          }}
          data-profile-menu
        >
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            {getUserInitial()}
          </button>

          {showUserDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName || user?.username}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              {resumeTitle && currentResumeId && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-800">
                      {resumeTitle}
                    </span>
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
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
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
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <div
          className="fixed z-50 hidden xl:flex space-x-2"
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-4 py-2 bg-white bg-opacity-20 text-gray-800 rounded-lg font-medium hover:bg-opacity-30 transition-all duration-200 backdrop-blur-sm border border-white border-opacity-50"
          >
            Login
          </button>
          <button
            onClick={() => setShowSignupModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 shadow-lg"
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Resume Not Saved
            </h3>
            <p className="text-gray-600 mb-6">
              Your resume is being downloaded, but it hasn't been saved to your
              account. Sign in to automatically save your resume whenever you
              download it.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDownloadNotification(false);
                  setShowLoginModal(true);
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={async () => {
                  setShowDownloadNotification(false);
                  setIsDownloading(true);
                  await performDownload();
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
    </div>
  );
};

export default ResumeTemplate1;
