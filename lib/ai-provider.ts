import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LLMResponse {
  text: string;
  provider: string;
  model: string;
  latencyMs: number;
}

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

export async function generateWithGroq(
  system: string,
  user: string,
  options: LLMOptions = {}
): Promise<LLMResponse> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
  const start = Date.now();

  const completion = await groq.chat.completions.create({
    model: DEFAULT_GROQ_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 3000,
    ...(options.jsonMode ? { response_format: { type: "json_object" as const } } : {}),
  });

  return {
    text: completion.choices[0]?.message?.content || "",
    provider: "groq",
    model: DEFAULT_GROQ_MODEL,
    latencyMs: Date.now() - start,
  };
}

export async function generateWithGemini(
  system: string,
  user: string,
  options: LLMOptions = {},
  model: string = "gemini-2.0-flash"
): Promise<LLMResponse> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const genModel = genAI.getGenerativeModel({
    model,
    systemInstruction: system,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 3000,
      ...(options.jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  });

  const start = Date.now();
  const result = await genModel.generateContent(user);
  const text = result.response.text();

  return {
    text,
    provider: "gemini",
    model,
    latencyMs: Date.now() - start,
  };
}

export type Provider = "groq" | "gemini-flash" | "gemini-pro";

export async function generateJSON(
  system: string,
  user: string,
  options: LLMOptions = {},
  provider: Provider = "groq"
): Promise<LLMResponse> {
  const opts = { ...options, jsonMode: true };

  switch (provider) {
    case "groq":
      return generateWithGroq(system, user, opts);
    case "gemini-flash":
      return generateWithGemini(system, user, opts, "gemini-2.0-flash");
    case "gemini-pro":
      return generateWithGemini(system, user, opts, "gemini-2.0-pro");
    default:
      return generateWithGroq(system, user, opts);
  }
}
