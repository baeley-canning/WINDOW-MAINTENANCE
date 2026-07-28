export default { content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}"],
  theme: { extend: {
    colors: {
      // Brand ink ramp (replaces default slate): near-neutral with a hint of warmth
      slate: { 50: "#f6f6f4", 100: "#ebebe7", 200: "#dbdad3", 300: "#bdbcb3", 400: "#92918a", 500: "#6f6e67", 600: "#565550", 700: "#3f3e39", 800: "#2a2a26", 900: "#1b1b18", 950: "#121210" },
      // Brand accent ramp (replaces default blue): deep petrol / steel blue
      blue: { 50: "#eef4f7", 100: "#dbe8ee", 200: "#b8d1dd", 300: "#8ab3c6", 400: "#568da8", 500: "#33718d", 600: "#1d5876", 700: "#184a63", 800: "#153e52", 900: "#123344", 950: "#0c2331" },
    },
    borderRadius: { lg: "0.375rem", xl: "0.5rem", "2xl": "1rem" },
  } }, plugins: [] };
