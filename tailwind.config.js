/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/index.html", "./client/src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",
        "surface-muted": "var(--color-surface-muted)",
        border: "var(--color-border)",
        "border-muted": "var(--color-border-muted)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        muted: "var(--color-muted)",
        "muted-strong": "var(--color-muted-strong)",
        danger: "var(--color-danger)",
        overlay: "var(--color-overlay)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        input: "var(--radius-input)",
        button: "var(--radius-button)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        modal: "var(--shadow-modal)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
