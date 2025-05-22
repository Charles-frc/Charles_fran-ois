document.addEventListener('DOMContentLoaded', () => {
    console.log("supporters.js chargé et DOM prêt.");

    // --- Gestion des Modales de Connexion et Inscription ---
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');

    // Ces fonctions sont appelées par onclick="", elles doivent être accessibles globalement.
    // Si ce script devient un module ES6, il faudra les attacher à `window`.
    window.showLoginModal = function() {
        if (loginModal && typeof loginModal.showModal === 'function') {
            loginModal.showModal();
        } else if (loginModal) {
            loginModal.style.display = 'block'; // Fallback simple
            console.warn("Utilisation du fallback display pour loginModal.");
        } else {
            console.error("L'élément #loginModal est introuvable.");
        }
    }

    window.showRegisterModal = function() {
        if (registerModal && typeof registerModal.showModal === 'function') {
            registerModal.showModal();
        } else if (registerModal) {
            registerModal.style.display = 'block'; // Fallback simple
            console.warn("Utilisation du fallback display pour registerModal.");
        } else {
            console.error("L'élément #registerModal est introuvable.");
        }
    }

    // --- Gestion du Compte à Rebours du Match ---
    const countdownEl = document.getElementById('countdown');
    let matchInterval; 

    function updateCountdown() {
        if (!countdownEl) return;

        const matchDateString = countdownEl.dataset.matchDate || '2025-05-31T21:00:00'; 
        const matchDate = new Date(matchDateString);
        const now = new Date();
        const diff = matchDate - now;

        if (diff < 0) {
            countdownEl.textContent = "Match Terminé";
            if (matchInterval) clearInterval(matchInterval);
            return;
        }
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
             countdownEl.textContent = `${days}j ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
        } else {
             countdownEl.textContent = `<span class="math-inline">\{String\(hours\)\.padStart\(2, '0'\)\}\:</span>{String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    if (countdownEl) {
        updateCountdown(); 
        matchInterval = setInterval(updateCountdown, 1000);
    }

    // --- Gestion Soumission Formulaire Newsletter de la PAGE SUPPORTERS ---
    const formPageNewsletter = document.getElementById('newsletterFormPage');
    if(formPageNewsletter){
        formPageNewsletter.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const emailInput = this.querySelector('input[type="email"]');
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton ? submitButton.textContent : "S'inscrire";

            if(emailInput && emailInput.value && validateEmail(emailInput.value)) { // Ajout de la validation
                console.log('Inscription newsletter (formulaire de page) pour :', emailInput.value);
                
                if (submitButton) {
                    submitButton.innerHTML = '<span class="loading loading-xs loading-spinner"></span> Envoi...';
                    submitButton.disabled = true;
                }
                
                setTimeout(() => {
                    alert(`Merci pour votre inscription à la newsletter PSG Passion : ${emailInput.value}`);
                    if (emailInput) emailInput.value = '';
                    if (submitButton) {
                        submitButton.innerHTML = originalButtonText; // Rétablir le texte original
                        submitButton.disabled = false;
                    }
                }, 1500);
            } else if (emailInput) {
                alert("Veuillez entrer une adresse email valide.");
                emailInput.focus();
            }
        });
    }

    function validateEmail(email) { // Fonction de validation simple
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    // --- Animations à l'Apparition (Intersection Observer) ---
    if (typeof IntersectionObserver === 'function') {
        const sectionsToAnimate = document.querySelectorAll('.info-card, .fan-zone .btn, .fan-zone p, .fan-zone h1');
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Supprimer les classes d'animation existantes pour permettre la ré-animation si besoin (ou si on les ajoute dynamiquement)
                    entry.target.classList.remove('animate__fadeInUp', 'animate__delay-1s'); // Enlever les classes spécifiques animate.css si elles étaient en dur

                    const animationType = entry.target.dataset.animationType || 'animate__fadeInUp'; // Lire un type d'animation ou utiliser un défaut
                    const animationDelay = entry.target.dataset.animationDelay || ''; // Lire un délai

                    entry.target.classList.add('animate__animated', animationType);
                    if(animationDelay) entry.target.style.animationDelay = animationDelay; // Appliquer le délai via style pour plus de flexibilité

                    // entry.target.style.visibility = 'visible'; // Assurer la visibilité si caché initialement par CSS
                    
                    obs.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.1 });

        sectionsToAnimate.forEach((section) => {
            // Optionnel: cacher les éléments initialement pour un meilleur effet de fondu à l'apparition
            // section.style.visibility = 'hidden'; 
            observer.observe(section);
        });
    } else {
        console.warn("IntersectionObserver n'est pas supporté. Les animations au défilement ne fonctionneront pas.");
    }
});