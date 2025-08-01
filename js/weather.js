class WeatherApp {
    constructor() {
        this.API_KEY = '9fcdf94541c44282bbe101419250108';
        this.BASE_URL = 'https://api.weatherapi.com/v1';
        this.storage = new StorageManager();
        this.animations = new AnimationManager();
        this.currentUnit = 'celsius';
        this.currentTheme = 'light';
        this.lastSearchedCity = null;
        this.forecastData = null;

        this.initializeApp();
    }
    
    initializeApp() {
        this.loadSettings();
        this.setupEventListeners();
        this.loadFavorites();
        this.showDemoData();
    }

    loadSettings() {
        const settings = this.storage.getSettings() || {};
        this.currentUnit = settings.unit || 'celsius';
        this.currentTheme = settings.theme || 'light';

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
        this.forecastData = null; // Clear forecast for demo
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
            uv.classList.remove('uv-low', 'uv-moderate', 'uv-high', 'uv-very-high');

            if (data.uvIndex <= 2) uv.classList.add('uv-low');
            else if (data.uvIndex <= 5) uv.classList.add('uv-moderate');
            else if (data.uvIndex <= 7) uv.classList.add('uv-high');
            else uv.classList.add('uv-very-high');
        }
    }

    fetchForecast(city) {
        const url = `${this.BASE_URL}/forecast.json?key=${this.API_KEY}&q=${encodeURIComponent(city)}&days=7&aqi=no&alerts=no`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Forecast data not available.');
                return response.json();
            })
            .then(data => {
                this.forecastData = data.forecast.forecastday;  // Store forecast for use
                this.showHourlyForecast();
                this.showWeeklyForecast();
            })
            .catch(error => {
                console.error(error);
                this.forecastData = null;
                this.showHourlyForecast();
                this.showWeeklyForecast();
            });
    }

    showHourlyForecast() {
        const hourlyScroll = document.getElementById('hourlyScroll');
        if (!hourlyScroll) return;

        if (!this.forecastData || this.forecastData.length === 0) {
            hourlyScroll.innerHTML = '<p>No hourly forecast data available.</p>';
            return;
        }

        // Use today's forecast hours
        const todayHours = this.forecastData[0].hour;

        const hoursHtml = todayHours.map(hour => {
            const time = new Date(hour.time);
            const hourLabel = time.getHours() === 0 ? '12 AM' :
                              time.getHours() < 12 ? `${time.getHours()} AM` :
                              `${time.getHours() - 12} PM`;

            const temp = this.currentUnit === 'celsius' ? hour.temp_c : hour.temp_f;
            const iconUrl = hour.condition.icon;
            const iconClass = 'hourly-icon-img';

            return `
                <div class="hourly-card">
                    <div class="hourly-time">${hourLabel}</div>
                    <div class="hourly-icon"><img src="https:${iconUrl}" alt="${hour.condition.text}" class="${iconClass}"></div>
                    <div class="hourly-temp">${Math.round(temp)}°</div>
                </div>
            `;
        }).join('');

        hourlyScroll.innerHTML = hoursHtml;
    }

    showWeeklyForecast() {
        const weeklyList = document.getElementById('weeklyList');
        if (!weeklyList) return;

        if (!this.forecastData || this.forecastData.length === 0) {
            weeklyList.innerHTML = '<p>No weekly forecast data available.</p>';
            return;
        }

        const daysHtml = this.forecastData.map((day, i) => {
            const date = new Date(day.date);
            const dayLabel = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
            const condition = day.day.condition.text;
            const iconUrl = day.day.condition.icon;
            const iconClass = 'weekly-icon-img';

            const high = this.currentUnit === 'celsius' ? day.day.maxtemp_c : day.day.maxtemp_f;
            const low = this.currentUnit === 'celsius' ? day.day.mintemp_c : day.day.mintemp_f;

            return `
                <div class="hourly-card">
                    <div class="hourly-time">${dayLabel}</div>
                    <div class="hourly-icon"><img src="https:${iconUrl}" alt="${condition}" class="${iconClass}"></div>
                    <div class="hourly-temp"><span>${Math.round(high)}°</span> / <span>${Math.round(low)}°</span></div>
                </div>
            `;
        }).join('');

        weeklyList.innerHTML = daysHtml;
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

        const url = `${this.BASE_URL}/current.json?key=${this.API_KEY}&q=${encodeURIComponent(city)}&aqi=no`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('City not found or API error.');
                return response.json();
            })
            .then(data => {
                this.lastSearchedCity = city;

                const weatherData = {
                    name: data.location.name,
                    country: data.location.country,
                    temp: data.current.temp_c,
                    condition: data.current.condition.text,
                    feelsLike: data.current.feelslike_c,
                    humidity: data.current.humidity,
                    windSpeed: data.current.wind_kph,
                    pressure: data.current.pressure_mb,
                    visibility: data.current.vis_km,
                    uvIndex: data.current.uv
                };

                this.displayWeatherData(weatherData);
                this.fetchForecast(city);
            })
            .catch(error => {
                console.error(error);
                this.showError(error.message || 'Unable to fetch weather data.');
            });
    }

    toggleUnit() {
        this.currentUnit = this.currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        document.querySelector('.unit-display').textContent = this.currentUnit === 'celsius' ? '°C' : '°F';

        const settings = this.storage.getSettings() || {};
        settings.unit = this.currentUnit;
        this.storage.saveSettings(settings);

        if (document.getElementById('weatherContent').style.display !== 'none') {
            if (this.lastSearchedCity) {
                this.searchWeather(this.lastSearchedCity);
            } else {
                this.showDemoData();
            }
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(this.currentTheme === 'dark' ? 'dark-theme' : 'light-theme');

        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) themeIcon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        const settings = this.storage.getSettings() || {};
        settings.theme = this.currentTheme;
        this.storage.saveSettings(settings);
    }

    toggleFavorite() {
        const cityName = document.getElementById('cityName').textContent.split(',')[0];
        const favorites = this.storage.getFavorites() || [];

        const existsIndex = favorites.findIndex(city => city.name === cityName);
        if (existsIndex > -1) {
            favorites.splice(existsIndex, 1);
            alert(`${cityName} removed from favorites.`);
        } else {
            favorites.push({ name: cityName });
            alert(`${cityName} added to favorites.`);
        }

        this.storage.saveFavorites(favorites);
        this.loadFavorites();
    }

    loadFavorites() {
        const favorites = this.storage.getFavorites() || [];
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
        if (this.lastSearchedCity) {
            this.searchWeather(this.lastSearchedCity);
        } else {
            this.showDemoData();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});
