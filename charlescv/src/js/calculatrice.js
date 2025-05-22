document.addEventListener('DOMContentLoaded', () => {
    console.log("calculatrice.js chargé et DOM prêt.");

    const display = document.getElementById('display');
    const historyListElement = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    const historySection = document.getElementById('history-section');
    const MAX_HISTORY_LENGTH = 10;
    let calculationHistory = [];

    if (!display) {
        console.warn("L'élément d'affichage de la calculatrice (#display) n'est pas trouvé. Le script de la calculatrice ne s'initialisera pas complètement.");
        return; // Important pour ne pas essayer d'utiliser 'display' s'il n'existe pas
    }
    if (!historyListElement) {
        console.warn("L'élément d'affichage de l'historique (#history-list) n'est pas trouvé.");
    }
    if (!clearHistoryBtn) {
        console.warn("Le bouton pour effacer l'historique (#clear-history-btn) n'est pas trouvé.");
    }
    if (!toggleHistoryBtn) {
        console.warn("Le bouton pour afficher/masquer l'historique (#toggle-history-btn) n'est pas trouvé.");
    }
    if (!historySection) {
        console.warn("La section d'historique (#history-section) n'est pas trouvée.");
    }

    // Charger l'historique depuis localStorage au démarrage
    function loadHistory() {
        const savedHistory = localStorage.getItem('calculatorHistory');
        if (savedHistory) {
            calculationHistory = JSON.parse(savedHistory);
            renderHistory();
        }
    }

    // Sauvegarder l'historique dans localStorage
    function saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
    }

    function renderHistory() {
        if (!historyListElement) return;
        historyListElement.innerHTML = '';
        calculationHistory.slice().reverse().forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'history-item';
            // Assurer que l'expression affichée dans l'historique utilise aussi × et ÷
            const displayExpression = item.expression.replace(/\*/g, '×').replace(/\//g, '÷');
            listItem.innerHTML = `
                <span class="expression">${displayExpression}</span>
                <span class="result">${item.result}</span>
            `;
            listItem.addEventListener('click', () => {
                // Quand on clique, on remet l'expression dans le display avec les symboles d'affichage
                display.value = displayExpression;
            });
            historyListElement.appendChild(listItem);
        });
    }

    function addToHistory(expressionForEval, result) {
        // On stocke l'expression telle qu'elle a été évaluée (avec * et /)
        // mais on l'affichera avec × et ÷ dans renderHistory.
        calculationHistory.push({ expression: expressionForEval, result: result });
        if (calculationHistory.length > MAX_HISTORY_LENGTH) {
            calculationHistory.shift();
        }
        saveHistory();
        renderHistory();
    }

    // --- Fonctions de la calculatrice qui doivent être globales pour onclick="" ---
    window.appendToDisplay = function(value) {
        if (!display) return;
        if (value === '*') {
            display.value += '×';
        } else if (value === '/') {
            display.value += '÷';
        } else {
            display.value += value;
        }
    };

    window.clearDisplay = function() {
        if (!display) return;
        display.value = '';
    };

    window.calculate = function() {
        if (!display || display.value === '') return;
        try {
            let expressionForEval = display.value.replace(/×/g, '*').replace(/÷/g, '/');
            const result = new Function('return ' + expressionForEval)();

            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Résultat invalide");
            }
            
            addToHistory(expressionForEval, result);
            display.value = result;

        } catch (error) {
            display.value = 'Error';
            console.error("Erreur de calcul:", error);
            setTimeout(window.clearDisplay, 1500); // Utiliser window.clearDisplay car clearDisplay est sur window
        }
    };

    window.backspace = function() {
        if (!display) return;
        display.value = display.value.slice(0, -1);
    };
    // --- Fin des fonctions globales ---


    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm("Voulez-vous vraiment effacer l'historique des calculs ?")) {
                calculationHistory = [];
                saveHistory();
                renderHistory();
            }
        });
    }

    if (toggleHistoryBtn && historySection) {
        toggleHistoryBtn.addEventListener('click', () => {
            if (historySection.style.display === 'none' || historySection.style.display === '') {
                historySection.style.display = 'block';
                toggleHistoryBtn.textContent = 'Masquer l\'historique';
            } else {
                historySection.style.display = 'none';
                toggleHistoryBtn.textContent = 'Historique';
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (!display || (event.target.tagName === 'INPUT' && event.target.id !== 'display') || event.target.tagName === 'TEXTAREA') {
            return;
        }
        const calculatorCard = display.closest('.card-calculator-theme');
         if (!calculatorCard || window.getComputedStyle(calculatorCard).display === 'none') {
            return;
        }

        const key = event.key;
        // Utiliser les fonctions globales ici aussi pour la cohérence si elles sont sur window
        if (/[\d.]/.test(key)) { event.preventDefault(); window.appendToDisplay(key); }
        else if (key === '+' || key === '-') { event.preventDefault(); window.appendToDisplay(key); }
        else if (key === '*') { event.preventDefault(); window.appendToDisplay('×'); } // On ajoute ×
        else if (key === '/') { event.preventDefault(); window.appendToDisplay('÷'); } // On ajoute ÷
        else if (key === 'Enter' || key === '=') { event.preventDefault(); window.calculate(); }
        else if (key === 'Backspace') { event.preventDefault(); window.backspace(); }
        else if (key === 'Escape' || key.toLowerCase() === 'c') { event.preventDefault(); window.clearDisplay(); }
        else if (key === '(' || key === ')') { event.preventDefault(); window.appendToDisplay(key); }
    });

    // Charger l'historique au démarrage
    loadHistory();
});