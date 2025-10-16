import { useState, useCallback } from "react";
import axios from "axios";

class AIEnhancementService {
  constructor() {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";

    this.apiUrl = "";
  }

  async checkServiceAvailability() {
    try {
      try {
        const response = await axios.get(`${this.apiUrl}/api/health`, {
          timeout: 5000,
        });

        if (response.status === 200 && response.data?.status === "ok") {
          return true;
        }
      } catch (apiHealthError) {
      }

      try {
        const altResponse = await axios.get(`${this.apiUrl}/health`, {
          timeout: 5000,
        });

        if (altResponse.status === 200 && altResponse.data?.status === "ok") {
          return true;
        }
      } catch (healthError) {
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async enhanceText(
    text,
    sectionType,
    jobTitle = "",
    industry = "",
    setApiStatus = null,
  ) {
    if (!text && !jobTitle) {
      throw new Error("Text or job title is required for enhancement");
    }

    console.log("🔧 DEBUG: enhanceText called with:", {
      text,
      sectionType,
      jobTitle,
      industry,
    });
    console.log("🔧 DEBUG: API URL:", this.apiUrl);
    console.log(`🚀 ENHANCEMENT START: Enhancing ${sectionType} section...`);
    const extractGeminiError = (error) => {
      console.log(
        "🔧 DEBUG: Extracting Gemini error from:",
        JSON.stringify(error.response?.data, null, 2),
      );
      console.log("🔧 DEBUG: Error response status:", error.response?.status);
      console.log(
        "🔧 DEBUG: Error response statusText:",
        error.response?.statusText,
      );

      if (error.response && error.response.data) {
        const data = error.response.data;

        if (data.message && data.details) {
          console.log(
            "🔧 DEBUG: Found detailed server error:",
            data.message,
            data.details,
          );
          return data.message;
        }

        if (
          data.message &&
          data.message !== "Enhancement process failed" &&
          data.message !== "Gemini API Error"
        ) {
          console.log("🔧 DEBUG: Found server message:", data.message);
          return data.message;
        }

        if (data.error) {
          console.log("🔧 DEBUG: Found error object:", data.error);
          if (typeof data.error === "string") {
            return data.error;
          }

          if (data.error.message) {
            let geminiError = data.error.message;
            if (data.error.code) {
              geminiError = `Code ${data.error.code}: ${geminiError}`;
            }
            if (data.error.status) {
              geminiError = `${data.error.status} - ${geminiError}`;
            }
            console.log("🔧 DEBUG: Constructed detailed error:", geminiError);
            return geminiError;
          }
        }

        if (data.details && data.details.originalMessage) {
          console.log(
            "🔧 DEBUG: Found original message in details:",
            data.details.originalMessage,
          );
          return data.details.originalMessage;
        }

        if (error.response.status === 200) {
          if (data.enhancedText) {
            console.error(
              "🔧 ERROR: Response had enhancedText but we missed it:",
              data.enhancedText,
            );
            return "Unexpected error: response contained enhanced text but wasn't processed correctly";
          }
          return data.message;
        }

        const statusMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        console.log("🔧 DEBUG: Using default HTTP error:", statusMessage);
        return statusMessage;
      }

      const networkError =
        error.message || `Network error: ${error.code || "Unknown"}`;
      console.log("🔧 DEBUG: Using network error:", networkError);
      return networkError;
    };

    try {
      if (setApiStatus) {
        setApiStatus({
          type: "processing",
          message: `Enhancing ${sectionType}...`,
          endpoint: "Primary Gemini",
          isUsingPrimary: true,
          isSwitchingToFallback: false,
          geminiError: "",
        });
      }

      try {
        console.log("🔧 DEBUG: Attempting primary endpoint /api/enhance");
        const response = await axios.post(
          `${this.apiUrl}/api/enhance`,
          {
            text,
            sectionType,
            jobTitle,
            industry,
          },
          {
            timeout: 15000,
            validateStatus: function (status) {
              return status >= 200 && status < 600;
            },
          },
        );

        console.log("🔧 DEBUG: Primary endpoint response:", response.data);
        console.log("🔧 DEBUG: Response status:", response.status);
        console.log(
          "🔧 DEBUG: Response structure keys:",
          response.data ? Object.keys(response.data) : "no data",
        );
        console.log(
          "🔧 DEBUG: Has enhancedText?",
          !!response.data?.enhancedText,
        );
        console.log(
          "🔧 DEBUG: enhancedText type:",
          typeof response.data?.enhancedText,
        );
        console.log(
          "🔧 DEBUG: enhancedText length:",
          response.data?.enhancedText?.length,
        );
        console.log(
          "🔧 DEBUG: enhancedText content:",
          response.data?.enhancedText || "missing",
        );
        console.log("🔧 DEBUG: Response data type:", typeof response.data);
        console.log(
          "🔧 DEBUG: Full response object:",
          JSON.stringify(response, null, 2),
        );

        if (response.status >= 400) {
          console.log(
            "🔧 DEBUG: Server returned error status, treating as error",
          );
          const error = new Error("Server returned error status");
          error.response = response;
          throw error;
        }

        if (response.data && response.data.enhancedText) {
          console.log(
            "🔧 DEBUG: Primary endpoint success, returning enhanced text",
          );
          console.log(
            "🔧 DEBUG: Enhanced text length:",
            response.data.enhancedText.length,
          );

          if (setApiStatus) {
            setApiStatus({
              type: "success",
              message: `${sectionType} enhanced successfully using Primary Gemini API`,
              endpoint: "Primary Gemini",
              isUsingPrimary: true,
              isSwitchingToFallback: false,
              geminiError: "",
            });
          }

          return response.data.enhancedText;
        } else {
          console.error(
            "🔧 ERROR: Primary endpoint returned response without enhancedText",
          );
          console.error(
            "🔧 ERROR: Full response data:",
            JSON.stringify(response.data, null, 2),
          );
          console.error("🔧 ERROR: Response status:", response.status);
          console.error(
            "🔧 ERROR: Response headers:",
            JSON.stringify(response.headers, null, 2),
          );
          console.error("🔧 ERROR: Axios response structure:", {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            config: {
              url: response.config?.url,
              method: response.config?.method,
              headers: response.config?.headers,
            },
          });

          let errorMessage;
          if (response.data && typeof response.data === "object") {
            if (
              response.data.error &&
              response.data.message &&
              response.data.details
            ) {
              errorMessage = response.data.message;
              console.log(
                "🔧 DEBUG: Server returned error in 200 response:",
                errorMessage,
              );
            } else if (response.data.error) {
              errorMessage = response.data.error;
            } else if (response.data.message) {
              if (
                response.data.message.includes("Error") ||
                response.data.message.includes("failed") ||
                response.data.message.includes("unavailable") ||
                response.data.message.includes("exceeded") ||
                response.data.message.includes("blocked")
              ) {
                errorMessage = response.data.message;
              } else {
                errorMessage = `Server returned unexpected message: ${response.data.message}`;
              }
            } else {
              errorMessage = `Primary API returned unexpected response structure: ${JSON.stringify(Object.keys(response.data))}`;
            }
          } else {
            errorMessage = `Primary API returned non-object response: ${typeof response.data}`;
          }

          const error = new Error(errorMessage);
          error.endpoint = "primary";
          error.response = response;
          throw error;
        }
      } catch (apiError) {
        const primaryGeminiError = extractGeminiError(apiError);
        console.error("🔧 DEBUG: Primary endpoint error:", primaryGeminiError);
        console.error("🔧 DEBUG: Full error object:", apiError);

        if (setApiStatus) {
          setApiStatus({
            type: "processing",
            message: "Switching to Fallback API...",
            endpoint: "Primary Gemini",
            isUsingPrimary: false,
            isSwitchingToFallback: true,
            geminiError: primaryGeminiError,
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (setApiStatus) {
          setApiStatus({
            type: "processing",
            message: `Enhancing ${sectionType} with fallback API...`,
            endpoint: "Fallback Gemini",
            isUsingPrimary: false,
            isSwitchingToFallback: false,
            geminiError: "",
          });
        }

        try {
          console.log(
            "🔧 DEBUG: Attempting fallback endpoint with different approach",
          );

          const altResponse = await axios.post(
            `${this.apiUrl}/enhance`,
            {
              text,
              sectionType,
              jobTitle,
              industry,
            },
            {
              timeout: 20000,
              validateStatus: function (status) {
                return status < 500;
              },
            },
          );

          console.log(
            "🔧 DEBUG: Alternative endpoint response:",
            altResponse.data,
          );

          if (altResponse.data && altResponse.data.enhancedText) {
            console.log(
              "🔧 DEBUG: Alternative endpoint success, returning enhanced text",
            );

            if (setApiStatus) {
              setApiStatus({
                type: "success",
                message: `${sectionType} enhanced successfully using Fallback Gemini API`,
                endpoint: "Fallback Gemini",
                isUsingPrimary: false,
                isSwitchingToFallback: false,
                geminiError: "",
              });
            }

            return altResponse.data.enhancedText;
          } else {
            console.log(
              "🔧 DEBUG: Alternative endpoint returned response without enhancedText",
            );
            console.log(
              "🔧 DEBUG: Alternative endpoint full response:",
              JSON.stringify(altResponse.data, null, 2),
            );

            let errorMessage;
            if (altResponse.data && typeof altResponse.data === "object") {
              if (
                altResponse.data.error &&
                altResponse.data.message &&
                altResponse.data.details
              ) {
                errorMessage = altResponse.data.message;
                console.log(
                  "🔧 DEBUG: Fallback server returned error response:",
                  errorMessage,
                );
              } else if (altResponse.data.error) {
                errorMessage = altResponse.data.error;
              } else if (
                altResponse.data.message &&
                altResponse.data.message !== "Enhancement process failed"
              ) {
                if (
                  altResponse.data.message.includes("Error") ||
                  altResponse.data.message.includes("failed") ||
                  altResponse.data.message.includes("unavailable") ||
                  altResponse.data.message.includes("exceeded") ||
                  altResponse.data.message.includes("blocked")
                ) {
                  errorMessage = altResponse.data.message;
                } else {
                  errorMessage = `Fallback server returned unexpected message: ${altResponse.data.message}`;
                }
              } else if (altResponse.status >= 400) {
                errorMessage = `Fallback API returned error status ${altResponse.status}: ${altResponse.statusText || "Unknown error"}`;
              } else {
                errorMessage =
                  "Fallback Gemini API returned empty response - no enhanced text or error message received";
              }
            } else {
              errorMessage = `Fallback API returned non-object response: ${typeof altResponse.data}`;
            }

            const error = new Error(errorMessage);
            error.endpoint = "fallback";
            error.response = altResponse;
            throw error;
          }
        } catch (altApiError) {
          const fallbackGeminiError = extractGeminiError(altApiError);
          console.error(
            "🔧 DEBUG: Alternative endpoint error:",
            fallbackGeminiError,
          );
          console.error(
            "🔧 DEBUG: Full alternative error object:",
            altApiError,
          );

          if (setApiStatus) {
            setApiStatus({
              type: "error",
              message:
                "Both Primary and Fallback APIs failed. Please try again.",
              endpoint: "Fallback Gemini",
              isUsingPrimary: false,
              isSwitchingToFallback: false,
              geminiError: fallbackGeminiError,
            });
          }

          const error = new Error(
            `Both Gemini APIs failed. Primary: ${primaryGeminiError}. Fallback: ${fallbackGeminiError}`,
          );
          error.endpoint = "both";
          error.primaryError = primaryGeminiError;
          error.fallbackError = fallbackGeminiError;
          throw error;
        }
      }

      console.error("🔧 DEBUG: Both endpoints failed, throwing generic error");
      console.error(
        "🔧 DEBUG: This should NOT happen - if you see this, both API calls failed",
      );
      throw new Error(
        "Enhancement service unavailable. Please check your connection and try again.",
      );
    } catch (error) {
      console.error("🔧 DEBUG: Outer catch block error:", error);

      if (setApiStatus && !error.endpoint) {
        setApiStatus({
          type: "error",
          message: "Network or service error occurred",
          endpoint: "Unknown",
          isUsingPrimary: true,
          isSwitchingToFallback: false,
          geminiError: error.message || "Unknown error",
        });
      }

      throw error;
    }
  }

  getErrorMessage(error) {
    if (error.response) {
      if (error.response.data) {
        if (error.response.data.message) {
          return error.response.data.message;
        }
        if (error.response.data.error) {
          return error.response.data.error;
        }
      }
      return `Server error: ${error.response.status}`;
    } else if (error.request) {
      return "No response from enhancement service. Please ensure the server is running.";
    } else {
      return error.message || "Unknown error occurred";
    }
  }
}

const aiEnhancementService = new AIEnhancementService();

const useAIEnhancer = () => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState(null);

  const enhanceText = useCallback(
    async (
      text,
      sectionType,
      jobTitle = "",
      industry = "",
      setApiStatus = null,
    ) => {
      if (!text && jobTitle) {
        text = `Generate content for ${sectionType} section for a ${jobTitle} position`;
      }
      if (!text) return text;

      setIsEnhancing(true);
      setError(null);

      try {
        if (text === "test" && sectionType === "test") {
          try {
            const testResponse = await axios.get(
              `${aiEnhancementService.apiUrl}/health`,
              {
                timeout: 5000,
              },
            );

            if (testResponse.status === 200) {
              return "Test successful";
            }
          } catch (testError) {
            throw new Error("AI enhancement service not available");
          }
        }

        try {
          const enhancedText = await aiEnhancementService.enhanceText(
            text,
            sectionType,
            jobTitle,
            industry,
            setApiStatus,
          );

          if (enhancedText) {
            return enhancedText;
          } else {
            throw new Error("Empty response from enhancement service");
          }
        } catch (apiError) {
          throw apiError;
        }
      } catch (err) {
        setError(err.message || "Failed to enhance resume content");
        throw new Error(err.message || "Failed to enhance resume content");
      } finally {
        setIsEnhancing(false);
      }
    },
    [],
  );

  const enhanceSection = useCallback(
    async (resumeData, setResumeData, section, index = null) => {
      setIsEnhancing(true);
      setError(null);

      try {
        let textToEnhance = "";
        let jobTitle = resumeData.role || "";

        if (section === "summary") {
          textToEnhance = resumeData.summary;
        } else if (section === "experience" && index !== null) {
          textToEnhance = resumeData.experience[index].accomplishment;
        } else if (
          section === "experience" &&
          index === null &&
          resumeData.experience &&
          resumeData.experience.length > 0
        ) {
          textToEnhance = resumeData.experience[0].accomplishment;
          index = 0;
        } else if (section === "achievements" && index !== null) {
          textToEnhance = resumeData.achievements[index].description;
        } else if (
          section === "achievements" &&
          index === null &&
          resumeData.achievements &&
          resumeData.achievements.length > 0
        ) {
          textToEnhance = resumeData.achievements[0].description;
          index = 0;
        } else if (section === "education" && index !== null) {
          textToEnhance =
            resumeData.education[index].description ||
            resumeData.education[index].degree;
        } else if (
          section === "education" &&
          index === null &&
          resumeData.education &&
          resumeData.education.length > 0
        ) {
          textToEnhance =
            resumeData.education[0].description ||
            resumeData.education[0].degree;
          index = 0;
        } else if (section === "projects" && index !== null) {
          textToEnhance = resumeData.projects[index].description;
        } else if (
          section === "projects" &&
          index === null &&
          resumeData.projects &&
          resumeData.projects.length > 0
        ) {
          textToEnhance = resumeData.projects[0].description;
          index = 0;
        } else if (section === "skills") {
          textToEnhance = JSON.stringify(resumeData.skills);
        } else {
          throw new Error("Invalid section or missing index for array section");
        }

        const enhancedText = await enhanceText(
          textToEnhance,
          section,
          jobTitle,
        );

        if (section === "summary") {
          setResumeData((prev) => ({
            ...prev,
            summary: enhancedText,
          }));
        } else if (section === "experience" && index !== null) {
          setResumeData((prev) => {
            const updatedExperience = [...prev.experience];
            updatedExperience[index] = {
              ...updatedExperience[index],
              accomplishment: enhancedText,
            };
            return {
              ...prev,
              experience: updatedExperience,
            };
          });
        } else if (section === "achievements" && index !== null) {
          setResumeData((prev) => {
            const updatedAchievements = [...prev.achievements];
            updatedAchievements[index] = {
              ...updatedAchievements[index],
              description: enhancedText,
            };
            return {
              ...prev,
              achievements: updatedAchievements,
            };
          });
        } else if (section === "education" && index !== null) {
          setResumeData((prev) => {
            const updatedEducation = [...prev.education];
            if ("description" in updatedEducation[index]) {
              updatedEducation[index] = {
                ...updatedEducation[index],
                description: enhancedText,
              };
            } else {
              updatedEducation[index] = {
                ...updatedEducation[index],
                degree: enhancedText,
              };
            }
            return {
              ...prev,
              education: updatedEducation,
            };
          });
        } else if (section === "projects" && index !== null) {
          setResumeData((prev) => {
            const updatedProjects = [...prev.projects];
            updatedProjects[index] = {
              ...updatedProjects[index],
              description: enhancedText,
            };
            return {
              ...prev,
              projects: updatedProjects,
            };
          });
        } else if (section === "skills") {
          try {
            const enhancedSkills = JSON.parse(enhancedText);
            if (Array.isArray(enhancedSkills)) {
              setResumeData((prev) => ({
                ...prev,
                skills: enhancedSkills,
              }));
            }
          } catch (e) {
            setResumeData((prev) => ({
              ...prev,
              skills: prev.skills,
            }));
          }
        }

        return enhancedText;
      } catch (error) {
        setError(error.message || "Failed to enhance content");
        return textToEnhance;
      } finally {
        setIsEnhancing(false);
      }
    },
    [enhanceText],
  );

  const enhanceFullResume = useCallback(
    async (resumeData, updateResume) => {
      if (!resumeData) return false;

      setIsEnhancing(true);
      setError(null);

      try {
        const jobTitle = resumeData.role || "";

        if (resumeData.summary !== undefined) {
          const enhancedSummary = await enhanceText(
            resumeData.summary,
            "summary",
            jobTitle,
          );
          updateResume((prev) => ({
            ...prev,
            summary: enhancedSummary,
          }));
        }

        if (resumeData.experience && resumeData.experience.length > 0) {
          const enhancedExperience = await Promise.all(
            resumeData.experience.map(async (exp) => {
              const enhancedAccomplishment = await enhanceText(
                exp.accomplishment,
                "experience",
                jobTitle,
              );

              return {
                ...exp,
                accomplishment: enhancedAccomplishment,
              };
            }),
          );

          updateResume((prev) => ({
            ...prev,
            experience: enhancedExperience,
          }));
        }

        if (resumeData.achievements && resumeData.achievements.length > 0) {
          const enhancedAchievements = await Promise.all(
            resumeData.achievements.map(async (achievement) => {
              if (achievement.description) {
                const enhancedDescription = await enhanceText(
                  achievement.description,
                  "achievements",
                  jobTitle,
                );

                return {
                  ...achievement,
                  description: enhancedDescription,
                };
              } else if (achievement.describe) {
                const enhancedDescription = await enhanceText(
                  achievement.describe,
                  "achievements",
                  jobTitle,
                );

                return {
                  ...achievement,
                  describe: enhancedDescription,
                };
              } else if (achievement.keyAchievements) {
                const enhancedTitle = await enhanceText(
                  achievement.keyAchievements,
                  "achievements",
                  jobTitle,
                );

                return {
                  ...achievement,
                  keyAchievements: enhancedTitle,
                };
              }

              return achievement;
            }),
          );

          updateResume((prev) => ({
            ...prev,
            achievements: enhancedAchievements,
          }));
        }

        return true;
      } catch (err) {
        setError(err.message || "Failed to enhance resume");
        return false;
      } finally {
        setIsEnhancing(false);
      }
    },
    [enhanceText],
  );

  return {
    enhanceText,
    enhanceSection,
    enhanceFullResume,
    isEnhancing,
    error,
  };
};

export default useAIEnhancer;
export { aiEnhancementService };
