// Module d'affichage
const displayModule = (function() {
    // Fonction pour mettre à jour le tableau des contacts
    function updateContactsTable() {
        const contacts = storeModule.getContacts();
        const tableBody = document.getElementById('contactsTableBody');
        const contactsCount = document.getElementById('contactsCount');
        
        if (contactsCount) {
            contactsCount.textContent = contacts.length;
        }
        
        if (tableBody) {
            tableBody.innerHTML = '';
            
            if (contacts.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `<td colspan="5" class="text-center py-4 text-muted">Aucun contact à afficher</td>`;
                tableBody.appendChild(emptyRow);
                return;
            }
            
            contacts.forEach(contact => {
                const row = document.createElement('tr');
                
                // Formater la date de naissance
                const birthDate = new Date(contact.dateNaissance);
                const formattedDate = birthDate.toLocaleDateString('fr-FR');
                
                row.innerHTML = `
                    <td>${contact.nom}</td>
                    <td>${contact.prenom}</td>
                    <td>${formattedDate}</td>
                    <td>${contact.adresse}</td>
                    <td>${contact.mail}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
    
    // Fonction pour afficher un message de succès
    function showSuccessMessage(message = "Contact ajouté avec succès !") {
        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
            
            // Masquer le message après 3 secondes
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        }
    }
    
    // Fonction pour mettre à jour la carte
    function updateMap(latitude, longitude) {
        const mapFrame = document.getElementById('mapFrame');
        if (mapFrame) {
            // Calculer la zone visible autour du marqueur
            const offset = 0.01;
            const bbox = `${longitude-offset},${latitude-offset},${longitude+offset},${latitude+offset}`;
            
            // Mettre à jour l'URL de l'iframe
            mapFrame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
        }
    }
    
    // Fonction pour mettre à jour les compteurs de caractères
    function updateCharCount(inputElement, countElement) {
        if (inputElement && countElement) {
            const count = inputElement.value.length;
            const maxLength = inputElement.getAttribute('maxlength') || 0;
            
            if (maxLength > 0) {
                countElement.textContent = `${count}/${maxLength} car.`;
                
                // Changer la couleur si on approche de la limite
                if (count > maxLength * 0.8) {
                    countElement.style.color = '#dc3545';
                } else {
                    countElement.style.color = '#6c757d';
                }
            } else {
                countElement.textContent = `${count} car.`;
            }
        }
    }
    
    // Initialisation des écouteurs d'événements pour les compteurs de caractères
    function initCharCounters() {
        const fields = [
            { input: 'lastname', count: 'lastnameCount' },
            { input: 'firstname', count: 'firstnameCount' },
            { input: 'address', count: 'addressCount' }
        ];
        
        fields.forEach(field => {
            const inputElement = document.getElementById(field.input);
            const countElement = document.getElementById(field.count);
            
            if (inputElement && countElement) {
                // Mettre à jour au chargement
                updateCharCount(inputElement, countElement);
                
                // Mettre à jour à chaque saisie
                inputElement.addEventListener('input', () => {
                    updateCharCount(inputElement, countElement);
                });
            }
        });
    }
    
    return {
        updateContactsTable,
        showSuccessMessage,
        updateMap,
        updateCharCount,
        initCharCounters
    };
})();

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les compteurs de caractères
    if (typeof displayModule !== 'undefined' && displayModule.initCharCounters) {
        displayModule.initCharCounters();
    }
    
    // Mettre à jour le tableau des contacts
    if (typeof displayModule !== 'undefined' && displayModule.updateContactsTable) {
        displayModule.updateContactsTable();
    }
    
    console.log("Module d'affichage initialisé");
});