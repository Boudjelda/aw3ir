
window.onload = () => {
  
  const paramsString = document.location.search;
  console.log('Params URL bruts :', paramsString);  

  const searchParams = new URLSearchParams(paramsString);

  
  for (const param of searchParams) {
    console.log('Param :', param);  

    const elementId = param[0];  
    const elementValue = param[1]; 
    const element = document.getElementById(elementId);

    if (element !== null) {
      
      if (elementId === 'birthday') {
        
        const dateParts = elementValue.split('-');
        const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        element.textContent = formattedDate;
      } else {
        element.textContent = elementValue;
      }
    }

 
  }

  console.log('Affichage terminé !');  
};