import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import useAIEnhancer from "../service";


const MobileAIModal = ({
  showAIModal,
  setShowAIModal,
  resumeData,
  setResumeData,
  isLoading,
  setIsLoading,
}) => {

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
    if (resumeData?.role && resumeData.role !== targetJob) {
      setTargetJob(resumeData.role);
    }
  }, [resumeData?.role]);


  useEffect(() => {
    if (showAIModal) {
      setEnhancementComplete(false);
      setEnhancedSections(new Set());
      setCurrentEnhancingSection("");
      setEnhancementError(null);
      setApiStatus({
        type: "idle",
        message: "",
        endpoint: "",
        isUsingPrimary: true,
        isSwitchingToFallback: false,
        geminiError: "",
      });
    }
  }, [showAIModal]);


  const handleSectionChange = (e) => {
    setEnhancementType(e.target.value);
  };


  const handleAIEnhancement = () => {
    setShowAIModal(true);
    setEnhancementComplete(false);
    setEnhancedSections(new Set());
    setCurrentEnhancingSection("");
    setEnhancementError(null);
    setApiStatus({
      type: "idle",
      message: "",
      endpoint: "",
      isUsingPrimary: true,
      isSwitchingToFallback: false,
      geminiError: "",
    });
    document.body.classList.add("modal-open");
  };


  const enhanceIndividualSection = async (section) => {
    try {
      if (section === "summary" && resumeData.summary) {
        const enhanced = await enhanceText(
          resumeData.summary,
          "summary",
          targetJob,
          industryType,
          setApiStatus,
        );
        setResumeData((prev) => ({
          ...prev,
          summary: enhanced,
        }));
      } else if (section === "experience" && resumeData.experience) {
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
      } else if (section === "skills" && resumeData.skills) {
        try {
          if (!Array.isArray(resumeData.skills)) {
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
            if (!skillGroup.items || skillGroup.items.length === 0) {
              enhancedSkills.push(skillGroup);
              continue;
            }

            const enhancedItems = [];

            for (let i = 0; i < skillGroup.items.length; i++) {
              const skill = skillGroup.items[i];

              if (!skill || skill.trim() === "") {
                const avoidSkillsList = globalGeneratedSkills.join(", ");
                const contextText = `Generate a unique professional skill for ${skillGroup.category} category. MUST avoid: ${avoidSkillsList}. Position: ${targetJob}. Be creative and specific.`;

                const enhanced = await enhanceText(
                  contextText,
                  "skills",
                  targetJob,
                  industryType,
                  setApiStatus,
                ).catch((error) => {
                  console.error("Error enhancing empty skill:", error);
                  return `Skill${i + 1}`;
                });

                let newSkill = enhanced.trim();
                if (newSkill.includes(":")) {
                  newSkill = newSkill.split(":")[0].trim();
                }
                newSkill = newSkill.split(" ")[0].replace(/[^a-zA-Z]/g, "");

                if (
                  !globalGeneratedSkills.includes(newSkill) &&
                  newSkill.length > 2
                ) {
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

                const enhanced = await enhanceText(
                  contextText,
                  "skills",
                  targetJob,
                  industryType,
                  setApiStatus,
                ).catch((error) => {
                  console.error(
                    "Error enhancing existing skill:",
                    skill,
                    error,
                  );
                  return skill;
                });

                let enhancedSkill = enhanced.trim();
                if (enhancedSkill.includes(":")) {
                  enhancedSkill = enhancedSkill.split(":")[0].trim();
                }
                enhancedSkill = enhancedSkill
                  .split(" ")[0]
                  .replace(/[^a-zA-Z]/g, "");

                if (
                  !globalGeneratedSkills.includes(enhancedSkill) &&
                  enhancedSkill.length > 2
                ) {
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

          setResumeData((prev) => ({
            ...prev,
            skills: enhancedSkills,
          }));
        } catch (skillsError) {
          console.error("Skills enhancement failed:", skillsError);
          setEnhancementError(
            `Skills enhancement failed: ${skillsError.message}`,
          );
        }
      } else if (section === "achievements" && resumeData.achievements) {
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
    } catch (err) {
      console.error(`Error enhancing ${section}:`, err);
      throw err;
    }
  };


  const handleEnhance = async () => {
    if (!targetJob.trim()) {
      setEnhancementError("Please enter a target job title");
      return;
    }

    setIsLoading(true);
    setEnhancementError(null);
    setEnhancementComplete(false);
    setEnhancedSections(new Set());
    setCurrentEnhancingSection("");
    setApiStatus({
      type: "idle",
      message: "",
      endpoint: "",
      isUsingPrimary: true,
      isSwitchingToFallback: false,
      geminiError: "",
    });

    try {
      const section = enhancementType;

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

      setEnhancementComplete(true);
      setCurrentEnhancingSection("");
    } catch (error) {
      console.error("Enhancement error:", error);
      setEnhancementError(
        error.message || "An unexpected error occurred during enhancement",
      );
    } finally {
      setIsLoading(false);
    }
  };


  const closeModal = () => {
    setShowAIModal(false);
    document.body.classList.remove("modal-open");
    if (window.aiModalOpenCallback) {
      window.aiModalOpenCallback(false);
    }
  };

  if (!showAIModal) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-80 z-[99999] flex items-center justify-center p-4 modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 999999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ai-enhancement-modal relative z-[99999]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{ zIndex: 999999 }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >

        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            AI Resume Enhancement
          </h2>
          <button
            onClick={closeModal}
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


        <div className="p-6">
          {!enhancementComplete ? (

            enhancementType === "full" &&
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

                      const isEnhanced = enhancedSections.has(section);
                      const isCurrentlyEnhancing =
                        currentEnhancingSection === section && isLoading;

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
                              Attempting to use backup Gemini service...
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


                {enhancementError && apiStatus.type !== "error" && (
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
                        <div className="font-medium mb-1">Error</div>
                        <div className="text-xs text-red-700">
                          {enhancementError}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
                    <option value="summary">Professional Summary</option>
                    <option value="skills">Skills</option>
                    <option value="experience">Work Experience</option>
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
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    AI will tailor content to match this role's requirements
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
                    onClick={closeModal}
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition text-base"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEnhance}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-base flex items-center justify-center"
                    disabled={isLoading || !serviceAvailable}
                  >
                    {isLoading && enhancementType !== "full" ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Enhancing...
                      </>
                    ) : (
                      "Enhance with AI"
                    )}
                  </button>
                </div>
              </>
            )
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
                  Your resume has been successfully enhanced with AI-powered
                  improvements.
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
                  onClick={closeModal}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-base"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
};

export default MobileAIModal;
