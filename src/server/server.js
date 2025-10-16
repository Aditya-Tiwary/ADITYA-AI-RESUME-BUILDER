const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const axios = require("axios");

const connectDB = require("../database/connection");
const authRoutes = require("../routes/auth");
const resumeRoutes = require("../routes/resume");

connectDB();

const app = express();
const PORT = 3002;

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'https://localhost:3000',
        /^https:\/\/.*\.replit\.dev$/,
        /^https:\/\/.*\.pike\.replit\.dev$/
      ];
      
      if (!origin || allowedOrigins.some(allowed => 
        typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
      )) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);

app.post("/enhance", async (req, res) => {
  try {
    console.log("Received AI enhancement request:", {
      sectionType: req.body.sectionType,
      hasJobTitle: !!req.body.jobTitle,
      hasIndustry: !!req.body.industry,
      textLength: req.body.text?.length || 0,
      forceFallbackKey: !!req.body.forceFallbackKey,
    });

    const { text, sectionType, jobTitle, industry, forceFallbackKey } = req.body;

    if (!text && !jobTitle) {
      return res
        .status(400)
        .json({ error: "Text or job title is required for enhancement" });
    }

    const primaryKey = process.env.GEMINI_API_KEY || process.env.GEMINI_PRIMARY_KEY;
    const secondaryKey = process.env.GEMINI_SECONDARY_KEY;

    if (!primaryKey) {
      return res.status(500).json({ 
        error: "AI service not configured. Please set GEMINI_API_KEY in environment variables." 
      });
    }

    const startWithFallback = forceFallbackKey === true;
    console.log(`🔧 API KEY STRATEGY: ${startWithFallback ? 'Starting with fallback key (forced)' : 'Starting with primary key (normal)'}`);

    let prompt = "";

    if (
      sectionType === "skills" &&
      (text.includes("Generate a relevant skill") ||
        text.includes("Generate a unique professional skill") ||
        text.includes("Enhance this skill"))
    ) {
      prompt = `${text}

CRITICAL REQUIREMENTS:
1. Return EXACTLY ONE WORD ONLY - no sentences, descriptions, or explanations
2. Must be a professional skill relevant to the specified category
3. MUST be different from any skills mentioned in the "avoid" list
4. Choose from diverse skills like: Analytics, Strategy, Coordination, Optimization, Execution, Innovation, Collaboration, Research, Development, Implementation, Automation, Documentation, Troubleshooting, Facilitation, Negotiation, Budgeting, Forecasting, Planning, Debugging, Architecture, Integration, Validation, Monitoring, Consulting, Training, Auditing, Compliance, Reporting, Visualization, Modeling, Prototyping, Deployment, Maintenance, Scalability, Security, Performance, Quality, Efficiency, Productivity, Communication, Presentation, Leadership, Teamwork, Creativity, Problem-solving, Critical-thinking, Time-management, Adaptability, Flexibility, Reliability, Initiative, Accountability, Attention-to-detail

ONE UNIQUE WORD:`;
    } else if (text && text.includes("Generate content for")) {
      prompt = `${text}`;

      if (jobTitle) {
        prompt += ` for a ${jobTitle} position`;
      }

      if (industry) {
        prompt += ` in the ${industry} industry`;
      }

      prompt += `.

IMPORTANT INSTRUCTIONS:
1. Generate professional, relevant content for the specified section
2. Only return the generated content with NO explanations, analysis, or comments
3. Do not include phrases like "Here's content for" or "Generated content:"
4. Do not include asterisks, bullet points, or any explanatory formatting
5. Only output the final content that the person should use directly
6. Make it specific and tailored to the job title and industry provided
7. Do not make the text bold, italic or anything like that just plain text only

Generated content:`;
    } else {
      prompt = `Your task is to enhance the following ${sectionType || "resume content"} making it more professional, impactful, and results-oriented`;

      if (jobTitle) {
        prompt += ` for a ${jobTitle} position`;
      }

      if (industry) {
        prompt += ` in the ${industry} industry`;
      }

      prompt += `.

IMPORTANT INSTRUCTIONS:
1. Only return the enhanced text itself with NO explanations, analysis, or comments
2. Do not include phrases like "Enhanced version:" or "Here's an enhanced version"
3. Do not include asterisks, bullet points, or any explanatory formatting
4. Do not explain your changes or reasoning
5. Only output the final enhanced text that the person should use directly
6. Do not make the text bold, italic or anything like that just plain text only
Original text: ${text}

Enhanced version (ONLY return the enhanced text, no explanations):`;
    }

    console.log("Sending request to Gemini AI...");

    const attemptGeminiCall = async (keyToUse) => {
      return await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keyToUse}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature:
              sectionType === "skills" &&
              text.includes("Generate a relevant skill")
                ? 0.8
                : 0.7,
            maxOutputTokens:
              sectionType === "skills" &&
              text.includes("Generate a relevant skill")
                ? 10
                : 1024,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        },
      );
    };

    let response;
    let usedApiKey = "primary";
    
    try {
      console.log(`🔑 PRIMARY API: Attempting ${sectionType} enhancement with primary key...`);
      response = await attemptGeminiCall(primaryKey);
      console.log(`✅ PRIMARY API SUCCESS: ${sectionType} enhanced successfully with primary key`);
    } catch (primaryError) {
      console.log(`❌ PRIMARY API FAILED: ${sectionType} enhancement failed with primary key`);
      console.log("Primary error details:", {
        status: primaryError.response?.status,
        statusText: primaryError.response?.statusText,
        message: primaryError.message,
        errorData: primaryError.response?.data
      });
      
      if (secondaryKey) {
        try {
          console.log(`🔄 SWITCHING TO FALLBACK: Attempting ${sectionType} enhancement with secondary key...`);
          response = await attemptGeminiCall(secondaryKey);
          usedApiKey = "fallback";
          console.log(`✅ FALLBACK API SUCCESS: ${sectionType} enhanced successfully with fallback key`);
        } catch (secondaryError) {
          console.log(`❌ BOTH APIS FAILED: ${sectionType} enhancement failed with both primary and fallback keys`);
          console.log("Secondary error details:", {
            status: secondaryError.response?.status,
            statusText: secondaryError.response?.statusText,
            message: secondaryError.message,
            errorData: secondaryError.response?.data
          });
          throw primaryError;
        }
      } else {
        throw primaryError;
      }
    }

    console.log("🔍 GEMINI API RESPONSE DEBUG:", {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      candidates: response.data?.candidates ? response.data.candidates.length : 'none',
      candidatesStructure: response.data?.candidates?.[0] ? Object.keys(response.data.candidates[0]) : 'none'
    });

    let rawText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.data.candidates?.[0]?.outputs?.[0]?.text ||
      response.data.text;

    if (!rawText) {
      console.log("❌ NO TEXT FOUND - Full Response Data:", JSON.stringify(response.data, null, 2));
      
      if (response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
          const reasonMessages = {
            'MAX_TOKENS': 'Response exceeded maximum token limit',
            'SAFETY': 'Response was blocked by Gemini safety filters',
            'RECITATION': 'Response was blocked due to potential copyright issues',
            'OTHER': 'Response was blocked for other policy reasons'
          };
          const reasonMessage = reasonMessages[candidate.finishReason] || `Response blocked: ${candidate.finishReason}`;
          throw new Error(`Gemini API blocked response: ${reasonMessage}`);
        }
      }
      
      if (response.data.candidates && response.data.candidates.length === 0) {
        throw new Error(`Gemini API quota exhausted: No response candidates returned (likely rate limit or quota exceeded)`);
      }
      
      if (response.data.error) {
        throw new Error(`Gemini API error: ${response.data.error.message || response.data.error}`);
      }
    }

    if (rawText) {
      console.log(
        "Enhanced text generated successfully - length:",
        rawText.length,
      );
      let enhancedText = cleanEnhancedText(rawText);

      if (
        sectionType === "skills" &&
        text.includes("Generate a relevant skill")
      ) {
        enhancedText = enhancedText.split(/\s+/)[0].replace(/[^\w]/g, "");
        enhancedText =
          enhancedText.charAt(0).toUpperCase() +
          enhancedText.slice(1).toLowerCase();
      }

      return res.json({ 
        enhancedText,
        apiInfo: {
          usedKey: usedApiKey,
          sectionType: sectionType,
          keyUsed: usedApiKey === "primary" ? "Primary" : "Fallback"
        }
      });
    } else {
      throw new Error("No valid response from Gemini API");
    }
  } catch (geminiError) {
    console.error("Gemini API error details:", {
      message: geminiError.message,
      status: geminiError.response?.status,
      statusText: geminiError.response?.statusText,
      data: geminiError.response?.data,
      code: geminiError.code
    });
    
    let errorCode = geminiError.response?.status || "UNKNOWN";
    let errorType = geminiError.code || "NETWORK_ERROR";
    let geminiErrorData = geminiError.response?.data;
    let detailedMessage = geminiError.message || "Unknown error occurred";
    
    if (geminiErrorData) {
      if (geminiErrorData.error) {
        detailedMessage = `${geminiErrorData.error.message || geminiErrorData.error}`;
        errorCode = geminiErrorData.error.code || errorCode;
        errorType = geminiErrorData.error.status || errorType;
      }
    }
    
    let userFriendlyMessage = "";
    
    if (errorCode === 429 || errorType === "RESOURCE_EXHAUSTED") {
      userFriendlyMessage = `Rate Limit Exceeded (Error ${errorCode}): You've made too many requests. Please wait a few minutes and try again.`;
    } else if (errorCode === 401 || errorType === "UNAUTHENTICATED") {
      userFriendlyMessage = `Authentication Failed (Error ${errorCode}): Invalid API key. Please check your Gemini API configuration.`;
    } else if (errorCode === 403 || errorType === "PERMISSION_DENIED") {
      userFriendlyMessage = `Permission Denied (Error ${errorCode}): Your API key doesn't have permission to use this service.`;
    } else if (errorCode === 400 || errorType === "INVALID_ARGUMENT") {
      userFriendlyMessage = `Invalid Request (Error ${errorCode}): The request format is incorrect. ${detailedMessage}`;
    } else if (errorCode === 404) {
      userFriendlyMessage = `Service Not Found (Error ${errorCode}): The Gemini AI model or endpoint is not available.`;
    } else if (errorCode === 500 || errorType === "INTERNAL") {
      userFriendlyMessage = `Gemini Server Error (Error ${errorCode}): Internal error on Google's servers. Please try again later.`;
    } else if (errorCode === 503 || errorType === "UNAVAILABLE") {
      userFriendlyMessage = `Service Unavailable (Error ${errorCode}): Gemini AI is temporarily unavailable. Please try again in a few minutes.`;
    } else {
      userFriendlyMessage = `Gemini API Error (Code: ${errorCode}, Type: ${errorType}): ${detailedMessage}`;
    }
    
    return res.status(500).json({
      error: "Gemini API Error",
      message: userFriendlyMessage,
      details: {
        code: errorCode,
        type: errorType,
        originalMessage: detailedMessage
      }
    });
  }
});

