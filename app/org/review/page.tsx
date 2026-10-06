"use client";

// Organizational review queue only — see components/ReviewQueue. Clinical
// requests have their own independent queue at /review.
import ReviewQueue from "@/components/ReviewQueue";

export default function OrgReviewQueuePage() {
  return <ReviewQueue impactType="organizational" />;
}
