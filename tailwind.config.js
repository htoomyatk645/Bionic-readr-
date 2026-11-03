/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--br-${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{tsx,ts,html}"],
  // The panel lives in a shadow root; Preflight's html/body rules are harmless
  // but its element resets are what keep host-page styles from leaking in.
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        line: token("line"),
        fg: token("fg"),
        "fg-muted": token("fg-muted"),
        "fg-subtle": token("fg-subtle"),
        accent: token("accent"),
        "accent-fg": token("accent-fg"),
        "accent-soft": token("accent-soft"),
        danger: token("danger")
      },
      boxShadow: {
        card: "var(--br-shadow)",
        panel: "var(--br-panel-shadow)"
      }
    }
  },
  plugins: []
};
