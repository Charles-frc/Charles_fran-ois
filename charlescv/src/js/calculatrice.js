document.addEventListener('DOMContentLoaded', () => {
    console.log("calculatrice.js chargé et DOM prêt.");

    // Configuration
    const CALCULATOR_CONFIG = {
        maxHistoryLength: 10,
        animationDuration: 300,
        errorDisplayDuration: 1500,
        scientificMode: false
    };

    // Statistiques d'utilisation
    let calculatorStats = {
        totalCalculations: 0,
        successfulCalculations: 0,
        failedCalculations: 0,
        mostUsedOperation: null,
        lastUsed: null,
        operationCounts: {
            '+': 0,
            '-': 0,
            '*': 0,
            '/': 0
        }
    };

    // Éléments DOM
    const display = document.getElementById('display');
    const historyListElement = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    const historySection = document.getElementById('history-section');
    const statsSection = document.createElement('div');
    statsSection.id = 'stats-section';
    statsSection.className = 'card card-calculator-theme mt-4';
    statsSection.style.display = 'none';
    statsSection.innerHTML = `
        <div class="card-body">
            <h3 class="card-title text-lg">Statistiques d'utilisation</h3>
            <div class="stats-grid grid grid-cols-2 gap-2 mt-2">
                <div class="stat-item">
                    <div class="stat-label text-sm text-gray-600">Calculs totaux</div>
                    <div class="stat-value font-semibold" id="total-calculations">0</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label text-sm text-gray-600">Calculs réussis</div>
                    <div class="stat-value font-semibold text-green-600" id="successful-calculations">0</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label text-sm text-gray-600">Calculs échoués</div>
                    <div class="stat-value font-semibold text-red-600" id="failed-calculations">0</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label text-sm text-gray-600">Opération la plus utilisée</div>
                    <div class="stat-value font-semibold" id="most-used-operation">-</div>
                </div>
            </div>
        </div>
    `;

    // Vérification des éléments DOM
    if (!display) {
        console.warn("L'élément d'affichage de la calculatrice (#display) n'est pas trouvé.");
        return;
    }

    // Charger les statistiques depuis localStorage
    function loadStats() {
        const savedStats = localStorage.getItem('calculatorStats');
        if (savedStats) {
            calculatorStats = JSON.parse(savedStats);
            updateStatsDisplay();
        }
    }

    // Sauvegarder les statistiques dans localStorage
    function saveStats() {
        localStorage.setItem('calculatorStats', JSON.stringify(calculatorStats));
    }

    // Mettre à jour l'affichage des statistiques
    function updateStatsDisplay() {
        const totalEl = document.getElementById('total-calculations');
        const successEl = document.getElementById('successful-calculations');
        const failedEl = document.getElementById('failed-calculations');
        const mostUsedEl = document.getElementById('most-used-operation');

        if (totalEl) totalEl.textContent = calculatorStats.totalCalculations;
        if (successEl) successEl.textContent = calculatorStats.successfulCalculations;
        if (failedEl) failedEl.textContent = calculatorStats.failedCalculations;
        if (mostUsedEl) {
            const mostUsed = Object.entries(calculatorStats.operationCounts)
                .reduce((a, b) => (b[1] > a[1] ? b : a), ['-', 0]);
            mostUsedEl.textContent = mostUsed[1] > 0 ? `${mostUsed[0]} (${mostUsed[1]})` : '-';
        }
    }

    // Animation de feedback
    function showFeedback(message, type = 'error') {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `feedback-message ${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
        feedbackEl.textContent = message;
        feedbackEl.style.backgroundColor = type === 'error' ? '#fee2e2' : '#dcfce7';
        feedbackEl.style.color = type === 'error' ? '#991b1b' : '#166534';
        document.body.appendChild(feedbackEl);

        // Animation d'entrée
        setTimeout(() => {
            feedbackEl.style.transform = 'translateX(0)';
        }, 10);

        // Animation de sortie
        setTimeout(() => {
            feedbackEl.style.transform = 'translateX(full)';
            setTimeout(() => feedbackEl.remove(), 300);
        }, CALCULATOR_CONFIG.errorDisplayDuration);
    }

    let calculationHistory = [];

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
        calculationHistory.slice().reverse().forEach((item, idx) => {
            const listItem = document.createElement('li');
            listItem.className = 'history-item flex justify-between items-center';
            // Assurer que l'expression affichée dans l'historique utilise aussi × et ÷
            const displayExpression = item.expression.replace(/\*/g, '×').replace(/\//g, '÷');
            listItem.innerHTML = `
                <span class="expression">${displayExpression}</span>
                <span class="result">${item.result}</span>
                <button class="btn btn-xs btn-outline ml-2 delete-history-btn" aria-label="Supprimer cette entrée">🗑️</button>
            `;
            listItem.querySelector('.expression').addEventListener('click', () => {
                display.value = displayExpression;
            });
            // Suppression d'une ligne
            listItem.querySelector('.delete-history-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                // Animation de disparition
                listItem.style.transition = 'opacity 0.3s';
                listItem.style.opacity = '0';
                setTimeout(() => {
                    // Calculer l'index réel dans calculationHistory
                    const realIdx = calculationHistory.length - 1 - idx;
                    calculationHistory.splice(realIdx, 1);
                    saveHistory();
                    renderHistory();
                }, 300);
            });
            historyListElement.appendChild(listItem);
        });
    }

    function addToHistory(expressionForEval, result) {
        // On stocke l'expression telle qu'elle a été évaluée (avec * et /)
        // mais on l'affichera avec × et ÷ dans renderHistory.
        calculationHistory.push({ expression: expressionForEval, result: result });
        if (calculationHistory.length > CALCULATOR_CONFIG.maxHistoryLength) {
            calculationHistory.shift();
        }
        saveHistory();
        renderHistory();
    }

    // --- Fonctions de la calculatrice qui doivent être globales pour onclick="" ---
    window.appendToDisplay = function(value) {
        if (!display) return;
        
        // Animation du bouton
        const button = document.querySelector(`button[onclick="appendToDisplay('${value}')"]`);
        if (button) {
            button.classList.add('animate-press');
            setTimeout(() => button.classList.remove('animate-press'), 150);
        }

        if (value === '*') {
            display.value += '×';
        } else if (value === '/') {
            display.value += '÷';
        } else {
            display.value += value;
        }

        // Animation de l'affichage
        display.classList.add('animate-input');
        setTimeout(() => display.classList.remove('animate-input'), 150);
    };

    window.clearDisplay = function() {
        if (!display) return;
        display.value = '';
    };

    // Ajouter des fonctions utilitaires pour le mode scientifique
    const scientificFunctions = {
        validateExpression: (expr) => {
            // Vérifier les parenthèses
            let parenthesesCount = 0;
            for (let char of expr) {
                if (char === '(') parenthesesCount++;
                if (char === ')') parenthesesCount--;
                if (parenthesesCount < 0) return false;
            }
            return parenthesesCount === 0;
        },

        formatResult: (result) => {
            if (typeof result !== 'number') return result;
            // Arrondir à 10 décimales pour éviter les erreurs de précision
            return Math.round(result * 1e10) / 1e10;
        },

        handleScientificError: (error) => {
            if (error instanceof SyntaxError) {
                return "Expression invalide. Vérifiez la syntaxe.";
            }
            if (error instanceof RangeError) {
                return "Résultat hors limites.";
            }
            if (error.message.includes('undefined')) {
                return "Fonction non définie pour cette valeur.";
            }
            return error.message;
        }
    };

    // Modifier la fonction calculate pour gérer le mode scientifique
    window.calculate = function() {
        if (!display || display.value === '') return;
        
        try {
            // Préparation de l'expression
            let expressionForEval = display.value.replace(/×/g, '*').replace(/÷/g, '/');
            
            // Validation des parenthèses
            if (!scientificFunctions.validateExpression(expressionForEval)) {
                throw new Error("Parenthèses non équilibrées");
            }

            // Mise à jour des statistiques
            const operations = expressionForEval.match(/[\+\-\*\/]/g) || [];
            operations.forEach(op => {
                if (calculatorStats.operationCounts.hasOwnProperty(op)) {
                    calculatorStats.operationCounts[op]++;
                }
            });
            calculatorStats.totalCalculations++;
            calculatorStats.lastUsed = new Date().toISOString();

            // Calcul du résultat
            const result = new Function('return ' + expressionForEval)();
            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Résultat invalide");
            }

            // Formatage et affichage du résultat
            const formattedResult = scientificFunctions.formatResult(result);
            calculatorStats.successfulCalculations++;
            addToHistory(expressionForEval, formattedResult);
            display.value = formattedResult;

            // Animation de succès
            display.classList.add('animate-success');
            setTimeout(() => display.classList.remove('animate-success'), 300);

        } catch (error) {
            // Gestion des erreurs
            calculatorStats.failedCalculations++;
            const errorMessage = scientificFunctions.handleScientificError(error);
            display.value = 'Error';
            console.error("Erreur de calcul:", error);
            showFeedback(errorMessage);
            setTimeout(window.clearDisplay, CALCULATOR_CONFIG.errorDisplayDuration);
        }

        // Mise à jour des statistiques
        saveStats();
        updateStatsDisplay();
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
        const scientificMode = document.getElementById('scientific-buttons').style.display !== 'none';

        // Raccourcis de base
        if (/[\d.]/.test(key)) { event.preventDefault(); window.appendToDisplay(key); }
        else if (key === '+' || key === '-') { event.preventDefault(); window.appendToDisplay(key); }
        else if (key === '*') { event.preventDefault(); window.appendToDisplay('×'); }
        else if (key === '/') { event.preventDefault(); window.appendToDisplay('÷'); }
        else if (key === 'Enter' || key === '=') { event.preventDefault(); window.calculate(); }
        else if (key === 'Backspace') { event.preventDefault(); window.backspace(); }
        else if (key === 'Escape' || key.toLowerCase() === 'c') { event.preventDefault(); window.clearDisplay(); }
        else if (key === '(' || key === ')') { event.preventDefault(); window.appendToDisplay(key); }

        // Raccourcis scientifiques (uniquement en mode scientifique)
        if (scientificMode) {
            switch (key.toLowerCase()) {
                case 's':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        window.appendToDisplay('Math.sin(');
                    }
                    break;
                case 'c':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        window.appendToDisplay('Math.cos(');
                    }
                    break;
                case 't':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        window.appendToDisplay('Math.tan(');
                    }
                    break;
                case 'r':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        window.appendToDisplay('Math.sqrt(');
                    }
                    break;
                case 'p':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        window.appendToDisplay('Math.pow(');
                    }
                    break;
                case 'l':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        window.appendToDisplay('Math.log(');
                    }
                    break;
                case 'g':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        window.appendToDisplay('Math.log10(');
                    }
                    break;
                case 'a':
                    if (event.ctrlKey) {
                        event.preventDefault();
                        window.appendToDisplay('Math.abs(');
                    }
                    break;
            }
        }
    });

    // Charger l'historique au démarrage
    loadHistory();

    // Ajouter un bouton pour afficher/masquer les statistiques
    const toggleStatsBtn = document.createElement('button');
    toggleStatsBtn.id = 'toggle-stats-btn';
    toggleStatsBtn.className = 'btn btn-sm mt-2 w-full bg-[var(--psg-blue)] text-white hover:bg-[var(--psg-red)]';
    toggleStatsBtn.textContent = 'Statistiques';
    toggleStatsBtn.onclick = () => {
        const statsSection = document.getElementById('stats-section');
        if (statsSection) {
            const isHidden = statsSection.style.display === 'none';
            statsSection.style.display = isHidden ? 'block' : 'none';
            toggleStatsBtn.textContent = isHidden ? 'Masquer Statistiques' : 'Statistiques';
        }
    };

    // Insérer les nouveaux éléments dans le DOM
    if (historySection && historySection.parentNode) {
        historySection.parentNode.insertBefore(statsSection, historySection.nextSibling);
        historySection.parentNode.insertBefore(toggleStatsBtn, statsSection);
    }

    // Ajouter des styles CSS pour les animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes press {
            0% { transform: scale(1); }
            50% { transform: scale(0.95); }
            100% { transform: scale(1); }
        }
        @keyframes success {
            0% { background-color: #e9ecef; }
            50% { background-color: #dcfce7; }
            100% { background-color: #e9ecef; }
        }
        @keyframes input {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        .animate-press { animation: press 0.15s ease-in-out; }
        .animate-success { animation: success 0.3s ease-in-out; }
        .animate-input { animation: input 0.15s ease-in-out; }
        .feedback-message { z-index: 1000; }
    `;
    document.head.appendChild(style);

    // Charger les statistiques au démarrage
    loadStats();

    // Ajouter des tooltips pour les boutons scientifiques
    document.addEventListener('DOMContentLoaded', () => {
        const scientificButtons = document.querySelectorAll('#scientific-buttons button');
        scientificButtons.forEach(button => {
            const shortcut = button.textContent.toLowerCase();
            let tooltipText = button.textContent;
            
            // Ajouter les raccourcis clavier aux tooltips
            switch (shortcut) {
                case 'sin': tooltipText += ' (Ctrl+S)'; break;
                case 'cos': tooltipText += ' (Ctrl+C)'; break;
                case 'tan': tooltipText += ' (Ctrl+T)'; break;
                case '√': tooltipText += ' (Ctrl+R)'; break;
                case 'x^y': tooltipText += ' (Ctrl+P)'; break;
                case 'ln': tooltipText += ' (Ctrl+L)'; break;
                case 'log': tooltipText += ' (Ctrl+G)'; break;
                case '|x|': tooltipText += ' (Ctrl+A)'; break;
            }
            
            button.title = tooltipText;
        });
    });

    // Gestion des onglets Instructions (ajoutée depuis le HTML)
    const tabs = document.querySelectorAll('.tabs .tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    if (tabs.length && tabPanes.length) {
        // Initialiser le premier onglet comme actif
        tabs[0].classList.add('tab-active', 'bg-[var(--psg-blue)]', 'text-white');
        tabPanes[0].classList.add('active');
        tabPanes[0].classList.remove('hidden');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => {
                    t.classList.remove('tab-active', 'bg-[var(--psg-blue)]', 'text-white');
                });
                tab.classList.add('tab-active', 'bg-[var(--psg-blue)]', 'text-white');

                const tabId = tab.dataset.tab;
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    pane.classList.add('hidden');
                });
                const activePane = document.getElementById(`${tabId}-tab`);
                if (activePane) {
                    activePane.classList.remove('hidden');
                    activePane.classList.add('active');
                }
            });
        });
    }

    // --- Gestion du bouton Copier le résultat ---
    const copyBtn = document.getElementById('copy-result-btn');
    if (copyBtn && display) {
        copyBtn.addEventListener('click', () => {
            if (display.value) {
                navigator.clipboard.writeText(display.value)
                    .then(() => {
                        showFeedback('Résultat copié !', 'success');
                    })
                    .catch(() => {
                        showFeedback('Impossible de copier', 'error');
                    });
            }
        });
    }

    // --- Message d'aide de bienvenue (affiché une seule fois) ---
    const welcomeHelp = document.getElementById('welcome-help');
    const closeHelpBtn = document.getElementById('close-help-btn');
    if (welcomeHelp && closeHelpBtn) {
        if (!localStorage.getItem('calculatorWelcomeHelpShown')) {
            welcomeHelp.classList.remove('hidden');
            closeHelpBtn.addEventListener('click', () => {
                welcomeHelp.classList.add('hidden');
                localStorage.setItem('calculatorWelcomeHelpShown', '1');
            });
        }
    }
});