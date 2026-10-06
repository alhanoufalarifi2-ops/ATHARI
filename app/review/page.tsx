"use client";

// Clinical review queue only — see components/ReviewQueue. Organizational
// requests have their own independent queue at /org/review.
import ReviewQueue from "@/components/ReviewQueue";

export default function ReviewQueuePage() {
  return <ReviewQueue impactType="clinical" />;
}
