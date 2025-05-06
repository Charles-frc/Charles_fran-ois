/** @type {import('tailwindcss').Config} */
export default { // Vite utilise souvent 'export default'
  content: [
    "./index.html",               // Scanne le fichier HTML à la racine
    "./src/**/*.{js,ts,jsx,tsx}", // Scanne les fichiers dans src
  ],
  theme: {
    extend: {
      // Vos extensions de thème ici
    },
  },
  plugins: [
    require('daisyui'), // Ajoute le plugin DaisyUI
  ],
   // Optionnel : configurez DaisyUI
   daisyui: {
    themes: ["light", "dark", "cupcake", /* Ajoutez d'autres thèmes ici */],
  },
}