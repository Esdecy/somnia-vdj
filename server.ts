/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initializer for Google GenAI client to preserve optional startup states
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured inside user secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST Endpoint: Analyze user dream log (vocal transcript or manual journal)
app.post("/api/analyze-dream", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No dream text provided." });
  }

  try {
    const ai = getGenAIClient();
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze the following dream description. Extract structured elements to represent and compile the dream in a visual editing timeline.
Dream description: "${text}"`,
      config: {
        systemInstruction: "You are a professional dream interpreter, psychologist, and surrealist cinematic director. Extract details completely match the required JSON structure.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A cinematic, poetic 3-4 word title representing the dream (e.g. 'The Sapphire City')",
            },
            emotion: {
              type: Type.STRING,
              description: "The primary emotional tone (e.g. 'Overwhelming Awe', 'Claustrophobic Dread', 'Poetic Introspection')",
            },
            location: {
              type: Type.STRING,
              description: "A single, clear geographical or surreal location where the dream is set (e.g. 'A bioluminescent glass skyscraper')",
            },
            characters: {
              type: Type.STRING,
              description: "A list of entities or shadow figures present in the dream (e.g. 'A glowing silhouette talking to me')",
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 short hashtag search keywords representing dream properties (e.g. ['#Lucid', 'Flight'])",
            },
            refinePrompt: {
              type: Type.STRING,
              description: "A highly descriptive, vivid cinematic prompt to feed into an image generator to draw this exact dreamscape. Use volumetric lights, high-contrast, moody colors, surreal and vaporwave-style keywords.",
            }
          },
          required: ["title", "emotion", "location", "characters", "tags", "refinePrompt"],
        },
      },
    });

    const bodyJSON = response.text?.trim() || "";
    const parsed = JSON.parse(bodyJSON);
    return res.json({ status: "success", data: parsed });

  } catch (error: any) {
    console.warn("Server Gemini analytical call fell back or failed:", error.message);
    // Graceful fallback to procedural generator so app NEVER hangs/crashes
    return res.json({
      status: "fallback",
      message: "Fell back to local procedural parsing engine.",
    });
  }
});

// REST Endpoint: Empathetic psychological dream interpretation & symbol query
app.post("/api/interpret-dream", async (req, res) => {
  const { text, question } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No dream description provided to analyze." });
  }

  const promptText = question 
    ? `The user is asking a specific question: "${question}" regarding their recorded dream.
Dream text: "${text}"
Please provide a grounded, psychological and emotional answer.` 
    : `Given the dream description: "${text}"
Please write a psychological and emotional dream interpretation. Map out potential waking life correlations (such as stressors, active routine/life changes, or subconscious symbols). Identify 2 key metaphors/objects and what emotional state they might reflect.`;

  try {
    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: "You are Somnia's intuitive, empathetic dream psychologist and guide. Speak directly to the dreamer in a warm, grounded, and supportive tone. Avoid clinical-sounding jargon, medical diagnosis assertions, and predictive 'woo-woo' supernatural assumptions. Focus on self-reflection, mindfulness, emotional processing, and waking life correlations (like how sleep environment or stress shapes REM dreams). Answer in 2 to 3 concise, highly readable, well-spaced paragraphs.",
      }
    });

    return res.json({ status: "success", interpretation: response.text });
  } catch (error: any) {
    console.warn("Gemini Dream Interpretation fell back or failed:", error.message);
    return res.json({
      status: "fallback",
      interpretation: "To understand this reverie, consider what emotional spikes you faced during the day. Often, recurring motifs represent active cognitive tasks or stressors your mind is reorganizing. Try comparing your Home Bed recall vs outer sleep environments, as environmental stability directly shapes REM dream intensity."
    });
  }
});

// REST Endpoint: Draw dream illustration using Gemini Flash Image generator
app.post("/api/generate-image", async (req, res) => {
  const { prompt, style } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided to generate image." });
  }

  try {
    const ai = getGenAIClient();
    
    // Call gemini-2.5-flash-image for efficient image generation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `A high fidelity, cinematic, atmospheric dream scene in ${style || "Synthwave"} style showing: ${prompt}. Majestic composition, unreal space depth, soft rim light glows. Proportions 16:9, digital photography.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    let base64Image = "";
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (base64Image) {
      return res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
    } else {
      throw new Error("No inline image data found in candidate parts.");
    }

  } catch (error: any) {
    console.warn("Gemini image generation failed or key missing:", error.message);
    return res.json({
      error: "Image model not initialised or missing keys.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express full-stack backend initialized. Dev server on port: ${PORT}`);
  });
}

startServer();
