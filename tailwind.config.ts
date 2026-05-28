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
      borderRadius: { card: "1.25rem" },
      maxWidth: { content: "1120px" }
    }
  },
  plugins: []
} satisfies Config;
