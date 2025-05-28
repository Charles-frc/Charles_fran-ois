/** Affiche la modale de newsletter.*/
function showNewsletterModal() {
    const modal = document.getElementById('newsletterModal');
    if (modal && typeof modal.showModal === 'function') {
        modal.showModal();
    } else if (modal) {
        console.warn("La méthode showModal() n'est pas supportée ou la modale est mal configurée. Utilisation d'un fallback display.");
        modal.style.display = 'block'; 
    } else {
        console.error("L'élément #newsletterModal est introuvable dans le DOM.");
    }
}
window.showNewsletterModal = showNewsletterModal;

// Configuration globale
const CONFIG = {
    animations: {
        enabled: true,
        duration: 300
    }
};

// Gestionnaire de newsletter
class NewsletterManager {
    constructor() {
        this.modal = document.getElementById('newsletterModal');
        this.form = document.getElementById('modalNewsletterFormActual');
        this.init();
    }

    init() {
        if (this.modal && this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    show() {
        if (this.modal) {
            this.modal.showModal();
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const email = this.form.querySelector('#newsletterEmailModalActual')?.value;
        if (email) {
            try {
                // Simuler un envoi à un serveur
                await this.simulateNewsletterSignup(email);
                this.showSuccess();
            } catch (error) {
                this.showError();
            }
        }
    }

    async simulateNewsletterSignup(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Newsletter signup:', email);
                resolve();
            }, 500);
        });
    }

    showSuccess() {
        // Ajouter une notification de succès
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in-up';
        notification.textContent = 'Inscription réussie !';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showError() {
        // Ajouter une notification d'erreur
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in-up';
        notification.textContent = 'Erreur lors de l\'inscription';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Gestionnaire d'âge des joueurs
class PlayerAgeManager {
    static calculateAge(birthDateString) {
        const birthDate = new Date(birthDateString);
        if (isNaN(birthDate.getTime())) return null;

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    static updateAllPlayerAges() {
        document.querySelectorAll('[data-birthdate]').forEach(element => {
            const ageElement = element.closest('.player-card')?.querySelector('.player-age');
            if (ageElement) {
                const age = this.calculateAge(element.dataset.birthdate);
                if (age !== null) {
                    ageElement.textContent = `${age} ans`;
                }
            }
        });
    }
}

// Gestionnaire d'animations
class AnimationManager {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            { threshold: 0.1 }
        );
    }

    init() {
        if (!CONFIG.animations.enabled) return;
        
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            this.observer.observe(element);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// Initialisation au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les gestionnaires
    const newsletterManager = new NewsletterManager();
    const animationManager = new AnimationManager();

    // Mettre à jour les âges des joueurs
    PlayerAgeManager.updateAllPlayerAges();

    // Initialiser les animations
    animationManager.init();

    // Exposer les gestionnaires globalement si nécessaire
    window.newsletterManager = newsletterManager;

    console.log("main.js chargé et DOM prêt.");

    const modalNewsletterElement = document.getElementById('newsletterModal');
    const modalNewsletterForm = document.getElementById('modalNewsletterFormActual');

    if (modalNewsletterForm && modalNewsletterElement) {
        modalNewsletterForm.addEventListener('submit', function(event) {
            const emailInput = this.querySelector('#newsletterEmailModalActual');
            if (emailInput && emailInput.value) {
                console.log('Inscription à la newsletter (modale globale) pour :', emailInput.value);
                const submitButton = this.querySelector('button[type="submit"]');
                if (submitButton) {
                    const originalButtonText = submitButton.textContent;
                    submitButton.textContent = 'Merci !';
                    submitButton.disabled = true;
                    setTimeout(() => {
                        submitButton.textContent = originalButtonText;
                        submitButton.disabled = false;
                        if (emailInput) emailInput.value = ''; 
                    }, 2000); 
                }
            } else {
                console.warn("Champ email de la modale newsletter vide lors de la soumission.");
            }
        });
    }

    const coachDateElement = document.querySelector('time[data-dynamic-date="true"]'); 
    if (coachDateElement) { 
        const now = new Date();
        const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin",
                            "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
        coachDateElement.textContent = `${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
        coachDateElement.setAttribute('datetime', `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    }

    const userListElement = document.getElementById("user-list");
    if (userListElement) { 
        console.log("Élément #user-list trouvé sur index.html, initialisation des cartes de clubs.");
        const clubsToShow = [
          { 
            name: "FC Barcelone", 
            job: "Club de Liga basé à Barcelone", 
            avatar: "image/barca.svg", // Chemin relatif depuis index.html
            link: "clubs-europeens/barca.html",
            // Couleurs extraites de barca.html (body bg-gradient)
            bgColorClub: "bg-gradient-to-br from-blue-900 to-red-700", 
            textColorClub: "text-white"
          },
          { 
            name: "Real Madrid", 
            job: "Club de Liga basé à Madrid", 
            avatar: "image/realmadrid.svg", 
            link: "clubs-europeens/realmadrid.html",
            // Couleurs extraites de realmadrid.html
            bgColorClub: "bg-gradient-to-br from-white via-gray-200 to-gray-400", 
            textColorClub: "text-gray-900" 
          },
          { 
            name: "Bayern Munich", 
            job: "Club de Bundesliga basé à Munich", 
            avatar: "image/bayern.svg", 
            link: "clubs-europeens/bayern.html",
            // Couleurs extraites de bayern.html
            bgColorClub: "bg-gradient-to-br from-red-800 to-white", 
            textColorClub: "text-gray-900" 
          },
          { 
            name: "Manchester City", 
            job: "Club de Premier League basé à Manchester", 
            avatar: "image/mancity.svg", 
            link: "clubs-europeens/mancity.html",
            // Couleurs extraites de mancity.html
            bgColorClub: "bg-gradient-to-br from-sky-400 to-blue-900", 
            textColorClub: "text-white"
          },
          { 
            name: "Liverpool FC", 
            job: "Club de Premier League basé à Liverpool", 
            avatar: "image/liverpool.svg", 
            link: "clubs-europeens/liverpool.html",
            bgColorClub: "bg-gradient-to-br from-red-700 to-red-900", 
            textColorClub: "text-white"
          },
          { 
            name: "AC Milan", 
            job: "Club Italien, basé à Milan", 
            avatar: "image/acmilan.svg", 
            link: "clubs-europeens/acmilan.html",
            bgColorClub: "bg-gradient-to-br from-red-700 to-red-900", 
            textColorClub: "text-white"
          }
        ];

        function createClubCard(club) {
          const cardLink = document.createElement("a");
          cardLink.href = club.link || "#";
          
          const cardBgClass = club.bgColorClub || "bg-white/10 backdrop-blur-sm"; // Fallback
          let titleTextColor = club.textColorClub || "text-white";
          let jobTextColor = titleTextColor === "text-white" ? "text-gray-200" : "text-gray-700"; // Légère variation pour le job

          cardLink.className = `${cardBgClass} shadow-xl rounded-2xl p-5 pt-6 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300 ease-in-out border border-transparent group relative overflow-hidden h-full`; // Ajout de h-full
          
          // Ajustements pour les fonds clairs
          if (club.bgColorClub.includes("white") || club.bgColorClub.includes("gray-200") || club.bgColorClub.includes("gray-400")) {
             cardLink.classList.remove("border-white/30"); // S'assurer que cette classe est enlevée si elle a été mise par défaut
             cardLink.classList.add("border-gray-300"); // Bordure plus visible sur fond clair
          } else {
             cardLink.classList.add("border-white/20"); // Bordure pour les cartes à fond sombre
          }


          cardLink.innerHTML = `
            <figure class="w-24 h-24 md:w-28 md:h-28 mb-5 flex items-center justify-center bg-white/25 rounded-full p-1 shadow-lg relative z-10">
                <img class="max-w-[85%] max-h-[85%] object-contain group-hover:scale-110 transition-transform duration-300" src="${club.avatar}" alt="Logo de ${club.name}" />
            </figure>
            <div class="flex flex-col flex-grow justify-between">
                <div>
                    <h2 class="text-lg md:text-xl font-bold ${titleTextColor} mb-1.5 group-hover:text-[var(--psg-gold)] transition-colors relative z-10">${club.name}</h2>
                    <p class="${jobTextColor} text-xs mb-4 h-8 overflow-hidden relative z-10">${club.job}</p> 
                </div>
                <div class="card-actions justify-center mt-auto relative z-10">
                    <span class="btn btn-sm bg-[var(--psg-red)] hover:bg-[var(--psg-blue)] text-white border-none shadow-md">
                        Découvrir
                    </span>
                </div>
            </div>
          `;
          return cardLink;
        }

        if (clubsToShow && clubsToShow.length > 0) {
            userListElement.innerHTML = ''; 
            clubsToShow.forEach(club => {
              userListElement.appendChild(createClubCard(club));
            });
        }
    } else {
    }

    // Correction : forcer l'affichage de tous les événements de la frise chronologique
    document.querySelectorAll('.timeline-content').forEach(el => {
        el.style.display = '';
        el.classList.remove('hidden');
    });
});