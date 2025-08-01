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
        
        // Just keep the clean background without animated icons
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