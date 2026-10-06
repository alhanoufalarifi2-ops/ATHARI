// Regenerates the ATHARI intake QR code (public/athari-submit-qr.png).
//
// The target URL is built from NEXT_PUBLIC_BASE_URL (falls back to
// http://localhost:3001 for local development) so the same command works
// again after the platform is hosted somewhere else — just set the env var
// to the real domain and re-run `npm run generate:qr`.
import QRCode from "qrcode";
import path from "node:path";
import { fileURLToPath } from "node:url";

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001").replace(/\/+$/, "");
const targetUrl = `${baseUrl}/submit`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "..", "public", "athari-submit-qr.png");

await QRCode.toFile(outPath, targetUrl, { width: 512, margin: 2 });

console.log(`QR code for ${targetUrl}`);
console.log(`saved to ${outPath}`);
