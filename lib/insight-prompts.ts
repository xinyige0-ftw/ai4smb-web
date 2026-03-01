import { BUSINESS_TYPES } from "@/lib/prompts";

const SEGMENT_OUTPUT_SCHEMA = `
Respond ONLY with valid JSON matching this schema:
{
  "summary": "2-3 sentence overview of the customer base and key insight",
  "segments": [
    {
      "name": "Memorable segment name",
      "percentage": number (0-100, all segments sum to ~100),
      "color": "one of: blue, green, amber, rose, purple, cyan",
      "description": "Who are these people, 1-2 sentences",
      "characteristics": ["trait 1", "trait 2", "trait 3"],
      "size": number (estimated count, 0 if unknown),
      "recommendations": ["specific action 1", "specific action 2"]
    }
  ],
  "quickWins": [
    "Specific, immediately actionable recommendation for this week"
  ],
  "dataQuality": "One sentence on reliability of these segments and what simple data to start tracking"
}`;

export const INSIGHT_SYSTEM_PROMPT = `You are a customer analytics expert helping small business owners understand their customers. You create actionable, specific segments — not generic personas.

Segment names should be memorable and specific (e.g. "Friday Night Regulars" not "Loyal Customers"). Recommendations must be concrete and doable without a big budget or team.

When working from limited information, be honest about what's inferred vs. observed, but still deliver useful segments grounded in the actual information provided. Percentages should sum to approximately 100%.

Always respond with valid JSON only. No markdown, no code fences, no explanation outside the JSON.`;

// ─── INTERVIEW MODE ───────────────────────────────────────────────

export const CUSTOMER_TYPES = [
  { id: "families", label: "Families" },
  { id: "young_pros", label: "Young Professionals" },
  { id: "seniors", label: "Seniors" },
  { id: "students", label: "Students" },
  { id: "tourists", label: "Tourists / Visitors" },
  { id: "local_regulars", label: "Local Regulars" },
  { id: "business_clients", label: "Business Clients" },
  { id: "couples", label: "Couples" },
  { id: "remote_workers", label: "Remote Workers" },
];

export const VISIT_FREQUENCIES = [
  { id: "weekly_plus", label: "Weekly or more" },
  { id: "few_per_month", label: "A few times a month" },
  { id: "monthly", label: "About once a month" },
  { id: "rarely", label: "Rarely / one-time visits" },
];

export const DISCOVERY_CHANNELS = [
  { id: "walk_in", label: "Walk by / foot traffic" },
  { id: "google", label: "Google Search" },
  { id: "word_of_mouth", label: "Word of mouth" },
  { id: "social_media", label: "Social media" },
  { id: "ads", label: "Paid ads" },
  { id: "events", label: "Events / partnerships" },
  { id: "returning", label: "Repeat customers" },
];

export interface InterviewAnswers {
  businessType: string;
  businessName?: string;
  location?: string;
  customerTypes: string[];
  visitFrequency: string;
  hasVIPs: string;
  vipDescription?: string;
  discoveryChannels: string[];
  extraNotes?: string;
}

export function buildInterviewPrompt(answers: InterviewAnswers): string {
  const businessLabel =
    BUSINESS_TYPES.find((b) => b.id === answers.businessType)?.label ||
    answers.businessType;

  const customerTypeLabels = answers.customerTypes
    .map((id) => CUSTOMER_TYPES.find((c) => c.id === id)?.label || id)
    .join(", ");

  const discoveryLabels = answers.discoveryChannels
    .map((id) => DISCOVERY_CHANNELS.find((d) => d.id === id)?.label || id)
    .join(", ");

  return `
Analyze a small business owner's knowledge of their customers and create actionable audience segments.

Business: ${answers.businessName || "the business"} (${businessLabel})
${answers.location ? `Location: ${answers.location}` : ""}

What the owner told us about their customers:
- Customer types they see: ${customerTypeLabels || "not specified"}
- How often regulars return: ${answers.visitFrequency || "not specified"}
- VIP/high-value customers: ${answers.hasVIPs}${answers.vipDescription ? ` — "${answers.vipDescription}"` : ""}
- How customers find them: ${discoveryLabels || "not specified"}
${answers.extraNotes ? `- Additional notes: "${answers.extraNotes}"` : ""}

Create 3-5 distinct customer segments grounded in what the owner described. Don't invent groups with no basis in their answers. If information is limited, make reasonable inferences and flag them.

For each segment, use what the owner told you to craft specific, recognizable names (e.g. "Morning Commuters" not "Regular Customers") and concrete recommendations they can act on immediately.

In quickWins, suggest 2-3 actions the owner can take THIS WEEK based on what they shared.
In dataQuality, suggest one simple thing to start tracking (e.g. "ask every new customer how they found you").

${SEGMENT_OUTPUT_SCHEMA}
`.trim();
}

