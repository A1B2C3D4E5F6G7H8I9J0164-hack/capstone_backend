const { GoogleGenerativeAI } = require("@google/generative-ai");
const jwt = require("jsonwebtoken");
const Activity = require("../models/Activity");


const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
};


let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const generateQuizFromText = async (userId, text, questionCount = 5) => {
  if (!text || !text.trim()) {
    const error = new Error("Text is required to generate a quiz");
    error.statusCode = 400;
    throw error;
  }

  if (!process.env.GEMINI_API_KEY) {
    const error = new Error(
      "AI service is not configured. Please set GEMINI_API_KEY environment variable."
    );
    error.statusCode = 503;
    throw error;
  }

  if (!genAI) {
    const error = new Error(
      "AI service is not initialized. Please check your GEMINI_API_KEY configuration."
    );
    error.statusCode = 503;
    throw error;
  }

  const safeQuestionCount = Math.max(1, Math.min(Number(questionCount) || 5, 15));
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `You are an AI that generates multiple-choice quizzes from study notes.

Generate ${safeQuestionCount} multiple-choice questions (MCQs) from the text below.

Return ONLY valid JSON in the following format (no extra text):
{
  "questions": [
    {
      "question": "...",
      "options": ["option A", "option B", "option C", "option D"],
      "answerIndex": 0
    }
  ]
}

Rules:
- Each question must have exactly 4 options.
- answerIndex must be an integer from 0 to 3 pointing to the correct option.
- Questions should cover key concepts, not trivial details.

Text:
${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const raw = response.text();

  if (!raw || !raw.trim()) {
    const error = new Error("AI generated an empty quiz. Please try again.");
    error.statusCode = 500;
    throw error;
  }

  let payload;
  try {
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    payload = JSON.parse(cleaned);
  } catch (parseErr) {
    console.error("Failed to parse quiz JSON:", parseErr);
    console.error("Raw quiz response (first 400 chars):", raw.substring(0, 400));
    const error = new Error("AI returned invalid quiz format. Please try again.");
    error.statusCode = 500;
    throw error;
  }

  if (!payload || !Array.isArray(payload.questions)) {
    const error = new Error("AI response did not contain a valid questions array.");
    error.statusCode = 500;
    throw error;
  }

  const normalizedQuestions = payload.questions
    .filter((q) => q && typeof q.question === "string" && Array.isArray(q.options))
    .map((q) => {
      const options = q.options.slice(0, 4).map((opt) => String(opt));
      while (options.length < 4) {
        options.push("");
      }
      let answerIndex = Number(q.answerIndex);
      if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
        answerIndex = 0;
      }
      return {
        question: q.question,
        options,
        answerIndex,
      };
    });

  return normalizedQuestions;
};

exports.generateQuizFromText = generateQuizFromText;

exports.summarizeNotes = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { notes } = req.body;
    
    if (!notes || !notes.trim()) {
      return res.status(400).json({ message: "Notes are required" });
    }


    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ 
        message: "AI service is not configured. Please set GEMINI_API_KEY environment variable." 
      });
    }

    if (!genAI) {
      return res.status(503).json({ 
        message: "AI service is not initialized. Please check your GEMINI_API_KEY configuration." 
      });
    }
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    
    console.log("Using Gemini model:", modelName);
    const model = genAI.getGenerativeModel({ model: modelName });


    const prompt = `You are a helpful assistant that summarizes notes, lecture content, research snippets, and meeting notes. Create concise, well-structured summaries with key takeaways. Format your response with clear sections and bullet points where appropriate.

Please summarize the following notes and extract the key insights:

${notes}`;

    console.log("Generating summary with Gemini API...");
    console.log("Model:", modelName);
    console.log("Notes length:", notes.length);


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    if (!summary || summary.trim().length === 0) {
      console.error("Empty summary received from Gemini API");
      return res.status(500).json({ 
        message: "AI generated an empty summary. Please try again." 
      });
    }

    console.log("Summary generated successfully, length:", summary.length);
    

    try {
      await Activity.create({
        userId,
        type: "summary_generated",
        description: `Generated summary from notes (${notes.length} chars)`,
        date: new Date(),
      });
    } catch (activityErr) {
      console.error("Error logging summary activity:", activityErr);

    }
    
    res.json({ summary: summary.trim() });
  } catch (err) {
    console.error("Gemini API Error:", err);
    console.error("Error details:", JSON.stringify(err, null, 2));
    

    let errorMessage = "Failed to generate summary. Please try again.";
    let statusCode = 500;


    if (err.message) {
      errorMessage = err.message;
      

      if (err.message.includes("API_KEY")) {
        errorMessage = "Invalid Gemini API key. Please check your API key configuration.";
        statusCode = 401;
      } else if (err.message.includes("quota") || err.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Please try again later.";
        statusCode = 429;
      } else if (err.message.includes("safety") || err.message.includes("blocked")) {
        errorMessage = "Content was blocked by safety filters. Please try with different content.";
        statusCode = 400;
      }
    }


    if (err.statusCode) {
      statusCode = err.statusCode;
    } else if (err.status) {
      statusCode = err.status;
    }


    if (err.response) {
      const responseError = err.response;
      if (responseError.status) {
        statusCode = responseError.status;
      }
      if (responseError.data && responseError.data.error) {
        errorMessage = responseError.data.error.message || errorMessage;
      }
    }

    return res.status(statusCode).json({ 
      message: errorMessage 
    });
  }
};

exports.generateQuizFromNotes = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { text, questionCount = 5 } = req.body || {};

    const questions = await generateQuizFromText(userId, text, questionCount);

    res.json({ questions });
  } catch (err) {
    console.error("Gemini quiz API Error:", err);

    let errorMessage = "Failed to generate quiz. Please try again.";
    let statusCode = 500;

    if (err.message) {
      errorMessage = err.message;
      if (err.message.includes("API_KEY")) {
        errorMessage = "Invalid Gemini API key. Please check your API key configuration.";
        statusCode = 401;
      } else if (err.message.includes("quota") || err.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Please try again later.";
        statusCode = 429;
      } else if (err.message.includes("safety") || err.message.includes("blocked")) {
        errorMessage = "Content was blocked by safety filters. Please try with different content.";
        statusCode = 400;
      }
    }

    if (err.statusCode) {
      statusCode = err.statusCode;
    } else if (err.status) {
      statusCode = err.status;
    }

    if (err.response && err.response.data && err.response.data.error) {
      errorMessage = err.response.data.error.message || errorMessage;
    }

    return res.status(statusCode).json({ message: errorMessage });
  }
};
