
const gpsModule = (function() {
    let currentPosition = null;


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


    function isGPSCoordinates(input) {
        const gpsPattern = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
        return gpsPattern.test(input.trim());
    }


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


    function simulatePosition(latitude, longitude) {
        currentPosition = {
            latitude: latitude,
            longitude: longitude
        };
        return currentPosition;
    }

    function getLastKnownPosition() {
        return currentPosition;
    }


    function coordinatesToAddress(lat, lon) {
        return `${lat.toFixed(7)}, ${lon.toFixed(7)}`;
    }


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
            
            // géocodage
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
            
            
            reject(new Error("Veuillez saisir une adresse ou des coordonnées GPS"));
        });
    }

    return {
        getCurrentPosition,
        geocodeAddress,      
        isGPSCoordinates,    
        parseCoordinates,    
        processAddress,      
        simulatePosition,
        getLastKnownPosition,
        coordinatesToAddress
    };
})();


document.addEventListener('DOMContentLoaded', function() {
    const geolocateBtn = document.getElementById('geolocateBtn');
    const addressInput = document.getElementById('address');
    
    if (geolocateBtn && addressInput) {
        geolocateBtn.addEventListener('click', function() {
            const currentAddress = addressInput.value.trim();
            
        
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
        
                gpsModule.processAddress(currentAddress)
                    .then(result => {
                        
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
    

    if (addressInput) {
        addressInput.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value && gpsModule.isGPSCoordinates(value)) {
                
                showCoordinatesIndicator();
            }
        });
    }
    
    console.log("✅ Module GPS avec géocodage initialisé");
});


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