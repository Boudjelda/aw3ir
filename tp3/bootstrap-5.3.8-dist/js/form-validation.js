window.onload = function () {
    console.log("DOM ready!");

    const form = document.getElementById('userForm');
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    // Fonction de validation email
    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Fonction pour afficher/masquer les messages d'erreur
    function showError(field, show) {
        const errorElement = document.getElementById(field.id + '-error');
        if (errorElement) {
            if (show) {
                field.classList.add('is-invalid');
                field.classList.remove('is-valid');
            } else {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
                errorElement.style.display = 'none';
            }
        }
    }

    // Validation d'un champ
    function validateField(field) {
        const value = field.value.trim();
        
        // Réinitialiser l'état
        field.classList.remove('is-invalid', 'is-valid');
        const errorElement = document.getElementById(field.id + '-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }

        if (field.hasAttribute('required') && value === '') {
            showError(field, true);
            return false;
        }

        let isValid = true;
        let errorMessage = '';

        if (field.id === 'lastname' || field.id === 'firstname' || field.id === 'address') {
            if (value.length < 5) {
                isValid = false;
                errorMessage = `Le ${field.id === 'lastname' ? 'nom' : field.id === 'firstname' ? 'prénom' : 'adresse'} doit contenir au moins 5 caractères.`;
            }
        } else if (field.id === 'email') {
            if (!validateEmail(value)) {
                isValid = false;
                errorMessage = 'Veuillez saisir une adresse email valide.';
            }
        } else if (field.id === 'birthday') {
            if (value) {
                const birthdayDate = new Date(value);
                const nowTimestamp = Date.now();
                const birthdayTimestamp = birthdayDate.getTime();
                if (birthdayTimestamp > nowTimestamp) {
                    isValid = false;
                    errorMessage = 'La date de naissance ne peut pas être dans le futur.';
                }
            }
        }

        if (!isValid) {
            showError(field, true);
            if (errorElement && errorMessage) {
                errorElement.textContent = errorMessage;
            }
            return false;
        } else {
            field.classList.add('is-valid');
            return true;
        }
    }

    // Validation du formulaire
    function validateForm() {
        let isFormValid = true;
        const fields = form.querySelectorAll('input[required]');
        fields.forEach(field => {
            if (!validateField(field)) {
                isFormValid = false;
            }
        });
        return isFormValid;
    }

    // Fonction pour vider tous les champs
    function clearForm() {
        const fields = form.querySelectorAll('input');
        fields.forEach(field => {
            field.value = '';
            field.classList.remove('is-valid', 'is-invalid');
            const errorElement = document.getElementById(field.id + '-error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
    }

    // Fonction pour sauvegarder les données
    function saveFormData() {
        const formData = {
            lastname: document.getElementById('lastname').value,
            firstname: document.getElementById('firstname').value,
            birthday: document.getElementById('birthday').value,
            address: document.getElementById('address').value,
            email: document.getElementById('email').value
        };
        localStorage.setItem('formData', JSON.stringify(formData));
    }

    // Fonction pour rediriger
    function redirectToAction() {
        let countdown = 3;
        const countdownElement = document.getElementById('countdown');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                saveFormData();
                window.location.href = 'action.html';
            }
        }, 1000);
    }

    // Validation en temps réel
    form.addEventListener('input', function (e) {
        validateField(e.target);
    });

    // Réinitialisation du formulaire
    form.addEventListener('reset', function () {
        setTimeout(() => {
            const fields = form.querySelectorAll('input');
            fields.forEach(field => {
                field.classList.remove('is-valid', 'is-invalid');
                const errorElement = document.getElementById(field.id + '-error');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            });
        }, 0);
    });

    // Soumission du formulaire
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("Formulaire soumis !");

        if (validateForm()) {
            successModal.show();
            redirectToAction();
        } else {
            errorModal.show();
        }
    });
};