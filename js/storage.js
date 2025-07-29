// Storage utilities for WeatherPro
class StorageManager {
    constructor() {
        this.FAVORITES_KEY = 'weatherpro_favorites';
        this.SETTINGS_KEY = 'weatherpro_settings';
    }

    // Get favorites from localStorage
    getFavorites() {
        try {
            const favorites = localStorage.getItem(this.FAVORITES_KEY);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    // Save favorites to localStorage
    saveFavorites(favorites) {
        try {
            localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }

    // Add city to favorites
    addFavorite(city) {
        const favorites = this.getFavorites();
        if (!favorites.some(fav => fav.name.toLowerCase() === city.name.toLowerCase())) {
            favorites.push(city);
            this.saveFavorites(favorites);
        }
    }

    // Remove city from favorites
    removeFavorite(cityName) {
        const favorites = this.getFavorites();
        const filtered = favorites.filter(fav => fav.name.toLowerCase() !== cityName.toLowerCase());
        this.saveFavorites(filtered);
    }

    // Get app settings
    getSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            return settings ? JSON.parse(settings) : {
                unit: 'celsius',
                theme: 'light'
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return { unit: 'celsius', theme: 'light' };
        }
    }

    // Save app settings
    saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
}

// Export for use in other modules
window.StorageManager = StorageManager;