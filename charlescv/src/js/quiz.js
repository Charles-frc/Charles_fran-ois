document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM chargé et quiz.js (version brute force & score animé) s'exécute !");

    const quizContainer = document.getElementById('quiz-container');
    const questionDisplay = document.getElementById('question-display');
    const optionsDisplay = document.getElementById('options-display');
    const feedbackDisplay = document.getElementById('feedback-display');
    const nextQuestionButton = document.getElementById('next-question-btn');
    const bruteForceButton = document.getElementById('brute-force-btn');
    const currentQuestionNumberDisplay = document.getElementById('current-question-number');
    const totalQuestionsNumberDisplay = document.getElementById('total-questions-number');

    const resultContainer = document.getElementById('result-container');
    const scoreDisplay = document.getElementById('score');
    const totalQuestionsResultDisplay = document.getElementById('total-questions-result');
    const overallFeedbackDisplay = document.getElementById('overall-feedback');
    const detailedFeedbackContainer = document.getElementById('detailed-feedback-container');
    const retryButton = document.getElementById('retry-quiz');

    const correctIconSVG = `<svg class="feedback-icon text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>`;
    const incorrectIconSVG = `<svg class="feedback-icon text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`;

    const questions = [
        { name: 'q1', text: '1. En quelle année le Paris Saint-Germain a-t-il été fondé ?', options: [{ value: '1968', text: '1968' },{ value: '1970', text: '1970' },{ value: '1972', text: '1972' }], answer: '1970' },
        { name: 'q2', text: "2. Quel joueur est le meilleur buteur de l'histoire du PSG (record établi avant mai 2025) ?", options: [{ value: 'cavani', text: 'Edinson Cavani' },{ value: 'mbappe', text: 'Kylian Mbappé' },{ value: 'ibra', text: 'Zlatan Ibrahimović' }], answer: 'mbappe' },
        { name: 'q3', text: "3. Contre quelle équipe le PSG a-t-il remporté la Coupe des Vainqueurs de Coupe en 1996 ?", options: [{ value: 'barca', text: 'FC Barcelone' },{ value: 'arsenal', text: 'Arsenal' },{ value: 'rapid', text: 'Rapid Vienne' }], answer: 'rapid' },
        { name: 'q4', text: "4. Quel est le nom du nouveau centre d'entraînement du PSG ?", options: [{ value: 'loges', text: 'Camp des Loges' },{ value: 'parc_training', text: 'Le Parc Training Center' },{ value: 'campus', text: 'Campus PSG' }], answer: 'campus' },
        { name: 'q5', text: "5. Combien de titres de Champion de France (Ligue 1) le PSG avait-il remporté à la fin de la saison 2023-2024 ?", options: [{ value: '10', text: '10' },{ value: '11', text: '11' },{ value: '12', text: '12' }], answer: '12' },
        { name: 'q6', text: "6. Quel entraîneur a mené le PSG à sa première finale de Ligue des Champions en 2020 ?", options: [{ value: 'ancelotti', text: 'Carlo Ancelotti' },{ value: 'blanc', text: 'Laurent Blanc' },{ value: 'tuchel', text: 'Thomas Tuchel' }], answer: 'tuchel' },
        { name: 'q7', text: "7. Quel joueur brésilien, portant le numéro 10, a enchanté le Parc des Princes au début des années 2000 avant de rejoindre le FC Barcelone ?", options: [{ value: 'kaka', text: 'Kaká' },{ value: 'ronaldinho', text: 'Ronaldinho' },{ value: 'robinho', text: 'Robinho' }], answer: 'ronaldinho' },
        { name: 'q8', text: "8. En quelle année Qatar Sports Investments (QSI) a-t-il racheté le PSG ?", options: [{ value: '2009', text: '2009' },{ value: '2011', text: '2011' },{ value: '2013', text: '2013' }], answer: '2011' },
        { name: 'q9', text: "9. Quel joueur a détenu le record du plus grand nombre de matchs joués pour le PSG pendant plus de 40 ans ?", options: [{ value: 'susic', text: 'Safet Sušić' },{ value: 'baratelli', text: 'Dominique Baratelli' },{ value: 'pilorget', text: 'Jean-Marc Pilorget' }], answer: 'pilorget' },
        { name: 'q10', text: "10. Quel est le principal rival du PSG en France, un match souvent appelé \"Le Classique\" ?", options: [{ value: 'marseille', text: 'Olympique de Marseille' },{ value: 'lyon', text: 'Olympique Lyonnais' },{ value: 'monaco', text: 'AS Monaco' }], answer: 'marseille' }
    ];

    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];
    let bruteForceActive = false;

    function displayCurrentQuestion() {
        if (!questionDisplay || !optionsDisplay || !feedbackDisplay || !currentQuestionNumberDisplay || !totalQuestionsNumberDisplay || !nextQuestionButton) {
            console.error("Un ou plusieurs éléments d'affichage du quiz sont manquants.");
            return;
        }

        feedbackDisplay.innerHTML = '';
        feedbackDisplay.className = 'p-4 rounded-md my-4 text-sm transition-opacity duration-300 opacity-0'; // Opacité 0 pour fondu
        nextQuestionButton.textContent = 'Valider ma réponse';
        nextQuestionButton.disabled = false;
        if (bruteForceButton) bruteForceButton.disabled = false;


        if (currentQuestionIndex < questions.length) {
            const q = questions[currentQuestionIndex];
            questionDisplay.textContent = q.text;
            optionsDisplay.innerHTML = ''; 

            const optionsForm = document.getElementById('quiz-options-form');
            if(optionsForm) optionsForm.reset(); 

            q.options.forEach(opt => {
                const label = document.createElement('label');
                label.className = 'quiz-option block';
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `q${currentQuestionIndex}`;
                radio.value = opt.value;
                radio.className = 'radio radio-primary mr-2';
                const span = document.createElement('span');
                span.textContent = opt.text;
                label.appendChild(radio);
                label.appendChild(span);
                optionsDisplay.appendChild(label);
            });

            currentQuestionNumberDisplay.textContent = currentQuestionIndex + 1;
            totalQuestionsNumberDisplay.textContent = questions.length;
            optionsDisplay.querySelectorAll('input[type="radio"]').forEach(radio => radio.disabled = false);


            if (bruteForceActive) {
                const correctAnswerRadio = optionsDisplay.querySelector(`input[value="${q.answer}"]`);
                if (correctAnswerRadio) {
                    correctAnswerRadio.checked = true;
                }
                setTimeout(() => {
                    handleNextQuestion(true); 
                }, 300); 
            }
        } else {
            showFinalResults();
        }
    }

    function handleNextQuestion(isBruteForceCall = false) {
        if (!feedbackDisplay || !optionsDisplay || !nextQuestionButton) return;

        const selectedOptionInput = optionsDisplay.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);

        if (!isBruteForceCall && !selectedOptionInput && nextQuestionButton.textContent === 'Valider ma réponse') {
            feedbackDisplay.textContent = "Veuillez sélectionner une réponse.";
            feedbackDisplay.className = 'p-4 rounded-md my-4 text-sm bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 opacity-100';
            return;
        }
        
        feedbackDisplay.classList.remove('opacity-0'); // Rendre visible pour l'animation

        if (nextQuestionButton.textContent === 'Valider ma réponse' || isBruteForceCall) {
            const q = questions[currentQuestionIndex];
            const userAnswerValue = selectedOptionInput ? selectedOptionInput.value : (isBruteForceCall ? q.answer : null);
            const isCorrect = userAnswerValue === q.answer;
            
            const userAnswerText = selectedOptionInput ? q.options.find(o => o.value === userAnswerValue)?.text : (isBruteForceCall ? q.options.find(o => o.value === q.answer)?.text : "Non répondu");

            if (isCorrect) {
                if (!bruteForceActive) score++;
                feedbackDisplay.innerHTML = `${correctIconSVG} Bravo ! C'est la bonne réponse.`;
                feedbackDisplay.className = 'p-4 rounded-md my-4 text-sm feedback-item correct opacity-100';
            } else {
                const correctAnswerObject = q.options.find(opt => opt.value === q.answer);
                feedbackDisplay.innerHTML = `${incorrectIconSVG} Dommage. La bonne réponse était : <strong>${correctAnswerObject.text}</strong>.`;
                feedbackDisplay.className = 'p-4 rounded-md my-4 text-sm feedback-item incorrect opacity-100';
            }
            
            userAnswers.push({
                question: q.text,
                userAnswer: userAnswerText,
                correctAnswer: q.options.find(o => o.value === q.answer)?.text,
                isCorrect: isCorrect && !bruteForceActive 
            });

            optionsDisplay.querySelectorAll('input[type="radio"]').forEach(radio => radio.disabled = true);
            
            if (!isBruteForceCall) {
                nextQuestionButton.textContent = 'Question Suivante';
                if (currentQuestionIndex === questions.length - 1) {
                    nextQuestionButton.textContent = 'Voir mon Score Final';
                }
                 if(bruteForceButton) bruteForceButton.disabled = true;
            } else {
                currentQuestionIndex++;
                if (currentQuestionIndex >= questions.length) {
                    score = questions.length; 
                    showFinalResults(); 
                } else {
                    // Délai pour que l'utilisateur voie la correction avant de passer
                    setTimeout(() => {
                        displayCurrentQuestion(); 
                    }, bruteForceActive ? 800 : 0); // Plus long délai en mode brute force
                }
                return; 
            }

        } else { 
            currentQuestionIndex++;
            displayCurrentQuestion();
        }
    }

    function activateBruteForce() {
        if (!confirm("Êtes-vous sûr de vouloir activer le mode 'Brute Force' ? Cela répondra correctement à toutes les questions et vous redirigera.")) {
            return;
        }
        console.log("Mode Brute Force activé !");
        bruteForceActive = true;
        if(nextQuestionButton) nextQuestionButton.disabled = true; 
        if(bruteForceButton) bruteForceButton.disabled = true;
        
        currentQuestionIndex = 0; 
        score = 0; 
        userAnswers = []; 
        feedbackDisplay.innerHTML = '<p class="text-blue-600 font-semibold">Activation du Brute Force... Les réponses seront corrigées automatiquement.</p>';
        feedbackDisplay.className = 'p-4 rounded-md my-4 text-sm bg-blue-50 border-l-4 border-blue-500 opacity-100';
        displayCurrentQuestion(); 
    }
    
    function animateScore(finalScore) {
        if (!scoreDisplay || bruteForceActive) {
            if(scoreDisplay) scoreDisplay.textContent = finalScore;
            if(scoreDisplay && finalScore === questions.length && !bruteForceActive) scoreDisplay.classList.add('score-perfect');
            else if(scoreDisplay && finalScore >= Math.ceil(questions.length * 0.7)) scoreDisplay.classList.add('score-good');
            else if(scoreDisplay && finalScore >= Math.ceil(questions.length * 0.4)) scoreDisplay.classList.add('score-average');
            return;
        }

        let currentAnimatedScore = 0;
        const duration = 1500; 
        const totalSteps = finalScore > 0 ? finalScore : 1; // Éviter la division par zéro
        const stepTime = Math.max(10, Math.floor(duration / totalSteps));

        scoreDisplay.textContent = currentAnimatedScore;
        scoreDisplay.classList.remove('score-perfect', 'score-good', 'score-average'); // Nettoyer les classes précédentes


        if (finalScore === 0) { // Gérer le cas où le score est 0
             scoreDisplay.textContent = 0;
             return;
        }

        const timer = setInterval(() => {
            currentAnimatedScore++;
            scoreDisplay.textContent = currentAnimatedScore;
            if (currentAnimatedScore >= finalScore) {
                clearInterval(timer);
                scoreDisplay.textContent = finalScore; 
                // Appliquer la classe de style basée sur le score final
                if(finalScore === questions.length) scoreDisplay.classList.add('score-perfect');
                else if(finalScore >= Math.ceil(questions.length * 0.7)) scoreDisplay.classList.add('score-good');
                else if(finalScore >= Math.ceil(questions.length * 0.4)) scoreDisplay.classList.add('score-average');
            }
        }, stepTime);
    }

    function showFinalResults() {
        if (!quizContainer || !resultContainer || !scoreDisplay || !totalQuestionsResultDisplay || !overallFeedbackDisplay || !detailedFeedbackContainer) return;

        quizContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');

        animateScore(score); 
        totalQuestionsResultDisplay.textContent = questions.length;
        detailedFeedbackContainer.innerHTML = ''; 

        userAnswers.forEach(ans => {
            const item = document.createElement('div');
            const displayCorrect = bruteForceActive ? true : ans.isCorrect;
            item.className = `feedback-item ${displayCorrect ? 'correct' : 'incorrect'} mb-3`;
            item.innerHTML = `
                <p class="font-semibold">${ans.question}</p>
                <p>Votre réponse : ${ans.userAnswer}</p>
                ${!displayCorrect ? `<p>Bonne réponse : ${ans.correctAnswer}</p>` : ''}
            `;
            detailedFeedbackContainer.appendChild(item);
        });

        overallFeedbackDisplay.className = 'text-xl font-semibold text-center my-4 transition-all duration-500 ease-out';
        overallFeedbackDisplay.style.opacity = '0';
        overallFeedbackDisplay.style.transform = 'translateY(20px)';

        setTimeout(() => {
            overallFeedbackDisplay.style.opacity = '1';
            overallFeedbackDisplay.style.transform = 'translateY(0px)';
            overallFeedbackDisplay.classList.remove('animate-pulse-feedback', 'animate-shake-encouraging', 'text-[var(--psg-gold)]', 'text-green-600', 'text-yellow-600', 'text-red-600'); // Nettoyer anciennes classes

            if (score === questions.length) { 
                overallFeedbackDisplay.textContent = bruteForceActive ? 
                    "Mode Brute Force : Toutes les réponses correctes ! Redirection..." : 
                    "SCORE PARFAIT ! Vous êtes un expert du PSG ! Redirection...";
                overallFeedbackDisplay.classList.add('text-[var(--psg-gold)]', 'font-bold', 'animate-pulse-feedback');
                if (!bruteForceActive) triggerConfetti(); 
                
                console.log("Redirection vers contact.html dans 3.5 secondes...");
                setTimeout(() => { window.location.href = 'contact.html'; }, 3500);
            } else if (score >= Math.ceil(questions.length * 0.7)) {
                overallFeedbackDisplay.textContent = `Excellent score ! ${score}/${questions.length}. Presque parfait !`;
                overallFeedbackDisplay.classList.add('text-green-600', 'animate-pulse-feedback');
            } else if (score >= Math.ceil(questions.length * 0.4)) {
                overallFeedbackDisplay.textContent = `Pas mal ! ${score}/${questions.length}. Continuez comme ça !`;
                overallFeedbackDisplay.classList.add('text-yellow-600', 'animate-shake-encouraging');
            } else {
                overallFeedbackDisplay.textContent = `Oups ! ${score}/${questions.length}. Il y a encore de la marge pour progresser.`;
                overallFeedbackDisplay.classList.add('text-red-600', 'animate-shake-encouraging');
            }
        }, 100); 

        bruteForceActive = false; 
    }
    
    function triggerConfetti() {
        const overallFeedbackContainerElement = document.getElementById('overall-feedback-container');
        if (!overallFeedbackContainerElement) return;
        for (let i = 0; i < 80; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti-piece');
            confetti.style.left = Math.random() * 100 + 'vw'; 
            confetti.style.animationDelay = Math.random() * 0.5 + 's'; 
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
            const size = Math.random() * 6 + 4; 
            confetti.style.width = size + 'px';
            confetti.style.height = size * (Math.random() * 0.5 + 0.75) + 'px'; 
            if (Math.random() > 0.7) confetti.style.borderRadius = '50%'; 
            const swayAmount = (Math.random() - 0.5) * 200; 
            confetti.style.setProperty('--sway-amount', swayAmount + 'px');
            confetti.style.animationName = 'confetti-fall-and-sway';
            confetti.style.animationDuration = Math.random() * 2 + 2.5 + 's'; 
            overallFeedbackContainerElement.appendChild(confetti);
            confetti.addEventListener('animationend', () => { confetti.remove(); });
        }
    }

    if (nextQuestionButton) {
        nextQuestionButton.addEventListener('click', () => handleNextQuestion(false));
    }
    if (bruteForceButton) {
        bruteForceButton.addEventListener('click', activateBruteForce);
    }

    if (retryButton) {
        retryButton.addEventListener('click', () => {
            currentQuestionIndex = 0;
            score = 0;
            userAnswers = [];
            bruteForceActive = false; // Assurez-vous que ce mode est réinitialisé
            if(resultContainer) resultContainer.classList.add('hidden');
            if(quizContainer) quizContainer.classList.remove('hidden');
            if(detailedFeedbackContainer) detailedFeedbackContainer.innerHTML = '';
            if(overallFeedbackDisplay) {
                 overallFeedbackDisplay.textContent = '';
                 overallFeedbackDisplay.className = 'text-xl font-semibold text-center my-4 transition-all duration-500 ease-out'; // Réinitialiser
                 overallFeedbackDisplay.style.opacity = '0';
                 overallFeedbackDisplay.style.transform = 'translateY(20px)';

            }
            if(scoreDisplay) scoreDisplay.classList.remove('score-perfect', 'score-good', 'score-average'); // Nettoyer classes de score
            if(nextQuestionButton) nextQuestionButton.disabled = false;
            if(bruteForceButton) bruteForceButton.disabled = false;
            displayCurrentQuestion();
        });
    }

    if (quizContainer) {
        quizContainer.classList.remove('hidden');
        displayCurrentQuestion();
    } else { console.error("Le conteneur principal du quiz #quiz-container est manquant."); }
    if(resultContainer) resultContainer.classList.add('hidden');
});