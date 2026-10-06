/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The site root sends visitors to the Executive Dashboard. Done at the
  // server level (a real 307 with a Location header) because the statically
  // prerendered redirect() in app/page.tsx is served by Vercel as a 307 with
  // no Location header, relying on client-side JavaScript to finish the hop.
  async redirects() {
    return [{ source: "/", destination: "/cluster/dashboard", permanent: false }];
  },
};

export default nextConfig;
