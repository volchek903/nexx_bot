import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nexx: {
          base: "#050713",
          deep: "#080D1F",
          card: "#101225",
          cardAlt: "#17122B",
          cyan: "#00B7FF",
          cyanSoft: "#37E8FF",
          blue: "#2278FF",
          pink: "#FF3DCE",
          fuchsia: "#E033FF",
          purple: "#8B35FF",
          text: "#F7FBFF",
          muted: "#9EA7C2",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #00B7FF 0%, #2278FF 35%, #8B35FF 65%, #FF3DCE 100%)",
      },
      boxShadow: {
        nexx: "0 0 24px rgba(0, 183, 255, 0.12), 0 0 32px rgba(255, 61, 206, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
