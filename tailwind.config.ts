import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B2545",
          light: "#13315C",
          50: "#EAF0F7",
        },
        sky: {
          DEFAULT: "#4FA8D8",
          light: "#7EC0E4",
          dark: "#3B8FBD",
        },
        bgsoft: "#F6F9FC",
      },
      fontFamily: {
        arabic: ["var(--font-tajawal)", "Tajawal", "IBM Plex Sans Arabic", "sans-serif"],
      },
      boxShadow: {
        card: "0 6px 20px rgba(15, 45, 90, 0.10)",
        cardHover: "0 12px 28px rgba(15, 45, 90, 0.16)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
