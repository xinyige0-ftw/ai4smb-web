export interface ColumnStats {
  name: string;
  type: "numeric" | "date" | "categorical" | "text";
  uniqueCount: number;
  sampleValues: string[];
  missing: number;
  min?: number;
  max?: number;
  mean?: number;
}

export interface CsvSummary {
  rowCount: number;
  columns: ColumnStats[];
  sampleRows: Record<string, string>[];
}

export function summarizeCsv(
  headers: string[],
  rows: string[][]
): CsvSummary {
  const columns: ColumnStats[] = headers.map((name, colIdx) => {
    const values = rows.map((r) => r[colIdx] ?? "").filter(Boolean);
    const missing = rows.length - values.length;
    const uniqueValues = [...new Set(values)];

    const numericValues = values.map(Number).filter((n) => !isNaN(n));
    const isNumeric = numericValues.length > values.length * 0.7;

    const datePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;
    const isDate =
      !isNumeric && values.filter((v) => datePattern.test(v)).length > values.length * 0.7;

    let type: ColumnStats["type"] = "text";
    if (isNumeric) type = "numeric";
    else if (isDate) type = "date";
    else if (uniqueValues.length < Math.min(values.length * 0.3, 50)) type = "categorical";

    const stats: ColumnStats = {
      name,
      type,
      uniqueCount: uniqueValues.length,
      sampleValues: uniqueValues.slice(0, 8),
      missing,
    };

    if (isNumeric && numericValues.length > 0) {
      stats.min = Math.min(...numericValues);
      stats.max = Math.max(...numericValues);
      stats.mean = Math.round((numericValues.reduce((a, b) => a + b, 0) / numericValues.length) * 100) / 100;
    }

    return stats;
  });

  const step = Math.max(1, Math.floor(rows.length / 25));
  const sampleRows = rows
    .filter((_, i) => i % step === 0)
    .slice(0, 25)
    .map((row) =>
      Object.fromEntries(headers.map((h, i) => [h, stripPii(row[i] ?? "")]))
    );

  return { rowCount: rows.length, columns, sampleRows };
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(\+?\d[\d\s\-().]{7,}\d)/g;
const NAME_COLUMNS = /^(name|first.?name|last.?name|full.?name|customer.?name|contact|owner)/i;

export function stripPii(value: string): string {
  let v = value.replace(EMAIL_RE, "[email]");
  v = v.replace(PHONE_RE, "[phone]");
  return v;
}

export function stripPiiFromSummary(summary: CsvSummary): CsvSummary {
  return {
    ...summary,
    columns: summary.columns.map((col) => {
      if (NAME_COLUMNS.test(col.name) || col.name.toLowerCase().includes("email") || col.name.toLowerCase().includes("phone")) {
        return { ...col, sampleValues: col.sampleValues.map(() => "[redacted]") };
      }
      return { ...col, sampleValues: col.sampleValues.map(stripPii) };
    }),
    sampleRows: summary.sampleRows.map((row) => {
      const cleaned: Record<string, string> = {};
      for (const [key, val] of Object.entries(row)) {
        if (NAME_COLUMNS.test(key)) {
          cleaned[key] = "[redacted]";
        } else {
          cleaned[key] = stripPii(val);
        }
      }
      return cleaned;
    }),
  };
}

export function buildSegmentPrompt(summary: CsvSummary, businessContext?: string, locale?: string): string {
  const colDescriptions = summary.columns
    .map((c) => {
      let desc = `- "${c.name}" (${c.type}, ${c.uniqueCount} unique values, ${c.missing} missing)`;
      if (c.type === "numeric") desc += ` range: ${c.min}–${c.max}, mean: ${c.mean}`;
      if (c.type === "categorical") desc += ` values: ${c.sampleValues.join(", ")}`;
      return desc;
    })
    .join("\n");

  return `
Analyze this customer dataset and create actionable audience segments.

Dataset: ${summary.rowCount} rows
Columns:
${colDescriptions}

Sample rows (JSON):
${JSON.stringify(summary.sampleRows.slice(0, 15), null, 2)}

${businessContext ? `Business context: ${businessContext}` : ""}

Create 3-5 meaningful customer segments based on patterns in this data. For each segment, explain WHO they are, HOW MANY fall into it (estimate percentage), WHERE to reach them, and WHAT to tell them.

Respond ONLY with valid JSON matching this schema:
{
  "summary": "2-3 sentence overview of the customer base and key insight",
  "segments": [
    {
      "name": "Segment Name",
      "percentage": number (estimated % of total customers),
      "color": "one of: blue, green, amber, rose, purple, cyan",
      "description": "Who are these people, 1-2 sentences",
      "characteristics": ["trait 1", "trait 2", "trait 3"],
      "size": number (estimated count),
      "recommendations": ["action 1", "action 2"],
      "propensityScore": "high" | "medium" | "low" (likelihood to convert),
      "lifetimeValueTier": "high" | "medium" | "low" (estimated customer value),
      "intent": "string describing what this segment wants (e.g. 'convenience seekers', 'deal hunters')",
      "bestChannels": [
        { "channel": "channel name", "fit": "high" | "medium", "reason": "why this channel works" }
      ],
      "avoidChannels": [
        { "channel": "channel name", "reason": "why this would waste budget" }
      ],
      "messagingAngle": "the key message that resonates with this segment",
      "offerSuggestion": "specific promotion or content idea",
      "toneGuidance": "how to speak to this segment (e.g. casual, premium, urgent)",
      "reasoning": "plain-English explanation of why this segment was identified and why these recommendations"
    }
  ],
  "quickWins": [
    "Specific, actionable recommendation the business can execute today",
    "Another quick win"
  ],
  "dataQuality": "1 sentence about any data issues or suggestions for better tracking"
}
${locale === "zh" ? "\nIMPORTANT: Respond entirely in Simplified Chinese (简体中文). Segment names, descriptions, characteristics, recommendations, and all text must be in Chinese." : ""}
`.trim();
}

export function getSegmentSystemPrompt(locale?: string): string {
  const base = `You are a customer analytics expert who helps small businesses understand their customers. You analyze raw data and find actionable patterns — not generic advice, but specific segments and recommendations tied to the actual data.

When estimating segment sizes, make sure percentages add up to approximately 100%. Base your segments on real patterns in the data, not generic marketing personas.

Be specific: use actual values from the data (dollar amounts, dates, product names) in your descriptions and recommendations.

For each segment, also determine:
- propensityScore and lifetimeValueTier based on observable data patterns (purchase frequency, order values, recency).
- intent: a short phrase capturing what drives this segment (e.g. "convenience seekers", "deal hunters", "premium experience seekers").
- bestChannels: 1-3 marketing channels that would work well for this segment, with fit level and reasoning drawn from the data (e.g. if data shows email engagement, recommend email).
- avoidChannels: channels that would waste budget for this segment, with reasoning.
- messagingAngle, offerSuggestion, and toneGuidance: concrete creative direction grounded in the segment's behavior.
- reasoning: a plain-English explanation of why this segment exists and why you made these specific recommendations.

Always respond with valid JSON only. No markdown, no code fences, no explanation outside the JSON.`;
  if (locale === "zh") return base + "\n\nRespond entirely in Simplified Chinese (简体中文).";
  return base;
}

export const SEGMENT_SYSTEM_PROMPT = getSegmentSystemPrompt();
