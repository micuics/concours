document.addEventListener('DOMContentLoaded', () => {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbolF2BWNfe_rm9gNfMsqDDHylWoHsdriZYuwprGqvKFvbNyX7knEqnlniRVcRGEKHeABSoV7h2QS1/pub?gid=0&single=true&output=csv';

    const remainingCountSpan = document.querySelector('#remaining-count span');
    const podiumContainer = document.getElementById('podium');
    const leaderboardList = document.getElementById('leaderboard-list');

    // Animation de comptage pour le score
    function animateCountUp(element, target) {
        let current = 0;
        const duration = 1500; // en millisecondes
        const increment = target / (duration / 16); // 16ms ~ 60fps

        function updateCount() {
            current += increment;
            if (current < target) {
                element.textContent = Math.ceil(current);
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = target;
            }
        }
        requestAnimationFrame(updateCount);
    }

    async function fetchDataAndBuildLeaderboard() {
        try {
            // Ajout d'un timestamp pour forcer le rechargement du fichier et éviter le cache du navigateur
            const response = await fetch(csvUrl + '&timestamp=' + new Date().getTime());
            if (!response.ok) {
                throw new Error('Erreur réseau lors de la récupération des données.');
            }
            const csvData = await response.text();
            
            const rows = csvData.split('\n').filter(row => row.trim() !== '');

            // Extraction de la valeur que vous avez mise en D4 dans Google Sheets
            const remainingValueRow = rows[3].split(',');
            const d4Content = remainingValueRow[3] ? remainingValueRow[3].trim().replace(/"/g, '') : ''; // Nettoie le contenu

            // On vérifie si le contenu est un nombre
            if (!isNaN(parseInt(d4Content))) {
                // Si c'est un nombre, on lance l'animation
                const remainingCount = parseInt(d4Content);
                animateCountUp(remainingCountSpan, remainingCount);
            } else {
                // Sinon, on affiche directement le texte
                remainingCountSpan.textContent = d4Content;
            }
            
            // Traitement des participants
            const participants = rows.slice(1).map(row => {
                const [name, scoreStr] = row.split(',');
                if (name && !isNaN(parseInt(scoreStr))) {
                    return { name: name.trim(), score: parseInt(scoreStr.trim()) };
                }
                return null;
            }).filter(p => p !== null);

            participants.sort((a, b) => b.score - a.score);

            podiumContainer.innerHTML = '';
            leaderboardList.innerHTML = '';

            buildPodium(participants.slice(0, 3));
            buildList(participants.slice(3));

        } catch (error) {
            console.error('Impossible de charger le classement :', error);
            remainingCountSpan.textContent = 'Erreur';
        }
    }

    function buildPodium(topThree) {
        const medalInfo = [
            { class: 'gold', image: 'a.png' },
            { class: 'silver', image: 'b.png' },
            { class: 'bronze', image: 'c.png' }
        ];

        topThree.forEach((participant, index) => {
            const placeDiv = document.createElement('div');
            placeDiv.className = `podium-place ${medalInfo[index].class}`;
            placeDiv.style.animationDelay = `${index * 0.2}s`;
            
            // Ajout du numéro de position (div.podium-rank)
            placeDiv.innerHTML = `
                <div class="podium-rank">${index + 1}</div>
                <img src="${medalInfo[index].image}" alt="Lot pour la ${index + 1}ère place">
                <h3>${participant.name}</h3>
                <div class="score">${participant.score}</div>
            `;
            podiumContainer.appendChild(placeDiv);
        });
    }

    function buildList(restOfParticipants) {
        restOfParticipants.forEach((participant, index) => {
            const listItem = document.createElement('li');
            
            // Animation en cascade pour la liste
            listItem.style.animationDelay = `${(index * 0.05) + 0.5}s`;
            
            listItem.innerHTML = `
                <span class="rank">${index + 4}.</span>
                <span class="name">${participant.name}</span>
                <span class="score">${participant.score}</span>
            `;
            leaderboardList.appendChild(listItem);
        });
    }

    fetchDataAndBuildLeaderboard();
});