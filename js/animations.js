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

        // Create floating particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s infinite linear;
                pointer-events: none;
            `;
            this.backgroundElement.appendChild(particle);
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