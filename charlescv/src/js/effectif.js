document.addEventListener('DOMContentLoaded', () => {
    // Éléments HTML existants
    const formationSelect = document.getElementById('formation-select');
    const formationGrid = document.getElementById('dynamic-formation-grid');
    const availablePlayersSidebar = document.getElementById('available-players-sidebar');
    const playerSelectionModal = document.getElementById('player_selection_modal');
    const modalPlayerList = document.getElementById('modal_player_list');
    const removePlayerFromSlotBtn = document.getElementById('remove-player-from-slot-btn');
    const resetBtn = document.getElementById('reset-composition-btn');

    // Nouveaux éléments HTML pour la sauvegarde/chargement nommés
    const compositionNameInput = document.getElementById('composition-name-input');
    const saveCompositionBtn = document.getElementById('save-composition-btn'); // Renommé pour clarté, était saveBtn
    const savedCompositionsSection = document.getElementById('saved-compositions-section');
    const savedCompositionsList = document.getElementById('saved-compositions-list');
    const noSavedCompositionsMsg = document.getElementById('no-saved-compositions');

    let ALL_PLAYERS = [];
    let currentLineup = {}; // { "slot-0": {id, name, number}, "slot-1": ... } // posGeneral n'est pas stocké ici, mais dans ALL_PLAYERS
    let selectedSlotElement = null;
    const SAVED_COMPS_STORAGE_KEY = 'psgSavedCompositions'; // Clé pour localStorage

    const FORMATION_LAYOUTS = {
        '4-3-3': {
            config: [
                { posName: 'GK', R: 4, C: 3 },
                { posName: 'LB', R: 3, C: 1 }, { posName: 'LCB', R: 3, C: 2 }, { posName: 'RCB', R: 3, C: 4 }, { posName: 'RB', R: 3, C: 5 },
                { posName: 'LCM', R: 2, C: 2 }, { posName: 'CM', R: 2, C: 3 }, { posName: 'RCM', R: 2, C: 4 },
                { posName: 'LW', R: 1, C: 1 }, { posName: 'ST', R: 1, C: 3 }, { posName: 'RW', R: 1, C: 5 }
            ],
            gridStyle: 'grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(4, 1fr);'
        },
        '4-4-2': {
            config: [
                { posName: 'GK', R: 4, C: 3 },
                { posName: 'LB', R: 3, C: 1 }, { posName: 'LCB', R: 3, C: 2 }, { posName: 'RCB', R: 3, C: 4 }, { posName: 'RB', R: 3, C: 5 }, // Correction: RB au lieu de RCCB
                { posName: 'LM', R: 2, C: 1 }, { posName: 'LCM', R: 2, C: 2 }, { posName: 'RCM', R: 2, C: 4 }, { posName: 'RM', R: 2, C: 5 }, // Correction: RCM au lieu de RCCM
                { posName: 'LST', R: 1, C: 2 }, { posName: 'RST', R: 1, C: 4 } // Changed ST to LST/RST for clarity
            ],
            gridStyle: 'grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(4, 1fr);'
        },
        '3-5-2': {
            config: [
                { posName: 'GK', R: 4, C: 3 },
                { posName: 'LCB', R: 3, C: 1 }, { posName: 'CB', R: 3, C: 3 }, { posName: 'RCB', R: 3, C: 5 }, // Correction: RCB au lieu de RCCB
                { posName: 'LWB', R: 2, C: 1 }, { posName: 'LCM', R: 2, C: 2 }, { posName: 'CM', R: 2, C: 3 }, { posName: 'RCM', R: 2, C: 4 }, { posName: 'RWB', R: 2, C: 5 }, // Correction: RCM et RWB
                { posName: 'LST', R: 1, C: 2 }, { posName: 'RST', R: 1, C: 4 }
            ],
            gridStyle: 'grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(4, 1fr);'
        },
        '3-4-3': {
            config: [
                { posName: 'GK', R: 4, C: 3 },
                { posName: 'LCB', R: 3, C: 1 }, { posName: 'CB', R: 3, C: 3 }, { posName: 'RCB', R: 3, C: 5 },
                { posName: 'LM', R: 2, C: 1 }, { posName: 'LCM', R: 2, C: 2 }, { posName: 'RCM', R: 2, C: 4 }, { posName: 'RM', R: 2, C: 5 },
                { posName: 'LW', R: 1, C: 1 }, { posName: 'ST', R: 1, C: 3 }, { posName: 'RW', R: 1, C: 5 }
            ],
            gridStyle: 'grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(4, 1fr);'
        },
        '4-2-3-1': {
            config: [
                { posName: 'GK', R: 5, C: 3 },
                { posName: 'LB', R: 4, C: 1 }, { posName: 'LCB', R: 4, C: 2 }, { posName: 'RCB', R: 4, C: 4 }, { posName: 'RB', R: 4, C: 5 },
                { posName: 'LDM', R: 3, C: 2 }, { posName: 'RDM', R: 3, C: 4 },
                { posName: 'LAM', R: 2, C: 1 }, { posName: 'CAM', R: 2, C: 3 }, { posName: 'RAM', R: 2, C: 5 },
                { posName: 'ST', R: 1, C: 3 }
            ],
            gridStyle: 'grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr);'
        }
    };

    function initializePlayers() {
        const playerElements = availablePlayersSidebar.querySelectorAll('.player-list-item');
        ALL_PLAYERS = [];
        playerElements.forEach(el => {
            ALL_PLAYERS.push({
                id: el.dataset.playerId,
                name: el.dataset.playerName,
                number: el.dataset.playerNumber,
                posGeneral: el.dataset.playerPosGeneral,
                element: el // Conserve une référence à l'élément de la liste
            });
        });
    }

    function renderFormationSlots(formationKey = '4-3-3') {
        if (!formationGrid) return;
        formationGrid.innerHTML = '';
        const layout = FORMATION_LAYOUTS[formationKey];
        if (!layout) {
            console.error(`Formation ${formationKey} not defined.`);
            formationGrid.style.cssText = '';
            return;
        }
        formationGrid.style.cssText = layout.gridStyle;

        layout.config.forEach((slotConfig, index) => {
            const slotElement = document.createElement('div');
            slotElement.classList.add('formation-slot', 'interactive'); // Ajout de 'interactive' pour les slots cliquables
            slotElement.dataset.slotId = `slot-${index}`;
            slotElement.dataset.positionName = slotConfig.posName;
            slotElement.style.gridRow = `${slotConfig.R} / span 1`;
            slotElement.style.gridColumn = `${slotConfig.C} / span 1`;

            const assignedPlayer = currentLineup[slotElement.dataset.slotId];
            if (assignedPlayer) {
                fillSlot(slotElement, assignedPlayer);
            } else {
                slotElement.innerHTML = `<span class="player-name-display">${slotConfig.posName}</span>`;
            }

            slotElement.addEventListener('click', () => handleSlotClick(slotElement));
            formationGrid.appendChild(slotElement);
        });
        updateAvailablePlayersListVisuals();
    }

    function handleSlotClick(slotElement) {
        selectedSlotElement = slotElement;
        populateModalPlayerList();
        if (playerSelectionModal && typeof playerSelectionModal.showModal === 'function') {
            playerSelectionModal.showModal();
        } else {
            console.error("Modal element not found or showModal not a function");
        }
    }

    function isPlayerInLineup(playerId) {
        return Object.values(currentLineup).some(p => p && p.id === playerId);
    }

    function isPositionCompatible(playerPosGeneral, slotPosition) {
        // Cas spécial pour Lee Kang-in et Désiré Doué (MIDFWD) qui peuvent jouer au milieu et en attaque
        if (playerPosGeneral === 'MIDFWD') {
            // Liste des positions autorisées pour les MIDFWD (milieu et attaque uniquement)
            const allowedPositions = [
                // Positions de milieu
                'LM', 'LCM', 'CM', 'RCM', 'RM', 'LDM', 'RDM', 'LAM', 'CAM', 'RAM',
                // Positions d'attaque
                'LW', 'ST', 'RW', 'LST', 'RST'
            ];
            return allowedPositions.includes(slotPosition);
        }

        // Restrictions strictes pour chaque type de joueur
        switch (playerPosGeneral) {
            case 'GK':
                // Les gardiens ne peuvent jouer qu'en position GK
                return slotPosition === 'GK';
            
            case 'DEF':
                // Les défenseurs ne peuvent jouer qu'en défense
                return ['LB', 'LCB', 'CB', 'RCB', 'RB', 'LWB', 'RWB'].includes(slotPosition);
            
            case 'MID':
                // Les milieux ne peuvent jouer qu'au milieu
                return ['LM', 'LCM', 'CM', 'RCM', 'RM', 'LDM', 'RDM', 'LAM', 'CAM', 'RAM'].includes(slotPosition);
            
            case 'FWD':
                // Les attaquants ne peuvent jouer qu'en attaque
                return ['LW', 'ST', 'RW', 'LST', 'RST'].includes(slotPosition);
            
            default:
                return false;
        }
    }

    function populateModalPlayerList() {
        if (!modalPlayerList || !selectedSlotElement) return;
        modalPlayerList.innerHTML = '';
        
        const slotPosition = selectedSlotElement.dataset.positionName;
        
        ALL_PLAYERS.forEach(player => {
            // Vérifier si le joueur est compatible avec la position
            if (!isPositionCompatible(player.posGeneral, slotPosition)) {
                return; // Skip ce joueur s'il n'est pas compatible
            }

            const listItem = document.createElement('div');
            listItem.classList.add('player-list-item', 'p-2', 'hover:bg-gray-200', 'rounded', 'mb-1', 'flex', 'items-center');
            
            const playerNumberSpan = document.createElement('span');
            playerNumberSpan.classList.add('player-number-badge', 'mr-2');
            playerNumberSpan.textContent = player.number;

            listItem.appendChild(playerNumberSpan);
            listItem.appendChild(document.createTextNode(`${player.name} (${player.posGeneral})`));
            listItem.dataset.playerId = player.id;

            const slotIdOfPlayer = Object.keys(currentLineup).find(key => currentLineup[key] && currentLineup[key].id === player.id);
            if (slotIdOfPlayer && selectedSlotElement && slotIdOfPlayer !== selectedSlotElement.dataset.slotId) {
                listItem.classList.add('opacity-50', 'pointer-events-none');
                listItem.title = "Déjà utilisé dans la composition";
            } else {
                listItem.addEventListener('click', () => {
                    const playerToAssign = ALL_PLAYERS.find(p => p.id === player.id);
                    if(playerToAssign) assignPlayerToSlot(playerToAssign);
                });
            }
            modalPlayerList.appendChild(listItem);
        });

        // Si aucun joueur n'est compatible, afficher un message
        if (modalPlayerList.children.length === 0) {
            const noPlayersMsg = document.createElement('div');
            noPlayersMsg.className = 'text-center text-gray-500 py-4';
            noPlayersMsg.textContent = 'Aucun joueur disponible pour cette position';
            modalPlayerList.appendChild(noPlayersMsg);
        }
    }
    
    function assignPlayerToSlot(player) {
        if (selectedSlotElement) {
            Object.keys(currentLineup).forEach(slotId => {
                if (currentLineup[slotId] && currentLineup[slotId].id === player.id && slotId !== selectedSlotElement.dataset.slotId) {
                    const oldSlotElement = formationGrid.querySelector(`[data-slot-id="${slotId}"]`);
                    if (oldSlotElement) clearSlot(oldSlotElement);
                }
            });
            
            fillSlot(selectedSlotElement, player);
            currentLineup[selectedSlotElement.dataset.slotId] = {
                id: player.id,
                name: player.name,
                number: player.number
            };

            if (playerSelectionModal && typeof playerSelectionModal.close === 'function') playerSelectionModal.close();
            selectedSlotElement = null;
            updateAvailablePlayersListVisuals();
        }
    }

    function fillSlot(slotElement, player) {
        slotElement.innerHTML = `
            <div class="player-number-display">${player.number}</div>
            <div class="player-name-display">${player.name}</div>`;
        slotElement.classList.add('filled');
        slotElement.dataset.assignedPlayerId = player.id;
    }

    function clearSlot(slotElement) {
        if (slotElement) {
            const positionName = slotElement.dataset.positionName || 'Vide';
            slotElement.innerHTML = `<span class="player-name-display">${positionName}</span>`;
            slotElement.classList.remove('filled');
            delete currentLineup[slotElement.dataset.slotId];
            delete slotElement.dataset.assignedPlayerId;
        }
    }
    
    if(removePlayerFromSlotBtn) {
        removePlayerFromSlotBtn.addEventListener('click', () => {
            if (selectedSlotElement && currentLineup[selectedSlotElement.dataset.slotId]) {
                clearSlot(selectedSlotElement);
                if (playerSelectionModal && typeof playerSelectionModal.close === 'function') playerSelectionModal.close();
                selectedSlotElement = null;
                updateAvailablePlayersListVisuals();
            }
        });
    }

    function updateAvailablePlayersListVisuals() {
        ALL_PLAYERS.forEach(player => {
            const playerIsAssigned = isPlayerInLineup(player.id);
            if (player.element) {
                player.element.classList.toggle('opacity-50', playerIsAssigned);
                player.element.title = playerIsAssigned ? "Utilisé dans la composition" : "";
            }
        });
    }
    
    if(formationSelect) {
        formationSelect.addEventListener('change', (e) => {
            // Ne pas réinitialiser currentLineup ici si on veut garder les joueurs en changeant de formation
            // currentLineup = {}; 
            renderFormationSlots(e.target.value);
            // Il faudrait une logique pour réassigner les joueurs si possible, ou les enlever si leur slot n'existe plus.
            // Pour l'instant, changer de formation efface les joueurs du terrain visuellement mais currentLineup peut les contenir.
            // Pour simplifier, on peut choisir de vider currentLineup au changement de formation :
            currentLineup = {}; 
            renderFormationSlots(e.target.value);

        });
    }

    // --- NOUVELLES FONCTIONS ET LOGIQUE POUR LA SAUVEGARDE MULTIPLE ---

    function getSavedCompositions() {
        const saved = localStorage.getItem(SAVED_COMPS_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    function saveCompositionsToStorage(compositions) {
        localStorage.setItem(SAVED_COMPS_STORAGE_KEY, JSON.stringify(compositions));
    }

    function handleSaveComposition() {
        const compName = compositionNameInput.value.trim();
        if (!compName) {
            alert("Veuillez entrer un nom pour votre composition.");
            compositionNameInput.focus();
            return;
        }

        const formation = formationSelect ? formationSelect.value : '4-3-3';
        // S'assurer que currentLineup ne contient que des joueurs assignés valides
        const validLineup = {};
        Object.keys(currentLineup).forEach(slotId => {
            if (currentLineup[slotId] && currentLineup[slotId].id) {
                validLineup[slotId] = currentLineup[slotId];
            }
        });

        if (Object.keys(validLineup).length === 0) {
            alert("Votre composition est vide. Ajoutez des joueurs avant de sauvegarder.");
            return;
        }

        let compositions = getSavedCompositions();
        const existingCompIndex = compositions.findIndex(c => c.name === compName);

        const newCompositionData = {
            name: compName,
            formation: formation,
            lineup: validLineup
        };

        if (existingCompIndex > -1) {
            if (confirm(`Une composition nommée "${compName}" existe déjà. Voulez-vous la remplacer ?`)) {
                compositions[existingCompIndex] = newCompositionData;
            } else {
                return; // L'utilisateur a annulé
            }
        } else {
            compositions.push(newCompositionData);
        }

        saveCompositionsToStorage(compositions);
        alert(`Composition "${compName}" sauvegardée !`);
        compositionNameInput.value = ''; // Réinitialiser le champ de nom
        renderSavedCompositionsList();
    }

    function renderSavedCompositionsList() {
        if (!savedCompositionsList || !savedCompositionsSection || !noSavedCompositionsMsg) return;

        const compositions = getSavedCompositions();
        savedCompositionsList.innerHTML = ''; // Vider la liste actuelle

        if (compositions.length === 0) {
            noSavedCompositionsMsg.classList.remove('hidden');
            savedCompositionsSection.classList.add('hidden');
        } else {
            noSavedCompositionsMsg.classList.add('hidden');
            savedCompositionsSection.classList.remove('hidden');
            compositions.forEach(comp => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'flex justify-between items-center p-2 bg-white rounded shadow-sm border border-gray-200';
                
                const nameSpan = document.createElement('span');
                nameSpan.className = 'text-gray-700 text-sm flex-grow';
                nameSpan.textContent = comp.name + ` (${comp.formation})`;

                const buttonsDiv = document.createElement('div');
                buttonsDiv.className = 'space-x-2 flex-shrink-0';

                const loadBtn = document.createElement('button');
                loadBtn.className = 'btn btn-xs btn-outline border-psg-blue text-psg-blue hover:bg-psg-blue hover:text-white';
                loadBtn.textContent = 'Charger';
                loadBtn.dataset.compositionName = comp.name;
                loadBtn.addEventListener('click', () => loadSpecificComposition(comp.name));
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-xs btn-outline btn-error';
                deleteBtn.textContent = 'Suppr.';
                deleteBtn.dataset.compositionName = comp.name;
                deleteBtn.addEventListener('click', () => deleteSpecificComposition(comp.name));

                buttonsDiv.appendChild(loadBtn);
                buttonsDiv.appendChild(deleteBtn);
                itemDiv.appendChild(nameSpan);
                itemDiv.appendChild(buttonsDiv);
                savedCompositionsList.appendChild(itemDiv);
            });
        }
    }

    function loadSpecificComposition(compName) {
        const compositions = getSavedCompositions();
        const compToLoad = compositions.find(c => c.name === compName);

        if (compToLoad) {
            currentLineup = compToLoad.lineup || {};
            if(formationSelect) formationSelect.value = compToLoad.formation || '4-3-3';
            renderFormationSlots(formationSelect.value); // Cela va aussi appeler updateAvailablePlayersListVisuals
            compositionNameInput.value = compName; // Pré-remplir le nom si on veut la modifier
            alert(`Composition "${compName}" chargée.`);
        } else {
            alert(`Erreur: Composition "${compName}" non trouvée.`);
        }
    }

    function deleteSpecificComposition(compName) {
        if (confirm(`Voulez-vous vraiment supprimer la composition "${compName}" ?`)) {
            let compositions = getSavedCompositions();
            compositions = compositions.filter(c => c.name !== compName);
            saveCompositionsToStorage(compositions);
            renderSavedCompositionsList();
            alert(`Composition "${compName}" supprimée.`);
        }
    }
    
    if(saveCompositionBtn) {
        saveCompositionBtn.addEventListener('click', handleSaveComposition);
    } else {
        console.warn("Bouton 'save-composition-btn' non trouvé pour la nouvelle logique.");
    }
    
    // La fonction loadSavedComposition originale chargeait une seule compo.
    // On va la laisser commenter ou la supprimer car la nouvelle logique est différente.
    // On appelle renderSavedCompositionsList pour charger la liste au démarrage.
    
    /*
    function loadSavedComposition() { // ANCIENNE VERSION, à supprimer ou adapter
        const saved = localStorage.getItem('psgTeamComposition'); // Clé obsolète
        let formationToLoad = '4-3-3'; 
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                formationToLoad = parsed.formation || '4-3-3';
                currentLineup = parsed.lineup || {};
            } catch (e) {
                console.error("Erreur en chargeant la composition:", e);
                currentLineup = {}; 
            }
        }
        if(formationSelect) formationSelect.value = formationToLoad;
        renderFormationSlots(formationToLoad); 
    }
    */
    
    if(resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm("Voulez-vous vraiment réinitialiser le terrain et la composition actuelle ?")) {
                currentLineup = {};
                // Ne pas supprimer toutes les sauvegardes ici, juste la compo actuelle.
                // localStorage.removeItem('psgTeamComposition'); // Clé obsolète
                renderFormationSlots(formationSelect ? formationSelect.value : '4-3-3');
                compositionNameInput.value = ''; // Vider aussi le champ de nom
                alert('Terrain réinitialisé.');
            }
        });
    }

    // Initialisation
    initializePlayers();
    // loadSavedComposition(); // L'ancienne fonction n'est plus adaptée.
    renderFormationSlots(formationSelect ? formationSelect.value : '4-3-3'); // Afficher la grille vide ou avec la dernière formation sélectionnée.
    renderSavedCompositionsList(); // Afficher la liste des compositions sauvegardées.
    
    const tabs = document.querySelectorAll('[role="tab"]');
    const tabContents = document.querySelectorAll('[role="tabpanel"]');
    const activeTabClasses = ['tab-active']; // DaisyUI v3+ utilise tab-active

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.setAttribute('aria-selected', 'false');
                t.classList.remove(...activeTabClasses);
            });
            tab.setAttribute('aria-selected', 'true');
            tab.classList.add(...activeTabClasses);

            const targetId = tab.getAttribute('data-tab-content');
            tabContents.forEach(content => {
                content.classList.toggle('hidden', content.id !== targetId);
            });
        });
    });
    if (tabs.length > 0) { // Activer le premier onglet par défaut
         tabs[0].click();
    }
});