function getCssVariableValue(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

document.addEventListener('DOMContentLoaded', () => {
    const psgBlue = getCssVariableValue('--psg-blue');
    const psgRed = getCssVariableValue('--psg-red');
    const psgGold = getCssVariableValue('--psg-gold');
    const neutralGray = '#8A8A8A';
    const chartTextColor = getCssVariableValue('--chart-text-color') || '#1f2937';

    const titlesCanvas = document.getElementById('titlesChart');
    const rankingCanvas = document.getElementById('rankingChart');
    const goalsCanvas = document.getElementById('goalsPerformanceChart');

    let chartsSuccessfullyInitialized = true;

    if (!titlesCanvas) {
        console.error("L'élément canvas avec l'ID 'titlesChart' est manquant !");
        chartsSuccessfullyInitialized = false;
    }
    if (!rankingCanvas) {
        console.error("L'élément canvas avec l'ID 'rankingChart' est manquant !");
        chartsSuccessfullyInitialized = false;
    }
    if (!goalsCanvas) {
        console.error("L'élément canvas avec l'ID 'goalsPerformanceChart' est manquant !");
        chartsSuccessfullyInitialized = false;
    }

    if (chartsSuccessfullyInitialized) {
        try {
            if (titlesCanvas) {
                const titlesCtx = titlesCanvas.getContext('2d');
                new Chart(titlesCtx, {
                    type: 'pie',
                    data: {
                        labels: ['Championnat', 'Coupe de France', 'Coupe de la Ligue', 'Trophée des Champions'],
                        datasets: [{
                            data: [12, 15, 9, 12],
                            backgroundColor: [psgBlue, psgRed, psgGold, neutralGray],
                            borderColor: '#ffffff',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Titres du Club par Catégorie',
                                font: { size: 18, weight: '600' },
                                color: chartTextColor,
                                padding: { top: 10, bottom: 20 }
                            },
                            legend: {
                                position: 'bottom',
                                labels: { color: chartTextColor, padding: 20, font: { size: 14 } }
                            },
                            tooltip: { bodyFont: { size: 14 }, titleFont: { size: 16 } }
                        }
                    }
                });
            }

            if (rankingCanvas) {
                const rankingCtx = rankingCanvas.getContext('2d');
                new Chart(rankingCtx, {
                    type: 'line',
                    data: {
                        labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
                        datasets: [{
                            label: 'Position en Ligue 1',
                            data: [1, 1, 1, 2, 1, 1, 1, 1],
                            borderColor: psgBlue,
                            backgroundColor: 'rgba(0, 42, 94, 0.1)',
                            tension: 0.1,
                            fill: true,
                            pointBackgroundColor: psgRed,
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: psgRed,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Évolution du Classement en Ligue 1',
                                font: { size: 18, weight: '600' },
                                color: chartTextColor,
                                padding: { top: 10, bottom: 20 }
                            },
                            legend: { labels: { color: chartTextColor, font: { size: 14 } }, display: true },
                            tooltip: { bodyFont: { size: 14 }, titleFont: { size: 16 } }
                        },
                        scales: {
                            y: { reverse: true, min: 1, ticks: { color: chartTextColor, stepSize: 1, font: { size: 14 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
                            x: { ticks: { color: chartTextColor, font: { size: 14 } }, grid: { display: false } }
                        }
                    }
                });
            }

            if (goalsCanvas) {
                const goalsCtx = goalsCanvas.getContext('2d');
                new Chart(goalsCtx, {
                    type: 'bar',
                    data: {
                        labels: ['2019-20', '2020-21', '2021-22', '2022-23', '2023-24', '2024-25'],
                        datasets: [
                            { label: 'Buts Marqués', data: [75, 86, 90, 89, 81, 92], backgroundColor: psgBlue, borderColor: psgBlue, borderWidth: 1 },
                            { label: 'Buts Encaissés', data: [24, 28, 36, 40, 33, 35], backgroundColor: psgGold, borderColor: psgGold, borderWidth: 1 }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Performance en Ligue 1 (Buts Marqués/Encaissés)',
                                font: { size: 18, weight: '600' },
                                color: chartTextColor,
                                padding: { top: 10, bottom: 20 }
                            },
                            legend: { position: 'bottom', labels: { color: chartTextColor, padding: 20, font: { size: 14 } } },
                            tooltip: { mode: 'index', intersect: false, bodyFont: { size: 14 }, titleFont: { size: 16 } }
                        },
                        scales: {
                            y: { beginAtZero: true, ticks: { color: chartTextColor, font: { size: 14 } }, grid: { color: 'rgba(0,0,0,0.05)' }, title: { display: true, text: 'Nombre de Buts', color: chartTextColor, font: {size: 12, weight: 'bold'}} },
                            x: { ticks: { color: chartTextColor, font: { size: 14 } }, grid: { display: false }, title: { display: true, text: 'Saison', color: chartTextColor, font: {size: 12, weight: 'bold'}} }
                        }
                    }
                });
            }
        } catch (e) {
            console.error("Erreur lors de l'initialisation d'un graphique Chart.js:", e);
            chartsSuccessfullyInitialized = false; // Marquer comme échec en cas d'erreur
        }
    }


    function sortTableByColumn(table, column, asc = true) {
        const dirModifier = asc ? 1 : -1;
        const tBody = table.tBodies[0];
        if (!tBody) return;
        const rows = Array.from(tBody.querySelectorAll("tr"));
        const currentSortedHeader = table.querySelector(`th:nth-child(${ column + 1 })`);

        table.querySelectorAll("th[data-sortable]").forEach(th => {
            if (th !== currentSortedHeader) {
                th.setAttribute("aria-sort", "none");
                th.classList.remove("sorted-asc", "sorted-desc");
            }
        });

        const sortedRows = rows.sort((a, b) => {
            const aVal = a.querySelector(`td:nth-child(${ column + 1 })`) ? a.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim() : '';
            const bVal = b.querySelector(`td:nth-child(${ column + 1 })`) ? b.querySelector(`td:nth-child(${ column + 1 })`).textContent.trim() : '';
            const dataType = currentSortedHeader && currentSortedHeader.dataset.type ? currentSortedHeader.dataset.type : 'text';


            const extractNumberFromString = (text) => {
                const match = text.match(/(-?\d+(\.\d+)?)/);
                return match ? parseFloat(match[1]) : text;
            };
            
            if (dataType === 'text' && currentSortedHeader && currentSortedHeader.textContent.includes('Meilleur buteur')) {
                 const aNum = extractNumberFromString(aVal);
                 const bNum = extractNumberFromString(bVal);
                 if (!isNaN(aNum) && !isNaN(bNum)) return (aNum - bNum) * dirModifier;
                 return aVal.localeCompare(bVal, 'fr', { sensitivity: 'base' }) * dirModifier; // Fallback si pas de nombre
            }
            if (dataType === 'number' || (currentSortedHeader && currentSortedHeader.textContent.includes('Diff.'))) {
                 const aNum = parseFloat(aVal.replace('+', ''));
                 const bNum = parseFloat(bVal.replace('+', ''));
                 if (!isNaN(aNum) && !isNaN(bNum)) return (aNum - bNum) * dirModifier;
                 return aVal.localeCompare(bVal, 'fr', { numeric: true, sensitivity: 'base' }) * dirModifier; // Fallback si non numérique malgré le type
            }

            return aVal.localeCompare(bVal, 'fr', { numeric: true, sensitivity: 'base' }) * dirModifier;
        });

        while (tBody.firstChild) { tBody.removeChild(tBody.firstChild); }
        tBody.append(...sortedRows);

        if (currentSortedHeader) {
            currentSortedHeader.classList.remove("sorted-asc", "sorted-desc");
            currentSortedHeader.classList.add(asc ? "sorted-asc" : "sorted-desc");
            currentSortedHeader.setAttribute("aria-sort", asc ? "ascending" : "descending");
        }
    }

    document.querySelectorAll(".sortable-table th[data-sortable]").forEach(headerCell => {
        headerCell.setAttribute("aria-sort", "none");
        headerCell.addEventListener("click", () => {
            const tableElement = headerCell.closest("table");
            if (!tableElement) return;
            const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
            
            let newSortDirectionIsAsc;
            const currentAriaSort = headerCell.getAttribute("aria-sort");

            if (currentAriaSort === "ascending") {
                newSortDirectionIsAsc = false;
            } else { 
                newSortDirectionIsAsc = true;
            }
            sortTableByColumn(tableElement, headerIndex, newSortDirectionIsAsc);
        });
    });

    const formCells = document.querySelectorAll('.table td.form-cell');
    formCells.forEach(cell => {
        const formString = cell.textContent.trim();
        let formHtml = '';
        if (formString && formString !== 'N/A') {
            const reversedFormString = formString.split('').reverse().join('');
            for (const char of reversedFormString) {
                if (char.toUpperCase() === 'W' || char.toUpperCase() === 'G' || char.toUpperCase() === 'V') {
                    formHtml += '<span class="form-icon form-win" title="Victoire"><svg viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg></span>';
                } else if (char.toUpperCase() === 'D' || char.toUpperCase() === 'N') {
                    formHtml += '<span class="form-icon form-draw" title="Nul"><svg viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg></span>';
                } else if (char.toUpperCase() === 'L' || char.toUpperCase() === 'P') {
                    formHtml += '<span class="form-icon form-loss" title="Défaite"><svg viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg></span>';
                }
            }
        } else if (formString === 'N/A') {
            formHtml = 'N/A';
        }
        cell.innerHTML = formHtml;
    });
});