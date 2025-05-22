// js/contact-form.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("contact-form.js chargé et DOM prêt.");

    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Empêche la soumission réelle du formulaire

            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const subjectInput = document.getElementById('contact-subject');
            const messageInput = document.getElementById('contact-message');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const subject = subjectInput ? subjectInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            // Validation simple
            if (!name) {
                alert('Veuillez entrer votre prénom et nom.');
                nameInput.focus();
                return;
            }
            if (!email) {
                alert('Veuillez entrer votre adresse email.');
                emailInput.focus();
                return;
            }
            if (!validateEmail(email)) {
                alert('Veuillez entrer une adresse email valide.');
                emailInput.focus();
                return;
            }
            if (!subject) {
                alert('Veuillez entrer un sujet pour votre message.');
                subjectInput.focus();
                return;
            }
            if (!message) {
                alert('Veuillez écrire votre message.');
                messageInput.focus();
                return;
            }

            console.log('Formulaire de contact soumis (simulation) avec :', { name, email, subject, message });
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            let originalButtonContent = '';
            if (submitButton) {
                originalButtonContent = submitButton.innerHTML; // Sauvegarder le contenu HTML original
                submitButton.innerHTML = `
                    <span class="loading loading-spinner loading-sm"></span>
                    Envoi en cours...
                `;
                submitButton.disabled = true;
            }

            setTimeout(() => {
                alert('Merci pour votre message, ' + name + ' ! Nous vous répondrons bientôt.');
                contactForm.reset(); 
                if (submitButton) {
                    submitButton.innerHTML = originalButtonContent; // Rétablir le contenu original
                    submitButton.disabled = false;
                }
            }, 1500);
        });
    } else {
        console.warn("Le formulaire #contact-form n'a pas été trouvé sur cette page.");
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
});