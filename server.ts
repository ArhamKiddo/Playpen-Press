import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Initialize Gemini Client safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Editorial assistant will be unavailable.");
}

// Help helper for Gemini API requests
async function generateGeminiText(prompt: string, systemInstruction?: string, isJson: boolean = false) {
  if (!ai) {
    throw new Error("Gemini AI API Key is not configured in this environment. Please set GEMINI_API_KEY in the Secrets menu.");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
      ...(isJson ? { responseMimeType: "application/json" } : {})
    }
  });

  return response.text;
}

// API endpoint for editorial assistant
app.post("/api/editorial-assistant", async (req, res) => {
  const { action, payload } = req.body;

  if (!ai) {
    return res.status(503).json({
      error: "Gemini AI assistant is offline because the API key is not configured in Secrets."
    });
  }

  try {
    switch (action) {
      case "draft-article": {
        const { topic, keyFacts, articleStyle, targetSection } = payload;
        const systemInstruction = "You are a professional newspaper editor and advisor for a top-tier school journalism newspaper. Your goal is to help students draft elegant, engaging, fact-driven, and non-sensational high school or collegiate student press articles.";
        
        const prompt = `Write a polished, professional student newspaper article on the following topic.
Category / Section: ${targetSection || 'Campus Life'}
Topic: ${topic}
Key Facts / Outline:
${keyFacts}

Article Style/Tone: ${articleStyle || 'Standard Journalism'}

Please output your response in JSON format matching this schema:
{
  "headline": "An engaging, classic, informative journalistic headline",
  "subheading": "A descriptive, stylish single-sentence subheading that adds context",
  "byline": "The writer name or staff designation, e.g. Pat Richardson, Staff Writer",
  "paragraphs": ["Paragraph 1 of the article...", "Paragraph 2 of the article...", "and so on..."]
}

Ensure the article is compelling, uses active voice, flows naturally, and acts as great journalism for a school newspaper. Don't invent fake details outside of the provided topic and key facts, but you can embellish descriptions of student life and atmosphere to make it a great read.`;

        const responseText = await generateGeminiText(prompt, systemInstruction, true);
        if (!responseText) throw new Error("Received empty response from Gemini");
        const jsonResult = JSON.parse(responseText.trim());
        return res.json(jsonResult);
      }

      case "proofread": {
        const { articleText } = payload;
        const systemInstruction = "You are an expert copyeditor for a school newspaper. You provide feedback that helps young writers develop their voice, improve grammar, write with better structure, and correct factual flow.";

        const prompt = `Review and proofread the following article draft.
Article Draft:
"""
${articleText}
"""

Analyze this text and output a breakdown in JSON format matching this schema:
{
  "overallScore": 85, // out of 100, represent the readiness of the draft
  "critique": "A brief, encouraging, professional editor feedback summary highlighting strengths and what to improve.",
  "suggestions": [
    {
      "original": "exact original snippet or sentence to change",
      "revised": "your recommended alternative sentence/phrase",
      "reason": "explanation of why (e.g., active voice, typo, clarity, wordiness)"
    }
  ],
  "polishedText": "The entire, fully polished and rewritten version of the article with your recommended changes applied."
}

Ensure your feedback is supportive, strictly structured in JSON, and tailored to help student journalists improve.`;

        const responseText = await generateGeminiText(prompt, systemInstruction, true);
        if (!responseText) throw new Error("Received empty response from Gemini");
        const jsonResult = JSON.parse(responseText.trim());
        return res.json(jsonResult);
      }

      case "headlines": {
        const { draftHeadline, summaryFacts } = payload;
        const systemInstruction = "You are a witty, experienced headline editor for a prominent school press organization.";

        const prompt = `Generate a variety of captivating, powerful, and accurate journalistic headlines and subheadings for a school newspaper based on the details below:
Draft Headline or Topic: ${draftHeadline}
Details/Context:
${summaryFacts}

Please return a JSON response matching this schema:
{
  "headlines": [
    {
      "title": "A headline option",
      "style": "Witty / Provocative / Classic / Informative / Dramatic",
      "subtitle": "An elegant secondary line/teaser"
    }
  ]
}

Provide exactly 5 highly distinct choices of headlines.`;

        const responseText = await generateGeminiText(prompt, systemInstruction, true);
        if (!responseText) throw new Error("Received empty response from Gemini");
        const jsonResult = JSON.parse(responseText.trim());
        return res.json(jsonResult);
      }

      case "story-ideas": {
        const { theme, category } = payload;
        const systemInstruction = "You are a student news editorial board director. Your goal is to inspire original, investigative, and lively school newspaper coverage ideas.";

        const prompt = `Generate 3 completely unique, compelling article pitch ideas for our school press based on the following theme and category.
Theme: "${theme}"
Category/Section: "${category}"

Please return a JSON response matching this schema:
{
  "ideas": [
    {
      "title": "A compelling proposed headline",
      "angle": "What makes this story unique and why students will want to read it",
      "sources": "Suggestions for who to interview (e.g., teachers, students, local leaders)",
      "methods": "Suggested reporting tips (e.g., survey high schoolers, check archives)"
    }
  ]
}

Provide exactly 3 ideas.`;

        const responseText = await generateGeminiText(prompt, systemInstruction, true);
        if (!responseText) throw new Error("Received empty response from Gemini");
        const jsonResult = JSON.parse(responseText.trim());
        return res.json(jsonResult);
      }

      default:
        return res.status(400).json({ error: "Invalid action type" });
    }
  } catch (error: any) {
    console.error("Gemini Assistant Error:", error);
    return res.status(500).json({
      error: "Failed to generate AI assistant content. " + (error.message || "")
    });
  }
});

// Vite middleware configuration for full-stack build/dev
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start express server:", error);
});
