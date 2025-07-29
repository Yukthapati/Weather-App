// Weather API and UI management for WeatherPro
class WeatherApp {
    constructor() {
        this.API_KEY = 'demo'; // Replace with actual API key
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
        this.storage = new StorageManager();
        this.animations = new AnimationManager();
        this.currentUnit = 'celsius';
        this.currentTheme = 'light';
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadSettings();
        this.setupEventListeners();
        this.loadFavorites();
        this.showDemoData();
    }

    loadSettings() {
        const settings = this.storage.getSettings();
        this.currentUnit = settings.unit;
        this.currentTheme = settings.theme;
        
        // Apply theme
        document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');
        
        // Update unit display
        const unitDisplay = document.querySelector('.unit-display');
        if (unitDisplay) {
            unitDisplay.textContent = this.currentUnit === 'celsius' ? '°C' : '°F';
        }
    }

    setupEventListeners() {
        // Search form
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const cityInput = document.getElementById('cityInput');
                if (cityInput && cityInput.value.trim()) {
                    this.searchWeather(cityInput.value.trim());
                }
            });
        }

        // Location button
        const unitToggle = document.getElementById('unitToggle');
        if (unitToggle) {
            unitToggle.addEventListener('click', () => this.toggleUnit());
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Favorite button
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        }

        // Retry button
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryLastSearch());
        }
    }

    showDemoData() {
        // Show demo weather data for Mumbai
        const demoData = {
            name: 'Mumbai',
            country: 'IN',
            temp: 28,
            condition: 'Partly Cloudy',
            feelsLike: 32,
            humidity: 78,
            windSpeed: 12,
            pressure: 1013,
            visibility: 8,
            uvIndex: 6
        };

        this.displayWeatherData(demoData);
        this.showHourlyForecast();
    }

    displayWeatherData(data) {
        // Update city name
        const cityName = document.getElementById('cityName');
        if (cityName) {
            cityName.textContent = `${data.name}, ${data.country}`;
        }

        // Update date/time
        const dateTime = document.getElementById('dateTime');
        if (dateTime) {
            dateTime.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Update temperature
        const currentTemp = document.getElementById('currentTemp');
        if (currentTemp) {
            const temp = this.currentUnit === 'celsius' ? data.temp : (data.temp * 9/5) + 32;
            currentTemp.textContent = `${Math.round(temp)}°`;
        }

        // Update condition
        const weatherCondition = document.getElementById('weatherCondition');
        if (weatherCondition) {
            weatherCondition.textContent = data.condition;
        }

        // Update feels like
        const feelsLike = document.getElementById('feelsLike');
        if (feelsLike) {
            const temp = this.currentUnit === 'celsius' ? data.feelsLike : (data.feelsLike * 9/5) + 32;
            feelsLike.textContent = `${Math.round(temp)}°`;
        }

        // Update weather details
        this.updateWeatherDetails(data);

        // Show weather content
        this.showWeatherContent();
    }

    updateWeatherDetails(data) {
        const details = {
            humidity: `${data.humidity}%`,
            windSpeed: `${data.windSpeed} km/h`,
            pressure: `${data.pressure} hPa`,
            visibility: `${data.visibility} km`,
            uvIndex: data.uvIndex
        };

        Object.entries(details).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = value;
            }
        });

        // Update UV index color
        const uvElement = document.getElementById('uvIndex');
        if (uvElement) {
            uvElement.className = 'detail-value uv-index';
            if (data.uvIndex <= 2) uvElement.classList.add('uv-low');
            else if (data.uvIndex <= 5) uvElement.classList.add('uv-moderate');
            else if (data.uvIndex <= 7) uvElement.classList.add('uv-high');
            else uvElement.classList.add('uv-very-high');
        }
    }

    showHourlyForecast() {
        const hourlyScroll = document.getElementById('hourlyScroll');
        if (!hourlyScroll) return;

        // Generate demo hourly data
        const hours = [];
        const now = new Date();
        
        for (let i = 0; i < 24; i++) {
            const hour = new Date(now.getTime() + (i * 60 * 60 * 1000));
            const temp = 28 + Math.sin(i * 0.3) * 5; // Simulate temperature variation
            
            hours.push({
                time: hour.getHours() === 0 ? '12 AM' : 
                      hour.getHours() <= 12 ? `${hour.getHours()} AM` : 
                      `${hour.getHours() - 12} PM`,
                temp: Math.round(temp),
                icon: 'fas fa-cloud-sun'
            });
        }

        // Create hourly cards
        hourlyScroll.innerHTML = hours.map(hour => `
            <div class="hourly-card">
                <div class="hourly-time">${hour.time}</div>
                <div class="hourly-icon">
                    <i class="${hour.icon}"></i>
                </div>
                <div class="hourly-temp">${hour.temp}°</div>
            </div>
        `).join('');
    }

    showWeatherContent() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('weatherContent').style.display = 'block';
    }

    showLoading() {
        document.getElementById('weatherContent').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';
        document.getElementById('loadingState').style.display = 'flex';
    }

    showError(message) {
        document.getElementById('weatherContent').style.display = 'none';
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').style.display = 'flex';
        
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }

    searchWeather(city) {
        console.log(`Searching weather for: ${city}`);
        this.showLoading();
        
        // Simulate API call with demo data
        setTimeout(() => {
            const demoData = {
                name: city,
                country: 'IN',
                temp: 25 + Math.random() * 10,
                condition: 'Clear Sky',
                feelsLike: 28 + Math.random() * 8,
                humidity: 60 + Math.random() * 30,
                windSpeed: 5 + Math.random() * 15,
                pressure: 1010 + Math.random() * 20,
                visibility: 8 + Math.random() * 4,
                uvIndex: Math.floor(Math.random() * 11)
            };
            
            this.displayWeatherData(demoData);
        }, 1000);
    }

    toggleUnit() {
        this.currentUnit = this.currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        
        const unitDisplay = document.querySelector('.unit-display');
        if (unitDisplay) {
            unitDisplay.textContent = this.currentUnit === 'celsius' ? '°C' : '°F';
        }

        // Save setting
        const settings = this.storage.getSettings();
        settings.unit = this.currentUnit;
        this.storage.saveSettings(settings);

        // Refresh display if weather data is shown
        if (document.getElementById('weatherContent').style.display !== 'none') {
            this.showDemoData();
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');

        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Save setting
        const settings = this.storage.getSettings();
        settings.theme = this.currentTheme;
        this.storage.saveSettings(settings);
    }

    toggleFavorite() {
        console.log('Toggle favorite clicked');
        // Implementation for adding/removing favorites
    }

    loadFavorites() {
        const favorites = this.storage.getFavorites();
        const favoritesList = document.getElementById('favoritesList');
        
        if (favoritesList) {
            if (favorites.length === 0) {
                favoritesList.innerHTML = '<p class="no-favorites">No favorite cities yet. Search for a city and add it to favorites!</p>';
            } else {
                favoritesList.innerHTML = favorites.map(city => `
                    <button class="favorite-city" onclick="weatherApp.searchWeather('${city.name}')">
                        ${city.name}
                    </button>
                `).join('');
            }
        }
    }

    retryLastSearch() {
        this.showDemoData();
    }
}

// Initialize the weather app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});