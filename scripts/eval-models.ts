import { generateJSON, type Provider, type LLMResponse } from "../lib/ai-provider";

const PROVIDERS: Provider[] = ["groq", "gemini-flash", "gemini-pro"];

const TEST_CASES = [
  {
    name: "Cafe segment (interview)",
    system: `You are a customer segmentation expert for small businesses. Always respond with valid JSON only. No markdown. Output: { "segments": [{ "name": string, "percentage": number, "description": string, "characteristics": string[], "recommendations": string[] }], "summary": string, "quickWins": string[] }`,
    user: "Business type: Coffee shop in Seattle. Typical customer: mix of remote workers and morning commuters. Most popular items: lattes and pastries. Busy hours: 7-9am and 12-2pm. Weekend crowd is families.",
  },
  {
    name: "Restaurant campaign",
    system: `You are a senior marketing strategist for small businesses. Always respond with valid JSON only. No markdown. Output: { "strategy": string, "channels": [{ "channel": string, "why": string, "content": object }] }`,
    user: "Business: Mario's Pizza (Restaurant/Bar). Goal: Get more customers. Budget: A few hundred/mo. Channels: instagram, facebook. Tone: appetizing, social, and lively.",
  },
  {
    name: "Salon benchmark",
    system: `You are a customer segmentation expert. Always respond with valid JSON only. Output: { "segments": [{ "name": string, "percentage": number, "description": string, "characteristics": string[], "recommendations": string[] }], "summary": string, "quickWins": string[] }`,
    user: "Show me typical customer segments for a Salon/Beauty business in a mid-size US city.",
  },
  {
    name: "Fitness campaign (smart pick)",
    system: `You are a senior marketing strategist for small businesses. Always respond with valid JSON only. Output: { "strategy": string, "channels": [{ "channel": string, "why": string, "content": object }] }`,
    user: "Business: FitZone (Fitness/Wellness). Goal: Launch something new — a new HIIT class. Budget: under $100 one-time. Choose the 2-3 best channels. Tone: energetic, motivating.",
  },
  {
    name: "E-commerce review analysis",
    system: `You are a customer segmentation expert. Analyze these reviews and identify customer segments. Always respond with valid JSON only. Output: { "segments": [{ "name": string, "percentage": number, "description": string, "characteristics": string[], "recommendations": string[] }], "summary": string, "quickWins": string[] }`,
    user: `Reviews:\n"Love the fast shipping! Ordered 3 times this month." - ★★★★★\n"Good products but customer service was slow to respond." - ★★★\n"The packaging is beautiful, perfect for gifts." - ★★★★★\n"Wish they had more color options." - ★★★★\n"Best prices I've found online for this quality." - ★★★★★`,
  },
];

async function runEval() {
  console.log("=== AI4SMB Model Evaluation ===\n");

  const results: { provider: string; test: string; latencyMs: number; validJson: boolean; outputLength: number }[] = [];

  for (const test of TEST_CASES) {
    console.log(`\n--- ${test.name} ---`);

    for (const provider of PROVIDERS) {
      try {
        const response: LLMResponse = await generateJSON(
          test.system,
          test.user,
          { temperature: 0.7, maxTokens: 2000 },
          provider
        );

        let validJson = false;
        try {
          JSON.parse(response.text);
          validJson = true;
        } catch {}

        results.push({
          provider: `${response.provider}/${response.model}`,
          test: test.name,
          latencyMs: response.latencyMs,
          validJson,
          outputLength: response.text.length,
        });

        console.log(`  ${provider}: ${response.latencyMs}ms | valid JSON: ${validJson} | ${response.text.length} chars`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`  ${provider}: ERROR - ${msg}`);
        results.push({
          provider,
          test: test.name,
          latencyMs: -1,
          validJson: false,
          outputLength: 0,
        });
      }
    }
  }

  console.log("\n\n=== SUMMARY ===\n");

  for (const provider of PROVIDERS) {
    const providerResults = results.filter((r) => r.provider.startsWith(provider.split("-")[0]) || r.provider === provider);
    const successful = providerResults.filter((r) => r.latencyMs > 0);
    const avgLatency = successful.length > 0
      ? Math.round(successful.reduce((sum, r) => sum + r.latencyMs, 0) / successful.length)
      : -1;
    const jsonRate = successful.length > 0
      ? Math.round((successful.filter((r) => r.validJson).length / successful.length) * 100)
      : 0;
    const avgLength = successful.length > 0
      ? Math.round(successful.reduce((sum, r) => sum + r.outputLength, 0) / successful.length)
      : 0;

    console.log(`${provider}:`);
    console.log(`  Avg latency: ${avgLatency}ms`);
    console.log(`  Valid JSON rate: ${jsonRate}%`);
    console.log(`  Avg output length: ${avgLength} chars`);
    console.log(`  Success rate: ${successful.length}/${providerResults.length}`);
    console.log();
  }
}

runEval().catch(console.error);
