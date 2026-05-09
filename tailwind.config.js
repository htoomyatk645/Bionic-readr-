/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "media",
  content: ["./src/**/*.{tsx,ts,html}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ],
        serif: ["ui-serif", "Charter", "Iowan Old Style", "Georgia", "serif"]
      },
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#eeeef0",
          200: "#d9d9de",
          300: "#b8b8c0",
          400: "#8e8e98",
          500: "#6c6c76",
          600: "#4d4d56",
          700: "#36363d",
          800: "#222227",
          900: "#131316"
        },
        accent: {
          DEFAULT: "#6b7cff",
          soft: "#eef0ff"
        }
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,15,20,0.04), 0 8px 24px rgba(15,15,20,0.06)",
        ring: "0 0 0 1px rgba(15,15,20,0.06)"
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem"
      }
    }
  },
  plugins: []
};
