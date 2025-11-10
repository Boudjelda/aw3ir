// Module de géolocalisation AVEC GÉOCODAGE
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

    // NOUVELLE FONCTION : Géocodage d'une adresse texte
    function geocodeAddress(address) {
        return new Promise((resolve, reject) => {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
            
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const result = {
                            latitude: parseFloat(data[0].lat),
                            longitude: parseFloat(data[0].lon),
                            address: data[0].display_name
                        };
                        resolve(result);
                    } else {
                        reject(new Error("Adresse introuvable"));
                    }
                })
                .catch(error => reject(new Error("Erreur de géocodage: " + error.message)));
        });
    }

    // NOUVELLE FONCTION : Détecter si c'est des coordonnées GPS
    function isGPSCoordinates(input) {
        const gpsPattern = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
        return gpsPattern.test(input.trim());
    }

    // NOUVELLE FONCTION : Parser les coordonnées
    function parseCoordinates(input) {
        const cleanInput = input.replace(/\s/g, '');
        const parts = cleanInput.split(',');
        
        if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            
            if (!isNaN(lat) && !isNaN(lng)) {
                return { latitude: lat, longitude: lng };
            }
        }
        return null;
    }

    // Fonction pour simuler des coordonnées GPS
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

    // NOUVELLE FONCTION : Traitement intelligent de l'adresse
    function processAddress(input) {
        return new Promise((resolve, reject) => {
            const trimmedInput = input.trim();
            
            // 1. Si c'est des coordonnées GPS
            if (isGPSCoordinates(trimmedInput)) {
                const coords = parseCoordinates(trimmedInput);
                if (coords) {
                    resolve({
                        type: 'coordinates',
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                        display: coordinatesToAddress(coords.latitude, coords.longitude)
                    });
                    return;
                }
            }
            
            // 2. Si c'est une adresse texte (géocodage)
            if (trimmedInput.length > 0) {
                geocodeAddress(trimmedInput)
                    .then(result => {
                        resolve({
                            type: 'geocoded',
                            latitude: result.latitude,
                            longitude: result.longitude,
                            display: coordinatesToAddress(result.latitude, result.longitude),
                            originalAddress: result.address
                        });
                    })
                    .catch(error => reject(error));
                return;
            }
            
            // 3. Si champ vide, erreur
            reject(new Error("Veuillez saisir une adresse ou des coordonnées GPS"));
        });
    }

    return {
        getCurrentPosition,
        geocodeAddress,      // NOUVEAU
        isGPSCoordinates,    // NOUVEAU
        parseCoordinates,    // NOUVEAU
        processAddress,      // NOUVEAU
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
            const currentAddress = addressInput.value.trim();
            
            // STRATÉGIE INTELLIGENTE :
            if (currentAddress === '') {
                // 1. Si champ vide → géolocalisation navigateur
                gpsModule.getCurrentPosition()
                    .then(position => {
                        const address = gpsModule.coordinatesToAddress(position.latitude, position.longitude);
                        addressInput.value = address;
                        
                        updateAddressCount();
                        updateMap(position.latitude, position.longitude);
                        
                        console.log("📍 Position GPS obtenue:", position);
                        showNotification("Position actuelle détectée!");
                    })
                    .catch(error => {
                        console.error("Erreur de géolocalisation:", error.message);
                        alert("Erreur de géolocalisation: " + error.message);
                    });
            } else {
                // 2. Si texte saisi → traitement intelligent
                gpsModule.processAddress(currentAddress)
                    .then(result => {
                        // Mettre à jour le champ avec les coordonnées formatées
                        addressInput.value = result.display;
                        
                        updateAddressCount();
                        updateMap(result.latitude, result.longitude);
                        
                        if (result.type === 'geocoded') {
                            console.log("🗺️ Adresse géocodée:", result);
                            showNotification(`Adresse trouvée: ${result.originalAddress.split(',')[0]}`);
                        } else {
                            console.log("📍 Coordonnées utilisées:", result);
                            showNotification("Coordonnées GPS utilisées!");
                        }
                    })
                    .catch(error => {
                        console.error("Erreur de traitement:", error.message);
                        alert("Erreur: " + error.message);
                    });
            }
        });
    }
    
    // NOUVEAU : Détection automatique quand on quitte le champ
    if (addressInput) {
        addressInput.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value && gpsModule.isGPSCoordinates(value)) {
                // Afficher un indicateur visuel
                showCoordinatesIndicator();
            }
        });
    }
    
    console.log("✅ Module GPS avec géocodage initialisé");
});

// FONCTIONS UTILITAIRES
function updateAddressCount() {
    const addressInput = document.getElementById('address');
    const addressCount = document.getElementById('addressCount');
    if (addressCount && addressInput) {
        addressCount.textContent = `${addressInput.value.length} car.`;
    }
}

function updateMap(latitude, longitude) {
    if (typeof displayModule !== 'undefined' && displayModule.updateMap) {
        displayModule.updateMap(latitude, longitude);
    }
}

function showNotification(message) {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showCoordinatesIndicator() {
    let indicator = document.getElementById('coordsIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'coordsIndicator';
        indicator.className = 'form-text text-info';
        indicator.innerHTML = '<i class="fas fa-map-marker-alt me-1"></i>Coordonnées GPS détectées';
        
        const addressGroup = document.getElementById('address').closest('.mb-4');
        if (addressGroup) {
            addressGroup.appendChild(indicator);
        }
    }
}