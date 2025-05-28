document.addEventListener('DOMContentLoaded', () => {
    // Configuration de la recherche
    const SEARCH_CONFIG = {
        minSearchLength: 2,
        maxResults: 10,
        searchDelay: 300
    };

    // Données de recherche (à remplir dynamiquement)
    let searchData = [];

    // Éléments DOM
    const searchInput = document.getElementById('global-search');
    const searchResults = document.getElementById('search-results');
    let searchTimeout;

    // Fonction pour charger les données de recherche
    async function loadSearchData() {
        try {
            // Charger les données de chaque section
            const sections = [
                { url: '/effectif.html', type: 'Joueur' },
                { url: '/histoire.html', type: 'Histoire' },
                { url: '/palmares.html', type: 'Palmarès' },
                { url: '/infos-club.html', type: 'Info' },
                { url: '/supporters.html', type: 'Supporters' },
                { url: '/quiz.html', type: 'Quiz' },
                { url: '/calculatrice.html', type: 'calculatrice' }
            ];

            for (const section of sections) {
                const response = await fetch(section.url);
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                
                // Extraire les titres et liens
                const titles = doc.querySelectorAll('h1, h2, h3');
                titles.forEach(title => {
                    if (title.textContent.trim()) {
                        searchData.push({
                            title: title.textContent.trim(),
                            url: section.url + '#' + (title.id || ''),
                            type: section.type,
                            content: title.nextElementSibling?.textContent?.trim().substring(0, 150) || ''
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données de recherche:', error);
        }
    }

    // Fonction de recherche
    function search(query) {
        if (query.length < SEARCH_CONFIG.minSearchLength) {
            searchResults.innerHTML = '';
            searchResults.classList.add('hidden');
            return;
        }

        const results = searchData.filter(item => {
            const searchText = (item.title + ' ' + item.content).toLowerCase();
            return searchText.includes(query.toLowerCase());
        }).slice(0, SEARCH_CONFIG.maxResults);

        displayResults(results);
    }

    // Fonction d'affichage des résultats
    function displayResults(results) {
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="p-4 text-center text-gray-500">Aucun résultat trouvé</div>';
        } else {
            searchResults.innerHTML = results.map(result => `
                <a href="${result.url}" class="block p-4 hover:bg-[var(--bg-secondary)] transition-colors">
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold text-[var(--text-primary)]">${result.title}</h3>
                        <span class="text-sm text-[var(--text-secondary)]">${result.type}</span>
                    </div>
                    ${result.content ? `<p class="text-sm text-[var(--text-secondary)] mt-1">${result.content}...</p>` : ''}
                </a>
            `).join('');
        }

        searchResults.classList.remove('hidden');
    }

    // Gestionnaire d'événements pour la recherche
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                search(e.target.value);
            }, SEARCH_CONFIG.searchDelay);
        });

        // Fermer les résultats en cliquant en dehors
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });

        // Navigation au clavier dans les résultats
        searchInput.addEventListener('keydown', (e) => {
            const results = searchResults.querySelectorAll('a');
            const currentIndex = Array.from(results).findIndex(result => result === document.activeElement);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (currentIndex < results.length - 1) {
                        results[currentIndex + 1].focus();
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        results[currentIndex - 1].focus();
                    }
                    break;
                case 'Escape':
                    searchResults.classList.add('hidden');
                    searchInput.blur();
                    break;
            }
        });
    }

    // Charger les données de recherche au démarrage
    loadSearchData();
}); 