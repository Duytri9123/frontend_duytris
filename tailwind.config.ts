/**
 * Tailwind CSS v4 uses CSS-based configuration via app/globals.css.
 * This file is kept for reference and tooling compatibility.
 *
 * Theme tokens are defined in app/globals.css using @theme inline.
 * shadcn/ui theme variables are configured via CSS custom properties.
 *
 * See: https://tailwindcss.com/docs/v4-beta
 */
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
};

export default config;
