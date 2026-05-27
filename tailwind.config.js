/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Luxury Brand Palette ──────────────────────────────────────────
        espresso: {
          DEFAULT: "#1a0a00",
          50:  "#fdf6ec",
          100: "#f7e4c4",
          200: "#efc98a",
          300: "#e4a84e",
          400: "#d4893d",
          500: "#b86b2a",
          600: "#8f4f1a",
          700: "#663710",
          800: "#3d2008",
          900: "#1a0a00",
        },
        gold: {
          DEFAULT: "#D4A853",
          light:  "#F0CC82",
          dark:   "#A87C2A",
          shine:  "#FCEEA3",
        },
        cream: {
          DEFAULT: "#FDF6EC",
          warm:   "#F9EED8",
          deep:   "#F0E0C0",
        },
        blush: {
          DEFAULT: "#F5C6C6",
          light:  "#FCE8E8",
          deep:   "#E89898",
          rose:   "#D4607A",
        },
        // ── UI Neutrals ───────────────────────────────────────────────────
        ink: {
          DEFAULT: "#1C1210",
          light:  "#3D2B28",
          muted:  "#7A5C58",
        },
        // ── Legacy compat (keep bg/fg vars working) ───────────────────────
        background: "var(--background)",
        foreground: "var(--foreground)",
      },

      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body:    ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-geist-mono)", "monospace"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        "hero-sm": ["clamp(2.5rem, 6vw, 4rem)",    { lineHeight: "1.1" }],
        "hero-lg": ["clamp(3.5rem, 9vw, 7rem)",    { lineHeight: "1.05" }],
        "section": ["clamp(2rem, 4vw, 3rem)",       { lineHeight: "1.15" }],
        "display": ["clamp(1.25rem, 2.5vw, 1.75rem)", { lineHeight: "1.4" }],
      },

      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "section": "clamp(5rem, 10vw, 9rem)",
      },

      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      boxShadow: {
        "luxury":      "0 20px 60px -10px rgba(26, 10, 0, 0.25)",
        "luxury-lg":   "0 40px 80px -15px rgba(26, 10, 0, 0.35)",
        "gold":        "0 8px 30px -5px rgba(212, 168, 83, 0.45)",
        "card":        "0 4px 20px rgba(26,10,0,0.08), 0 1px 4px rgba(26,10,0,0.04)",
        "card-hover":  "0 20px 50px rgba(26,10,0,0.15), 0 4px 12px rgba(26,10,0,0.08)",
        "glass":       "0 8px 32px rgba(26,10,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)",
        "glow-gold":   "0 0 30px rgba(212, 168, 83, 0.3)",
        "glow-blush":  "0 0 30px rgba(245, 198, 198, 0.4)",
        "inset-top":   "inset 0 1px 0 rgba(255,255,255,0.15)",
      },

      backgroundImage: {
        // Brand gradients
        "luxury-dark":   "linear-gradient(135deg, #1a0a00 0%, #2d1200 50%, #1a0a00 100%)",
        "luxury-warm":   "linear-gradient(135deg, #FDF6EC 0%, #F9EED8 50%, #F0E0C0 100%)",
        "gold-shine":    "linear-gradient(135deg, #A87C2A 0%, #D4A853 40%, #F0CC82 60%, #D4A853 100%)",
        "blush-rose":    "linear-gradient(135deg, #FCE8E8 0%, #F5C6C6 50%, #E89898 100%)",
        "hero-overlay":  "linear-gradient(to bottom, rgba(26,10,0,0.3) 0%, rgba(26,10,0,0.5) 60%, rgba(26,10,0,0.85) 100%)",
        "card-shine":    "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)",
        "noise":         "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },

      keyframes: {
        // Entrance animations
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-down": {
          "0%":   { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-right": {
          "0%":   { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-left": {
          "0%":   { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        // Looping animations
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%":      { transform: "translateY(-12px) rotate(2deg)" },
          "66%":      { transform: "translateY(-6px) rotate(-1deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-18px)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.7", transform: "scale(0.97)" },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "marquee": {
          "0%":   { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "progress-bar": {
          "0%":   { width: "0%" },
          "100%": { width: "100%" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 15px rgba(212,168,83,0.3)" },
          "50%":      { boxShadow: "0 0 35px rgba(212,168,83,0.6)" },
        },
        "star-fill": {
          "0%":   { transform: "scale(0) rotate(-30deg)", opacity: "0" },
          "60%":  { transform: "scale(1.2) rotate(5deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "skeleton": {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },

      animation: {
        "fade-up":       "fade-up 0.7s ease forwards",
        "fade-up-slow":  "fade-up 1s ease forwards",
        "fade-in":       "fade-in 0.5s ease forwards",
        "fade-down":     "fade-down 0.5s ease forwards",
        "scale-in":      "scale-in 0.5s ease forwards",
        "slide-right":   "slide-right 0.6s ease forwards",
        "slide-left":    "slide-left 0.6s ease forwards",
        "float":         "float 5s ease-in-out infinite",
        "float-slow":    "float-slow 7s ease-in-out infinite",
        "float-delayed": "float 5s ease-in-out 1.5s infinite",
        "shimmer":       "shimmer 2.5s linear infinite",
        "pulse-soft":    "pulse-soft 3s ease-in-out infinite",
        "spin-slow":     "spin-slow 12s linear infinite",
        "marquee":       "marquee 30s linear infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "glow":          "glow 2s ease-in-out infinite",
        "star-fill":     "star-fill 0.3s ease forwards",
        "skeleton":      "skeleton 1.5s ease-in-out infinite",
      },

      backdropBlur: {
        xs: "2px",
      },

      screens: {
        "xs":   "375px",
        "3xl":  "1920px",
        "4xl":  "2560px",
      },

      transitionTimingFunction: {
        "luxury": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
    },
  },
  plugins: [],
};
