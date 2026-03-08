"use client";

import { useState } from "react";
import { BUSINESS_TYPES } from "@/lib/prompts";
import {
  CUSTOMER_TYPES,
  VISIT_FREQUENCIES,
  DISCOVERY_CHANNELS,
  type InterviewAnswers,
} from "@/lib/insight-prompts";
import SegmentResults from "./SegmentResults";

interface SegmentData {
  summary: string;
  segments: {
    name: string; percentage: number; color: string;
    description: string; characteristics: string[]; size: number; recommendations: string[];
  }[];
  quickWins: string[];
  dataQuality: string;
}

interface InterviewModeProps {
  onBack: () => void;
}

export default function InterviewMode({ onBack }: InterviewModeProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SegmentData | null>(null);
  const [resultId, setResultId] = useState<string | null>(null);

  const [businessType, setBusinessType] = useState("");
  const [businessTypeCustom, setBusinessTypeCustom] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [customerTypes, setCustomerTypes] = useState<string[]>([]);
  const [visitFrequency, setVisitFrequency] = useState("");
  const [hasVIPs, setHasVIPs] = useState("");
  const [vipDescription, setVipDescription] = useState("");
  const [discoveryChannels, setDiscoveryChannels] = useState<string[]>([]);
  const [extraNotes, setExtraNotes] = useState("");

  function toggleChip(id: string, arr: string[], set: (v: string[]) => void) {
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  async function handleAnalyze() {
    setLoading(true);
    setError("");
    try {
      const anonId =
        typeof window !== "undefined"
          ? window.localStorage.getItem("ai4smb_anon_id") || "unknown"
          : "unknown";

      const answers: InterviewAnswers = {
        businessType: businessType === "other" ? businessTypeCustom : businessType,
        businessName: businessName || undefined,
        location: location || undefined,
        customerTypes,
        visitFrequency,
        hasVIPs,
        vipDescription: vipDescription || undefined,
        discoveryChannels,
        extraNotes: extraNotes || undefined,
      };

      const res = await fetch("/api/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonId, mode: "interview", answers }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      setResult(data.result);
      setResultId(data.id || null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <SegmentResults
        result={result}
        resultId={resultId}
        meta={{ rowCount: 0, columnCount: 0 }}
        metaLabel="Based on your knowledge of your customers"
        onStartOver={onBack}
        onReanalyze={handleAnalyze}
        loading={loading}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-3 text-sm">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= 1 ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700"}`}>1</span>
        <span className={`h-0.5 w-8 ${step >= 2 ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-700"}`} />
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= 2 ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700"}`}>2</span>
      </div>

      {/* STEP 1: Business */}
      {step === 1 && (
        <div>
          <h1 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            What&apos;s your business?
          </h1>
          <p className="mb-6 text-center text-zinc-500 dark:text-zinc-400">Tap one to get started</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BUSINESS_TYPES.map((bt) => (
              <button
                key={bt.id}
                onClick={() => {
                  setBusinessType(bt.id);
                  if (bt.id !== "other") setStep(2);
                }}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 text-center transition-all active:scale-95 ${businessType === bt.id ? "border-blue-600 bg-blue-50 dark:bg-blue-950" : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"}`}
              >
                <span className="text-2xl">{bt.icon}</span>
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{bt.label}</span>
              </button>
            ))}
          </div>

          {businessType === "other" && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Describe your business in a few words..."
                value={businessTypeCustom}
                onChange={(e) => setBusinessTypeCustom(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                autoFocus
              />
              <button
                onClick={() => businessTypeCustom.trim() && setStep(2)}
                disabled={!businessTypeCustom.trim()}
                className="mt-3 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Business name (optional)"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="rounded-lg border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <input
              type="text"
              placeholder="City / region (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-lg border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <button onClick={onBack} className="mt-6 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            ← Back to all options
          </button>
        </div>
      )}

      {/* STEP 2: Customer knowledge */}
      {step === 2 && (
        <div>
          <h1 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Tell us about your customers
          </h1>
          <p className="mb-6 text-center text-zinc-500 dark:text-zinc-400">
            Answer what you know — skip what you don&apos;t
          </p>

          {/* Customer types */}
          <div className="mb-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Who comes in? (select all that apply)
            </div>
            <div className="flex flex-wrap gap-2">
              {CUSTOMER_TYPES.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => toggleChip(ct.id, customerTypes, setCustomerTypes)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${customerTypes.includes(ct.id) ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-300"}`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visit frequency */}
          <div className="mb-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              How often do regulars come back?
            </div>
            <div className="flex flex-wrap gap-2">
              {VISIT_FREQUENCIES.map((vf) => (
                <button
                  key={vf.id}
                  onClick={() => setVisitFrequency(vf.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${visitFrequency === vf.id ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-300"}`}
                >
                  {vf.label}
                </button>
              ))}
            </div>
          </div>

          {/* VIPs */}
          <div className="mb-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Do you have customers who spend or visit much more than average?
            </div>
            <div className="flex flex-wrap gap-2">
              {["Yes, definitely", "Somewhat", "Not really"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setHasVIPs(opt)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${hasVIPs === opt ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-300"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {(hasVIPs === "Yes, definitely" || hasVIPs === "Somewhat") && (
              <input
                type="text"
                placeholder="Describe them briefly (e.g. 'morning coffee crowd, come every weekday')"
                value={vipDescription}
                onChange={(e) => setVipDescription(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            )}
          </div>

          {/* Discovery */}
          <div className="mb-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              How do most customers find you? (select all that apply)
            </div>
            <div className="flex flex-wrap gap-2">
              {DISCOVERY_CHANNELS.map((dc) => (
                <button
                  key={dc.id}
                  onClick={() => toggleChip(dc.id, discoveryChannels, setDiscoveryChannels)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${discoveryChannels.includes(dc.id) ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-300"}`}
                >
                  {dc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extra notes */}
          <div className="mb-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Anything else you&apos;ve noticed about your customers? (optional)
            </div>
            <textarea
              placeholder="e.g. we get lots of first dates on Fridays, parents bring kids after school, office groups order in bulk..."
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-600 dark:border-zinc-600 dark:text-zinc-300"
            >
              Back
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading || !businessType}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-40"
            >
              {loading ? (
                <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Analyzing...</>
              ) : "Analyze my customers"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
