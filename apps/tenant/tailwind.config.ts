import type { Config } from "tailwindcss";
import uiConfig from "@nexis/ui/tailwind.config";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    // Páginas/componentes dos plugins renderizados dentro do tenant app
    "../../packages/plugin-*/src/**/*.{ts,tsx}",
  ],
  presets: [uiConfig],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
