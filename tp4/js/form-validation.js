
const validationModule = (function() {
    
    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    
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

    
    function validateField(field) {
        const value = field.value.trim();
        
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

        if (field.id === 'lastname' || field.id === 'firstname') {
            if (value.length < 5) {
                isValid = false;
                errorMessage = `Le ${field.id === 'lastname' ? 'nom' : 'prénom'} doit contenir au moins 5 caractères.`;
            }
        } else if (field.id === 'address') {
            if (value.length < 5) {
                isValid = false;
                errorMessage = 'L\'adresse doit contenir au moins 5 caractères.';
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

    
    function validateForm() {
        let isFormValid = true;
        const fields = document.querySelectorAll('#userForm input[required]');
        fields.forEach(field => {
            if (!validateField(field)) {
                isFormValid = false;
            }
        });
        return isFormValid;
    }

    
    function clearForm() {
        const fields = document.querySelectorAll('#userForm input');
        fields.forEach(field => {
            field.value = '';
            field.classList.remove('is-valid', 'is-invalid');
            const errorElement = document.getElementById(field.id + '-error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        });
        
        
        if (typeof displayModule !== 'undefined' && displayModule.initCharCounters) {
            displayModule.initCharCounters();
        }
    }

    return {
        validateField,
        validateForm,
        clearForm
    };
})();


document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM ready!");

    const form = document.getElementById('userForm');
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));


    form.addEventListener('input', function (e) {
        validationModule.validateField(e.target);
    });

    // Réinitialisation
    form.addEventListener('reset', function () {
        setTimeout(() => {
            validationModule.clearForm();
        }, 0);
    });

    
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("Formulaire soumis !");

        if (validationModule.validateForm()) {
            
            const formData = {
                nom: document.getElementById('lastname').value,
                prenom: document.getElementById('firstname').value,
                dateNaissance: document.getElementById('birthday').value,
                adresse: document.getElementById('address').value,
                mail: document.getElementById('email').value
            };
            
            // Ajouter le contact au store
            if (typeof storeModule !== 'undefined' && storeModule.addContact) {
                storeModule.addContact(formData);
                
                // Afficher le message de succès
                if (typeof displayModule !== 'undefined' && displayModule.showSuccessMessage) {
                    displayModule.showSuccessMessage();
                }
                
                // Mettre à jour le tableau des contacts
                if (typeof displayModule !== 'undefined' && displayModule.updateContactsTable) {
                    displayModule.updateContactsTable();
                }
                
                // Réinitialiser le formulaire
                validationModule.clearForm();
            } else {
                console.error("Module de stockage non disponible");
            }
        } else {
            errorModal.show();
        }
    });
});