
const storeModule = (function() {
    let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    
    function saveToLocalStorage() {
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }

    
    function getContacts() {
        return [...contacts];
    }


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

    // supprimer un contact
    function deleteContact(id) {
        const initialLength = contacts.length;
        contacts = contacts.filter(contact => contact.id !== id);
        saveToLocalStorage();
        return contacts.length !== initialLength;
    }

    
    function clearContacts() {
        contacts = [];
        saveToLocalStorage();
        return 0;
    }


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