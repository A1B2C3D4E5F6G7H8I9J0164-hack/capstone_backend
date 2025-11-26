const OpenAI = require("openai");
const jwt = require("jsonwebtoken");

// Helper function to get user from token
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

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        message: "AI service is not configured. Please set OPENAI_API_KEY environment variable." 
      });
    }

    // Call OpenAI API for summarization
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes notes, lecture content, research snippets, and meeting notes. Create concise, well-structured summaries with key takeaways. Format your response with clear sections and bullet points where appropriate.",
        },
        {
          role: "user",
          content: `Please summarize the following notes and extract the key insights:\n\n${notes}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content || "Unable to generate summary.";

    res.json({ summary });
  } catch (err) {
    console.error("OpenAI API Error:", err);
    
    // Handle specific OpenAI errors
    if (err.response) {
      return res.status(err.response.status || 500).json({ 
        message: err.response.data?.error?.message || "AI service error" 
      });
    }
    
    res.status(500).json({ 
      message: err.message || "Failed to generate summary. Please try again." 
    });
  }
};

