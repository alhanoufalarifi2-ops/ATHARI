// Minimal ambient typing for the "qrcode" package (already a project
// dependency — see scripts/generate-qr.mjs) covering only the API used by
// the Impact Certificate's client-side verification QR
// (app/submit/certificate/[impactNumber]/page.tsx). Avoids adding
// @types/qrcode as a new dependency for one function signature.
declare module "qrcode" {
  interface QRCodeToDataURLOptions {
    margin?: number;
    width?: number;
    color?: { dark?: string; light?: string };
  }

  function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;

  const QRCode: { toDataURL: typeof toDataURL };
  export default QRCode;
}
