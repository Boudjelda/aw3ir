// Module de géolocalisation
const gpsModule = (function() {
    let currentPosition = null;

    // Fonction pour obtenir la position actuelle
    function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("La géolocalisation n'est pas supportée par ce navigateur."));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                position => {
                    currentPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    resolve(currentPosition);
                },
                error => {
                    let errorMessage;
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "L'utilisateur a refusé la demande de géolocalisation.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Les informations de localisation ne sont pas disponibles.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "La demande de localisation a expiré.";
                            break;
                        default:
                            errorMessage = "Une erreur inconnue s'est produite.";
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    // Fonction pour simuler des coordonnées GPS (pour le développement)
    function simulatePosition(latitude, longitude) {
        currentPosition = {
            latitude: latitude,
            longitude: longitude
        };
        return currentPosition;
    }

    // Fonction pour obtenir la dernière position connue
    function getLastKnownPosition() {
        return currentPosition;
    }

    // Fonction pour formater les coordonnées en adresse
    function coordinatesToAddress(lat, lon) {
        return `${lat.toFixed(7)}, ${lon.toFixed(7)}`;
    }

    return {
        getCurrentPosition,
        simulatePosition,
        getLastKnownPosition,
        coordinatesToAddress
    };
})();

// Initialisation de la géolocalisation
document.addEventListener('DOMContentLoaded', function() {
    const geolocateBtn = document.getElementById('geolocateBtn');
    const addressInput = document.getElementById('address');
    
    if (geolocateBtn && addressInput) {
        geolocateBtn.addEventListener('click', function() {
            gpsModule.getCurrentPosition()
                .then(position => {
                    // Mettre à jour le champ d'adresse avec les coordonnées
                    const address = gpsModule.coordinatesToAddress(position.latitude, position.longitude);
                    addressInput.value = address;
                    
                    // Mettre à jour le compteur de caractères
                    const addressCount = document.getElementById('addressCount');
                    if (addressCount) {
                        addressCount.textContent = `${address.length} car.`;
                    }
                    
                    // Mettre à jour la carte
                    if (typeof displayModule !== 'undefined' && displayModule.updateMap) {
                        displayModule.updateMap(position.latitude, position.longitude);
                    }
                    
                    console.log("Position obtenue:", position);
                })
                .catch(error => {
                    console.error("Erreur de géolocalisation:", error.message);
                    alert("Erreur de géolocalisation: " + error.message);
                });
        });
    }
    
    // Simulation de coordonnées GPS pour le développement
    console.log("Pour simuler une position GPS, utilisez: gpsModule.simulatePosition(48.8566, 2.3522)");
});