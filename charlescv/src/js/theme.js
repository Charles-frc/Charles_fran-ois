// Gestionnaire de thème amélioré
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Fonction pour appliquer le thème
    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon(theme);
        
        // Émettre un événement personnalisé pour notifier les autres composants
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
    
    // Récupérer le thème sauvegardé ou utiliser 'light' par défaut
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Gérer le clic sur le bouton de thème
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
        });
    }

    // Mettre à jour l'icône du bouton de thème
    function updateThemeIcon(theme) {
        if (themeToggle) {
            themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
            themeToggle.setAttribute('aria-label', 
                theme === 'light' ? 'Passer au thème sombre' : 'Passer au thème clair'
            );
        }
    }

    // Écouter les changements de thème depuis d'autres onglets/fenêtres
    window.addEventListener('storage', (e) => {
        if (e.key === 'theme') {
            applyTheme(e.newValue);
        }
    });

    // Vérifier si nous sommes sur une page annexe
    const isAnnexPage = window.location.pathname.includes('/annexes/');
    if (isAnnexPage) {
        // Pour les pages annexes, on force l'héritage du thème de la page principale
        // sauf pour la section "Quelques Grands Clubs Européens"
        const isEuropeanClubsPage = window.location.pathname.includes('clubs-europeens');
        if (!isEuropeanClubsPage) {
            // On récupère le thème de la page principale
            const mainPageTheme = localStorage.getItem('theme') || 'light';
            applyTheme(mainPageTheme);
        }
    }
}); 