app.post("/api/enhance", async (req, res) => {
  try {
    const { text, sectionType, jobTitle, industry } = req.body;

    if (!text && !jobTitle) {
      return res
        .status(400)
        .json({ error: "Text or job title is required for enhancement" });
    }

    let prompt = "";

    if (
      sectionType === "skills" &&
      (text.includes("Generate a relevant skill") ||
        text.includes("Generate a unique professional skill") ||
        text.includes("Enhance this skill"))
    ) {
      prompt = `${text}

CRITICAL REQUIREMENTS:
1. Return EXACTLY ONE WORD ONLY - no sentences, descriptions, or explanations
2. Must be a professional skill relevant to the specified category
3. MUST be different from any skills mentioned in the "avoid" list
4. Choose from diverse skills like: Analytics, Strategy, Coordination, Optimization, Execution, Innovation, Collaboration, Research, Development, Implementation, Automation, Documentation, Troubleshooting, Facilitation, Negotiation, Budgeting, Forecasting, Planning, Debugging, Architecture, Integration, Validation, Monitoring, Consulting, Training, Auditing, Compliance, Reporting, Visualization, Modeling, Prototyping, Deployment, Maintenance, Scalability, Security, Performance, Quality, Efficiency, Productivity, Communication, Presentation, Leadership, Teamwork, Creativity, Problem-solving, Critical-thinking, Time-management, Adaptability, Flexibility, Reliability, Initiative, Accountability, Attention-to-detail

ONE UNIQUE WORD:`;
    } else if (text && text.includes("Generate content for")) {
      prompt = `${text}`;

      if (jobTitle) {
        prompt += ` for a ${jobTitle} position`;
      }

      if (industry) {
        prompt += ` in the ${industry} industry`;
      }

      prompt += `.

IMPORTANT INSTRUCTIONS:
1. Only return the enhanced text itself with NO explanations, analysis, or comments
2. Do not include phrases like "Enhanced version:" or "Here's an enhanced version"
3. Do not format the response make it bold, italic or anything like that just plain text only
4. Do not explain your changes or reasoning
5. Only output the final enhanced text that the person should use directly

Original text: ${text}

Enhanced version (ONLY return the enhanced text, no explanations):`;
    } else {
      prompt = `Your task is to enhance the following ${sectionType || "resume content"} making it more professional, impactful, and results-oriented`;

      if (jobTitle) {
        prompt += ` for a ${jobTitle} position`;
      }

      if (industry) {
        prompt += ` in the ${industry} industry`;
      }

      prompt += `.

IMPORTANT INSTRUCTIONS:
1. Only return the enhanced text itself with NO explanations, analysis, or comments
2. Do not include phrases like "Enhanced version:" or "Here's an enhanced version"
3. Do not format the response make it bold, italic or anything like that just plain text only
4. Do not explain your changes or reasoning
5. Only output the final enhanced text that the person should use directly

Original text: ${text}

Enhanced version (ONLY return the enhanced text, no explanations):`;
    }

    const primaryKey = process.env.GEMINI_API_KEY || process.env.GEMINI_PRIMARY_KEY;
    const secondaryKey = process.env.GEMINI_SECONDARY_KEY;
    
    if (!primaryKey) {
      return res.status(500).json({ 
        error: "AI service not configured. Please set GEMINI_API_KEY in environment variables." 
      });
    }
    
    let apiKey = primaryKey;

    const attemptGeminiCall = async (keyToUse) => {
      return await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keyToUse}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature:
              sectionType === "skills" &&
              text.includes("Generate a relevant skill")
                ? 0.8
                : 0.7,
            maxOutputTokens:
              sectionType === "skills" &&
              text.includes("Generate a relevant skill")
                ? 10
                : 1024,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000,
        },
      );
    };

    let response;
    let usedApiKey = "primary";
    
    try {
      console.log(`🔑 PRIMARY API: Attempting ${sectionType} enhancement with primary key...`);
      response = await attemptGeminiCall(primaryKey);
      console.log(`✅ PRIMARY API SUCCESS: ${sectionType} enhanced successfully with primary key`);
    } catch (primaryError) {
      console.log(`❌ PRIMARY API FAILED: ${sectionType} enhancement failed with primary key`);
      console.log("Primary error details:", {
        status: primaryError.response?.status,
        statusText: primaryError.response?.statusText,
        message: primaryError.message,
        errorData: primaryError.response?.data
      });
      
      if (secondaryKey) {
        try {
          console.log(`🔄 SWITCHING TO FALLBACK: Attempting ${sectionType} enhancement with secondary key...`);
          response = await attemptGeminiCall(secondaryKey);
          usedApiKey = "fallback";
          console.log(`✅ FALLBACK API SUCCESS: ${sectionType} enhanced successfully with fallback key`);
        } catch (secondaryError) {
          console.log(`❌ BOTH APIS FAILED: ${sectionType} enhancement failed with both primary and fallback keys`);
          console.log("Secondary error details:", {
            status: secondaryError.response?.status,
            statusText: secondaryError.response?.statusText,
            message: secondaryError.message,
            errorData: secondaryError.response?.data
          });
          throw primaryError;
        }
      } else {
        throw primaryError;
      }
    }

    console.log("🔍 GEMINI API RESPONSE DEBUG (/api/enhance):", {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      candidates: response.data?.candidates ? response.data.candidates.length : 'none',
      candidatesStructure: response.data?.candidates?.[0] ? Object.keys(response.data.candidates[0]) : 'none'
    });

    let rawText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.data.candidates?.[0]?.outputs?.[0]?.text ||
      response.data.text;

    if (!rawText) {
      console.log("❌ NO TEXT FOUND (/api/enhance) - Full Response Data:", JSON.stringify(response.data, null, 2));
      
      if (response.data.candidates && response.data.candidates.length === 0) {
        throw new Error(`Gemini API quota exhausted: No response candidates returned (likely rate limit or quota exceeded)`);
      }
      
      if (response.data.error) {
        throw new Error(`Gemini API error: ${response.data.error.message || response.data.error}`);
      }
      
      if (usedApiKey === "fallback") {
        throw new Error(`Both Gemini APIs failed to generate content. This may be due to quota limits or service issues. Please check your Gemini API quota and try again later.`);
      }
    }

    if (rawText) {
      console.log(
        "Enhanced text generated successfully - length:",
        rawText.length,
      );
      let enhancedText = cleanEnhancedText(rawText);

      if (
        sectionType === "skills" &&
        text.includes("Generate a relevant skill")
      ) {
        enhancedText = enhancedText.split(/\s+/)[0].replace(/[^\w]/g, "");
        enhancedText =
          enhancedText.charAt(0).toUpperCase() +
          enhancedText.slice(1).toLowerCase();
      }

      return res.json({ 
        enhancedText,
        apiInfo: {
          usedKey: usedApiKey,
          sectionType: sectionType,
          keyUsed: usedApiKey === "primary" ? "Primary" : "Fallback"
        }
      });
    } else {
      if (usedApiKey === "fallback") {
        throw new Error("Both primary and fallback Gemini APIs failed to generate content. This often indicates quota exceeded or rate limiting. Please check your Gemini API quota and try again later.");
      } else {
        throw new Error("Gemini API returned empty response. Please try again or check your API quota.");
      }
    }
  } catch (geminiError) {
    console.error("Gemini API error details (/api/enhance):", {
      message: geminiError.message,
      status: geminiError.response?.status,
      statusText: geminiError.response?.statusText,
      data: geminiError.response?.data,
      code: geminiError.code
    });
    
    let errorCode = geminiError.response?.status || "UNKNOWN";
    let errorType = geminiError.code || "NETWORK_ERROR";
    let geminiErrorData = geminiError.response?.data;
    let detailedMessage = geminiError.message || "Unknown error occurred";
    
    if (geminiErrorData) {
      if (geminiErrorData.error) {
        detailedMessage = `${geminiErrorData.error.message || geminiErrorData.error}`;
        errorCode = geminiErrorData.error.code || errorCode;
        errorType = geminiErrorData.error.status || errorType;
      }
    }
    
    let userFriendlyMessage = "";
    
    if (errorCode === 429 || errorType === "RESOURCE_EXHAUSTED") {
      userFriendlyMessage = `Rate Limit Exceeded (Error ${errorCode}): You've made too many requests. Please wait a few minutes and try again.`;
    } else if (errorCode === 401 || errorType === "UNAUTHENTICATED") {
      userFriendlyMessage = `Authentication Failed (Error ${errorCode}): Invalid API key. Please check your Gemini API configuration.`;
    } else if (errorCode === 403 || errorType === "PERMISSION_DENIED") {
      userFriendlyMessage = `Permission Denied (Error ${errorCode}): Your API key doesn't have permission to use this service.`;
    } else if (errorCode === 400 || errorType === "INVALID_ARGUMENT") {
      userFriendlyMessage = `Invalid Request (Error ${errorCode}): The request format is incorrect. ${detailedMessage}`;
    } else if (errorCode === 404) {
      userFriendlyMessage = `Service Not Found (Error ${errorCode}): The Gemini AI model or endpoint is not available.`;
    } else if (errorCode === 500 || errorType === "INTERNAL") {
      userFriendlyMessage = `Gemini Server Error (Error ${errorCode}): Internal error on Google's servers. Please try again later.`;
    } else if (errorCode === 503 || errorType === "UNAVAILABLE") {
      userFriendlyMessage = `Service Unavailable (Error ${errorCode}): Gemini AI is temporarily unavailable. Please try again in a few minutes.`;
    } else {
      userFriendlyMessage = `Gemini API Error (Code: ${errorCode}, Type: ${errorType}): ${detailedMessage}`;
    }
    
    return res.status(500).json({
      error: "Gemini API Error",
      message: userFriendlyMessage,
      details: {
        code: errorCode,
        type: errorType,
        originalMessage: detailedMessage
      }
    });
  }
});

function cleanEnhancedText(rawText) {
  return rawText
    .replace(/^\*\*.*?\*\*\s*/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\*.*?\*\s*/g, "")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^Enhanced version:\s*/gi, "")
    .replace(/^Here's an enhanced version:\s*/gi, "")
    .replace(/^Enhanced text:\s*/gi, "")
    .replace(/^Generated content:\s*/gi, "")
    .replace(/^Content:\s*/gi, "")
    .replace(/^Result:\s*/gi, "")
    .replace(/^Output:\s*/gi, "")
    .replace(/^\s*-\s*/gm, "")
    .replace(/^\s*\*\s*/gm, "")
    .replace(/^\s*\d+\.\s*/gm, "")
    .trim();
}

app.listen(PORT, () => {
  console.log(`✅ AI Enhancement API server running on port ${PORT}`);
  console.log(`💻 API endpoints available:`);
  console.log(`  - http://localhost:${PORT}/health`);
  console.log(`  - http://localhost:${PORT}/enhance`);
  console.log(`  - http://localhost:${PORT}/api/health`);
  console.log(`  - http://localhost:${PORT}/api/enhance`);
});
