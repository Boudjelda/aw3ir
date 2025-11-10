// Module de stockage des contacts
const storeModule = (function() {
    let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    
    //  save dans le localStorage
    function saveToLocalStorage() {
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }

    
    function getContacts() {
        return [...contacts];
    }

    // ajouter un contact
    function addContact(contact) {
        // Générer un ID unique
        const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
        
        const newContact = {
            id: newId,
            nom: contact.nom,
            prenom: contact.prenom,
            dateNaissance: contact.dateNaissance,
            adresse: contact.adresse,
            mail: contact.mail
        };
        
        contacts.push(newContact);
        saveToLocalStorage();
        return contacts.length;
    }

    // Fonction pour supprimer un contact
    function deleteContact(id) {
        const initialLength = contacts.length;
        contacts = contacts.filter(contact => contact.id !== id);
        saveToLocalStorage();
        return contacts.length !== initialLength;
    }

    // Fonction pour vider tous les contacts
    function clearContacts() {
        contacts = [];
        saveToLocalStorage();
        return 0;
    }

    // Fonction pour obtenir un contact par son ID
    function getContactById(id) {
        return contacts.find(contact => contact.id === id);
    }

    return {
        getContacts,
        addContact,
        deleteContact,
        clearContacts,
        getContactById
    };
})();