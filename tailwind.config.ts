import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
          600: "#475569"
        },
        mist: {
          100: "#f8fafc",
          200: "#e2e8f0",
          300: "#cbd5f5"
        },
        accent: {
          600: "#0ea5a4",
          700: "#0f766e"
        },
        sun: {
          400: "#f59e0b",
          500: "#d97706"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)"
      },
      fontFamily: {
        display: ["'Inter'", "ui-sans-serif", "system-ui"],
        body: ["'Inter'", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};

export default config;
