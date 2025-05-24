function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("contact-form.js chargé et DOM prêt.");

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Empêche la soumission réelle du formulaire

            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email'); // Email du formulaire de contact
            const subjectInput = document.getElementById('contact-subject');
            const messageInput = document.getElementById('contact-message');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const subject = subjectInput ? subjectInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            // Validation simple
            if (!name) { alert('Veuillez entrer votre prénom et nom.'); nameInput.focus(); return; }
            if (!email) { alert('Veuillez entrer votre adresse email.'); emailInput.focus(); return; }
            if (!validateEmail(email)) { alert('Veuillez entrer une adresse email valide.'); emailInput.focus(); return; }
            if (!subject) { alert('Veuillez entrer un sujet pour votre message.'); subjectInput.focus(); return; }
            if (!message) { alert('Veuillez écrire votre message.'); messageInput.focus(); return; }

            console.log('Formulaire de contact soumis (simulation) avec :', { name, email, subject, message });
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            let originalButtonContent = '';
            if (submitButton) {
                originalButtonContent = submitButton.innerHTML; 
                submitButton.innerHTML = `
                    <span class="loading loading-spinner loading-sm"></span>
                    Envoi en cours...
                `;
                submitButton.disabled = true;
            }

            // Simulation d'envoi (votre code existant)
            setTimeout(() => {
                alert('Merci pour votre message, ' + name + ' ! Nous vous répondrons bientôt.');
                contactForm.reset(); 
                if (submitButton) {
                    submitButton.innerHTML = originalButtonContent; 
                    submitButton.disabled = false;
                }
            }, 1500);
        });
    } else {
        console.warn("Le formulaire #contact-form n'a pas été trouvé sur cette page.");
    }

    // --- Nouvelle Logique pour le Formulaire d'Inscription à la Newsletter ---
    const newsletterForm = document.getElementById('modalNewsletterFormActual');
    const newsletterEmailInput = document.getElementById('newsletterEmailModalActual');
    const newsletterModal = document.getElementById('newsletterModal'); // Référence à la modale

    if (newsletterForm && newsletterEmailInput && newsletterModal) {
        console.log("Éléments du formulaire de newsletter trouvés. Prêt à configurer l'envoi.");
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Empêche la soumission par défaut (qui ferme juste la modale)

            const emailForNewsletter = newsletterEmailInput.value.trim();

            if (!emailForNewsletter || !validateEmail(emailForNewsletter)) { // Utilise la fonction validateEmail partagée
                alert('Veuillez entrer une adresse email valide pour la newsletter.');
                newsletterEmailInput.focus();
                return;
            }

            const newsSubmitButton = newsletterForm.querySelector('button[type="submit"]');
            const originalNewsButtonText = newsSubmitButton.textContent; // Sauvegarde le texte du bouton
            newsSubmitButton.innerHTML = '<span class="loading loading-spinner loading-xs"></span> Inscription...';
            newsSubmitButton.disabled = true;

            // --- Configuration Formspree ---
            // IMPORTANT : Remplacez 'YOUR_FORM_ID' ci-dessous 
            // par l'ID réel de votre formulaire Formspree que vous avez créé.
            // L'URL ressemblera à quelque chose comme : 'https://formspree.io/f/xxyyzzqq'
            const formspreeEndpoint = 'https://formspree.io/f/xwpojbga'; 
            // ------------------------------

            fetch(formspreeEndpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email: emailForNewsletter, // L'email à envoyer
                    source: 'Inscription Newsletter PSG Passion' // Info optionnelle pour identifier la source
                })
            })
            .then(response => {
                if (response.ok) {
                    alert('Merci pour votre inscription à la newsletter !');
                    newsletterForm.reset(); // Vide le champ email
                    if (newsletterModal.close) { // Méthode standard pour fermer un <dialog>
                        newsletterModal.close(); 
                    }
                } else {
                    // Essayer de lire l'erreur de Formspree
                    response.json().then(data => {
                        if (data.errors) {
                            alert('Erreur lors de l\'inscription : ' + data.errors.map(error => error.message).join(", "));
                        } else {
                            alert('Une erreur s\'est produite lors de l\'inscription. Veuillez réessayer.');
                        }
                    }).catch(() => {
                        // Si la réponse n'est pas du JSON ou autre problème
                        alert('Une erreur s\'est produite lors de l\'inscription (réponse du serveur invalide). Veuillez réessayer.');
                    });
                }
            })
            .catch(error => {
                console.error('Erreur lors de la soumission du formulaire de newsletter via Fetch:', error);
                alert('Une erreur de communication s\'est produite lors de l\'inscription. Veuillez vérifier votre connexion et réessayer. Consultez la console pour plus de détails.');
            })
            .finally(() => {
                newsSubmitButton.textContent = originalNewsButtonText; // Rétablit le texte original du bouton
                newsSubmitButton.disabled = false;
            });
        });
    } else {
        // Ces messages vous aideront à déboguer si les éléments ne sont pas trouvés
        if (!newsletterForm) console.warn("Formulaire de newsletter (#modalNewsletterFormActual) non trouvé. Vérifiez l'ID dans contact.html.");
        if (!newsletterEmailInput) console.warn("Champ email de newsletter (#newsletterEmailModalActual) non trouvé. Vérifiez l'ID dans contact.html.");
        if (!newsletterModal) console.warn("Modale de newsletter (#newsletterModal) non trouvée. Vérifiez l'ID dans contact.html.");
    }
});