/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg:        "#0F172A",
        surface:   "#1E293B",
        border:    "#334155",
        primary:   "#6366F1",
        secondary: "#22D3EE",
        success:   "#10B981",
        warning:   "#F59E0B",
        danger:    "#EF4444",
        bronze:    "#CD7F32",
        silver:    "#C0C0C0",
        gold:      "#FFD700",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card:  "8px",
        input: "6px",
        badge: "4px",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        slow:    "300ms",
      },
    },
  },
  plugins: [],
};
