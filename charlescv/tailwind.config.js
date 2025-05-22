/** @type {import('@tailwindcss/postcss').Config} */
export default { // Configuration pour @tailwindcss/postcss
  content: [
    "./*.html",                   // Scanne tous les fichiers HTML à la racine
    "./src/**/*.{js,ts,jsx,tsx}", // Scanne les fichiers dans src
    "./**/*.html",                // Scanne tous les fichiers HTML dans tous les dossiers
  ],
  theme: {
    extend: {
       colors: {
         'psg-blue': '#004191',   // Bleu PSG correct
         'psg-red': '#DA291C',    // Rouge PSG
         'primary': '#004191',    // Définir primary comme bleu PSG
       },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["light"],
    base: true,
    styled: true,
    utils: true,
  },
}