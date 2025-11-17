
var app;
window.onload = function () {
  app = new Vue({
    el: '#weatherApp',
    data: {
      loaded: false,
      formCityName: '',
      message: 'WebApp Loaded.',
      messageForm: '',
      cityList: [{ name: 'Paris' }], 
      cityWeather: null,
      cityWeatherLoading: false,
    },

    mounted: function () {
      this.loaded = true;
    },

    
    methods: {
      // ajouter une ville
      addCity: function (event) {
        event.preventDefault(); // empêche le reload

        // trim pour éviter les espaces
        var cityName = this.formCityName.trim();
        if (cityName === '') return; // sécurité

        if (this.isCityExist(cityName)) {
          this.messageForm = 'Existe déjà';
          return;
        }

        // ajout à la liste
        this.cityList.push({ name: cityName });

        // reset champ et message
        this.formCityName = '';
        this.messageForm = '';
      },

      // tester si la ville existe déjà 
      isCityExist: function (_cityName) {
        return this.cityList.filter(function (item) {
          return item.name.toUpperCase() === _cityName.toUpperCase();
        }).length > 0;
      },

      // supprimer une ville
      remove: function (_city) {
        this.cityList = this.cityList.filter(function (item) {
          return item.name !== _city.name;
        });

        // si la météo affichée correspondait à la ville supprimée, on efface
        if (this.cityWeather && this.cityWeather.name === _city.name) {
          this.cityWeather = null;
        }
      },

      // récupérer la météo pour une ville
      meteo: function (_city) {
        var self = this;
        self.cityWeatherLoading = true;
        self.message = null;

        var API_KEY = '5bafe1903b39a620eab1fa72180651a9';

        var url = 'https://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(_city.name) + '&units=metric&lang=fr&appid=' + API_KEY;

        fetch(url)
          .then(function (response) { return response.json(); })
          .then(function (json) {
            self.cityWeatherLoading = false;

            if (json.cod == 200) {
              self.cityWeather = json;
              self.message = null;
            } else {
              self.cityWeather = null;
              self.message = 'Météo introuvable pour ' + _city.name + ' (' + (json.message || 'erreur') + ')';
            }
          })
          .catch(function (err) {
            self.cityWeatherLoading = false;
            self.cityWeather = null;
            self.message = 'Erreur réseau : ' + err.message;
          });
      }
    },

    // ormater les dates
    computed: {
      cityWheaterDate: function () {
        if (this.cityWeather !== null) {
          var date = new Date(this.cityWeather.dt * 1000);
          var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
          return date.getHours() + ':' + minutes;
        } else return '';
      },

      cityWheaterSunrise: function () {
        if (this.cityWeather !== null) {
          var date = new Date(this.cityWeather.sys.sunrise * 1000);
          var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
          return date.getHours() + ':' + minutes;
        } else return '';
      },

      cityWheaterSunset: function () {
        if (this.cityWeather !== null) {
          var date = new Date(this.cityWeather.sys.sunset * 1000);
          var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
          return date.getHours() + ':' + minutes;
        } else return '';
      },

      // calcul d'une bounding box
      openStreetMapArea: function () {
        if (this.cityWeather !== null) {
          const zoom = 8;
          const delta = 0.05 / Math.pow(2, zoom - 10);

          const bboxEdges = {
            south: this.cityWeather.coord.lat - delta,
            north: this.cityWeather.coord.lat + delta,
            west: this.cityWeather.coord.lon - delta,
            east: this.cityWeather.coord.lon + delta,
          };

          return bboxEdges.west + '%2C' + bboxEdges.south + '%2C' + bboxEdges.east + '%2C' + bboxEdges.north;
        } else return '';
      }
    }
  });
};