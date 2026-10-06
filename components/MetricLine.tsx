// Organizational results: when a metric was recorded, show its name and the
// before ← after values exactly as entered. Nothing is shown (and nothing is
// derived or computed) when no metric name was recorded — the written
// before/after description above it stays the only statement of the change.
export default function MetricLine({
  metricName,
  beforeValue,
  afterValue,
}: {
  metricName?: string;
  beforeValue?: string;
  afterValue?: string;
}) {
  if (!metricName) return null;
  return (
    <p className="mb-2 text-sm text-navy/60">
      <span className="font-semibold text-navy/70">{metricName} </span>
      {beforeValue && <span className="line-through decoration-navy/30">{beforeValue}</span>}
      {beforeValue && afterValue && <span className="text-sky-dark"> ← </span>}
      {afterValue && <span className="font-semibold text-navy">{afterValue}</span>}
    </p>
  );
}
