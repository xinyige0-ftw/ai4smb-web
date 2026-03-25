import fs from "node:fs";
import path from "node:path";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

function getTargets() {
  const configured = process.env.COMPARE_MODELS?.trim();
  if (configured) {
    return configured.split(",").map((s) => s.trim()).filter(Boolean);
  }
  const defaults = ["groq:llama-3.3-70b-versatile", "groq:qwen/qwen3-32b"];
  if (process.env.GEMINI_API_KEY) {
    defaults.push(`gemini:${process.env.GEMINI_FLASH_MODEL || "gemini-2.5-flash"}`);
  }
  return defaults;
}

const TEST_CASES = [
  {
    name: "Campaign strategy JSON",
    system:
      'You are a senior marketing strategist for small businesses. Output strict JSON only: {"strategy":string,"channels":[{"channel":string,"why":string,"content":object}]}',
    user: "Business: family cafe in Seattle. Goal: increase weekday lunch traffic by 20% in 30 days. Budget: $300/month. Channels: instagram, tiktok, email.",
    requiredTopKeys: ["strategy", "channels"],
  },
  {
    name: "Customer segments JSON",
    system:
      'You are a customer segmentation expert. Output strict JSON only: {"segments":[{"name":string,"percentage":number,"description":string,"characteristics":string[],"recommendations":string[]}],"summary":string,"quickWins":string[]}',
    user: "Business type: salon in Manama. Customers: working women, university students, and bridal clients. Peak time: evenings and weekends.",
    requiredTopKeys: ["segments", "summary", "quickWins"],
  },
];

async function callGroq(model, system, user) {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });
  const start = Date.now();
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
    max_tokens: 2200,
    response_format: { type: "json_object" },
  });
  return {
    text: completion.choices[0]?.message?.content || "",
    latencyMs: Date.now() - start,
  };
}

async function callGemini(model, system, user) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const genModel = genAI.getGenerativeModel({
    model,
    systemInstruction: system,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2200,
      responseMimeType: "application/json",
    },
  });
  const start = Date.now();
  const result = await genModel.generateContent(user);
  return {
    text: result.response.text(),
    latencyMs: Date.now() - start,
  };
}

function evaluateJson(text, requiredTopKeys) {
  try {
    const parsed = JSON.parse(text);
    const present = requiredTopKeys.filter((k) => Object.prototype.hasOwnProperty.call(parsed, k)).length;
    return {
      validJson: true,
      schemaScore: requiredTopKeys.length === 0 ? 1 : present / requiredTopKeys.length,
    };
  } catch {
    return { validJson: false, schemaScore: 0 };
  }
}

async function main() {
  loadEnvLocal();
  const targets = getTargets();
  if (!targets.length) {
    console.log("No targets found. Set COMPARE_MODELS.");
    process.exit(1);
  }

  const rows = [];
  console.log("\n=== AI4SMB Model Comparison ===\n");
  console.log(`Targets: ${targets.join(" | ")}\n`);

  for (const test of TEST_CASES) {
    console.log(`--- ${test.name} ---`);
    for (const target of targets) {
      const [provider, model] = target.split(":");
      try {
        const result =
          provider === "groq"
            ? await callGroq(model, test.system, test.user)
            : await callGemini(model, test.system, test.user);
        const evalResult = evaluateJson(result.text, test.requiredTopKeys);
        const snippet = result.text.replace(/\s+/g, " ").slice(0, 120);
        rows.push({
          target,
          test: test.name,
          latencyMs: result.latencyMs,
          validJson: evalResult.validJson,
          schemaScore: evalResult.schemaScore,
          chars: result.text.length,
          snippet,
        });
        console.log(
          `${target} | ${result.latencyMs}ms | json:${evalResult.validJson ? "yes" : "no"} | schema:${Math.round(
            evalResult.schemaScore * 100
          )}% | chars:${result.text.length}`
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        rows.push({
          target,
          test: test.name,
          latencyMs: -1,
          validJson: false,
          schemaScore: 0,
          chars: 0,
          snippet: "",
        });
        console.log(`${target} | ERROR | ${message}`);
      }
    }
    console.log("");
  }

  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.target)) grouped.set(row.target, []);
    grouped.get(row.target).push(row);
  }

  console.log("=== Summary ===");
  for (const [target, group] of grouped.entries()) {
    const ok = group.filter((r) => r.latencyMs > 0);
    const avgLatency = ok.length ? Math.round(ok.reduce((s, r) => s + r.latencyMs, 0) / ok.length) : -1;
    const jsonRate = ok.length ? Math.round((ok.filter((r) => r.validJson).length / ok.length) * 100) : 0;
    const avgSchema = ok.length ? Math.round((ok.reduce((s, r) => s + r.schemaScore, 0) / ok.length) * 100) : 0;
    console.log(`${target}`);
    console.log(`  avg latency: ${avgLatency}ms`);
    console.log(`  valid JSON rate: ${jsonRate}%`);
    console.log(`  avg schema score: ${avgSchema}%`);
    console.log(`  success: ${ok.length}/${group.length}`);
  }

  const firstCase = rows.filter((r) => r.test === TEST_CASES[0].name && r.snippet);
  if (firstCase.length) {
    console.log("\n=== Output Preview (first test) ===");
    for (const row of firstCase) {
      console.log(`${row.target}: ${row.snippet}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
