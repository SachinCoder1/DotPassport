import type { Config } from 'tailwindcss';

export default {
  // Dark mode is defined using @custom-variant in global.css (Tailwind v4 approach)
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
} satisfies Config;