// ─── BENCHMARK MODE ───────────────────────────────────────────────

export interface BenchmarkInput {
  businessType: string;
  location?: string;
}

export function buildBenchmarkPrompt(input: BenchmarkInput): string {
  const businessLabel =
    BUSINESS_TYPES.find((b) => b.id === input.businessType)?.label ||
    input.businessType;

  return `
You are an expert in U.S. small business customer analytics with deep knowledge of industry patterns.

Business type: ${businessLabel}
${input.location ? `Location: ${input.location}` : "Location: United States (general)"}

Based on your knowledge of typical customer patterns for ${businessLabel} businesses in the U.S., identify the 3-5 most common customer segments. Ground these in real industry patterns — who typically visits this type of business, why, how often, and what they value.

These are industry benchmarks, not data from this specific business. In the dataQuality field, say clearly that these are typical patterns for this business type and encourage the owner to upload their own data or answer questions about their specific customers to get personalized insights.

${SEGMENT_OUTPUT_SCHEMA}
`.trim();
}

// ─── REVIEW ANALYSIS ──────────────────────────────────────────────

export function buildReviewPrompt(reviewText: string, businessType?: string): string {
  const businessLabel = businessType
    ? BUSINESS_TYPES.find((b) => b.id === businessType)?.label || businessType
    : null;

  return `
Analyze these customer reviews to identify distinct audience segments.

${businessLabel ? `Business type: ${businessLabel}` : ""}

Customer reviews:
"""
${reviewText.slice(0, 8000)}
"""

Identify 3-5 customer segments visible in these reviews, based on:
- Who's writing (demographic clues, context they mention, vocabulary)
- What different groups value (price, quality, service, atmosphere, specific items)
- Relationship with the business (first-timers vs regulars, occasion-based vs habitual)
- Loyalty and sentiment signals

Use actual themes and language from the reviews to ground each segment. Don't create segments not supported by the text. Give segments names that reflect what reviewers actually say (e.g. "Weekend Brunch Crowd" or "Work Lunch Regulars").

In dataQuality, note that review writers are a self-selected group (skewed toward strong opinions) and suggest other sources to cross-check these segments.

${SEGMENT_OUTPUT_SCHEMA}
`.trim();
}

// ─── SOCIAL ANALYSIS ──────────────────────────────────────────────

export function buildSocialPrompt(socialContent: string, businessType?: string): string {
  const businessLabel = businessType
    ? BUSINESS_TYPES.find((b) => b.id === businessType)?.label || businessType
    : null;

  return `
Analyze a small business's social media presence to understand their audience segments.

${businessLabel ? `Business type: ${businessLabel}` : ""}

Social media content (bio, posts, captions, comments, follower descriptions, engagement data):
"""
${socialContent.slice(0, 5000)}
"""

Based on this content, identify 3-5 customer segments by inferring:
- Who engages with different types of posts (topics, products, offers)
- Language and demographics visible in comments or follower descriptions
- What content drives the most engagement and who that audience likely is
- What the business emphasizes and who that naturally attracts

Ground segments in what was actually provided. Note what's inferred.
In dataQuality, note the limitations (social followers ≠ all customers) and suggest what to track.

${SEGMENT_OUTPUT_SCHEMA}
`.trim();
}

// ─── TEACH ME MODE ────────────────────────────────────────────────

export const TEACH_ME_QUESTIONS = [
  "What type of business do you run, and where is it located?",
  "Describe a typical customer — who are they, and why do they come to you?",
  "Do you notice different types of customers? Tell me about the distinct groups you see.",
  "Which customers come back most often, and which ones tend to spend the most?",
  "What's the biggest challenge you face with your customers right now?",
];

export interface TeachMeQA {
  question: string;
  answer: string;
}

export interface TeachMeConversation {
  qas: TeachMeQA[];
}

export function buildTeachMePrompt(conversation: TeachMeConversation): string {
  const qaText = conversation.qas
    .map((qa, i) => `Q${i + 1}: ${qa.question}\nOwner: ${qa.answer}`)
    .join("\n\n");

  return `
You are analyzing a conversation where a business owner described their customers in their own words.

Conversation:
${qaText}

Based on this conversation, identify 3-5 distinct customer segments. Draw directly from what the owner said — use their language and descriptions. Make segment names feel like the owner would recognize and use them themselves.

For each segment, ground every characteristic and recommendation in what they told you. If they mentioned a challenge, make your quickWins address it directly.

In dataQuality, suggest one simple tracking habit they can start tomorrow.

${SEGMENT_OUTPUT_SCHEMA}
`.trim();
}
