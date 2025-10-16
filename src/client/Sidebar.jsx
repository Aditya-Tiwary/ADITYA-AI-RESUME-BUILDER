import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Link } from "wouter";
import useAIEnhancer from "./service";

const sidebarStyles = `
  .sidebar-scrollable {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
  }

  .sidebar-scrollable::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar-scrollable::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .sidebar-scrollable::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .sidebar-scrollable::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  @media screen and (min-width: 1280px) and (max-height: 740px) {
    .sidebar-container {
      height: 100vh;
      max-height: 100vh;
    }

    .sidebar-content {
      height: calc(100vh - 2rem);
      overflow-y: auto;
      padding-right: 0.5rem;
    }
  }

  @media screen and (min-width: 1280px) and (max-height: 600px) {
    .sidebar-content {
      height: calc(100vh - 1.5rem);
    }
  }

  @media screen and (min-width: 1280px) and (max-height: 500px) {
    .sidebar-content {
      height: calc(100vh - 1rem);
    }
  }
`;

const Sidebar = React.memo(
  ({
    setActiveSection,
    handleDownload,
    handleShare,
    branding,
    handleBrandingToggle,
    handleUploadResume,
    handleColorPicker,
    handleSaveResume,
    isLoading,
    setIsLoading,
    resumeData,
    setResumeData,
    isAuthenticated,
  }) => {
    const [showAIMenu, setShowAIMenu] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [enhancementType, setEnhancementType] = useState("full");
    const [targetJob, setTargetJob] = useState(resumeData?.role || "");
    const [industryType, setIndustryType] = useState("");
    const [enhancementError, setEnhancementError] = useState(null);
    const [serviceAvailable, setServiceAvailable] = useState(true);

    const [currentEnhancingSection, setCurrentEnhancingSection] = useState("");
    const [enhancementComplete, setEnhancementComplete] = useState(false);
    const [enhancedSections, setEnhancedSections] = useState(new Set());
    const [apiStatus, setApiStatus] = useState({
      type: "idle",
      message: "",
      endpoint: "",
      isUsingPrimary: true,
      isSwitchingToFallback: false,
      geminiError: "",
    });

    const { enhanceText, isEnhancing, error: aiError } = useAIEnhancer();
    useEffect(() => {
      const styleElement = document.createElement("style");
      styleElement.innerHTML = sidebarStyles;
      document.head.appendChild(styleElement);

      return () => {
        document.head.removeChild(styleElement);
      };
    }, []);

    useEffect(() => {
      setTargetJob(resumeData?.role || "");
    }, [resumeData?.role]);

    useEffect(() => {
      if (showAIModal) {
        setServiceAvailable(true);
        setEnhancementError(null);
        console.log(
          "🔧 DEBUG: AI modal opened - availability check removed to show real errors",
        );
      }
    }, [showAIModal]);

    useEffect(() => {
      if (showAIModal) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }

      return () => {
        document.body.style.overflow = "";
      };
    }, [showAIModal]);
    const handleSectionChange = (e) => {
      setEnhancementType(e.target.value);
    };

    const handleAIEnhancement = (section = null) => {
      setEnhancementType(section || "full");
      setShowAIModal(true);
      setIsLoading(false);
      setEnhancedSections(new Set());
      setCurrentEnhancingSection("");
      setEnhancementComplete(false);
      setEnhancementError(null);

      document.body.classList.add("modal-open");

      if (window.aiModalOpenCallback) {
        window.aiModalOpenCallback(true);
      }
    };

    const handleEnhance = async () => {
      setIsLoading(true);
      setEnhancementError(null);
      setCurrentEnhancingSection(enhancementType);
      setEnhancementComplete(false);
      setApiStatus({
        type: "idle",
        message: "",
        endpoint: "",
        isUsingPrimary: true,
        isSwitchingToFallback: false,
        geminiError: "",
      });

      try {
        await enhanceSection(enhancementType);

        setEnhancementComplete(true);

        if (enhancementType === "full") {
          setEnhancedSections(
            (prev) =>
              new Set([
                ...prev,
                "full",
                "summary",
                "experience",
                "skills",
                "achievements",
              ]),
          );
        } else {
          setEnhancedSections((prev) => new Set([...prev, enhancementType]));
        }

      } catch (err) {
        setEnhancementError(err.message || "Failed to enhance resume");
      } finally {
        setIsLoading(false);
      }
    };

    const enhanceIndividualSection = async (section) => {
      if (!resumeData) return;

      try {
        if (section === "summary") {
          const enhanced = await enhanceText(
            resumeData.summary || "",
            "summary",
            targetJob,
            industryType,
            setApiStatus,
          );
          setResumeData((prev) => ({
            ...prev,
            summary: enhanced,
          }));
        }
        else if (section === "experience" && resumeData.experience) {
          const enhancedExperience = await Promise.all(
            resumeData.experience.map(async (exp) => {
              const enhanced = await enhanceText(
                exp.accomplishment || "",
                "experience",
                targetJob,
                industryType,
                setApiStatus,
              );

              return {
                ...exp,
                accomplishment: enhanced,
              };
            }),
          );

          setResumeData((prev) => ({
            ...prev,
            experience: enhancedExperience,
          }));
        }
        else if (section === "headings" && resumeData.experience) {
          const enhancedExperience = await Promise.all(
            resumeData.experience.map(async (exp) => {
              if (!exp.role) return exp;

              const enhanced = await enhanceText(
                exp.role,
                "headings",
                targetJob,
                industryType,
                setApiStatus,
              );

              return {
                ...exp,
                role: enhanced,
              };
            }),
          );

          setResumeData((prev) => ({
            ...prev,
            experience: enhancedExperience,
          }));
        }
        else if (section === "skills" && resumeData.skills) {
          try {
            console.log("🔧 DEBUG: Skills enhancement starting for Template 3");
            console.log("🔧 DEBUG: resumeData.skills:", resumeData.skills);
            console.log("🔧 DEBUG: targetJob:", targetJob);
            console.log("🔧 DEBUG: industryType:", industryType);
            console.log(
              "🔧 DEBUG: Skills structure validation:",
              resumeData.skills.map((s) => ({
                category: s.category,
                itemsCount: s.items?.length || 0,
              })),
            );
            if (!Array.isArray(resumeData.skills)) {
              console.error(
                "🔧 DEBUG: Skills is not an array:",
                typeof resumeData.skills,
              );
              throw new Error("Skills data structure is invalid");
            }

            
            const allExistingSkills = resumeData.skills.flatMap(
              (group) =>
                group.items?.filter((skill) => skill && skill.trim() !== "") ||
                [],
            );

            
            const globalGeneratedSkills = [...allExistingSkills];

            const enhancedSkills = [];

            for (const skillGroup of resumeData.skills) {
              console.log("🔧 DEBUG: Processing skillGroup:", skillGroup);
              if (!skillGroup.items || skillGroup.items.length === 0) {
                console.log("🔧 DEBUG: Skipping empty skillGroup");
                enhancedSkills.push(skillGroup);
                continue;
              }

              const enhancedItems = [];
              console.log(
                "🔧 DEBUG: Processing",
                skillGroup.items.length,
                "items in category:",
                skillGroup.category,
              );

              for (let i = 0; i < skillGroup.items.length; i++) {
                const skill = skillGroup.items[i];

                if (!skill || skill.trim() === "") {
                  
                  const avoidSkillsList = globalGeneratedSkills.join(", ");
                  const contextText = `Generate a unique professional skill for ${skillGroup.category} category. MUST avoid: ${avoidSkillsList}. Position: ${targetJob}. Be creative and specific.`;

                  console.log(
                    "🔧 DEBUG: Calling enhanceText for empty skill with context:",
                    contextText,
                  );
                  const enhanced = await enhanceText(
                    contextText,
                    "skills",
                    targetJob,
                    industryType,
                    setApiStatus,
                  ).catch((error) => {
                    console.error(
                      "🔧 DEBUG: Error enhancing empty skill:",
                      error,
                    );
                    return `Skill${i + 1}`; 
                  });

                  console.log(
                    "🔧 DEBUG: Enhanced text for empty skill:",
                    enhanced,
                  );

                  
                  let newSkill = enhanced.trim();

                  
                  if (newSkill.includes(":")) {
                    newSkill = newSkill.split(":")[0].trim();
                  }

                  
                  newSkill = newSkill.split(" ")[0].replace(/[^a-zA-Z]/g, "");

                  console.log("🔧 DEBUG: Processed new skill name:", newSkill);

                  
                  if (
                    !globalGeneratedSkills.includes(newSkill) &&
                    newSkill.length > 2
                  ) {
                    console.log("🔧 DEBUG: Adding new unique skill:", newSkill);
                    globalGeneratedSkills.push(newSkill);
                    enhancedItems.push(newSkill);
                  } else {
                    
                    const fallbackSkills = [
                      "Analytics",
                      "Strategy",
                      "Innovation",
                      "Research",
                      "Optimization",
                      "Coordination",
                      "Implementation",
                      "Documentation",
                      "Testing",
                      "Mentoring",
                    ];
                    const uniqueSkill =
                      fallbackSkills.find(
                        (skill) => !globalGeneratedSkills.includes(skill),
                      ) || `Skill${i + 1}`;
                    globalGeneratedSkills.push(uniqueSkill);
                    enhancedItems.push(uniqueSkill);
                  }
                } else {
                  
                  const avoidSkillsList = globalGeneratedSkills.join(", ");
                  const contextText = `Enhance this skill "${skill}" to a better, more specific professional skill for ${skillGroup.category} category. MUST avoid: ${avoidSkillsList}. Position: ${targetJob}. Make it unique and professional.`;

                  console.log(
                    "🔧 DEBUG: Calling enhanceText for existing skill:",
                    skill,
                    "with context:",
                    contextText,
                  );
                  const enhanced = await enhanceText(
                    contextText,
                    "skills",
                    targetJob,
                    industryType,
                    setApiStatus,
                  ).catch((error) => {
                    console.error(
                      "🔧 DEBUG: Error enhancing existing skill:",
                      skill,
                      error,
                    );
                    return skill; 
                  });

                  console.log("🔧 DEBUG: Enhanced text received:", enhanced);

                  
                  let enhancedSkill = enhanced.trim();

                  
                  if (enhancedSkill.includes(":")) {
                    enhancedSkill = enhancedSkill.split(":")[0].trim();
                  }

                  
                  enhancedSkill = enhancedSkill
                    .split(" ")[0]
                    .replace(/[^a-zA-Z]/g, "");

                  console.log("🔧 DEBUG: Processed skill name:", enhancedSkill);

                  
                  if (
                    !globalGeneratedSkills.includes(enhancedSkill) &&
                    enhancedSkill.length > 2
                  ) {
                    console.log(
                      "🔧 DEBUG: Adding unique skill:",
                      enhancedSkill,
                    );
                    globalGeneratedSkills.push(enhancedSkill);
                    enhancedItems.push(enhancedSkill);
                  } else {
                    
                    const fallbackSkills = [
                      "Analytics",
                      "Strategy",
                      "Innovation",
                      "Research",
                      "Optimization",
                      "Coordination",
                      "Implementation",
                      "Documentation",
                      "Testing",
                      "Mentoring",
                      "Planning",
                      "Debugging",
                      "Architecture",
                      "Integration",
                      "Validation",
                      "Monitoring",
                      "Consulting",
                      "Training",
                      "Auditing",
                      "Compliance",
                      "Reporting",
                      "Visualization",
                      "Modeling",
                      "Prototyping",
                      "Deployment",
                      "Maintenance",
                    ];
                    const uniqueSkill =
                      fallbackSkills.find(
                        (skill) => !globalGeneratedSkills.includes(skill),
                      ) || `Enhanced${i + 1}`;
                    globalGeneratedSkills.push(uniqueSkill);
                    enhancedItems.push(uniqueSkill);
                  }
                }
              }

              enhancedSkills.push({
                ...skillGroup,
                items: enhancedItems,
              });
            }

            console.log("🔧 DEBUG: Final enhanced skills:", enhancedSkills);
            console.log("🔧 DEBUG: Updating resume data with enhanced skills");

            setResumeData((prev) => ({
              ...prev,
              skills: enhancedSkills,
            }));
          } catch (skillsError) {
            console.error("🔧 DEBUG: Skills enhancement failed:", skillsError);
            setEnhancementError(
              `Skills enhancement failed: ${skillsError.message}`,
            );
            
          }
        }
        
        else if (section === "achievements" && resumeData.achievements) {
          const enhancedAchievements = await Promise.all(
            resumeData.achievements.map(async (achievement) => {
              const enhanced = await enhanceText(
                achievement.describe || "",
                "achievements",
                targetJob,
                industryType,
                setApiStatus,
              );

              return {
                ...achievement,
                describe: enhanced,
              };
            }),
          );

          setResumeData((prev) => ({
            ...prev,
            achievements: enhancedAchievements,
          }));
        }
        
        else if (section === "education" && resumeData.education) {
          const enhancedEducation = await Promise.all(
            resumeData.education.map(async (edu) => {
              if (!edu.degree) return edu;

              const enhanced = await enhanceText(
                edu.degree,
                "education",
                targetJob,
                industryType,
                setApiStatus,
              );

              return {
                ...edu,
                degree: enhanced,
              };
            }),
          );

          setResumeData((prev) => ({
            ...prev,
            education: enhancedEducation,
          }));
        }
        
        else if (section === "projects" && resumeData.projects) {
          const enhancedProjects = await Promise.all(
            resumeData.projects.map(async (project) => {
              if (!project.description) return project;

              const enhanced = await enhanceText(
                project.description,
                "projects",
                targetJob,
                industryType,
                setApiStatus,
              );

              return {
                ...project,
                description: enhanced,
              };
            }),
          );

          setResumeData((prev) => ({
            ...prev,
            projects: enhancedProjects,
          }));
        }
      } catch (err) {
        console.error(`Error enhancing ${section}:`, err);
        throw err;
      }
    };


    const enhanceSection = async (section) => {
      
      if (!resumeData) return;

      try {
        
        if (section === "full") {
          
          
          const sections = ["summary", "experience", "achievements", "skills"];

          for (const sectionName of sections) {
            try {
              
              setCurrentEnhancingSection(sectionName);
              await enhanceIndividualSection(sectionName);
              
              setEnhancedSections((prev) => new Set([...prev, sectionName]));
            } catch (sectionError) {
              console.error(`Error enhancing ${sectionName}:`, sectionError);
              const sectionDisplayName =
                sectionName === "summary"
                  ? "Professional Summary"
                  : sectionName === "experience"
                    ? "Work Experience"
                    : sectionName === "skills"
                      ? "Skills"
                      : sectionName === "achievements"
                        ? "Achievements"
                        : sectionName.charAt(0).toUpperCase() +
                          sectionName.slice(1);
              throw new Error(
                `Failed to enhance ${sectionDisplayName}: ${sectionError.message || sectionError}`,
              );
            }
          }
        } else {
          
          await enhanceIndividualSection(section);
        }
      } catch (err) {
        console.error(`Error enhancing ${section}:`, err);
        throw err;
      }
    };

    return (
      <>
        <div className="xl:fixed xl:left-0 xl:top-0 xl:h-screen xl:w-72 sidebar sidebar-container z-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-10 left-8 w-4 h-4 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-60"
              style={{ animation: "float-particles 8s ease-in-out infinite" }}
            ></div>
            <div
              className="absolute top-32 right-12 w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-70"
              style={{
                animation: "float-particles 6s ease-in-out infinite 1s",
              }}
            ></div>
            <div
              className="absolute top-64 left-16 w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-50"
              style={{
                animation: "float-particles 10s ease-in-out infinite 2s",
              }}
            ></div>
            <div
              className="absolute bottom-32 right-6 w-5 h-5 bg-gradient-to-br from-green-400 to-teal-500 rounded-full opacity-60"
              style={{
                animation: "float-particles 7s ease-in-out infinite 3s",
              }}
            ></div>
            <div
              className="absolute bottom-16 left-4 w-3 h-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-55"
              style={{
                animation: "float-particles 9s ease-in-out infinite 4s",
              }}
            ></div>


            <div
              className="absolute top-20 right-4 w-16 h-16 bg-gradient-to-br from-pink-200/20 via-purple-200/15 to-blue-200/20 blur-xl"
              style={{ animation: "morph-bg 12s ease-in-out infinite" }}
            ></div>
            <div
              className="absolute bottom-40 left-2 w-12 h-12 bg-gradient-to-br from-green-200/20 via-teal-200/15 to-cyan-200/20 blur-xl"
              style={{ animation: "morph-bg 15s ease-in-out infinite 3s" }}
            ></div>
            <div
              className="absolute top-1/2 right-8 w-8 h-8 bg-gradient-to-br from-yellow-200/20 via-orange-200/15 to-red-200/20 blur-xl"
              style={{ animation: "morph-bg 10s ease-in-out infinite 6s" }}
            ></div>
          </div>

          <div className="flex justify-center xl:justify-start h-full relative z-10">
            <div
              className="inline-flex xl:w-full xl:h-full bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-2 xl:p-6 rounded-b-3xl xl:rounded-r-3xl xl:rounded-b-none shadow-2xl border-b xl:border-r xl:border-b-0 border-gray-200/50 flex-row xl:flex-col items-center xl:items-start"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 50%, rgba(255,255,255,0.95) 100%)",
                backdropFilter: "blur(10px)",
                borderImage:
                  "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(59,130,246,0.1), rgba(147,51,234,0.1)) 1",
              }}
            >
              <div className="w-full h-full flex flex-row xl:flex-col items-center xl:items-start space-x-2 xl:space-x-0 xl:space-y-3 z-30 overflow-x-auto xl:overflow-x-visible sidebar-content sidebar-scrollable">
                <h3 className="text-xl xl:text-xl font-bold text-gray-800 hidden xl:block flex-shrink-0 mb-1">
                  Resume Tools
                </h3>


                <Link
                  href="/templates"
                  className="w-14 h-14 xl:w-full flex-shrink-0"
                  style={{ marginBottom: "16px" }}
                >
                  <button
                    className="w-full h-full xl:h-24 rounded-2xl xl:rounded-2xl p-3 xl:p-4 shadow-2xl flex items-center justify-center xl:flex-col xl:justify-center transition-all duration-500 overflow-hidden cursor-pointer relative z-40 transform hover:scale-105 hover:shadow-3xl group"
                    style={{
                      background:
                        "linear-gradient(135deg, #00FFFF 0%, #00E5FF 25%, #00D4FF 50%, #00C9FF 75%, #00B8FF 100%)",
                      backgroundSize: "400% 400%",
                      animation: "gradient-flow 6s ease infinite",
                      boxShadow:
                        "0 20px 40px -10px rgba(0, 201, 255, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                      minWidth: "56px",
                      minHeight: "56px",
                      border: "2px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-pink-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                    <span className="text-3xl xl:hidden transform group-hover:rotate-180 transition-transform duration-500">
                      ✨
                    </span>
                    <div className="hidden xl:block w-full relative z-10">
                      <div className="flex items-center w-full gap-3 pl-3 mb-2">
                        <div className="p-2 bg-white/25 backdrop-blur-sm rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                          <img
                            src="/assets/button-icons/create-resume.svg"
                            alt=""
                            className="w-8 h-8 flex-shrink-0"
                          />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight group-hover:scale-110 transition-transform duration-300">
                          Create Resume
                        </h3>
                      </div>
                      <p
                        className="text-sm text-white font-semibold text-left transition-colors duration-300"
                        style={{ paddingLeft: "12px" }}
                      >
                        Choose templates
                      </p>
                    </div>
                  </button>
                </Link>

                <div
                  className="relative w-14 h-14 xl:w-full xl:h-32 flex items-center justify-center"
                  style={{ marginTop: "40px" }}
                >
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      animation: "ai-neon-border 3s ease-in-out infinite",
                      border: "1px solid #3b82f6",
                      zIndex: 30,
                    }}
                  ></div>

                  <button
                    className="w-14 h-14 xl:w-full xl:h-32 rounded-lg xl:rounded-lg p-3 xl:pt-1.5 xl:pb-4 xl:px-4 flex items-center justify-center xl:flex-col xl:items-start xl:justify-start transition-all duration-300 overflow-hidden flex-shrink-0 cursor-pointer relative z-50"
                    onClick={() => handleAIEnhancement()} 
                    data-ai-button="true" 
                    data-sidebar-ai-trigger 
                    style={{
                      background:
                        "url('/assets/gemini-2-flash.png') center/cover, linear-gradient(to right, #1a1a2e, #16213e)", 
                      
                      minWidth: "56px", 
                      minHeight: "56px", 
                    }}
                  >
                    <div className="flex items-center xl:flex-col xl:items-start w-full">
                      <span className="text-2xl xl:text-lg xl:hidden">🤖</span>
                      <div className="hidden xl:block h-full flex flex-col">
                        <h3
                          className="text-xl font-medium text-white leading-tight mb-auto tracking-wide pt-2"
                          style={{
                            fontFamily:
                              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          }}
                        >
                          AI Resume Enhancer
                        </h3>
                        <div className="text-left mt-auto pt-3">
                          <p
                            className="text-xs text-white opacity-70 mb-1"
                            style={{
                              fontFamily:
                                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            }}
                          >
                            Powered by
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  className="w-14 h-14 xl:w-full xl:h-24 rounded-2xl xl:rounded-2xl p-3 xl:p-4 shadow-2xl flex items-center justify-center xl:flex-col xl:justify-center transition-all duration-500 overflow-hidden flex-shrink-0 cursor-pointer relative z-40 transform hover:scale-105 hover:shadow-3xl group"
                  onClick={handleColorPicker}
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6B9D 0%, #FF8A80 25%, #FFAB91 50%, #FFCC80 75%, #FFE082 100%)",
                    backgroundSize: "350% 350%",
                    animation: "gradient-flow 9s ease infinite",
                    boxShadow:
                      "0 20px 40px -10px rgba(255, 107, 157, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                    minWidth: "56px",
                    minHeight: "56px",
                    border: "2px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 via-transparent to-pink-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                  <span className="text-3xl xl:hidden transform group-hover:rotate-180 transition-transform duration-500">
                    🌈
                  </span>
                  <div className="hidden xl:block w-full relative z-10">
                    <div className="flex items-center w-full gap-3 pl-3 mb-2">
                      <div className="p-2 bg-white/25 backdrop-blur-sm rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                        <img
                          src="/assets/button-icons/color-theme.svg"
                          alt=""
                          className="w-8 h-8 flex-shrink-0"
                        />
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:scale-110 transition-transform duration-300">
                        Color Theme
                      </h3>
                    </div>
                    <p
                      className="text-sm text-white font-semibold text-left transition-colors duration-300"
                      style={{ paddingLeft: "12px" }}
                    >
                      Customize your resume colors
                    </p>
                  </div>
                </button>


                <button
                  className="w-14 h-14 xl:w-full xl:h-24 rounded-2xl xl:rounded-2xl p-3 xl:p-4 shadow-2xl flex items-center justify-center xl:flex-col xl:justify-center transition-all duration-500 overflow-hidden flex-shrink-0 cursor-pointer relative z-40 transform hover:scale-105 hover:shadow-3xl group"
                  onClick={handleDownload}
                  style={{
                    background:
                      "linear-gradient(135deg, #FF4500 0%, #FF6347 25%, #FF7F50 50%, #FFA500 75%, #FFD700 100%)",
                    backgroundSize: "320% 320%",
                    animation: "gradient-flow 7s ease infinite",
                    boxShadow:
                      "0 20px 40px -10px rgba(255, 69, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
                    minWidth: "56px",
                    minHeight: "56px",
                    border: "2px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 via-transparent to-red-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                  <span className="text-3xl xl:hidden transform group-hover:scale-125 transition-transform duration-500">
                    ⚡
                  </span>
                  <div className="hidden xl:block w-full relative z-10">
                    <div className="flex items-center w-full gap-3 pl-3 mb-2">
                      <div className="p-2 bg-white/25 backdrop-blur-sm rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                        <img
                          src="/assets/button-icons/download.svg"
                          alt=""
                          className="w-8 h-8 flex-shrink-0 filter brightness-0 invert"
                        />
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:scale-110 transition-transform duration-300">
                        Download
                      </h3>
                    </div>
                    <p
                      className="text-sm text-white font-semibold text-left transition-colors duration-300"
                      style={{ paddingLeft: "12px" }}
                    >
                      Export as PDF or print
                    </p>
                  </div>
                </button>


                <button
                  className="w-14 h-14 xl:w-full xl:h-24 rounded-2xl xl:rounded-2xl p-3 xl:p-4 shadow-2xl flex items-center justify-center xl:flex-col xl:justify-center transition-all duration-500 overflow-hidden flex-shrink-0 cursor-pointer relative z-40 transform hover:scale-105 hover:shadow-3xl group"
                  onClick={handleSaveResume}
                  style={{
                    background: isAuthenticated
                      ? "linear-gradient(135deg, #20B2AA 0%, #008B8B 25%, #4682B4 50%, #5F9EA0 75%, #87CEEB 100%)"
                      : "linear-gradient(135deg, #708090 0%, #2F4F4F 25%, #696969 50%, #778899 75%, #B0C4DE 100%)",
                    backgroundSize: "280% 280%",
                    animation: "gradient-flow 11s ease infinite",
                    boxShadow: isAuthenticated
                      ? "0 20px 40px -10px rgba(32, 178, 170, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)"
                      : "0 20px 40px -10px rgba(112, 128, 144, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                    minWidth: "56px",
                    minHeight: "56px",
                    border: "2px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${
                      isAuthenticated
                        ? "bg-gradient-to-br from-cyan-200/20 via-transparent to-blue-200/20"
                        : "bg-gradient-to-br from-gray-200/20 via-transparent to-gray-300/20"
                    }`}
                  ></div>

                  <span className="text-3xl xl:hidden transform group-hover:scale-125 transition-transform duration-500">
                    {isAuthenticated ? "💾" : "🔒"}
                  </span>
                  <div className="hidden xl:block w-full relative z-10">
                    <div className="flex items-center w-full gap-3 pl-3 mb-2">
                      <div className="p-2 bg-white/25 backdrop-blur-sm rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                        <img
                          src={
                            isAuthenticated
                              ? "/assets/button-icons/save.svg"
                              : "/assets/button-icons/login.svg"
                          }
                          alt=""
                          className="w-8 h-8 flex-shrink-0 filter brightness-0 invert"
                        />
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:scale-110 transition-transform duration-300">
                        {isAuthenticated ? "Save" : "Login to Save"}
                      </h3>
                    </div>
                    <p
                      className="text-sm text-white font-semibold text-left transition-colors duration-300"
                      style={{ paddingLeft: "12px" }}
                    >
                      {isAuthenticated
                        ? "Save your progress"
                        : "Sign in to save your work"}
                    </p>
                  </div>
                </button>


                <button
                  className="w-14 h-14 xl:w-full xl:h-24 rounded-2xl xl:rounded-2xl p-3 xl:p-4 shadow-2xl flex items-center justify-center xl:flex-col xl:justify-center transition-all duration-500 overflow-hidden flex-shrink-0 cursor-pointer relative z-40 transform hover:scale-105 hover:shadow-3xl group"
                  onClick={handleShare}
                  style={{
                    background:
                      "linear-gradient(135deg, #2D1B69 0%, #3730A3 25%, #4338CA 50%, #6366F1 75%, #8B5CF6 100%)",
                    backgroundSize: "360% 360%",
                    animation: "gradient-flow 13s ease infinite",
                    boxShadow:
                      "0 20px 40px -10px rgba(45, 27, 105, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                    minWidth: "56px",
                    minHeight: "56px",
                    border: "2px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 via-transparent to-purple-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                  <span className="text-3xl xl:hidden transform group-hover:rotate-180 transition-transform duration-500">
                    🚀
                  </span>
                  <div className="hidden xl:block w-full relative z-10">
                    <div className="flex items-center w-full gap-3 pl-3 mb-2">
                      <div className="p-2 bg-white/25 backdrop-blur-sm rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                        <img
                          src="/assets/button-icons/share.svg"
                          alt=""
                          className="w-8 h-8 flex-shrink-0 filter brightness-0 invert"
                        />
                      </div>
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:scale-110 transition-transform duration-300">
                        Share
                      </h3>
                    </div>
                    <p
                      className="text-sm text-white font-semibold text-left transition-colors duration-300"
                      style={{ paddingLeft: "12px" }}
                    >
                      Send to social media
                    </p>
                  </div>
                </button>

                <div
                  className="w-12 h-12 xl:w-full xl:h-28 rounded-2xl xl:rounded-2xl p-2 xl:p-4 shadow-2xl flex items-center justify-center xl:flex-col xl:items-center transition-all duration-500 overflow-hidden flex-shrink-0 transform hover:scale-105 hover:shadow-3xl group relative"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFD700 0%, #FFA500 25%, #FF8C00 50%, #FF7F50 75%, #FF6347 100%)",
                    backgroundSize: "340% 340%",
                    animation: "gradient-flow 15s ease infinite",
                    boxShadow:
                      "0 20px 40px -10px rgba(255, 215, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.4)",
                    border: "2px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 via-transparent to-purple-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

                  <span className="text-3xl xl:hidden transform group-hover:rotate-180 transition-transform duration-500">
                    ✨
                  </span>
                  <div className="hidden xl:block w-full relative z-10">
                    <div className="flex items-center justify-between w-full pl-3 pr-2 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/25 backdrop-blur-sm rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                          <img
                            src="/assets/button-icons/branding.svg"
                            alt=""
                            className="w-12 h-8 flex-shrink-0"
                          />
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight group-hover:scale-110 transition-transform duration-300">
                          Branding
                        </h3>
                      </div>


                      <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={branding}
                          onChange={handleBrandingToggle}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-5 rounded-2xl relative transition-all duration-500 transform hover:scale-110 ${
                            branding
                              ? "bg-gradient-to-r from-emerald-400 to-green-500 shadow-xl shadow-green-500/40"
                              : "bg-gradient-to-r from-gray-300 to-gray-400 shadow-xl shadow-gray-400/40"
                          }`}
                          style={{
                            boxShadow: branding
                              ? "0 8px 25px rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)"
                              : "0 8px 25px rgba(156, 163, 175, 0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
                          }}
                        >
                          <div
                            className="absolute w-3 h-3 bg-white rounded-full left-1 top-1 transition-all duration-500 shadow-xl flex items-center justify-center"
                            style={{
                              transform: branding
                                ? "translateX(20px)"
                                : "translateX(0)",
                              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
                            }}
                          >
                            <div
                              className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                                branding ? "bg-green-500" : "bg-gray-400"
                              }`}
                            ></div>
                          </div>
                        </div>
                      </label>
                    </div>
                    <p
                      className="text-sm text-white/95 font-semibold text-left group-hover:text-white transition-colors duration-300"
                      style={{ paddingLeft: "12px" }}
                    >
                      Show or hide watermark
                    </p>
                  </div>


                  <div
                    className="xl:hidden absolute inset-0 cursor-pointer"
                    onClick={handleBrandingToggle}
                  />
                </div>
              </div>
            </div>
          </div>


          {showAIModal &&
            createPortal(
              <motion.div
                
                className="fixed inset-0 bg-black bg-opacity-80 z-[99999] flex items-center justify-center p-4 modal-overlay"
                
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                style={{ zIndex: 999999 }} 
                onClick={(e) => {
                  
                  if (e.target === e.currentTarget) {
                    setShowAIModal(false);
                    
                    document.body.classList.remove("modal-open");
                  }
                }}
              >
                <motion.div
                  
                  className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden ai-enhancement-modal relative z-[99999]"
                  
                  initial={{ scale: 0.9, y: 20 }} 
                  animate={{ scale: 1, y: 0 }} 
                  exit={{ scale: 0.9, y: 20 }} 
                  style={{ zIndex: 999999 }} 
                  onClick={(e) => {
                    
                    e.stopPropagation();
                  }}
                >
                  <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">
                      AI Resume Enhancement
                    </h2>
                    <button
                      onClick={() => {
                        setShowAIModal(false);
                        
                        document.body.classList.remove("modal-open");

                        
                        if (window.aiModalOpenCallback) {
                          window.aiModalOpenCallback(false);
                        }
                      }}
                      className="text-gray-500 hover:text-gray-700 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex">
                    <div className="flex-1 p-6 border-r border-gray-200">
                      {!enhancementComplete ? (
                        <>
                          <div className="mb-5">
                            <label className="block text-gray-700 text-base mb-2">
                              What would you like to enhance?
                            </label>
                            <select
                              value={enhancementType}
                              onChange={handleSectionChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={isLoading}
                            >
                              <option value="full">Full Resume</option>
                              <option value="summary">
                                Professional Summary
                              </option>
                              <option value="skills">Skills</option>
                              <option value="experience">
                                Work Experience
                              </option>
                              <option value="achievements">Achievements</option>
                            </select>
                          </div>

                          <div className="mb-5">
                            <label className="block text-gray-700 text-base mb-2">
                              Target Job Title
                            </label>
                            <input
                              type="text"
                              value={targetJob}
                              onChange={(e) => setTargetJob(e.target.value)}
                              placeholder="Experienced Project Manager | IT | Leadership | Cost Management"
                              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={isLoading}
                            />
                            <p className="mt-1 text-sm text-gray-500">
                              AI will tailor content to match this role's
                              requirements
                            </p>
                          </div>

                          <div className="mb-6">
                            <label className="block text-gray-700 text-base mb-2">
                              Industry (Optional)
                            </label>
                            <input
                              type="text"
                              value={industryType}
                              onChange={(e) => setIndustryType(e.target.value)}
                              placeholder="e.g. Tech, Healthcare, Finance"
                              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => {
                                setShowAIModal(false);
                                
                                document.body.classList.remove("modal-open");

                                if (window.aiModalOpenCallback) {
                                  window.aiModalOpenCallback(false);
                                }
                              }}
                              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition text-base"
                              disabled={isLoading}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleEnhance}
                              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-base"
                              disabled={isLoading || !serviceAvailable}
                            >
                              {isLoading ? (
                                
                                <span className="flex items-center space-x-2">
                                  <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  <span>Enhancing...</span>
                                </span>
                              ) : (
                                
                                "Enhance with AI"
                              )}
                            </button>
                          </div>
                        </>
                      ) : (

                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                              <svg
                                className="w-8 h-8 text-green-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                              Enhancement Complete!
                            </h3>
                            <p className="text-gray-600 mb-6">
                              Your resume has been successfully enhanced with
                              AI-powered improvements.
                            </p>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <h4 className="font-semibold text-green-800 mb-2">
                              What's been improved:
                            </h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              <li>• Professional language and tone</li>
                              <li>• Industry-specific keywords</li>
                              <li>• Quantified achievements where possible</li>
                              <li>• Content tailored to target role</li>
                              <li>• Improved structure and readability</li>
                            </ul>
                          </div>

                          <div className="flex justify-center">
                            <button
                              onClick={() => {
                                setShowAIModal(false);
                                document.body.classList.remove("modal-open");
                                if (window.aiModalOpenCallback) {
                                  window.aiModalOpenCallback(false);
                                }
                              }}
                              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-base"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>


                    <div className="flex-1 bg-gray-50 p-6">

                      {(enhancementType === "full" ||
                        currentEnhancingSection === "full") &&
                      (isLoading ||
                        enhancedSections.size > 0 ||
                        apiStatus.type !== "idle" ||
                        enhancementError) ? (
                        <div className="space-y-3">

                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Enhancement Status
                            </h4>
                            <div className="space-y-2">
                              {[
                                "full",
                                "summary",
                                "experience",
                                "skills",
                                "achievements",
                              ].map((section) => {
                                const sectionNames = {
                                  full: "Full Resume",
                                  summary: "Professional Summary",
                                  experience: "Work Experience",
                                  skills: "Skills",
                                  achievements: "Achievements",
                                };

                                const isEnhanced =
                                  enhancedSections.has(section);
                                const isCurrentlyEnhancing =
                                  currentEnhancingSection === section &&
                                  isLoading;

                                return (
                                  <div
                                    key={section}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                                  >
                                    <span className="text-sm font-medium text-gray-700">
                                      {sectionNames[section]}
                                    </span>
                                    <div className="flex items-center">
                                      {isCurrentlyEnhancing ? (
                                        
                                        <div className="relative flex items-center justify-center">
                                          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                      ) : isEnhanced ? (
                                        
                                        <svg
                                          className="h-5 w-5 text-green-500"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      ) : (
                                        
                                        <svg
                                          className="h-5 w-5 text-red-500"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>


                          {(isLoading ||
                            apiStatus.type === "error" ||
                            apiStatus.isSwitchingToFallback) && (
                            <div className="space-y-2">

                              <div
                                className={`p-3 rounded-md text-sm border-l-4 ${
                                  apiStatus.isUsingPrimary
                                    ? "bg-blue-50 text-blue-800 border-blue-400"
                                    : "bg-amber-50 text-amber-800 border-amber-400"
                                }`}
                              >
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    {apiStatus.isUsingPrimary ? (
                                      <svg
                                        className="h-4 w-4 text-blue-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="h-4 w-4 text-amber-500"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="ml-2">
                                    <span className="font-medium">
                                      Currently using:{" "}
                                      {apiStatus.isUsingPrimary
                                        ? "Primary Gemini API"
                                        : "Fallback Gemini API"}
                                    </span>
                                  </div>
                                </div>
                              </div>


                              {apiStatus.isSwitchingToFallback && (
                                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm border-l-4 border-yellow-400">
                                  <div className="flex items-start">
                                    <svg
                                      className="animate-spin h-4 w-4 text-yellow-600 mr-2 mt-0.5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                    <div className="flex-1">
                                      <div className="font-medium mb-1">
                                        Switching to Fallback API...
                                      </div>
                                      {apiStatus.geminiError && (
                                        <div className="text-xs bg-yellow-100 p-2 rounded border-l-2 border-yellow-300 mb-2">
                                          <div className="font-medium text-yellow-900">
                                            Primary API Error:
                                          </div>
                                          <div className="text-yellow-700">
                                            {apiStatus.geminiError}
                                          </div>
                                        </div>
                                      )}
                                      <div className="text-xs text-yellow-700">
                                        Attempting to use backup Gemini
                                        service...
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}


                              {apiStatus.type === "error" && (
                                <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm border-l-4 border-red-400">
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                      <svg
                                        className="h-4 w-4 text-red-400 mt-0.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                    <div className="ml-2 flex-1">
                                      <div className="font-medium mb-1">
                                        {apiStatus.endpoint} API Error
                                      </div>
                                      {apiStatus.geminiError && (
                                        <div className="text-xs mb-1 bg-red-100 p-2 rounded border-l-2 border-red-300">
                                          <div className="font-medium text-red-900">
                                            Gemini API Error:
                                          </div>
                                          <div className="text-red-700">
                                            {apiStatus.geminiError}
                                          </div>
                                        </div>
                                      )}
                                      <div>{apiStatus.message}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}


                          {enhancementError && apiStatus.type === "idle" && (
                            <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
                              <div className="font-bold mb-1">
                                Enhancement Error
                              </div>
                              <div>{enhancementError}</div>
                            </div>
                          )}
                        </div>
                      ) : (

                        <div className="space-y-4">
                          <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                              <svg
                                className="w-8 h-8 text-indigo-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              AI Enhancement Tips
                            </h3>
                            <p className="text-gray-600 text-sm">
                              Get the most out of your resume enhancement
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 text-blue-500 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Be Specific
                              </h4>
                              <p className="text-sm text-gray-600">
                                Include specific job titles and industry details
                                for better targeted enhancements.
                              </p>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 text-green-500 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Full Resume
                              </h4>
                              <p className="text-sm text-gray-600">
                                Choose "Full Resume" for comprehensive
                                improvements across all sections.
                              </p>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                                <svg
                                  className="w-4 h-4 text-purple-500 mr-2"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Review Changes
                              </h4>
                              <p className="text-sm text-gray-600">
                                Always review the enhanced content and make
                                manual adjustments as needed.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                  <div className="bg-gray-50 px-6 py-4 text-sm text-gray-600 border-t border-gray-200">
                    <p>

                      Our AI will improve your resume's language, add metrics
                      where appropriate, and ensure content is tailored to your
                      target job.
                    </p>
                  </div>
                </motion.div>
              </motion.div>,
              document.body,
            )}
        </div>
      </>
    );
  },
);


export default Sidebar;
