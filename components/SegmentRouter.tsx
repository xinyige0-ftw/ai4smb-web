"use client";

import { useState } from "react";
import SegmentHub from "./SegmentHub";
import SegmentWizard from "./SegmentWizard";
import InterviewMode from "./InterviewMode";
import BenchmarkMode from "./BenchmarkMode";
import ReviewAnalysis from "./ReviewAnalysis";
import POSPaste from "./POSPaste";
import SocialAnalysis from "./SocialAnalysis";
import TeachMeMode from "./TeachMeMode";

type Mode = null | "csv" | "interview" | "benchmark" | "reviews" | "pos" | "social" | "teachme";

export default function SegmentRouter() {
  const [mode, setMode] = useState<Mode>(null);

  const back = () => setMode(null);

  if (mode === null) return <SegmentHub onSelect={setMode} />;
  if (mode === "csv") return <SegmentWizard onBack={back} />;
  if (mode === "interview") return <InterviewMode onBack={back} />;
  if (mode === "benchmark") return <BenchmarkMode onBack={back} />;
  if (mode === "reviews") return <ReviewAnalysis onBack={back} />;
  if (mode === "pos") return <POSPaste onBack={back} />;
  if (mode === "social") return <SocialAnalysis onBack={back} />;
  if (mode === "teachme") return <TeachMeMode onBack={back} />;

  return <SegmentHub onSelect={setMode} />;
}
