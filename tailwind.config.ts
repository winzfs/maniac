import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F7F6F2",
        surface: "#FFFFFF",
        text: { primary: "#171717", secondary: "#666666" },
        border: "#E7E5DF",
        graphite: "#252525",
        garage: { orange: "#FF6A2A", lime: "#C7FF3D" }
      },
      borderRadius: { card: "1rem" },
      maxWidth: { content: "1360px" },
      boxShadow: {
        card: "0 1px 2px rgba(23, 23, 23, 0.04), 0 8px 24px rgba(23, 23, 23, 0.04)",
      }
    }
  },
  plugins: []
} satisfies Config;
