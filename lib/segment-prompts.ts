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

export function buildSegmentPrompt(summary: CsvSummary, businessContext?: string): string {
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

Create 3-5 meaningful customer segments based on patterns in this data. For each segment, explain WHO they are, HOW MANY fall into it (estimate percentage), and WHAT to do with them.

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
      "recommendations": ["action 1", "action 2"]
    }
  ],
  "quickWins": [
    "Specific, actionable recommendation the business can execute today",
    "Another quick win"
  ],
  "dataQuality": "1 sentence about any data issues or suggestions for better tracking"
}
`.trim();
}

export const SEGMENT_SYSTEM_PROMPT = `You are a customer analytics expert who helps small businesses understand their customers. You analyze raw data and find actionable patterns — not generic advice, but specific segments and recommendations tied to the actual data.

When estimating segment sizes, make sure percentages add up to approximately 100%. Base your segments on real patterns in the data, not generic marketing personas.

Be specific: use actual values from the data (dollar amounts, dates, product names) in your descriptions and recommendations.

Always respond with valid JSON only. No markdown, no code fences, no explanation outside the JSON.`;
