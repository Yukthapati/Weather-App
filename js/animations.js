// Animation utilities for WeatherPro
class AnimationManager {
    constructor() {
        this.backgroundElement = document.getElementById('backgroundAnimation');
        this.initializeAnimations();
    }

    initializeAnimations() {
        this.createBackgroundParticles();
        this.setupScrollAnimations();
    }

    // Create animated background particles
    createBackgroundParticles() {
        if (!this.backgroundElement) return;

        // Clear existing particles
        this.backgroundElement.innerHTML = '';

        // Default background
        this.updateWeatherBackground('clear');
    }

    // Update background based on weather condition
    updateWeatherBackground(condition) {
        if (!this.backgroundElement) return;

        // Clear existing content
        this.backgroundElement.innerHTML = '';
        
        // Remove existing weather background classes
        this.backgroundElement.className = 'background-animation';
        
        const conditionLower = condition.toLowerCase();
        let weatherType = 'clear';
        let iconClass = 'fas fa-sun';
        let iconType = 'sun';
        
        // Determine weather type and icon
        if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('shower')) {
            weatherType = 'rainy';
            iconClass = 'fas fa-cloud-rain';
            iconType = 'rain';
        } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
            weatherType = 'cloudy';
            iconClass = 'fas fa-cloud';
            iconType = 'cloud';
        } else if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
            weatherType = 'snowy';
            iconClass = 'fas fa-snowflake';
            iconType = 'snow';
        } else if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
            weatherType = 'sunny';
            iconClass = 'fas fa-sun';
            iconType = 'sun';
        }
        
        // Add weather background class
        this.backgroundElement.classList.add(`weather-bg-${weatherType}`);
        
        // Create weather-specific animated icons
        this.createWeatherIcons(iconClass, iconType);
    }
    
    // Create animated weather icons for background
    createWeatherIcons(iconClass, iconType) {
        const iconCount = iconType === 'rain' ? 15 : 8;
        
        for (let i = 0; i < iconCount; i++) {
            const icon = document.createElement('i');
            icon.className = `${iconClass} weather-icon-bg ${iconType}`;
            icon.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 5}s;
                font-size: ${Math.random() * 1.5 + 1.5}rem;
            `;
            this.backgroundElement.appendChild(icon);
        }
    }

    // Setup scroll-based animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.weather-content section').forEach(section => {
            observer.observe(section);
        });
    }

    // Animate weather icon based on condition
    animateWeatherIcon(condition) {
        const iconElement = document.getElementById('weatherIcon');
        if (!iconElement) return;

        // Remove existing animation classes
        iconElement.classList.remove('sunny', 'cloudy', 'rainy', 'snowy');

        // Add appropriate animation class
        const conditionLower = condition.toLowerCase();
        if (conditionLower.includes('sun') || conditionLower.includes('clear')) {
            iconElement.classList.add('sunny');
        } else if (conditionLower.includes('cloud')) {
            iconElement.classList.add('cloudy');
        } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
            iconElement.classList.add('rainy');
        } else if (conditionLower.includes('snow')) {
            iconElement.classList.add('snowy');
        }
    }

    // Smooth scroll to element
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Export for use in other modules
window.AnimationManager = AnimationManager;