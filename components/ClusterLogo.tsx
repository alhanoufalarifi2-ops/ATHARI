// Fixed organizational identity for ATHARI-R1 — the actual Riyadh First Health
// Cluster logo file (public/R1-Logo (1).png), used as-is. Do not redraw, recolor,
// crop, or stretch it; only `width` is adjustable and height always follows
// the file's own aspect ratio.
export default function ClusterLogo({ width = 215 }: { width?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/R1-Logo%20(1).png"
      alt="شعار تجمع الرياض الصحي الأول"
      style={{ width, height: "auto", objectFit: "contain" }}
      className="object-contain"
    />
  );
}
