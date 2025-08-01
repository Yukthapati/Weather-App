// Weather API and UI management for WeatherPro
class WeatherApp {
    constructor() {
        this.API_KEY = 'demo';
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

        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(this.currentTheme === 'dark' ? 'dark-theme' : 'light-theme');

        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) themeIcon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        const unitDisplay = document.querySelector('.unit-display');
        if (unitDisplay) unitDisplay.textContent = this.currentUnit === 'celsius' ? '°C' : '°F';
    }

    setupEventListeners() {
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

        document.getElementById('unitToggle')?.addEventListener('click', () => this.toggleUnit());
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        document.getElementById('favoriteBtn')?.addEventListener('click', () => this.toggleFavorite());
        document.getElementById('retryBtn')?.addEventListener('click', () => this.retryLastSearch());
    }

    showDemoData() {
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
        this.showWeeklyForecast();
        this.animations.updateWeatherBackground(demoData.condition);
    }

    displayWeatherData(data) {
        document.getElementById('cityName').textContent = `${data.name}, ${data.country}`;
        document.getElementById('dateTime').textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const convert = (t) => this.currentUnit === 'celsius' ? t : (t * 9/5) + 32;

        document.getElementById('currentTemp').textContent = `${Math.round(convert(data.temp))}°`;
        document.getElementById('weatherCondition').textContent = data.condition;
        document.getElementById('feelsLike').textContent = `${Math.round(convert(data.feelsLike))}°`;

        this.updateWeatherDetails(data);
        this.showWeatherContent();
        this.animations.updateWeatherBackground(data.condition);
    }

    updateWeatherDetails(data) {
        const details = {
            humidity: `${Math.round(data.humidity)}%`,
            windSpeed: `${Math.round(data.windSpeed)} km/h`,
            pressure: `${Math.round(data.pressure)} hPa`,
            visibility: `${Math.round(data.visibility)} km`,
            uvIndex: data.uvIndex
        };

        for (const [key, value] of Object.entries(details)) {
            const el = document.getElementById(key);
            if (el) el.textContent = value;
        }

        const uv = document.getElementById('uvIndex');
        if (uv) {
            uv.className = 'detail-value uv-index';
            if (data.uvIndex <= 2) uv.classList.add('uv-low');
            else if (data.uvIndex <= 5) uv.classList.add('uv-moderate');
            else if (data.uvIndex <= 7) uv.classList.add('uv-high');
            else uv.classList.add('uv-very-high');
        }
    }

    showHourlyForecast() {
        const hourlyScroll = document.getElementById('hourlyScroll');
        if (!hourlyScroll) return;

        const now = new Date();
        const hours = Array.from({ length: 24 }, (_, i) => {
            const hour = new Date(now.getTime() + i * 3600000);
            const temp = 28 + Math.sin(i * 0.3) * 5;

            return {
                time: hour.getHours() === 0 ? '12 AM' :
                      hour.getHours() <= 12 ? `${hour.getHours()} AM` :
                      `${hour.getHours() - 12} PM`,
                temp: Math.round(temp),
                icon: 'fas fa-cloud-sun'
            };
        });

        hourlyScroll.innerHTML = hours.map(h => `
            <div class="hourly-card">
                <div class="hourly-time">${h.time}</div>
                <div class="hourly-icon"><i class="${h.icon}"></i></div>
                <div class="hourly-temp">${h.temp}°</div>
            </div>
        `).join('');
    }

    showWeeklyForecast() {
        const weeklyList = document.getElementById('weeklyList');
        if (!weeklyList) return;

        const today = new Date();
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const conditions = ['Clear Sky', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Sunny'];
        const icons = ['fas fa-sun', 'fas fa-cloud-sun', 'fas fa-cloud', 'fas fa-cloud-rain', 'fas fa-sun'];

        const days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today.getTime() + i * 86400000);
            const conditionIndex = Math.floor(Math.random() * conditions.length);
            const highTemp = 25 + Math.random() * 10;
            const lowTemp = highTemp - 5 - Math.random() * 5;

            return {
                day: i === 0 ? 'Today' : weekdays[date.getDay()],
                condition: conditions[conditionIndex],
                icon: icons[conditionIndex],
                high: Math.round(this.currentUnit === 'celsius' ? highTemp : (highTemp * 9/5) + 32),
                low: Math.round(this.currentUnit === 'celsius' ? lowTemp : (lowTemp * 9/5) + 32)
            };
        });

        weeklyList.innerHTML = days.map(d => `
            <div class="hourly-card">
                <div class="hourly-time">${d.day}</div>
                <div class="hourly-icon"><i class="${d.icon}"></i></div>
                <div class="hourly-temp"><span>${d.high}°</span> / <span>${d.low}°</span></div>
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
        if (errorMessage) errorMessage.textContent = message;
    }

    searchWeather(city) {
    console.log(`Searching weather for: ${city}`);
    this.showLoading();

    const url = `${this.BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${this.API_KEY}&units=metric`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('City not found or API error.');
            return response.json();
        })
        .then(data => {
            const weatherData = {
                name: data.name,
                country: data.sys.country,
                temp: data.main.temp,
                condition: data.weather[0].main,
                feelsLike: data.main.feels_like,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
                pressure: data.main.pressure,
                visibility: data.visibility / 1000, // Convert m to km
                uvIndex: Math.floor(Math.random() * 11) // Placeholder, as UV requires OneCall API
            };

            this.displayWeatherData(weatherData);
            this.showWeeklyForecast();
        })
        .catch(error => {
            console.error(error);
            this.showError(error.message || 'Unable to fetch weather data.');
        });
}


    toggleUnit() {
        this.currentUnit = this.currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        document.querySelector('.unit-display').textContent = this.currentUnit === 'celsius' ? '°C' : '°F';

        const settings = this.storage.getSettings();
        settings.unit = this.currentUnit;
        this.storage.saveSettings(settings);

        if (document.getElementById('weatherContent').style.display !== 'none') {
            this.showDemoData();
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(this.currentTheme === 'dark' ? 'dark-theme' : 'light-theme');

        document.querySelector('#themeToggle i').className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        const settings = this.storage.getSettings();
        settings.theme = this.currentTheme;
        this.storage.saveSettings(settings);
    }

    toggleFavorite() {
        console.log('Toggle favorite clicked');
    }

    loadFavorites() {
        const favorites = this.storage.getFavorites();
        const favoritesList = document.getElementById('favoritesList');

        if (favoritesList) {
            favoritesList.innerHTML = favorites.length === 0 
                ? '<p class="no-favorites">No favorite cities yet. Search for a city and add it to favorites!</p>'
                : favorites.map(city => `
                    <button class="favorite-city" onclick="weatherApp.searchWeather('${city.name}')">
                        ${city.name}
                    </button>
                `).join('');
        }
    }

    retryLastSearch() {
        this.showDemoData();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});
