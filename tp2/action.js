// action.js
window.onload = () => {
  // Récupère les params de l'URL (ex. : ?name=John&...)
  const paramsString = document.location.search;
  console.log('Params URL bruts :', paramsString);  // Debug : vérifie en console

  const searchParams = new URLSearchParams(paramsString);

  // Boucle sur chaque param (ex. : ['name', 'John'])
  for (const param of searchParams) {
    console.log('Param :', param);  // Debug : ['name', 'John']

    const elementId = param[0];  // Clé (ex. : 'name')
    const elementValue = param[1];  // Valeur (ex. : 'John')
    const element = document.getElementById(elementId);

    if (element !== null) {
      // Affiche la valeur dans le span (textContent pour texte sûr)
      if (elementId === 'birthday') {
        // Format date : YYYY-MM-DD → DD/MM/YYYY
        const dateParts = elementValue.split('-');
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        element.textContent = formattedDate;
      } else {
        element.textContent = elementValue;
      }
    }

    // Liens spéciaux
    if (param[0] === 'address') {
      element.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(elementValue)}`;
    } else if (param[0] === 'email') {
      element.href = `mailto:${elementValue}?subject=Hello!&body=What's up?`;
      element.textContent = elementValue;  // Assure que le texte est l'email
    }
  }

  console.log('Affichage terminé !');  // Debug final
};