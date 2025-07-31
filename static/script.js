// EmotifyLyrics Interactive JavaScript
// Main JavaScript file for EmotifyLyrics website

// Global variables
let currentEmotion = null;
let currentConfidence = 0;
let isProcessing = false;

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const lyricsInput = document.getElementById('lyrics-input');
const charCount = document.getElementById('char-count');
const emotionForm = document.getElementById('emotion-form');
const resultSection = document.getElementById('result-section');
const emotionIcon = document.getElementById('emotion-icon');
const emotionName = document.getElementById('emotion-name');
const confidenceFill = document.getElementById('confidence-fill');
const confidencePercentage = document.getElementById('confidence-percentage');
const emotionDescription = document.getElementById('emotion-description');

// Emotion data configuration
const emotionConfig = {
    bahagia: {
        name: 'Bahagia',
        icon: 'fas fa-smile',
        color: 'linear-gradient(45deg, #ffd700, #ffb347)',
        bgClass: 'happy-bg',
        description: 'Lirik ini mengekspresikan perasaan bahagia dan kegembiraan dengan nuansa positif yang kuat. Terdapat tema-tema tentang cinta, kebahagiaan, dan optimisme.'
    },
    sedih: {
        name: 'Sedih',
        icon: 'fas fa-sad-tear',
        color: 'linear-gradient(45deg, #87ceeb, #4169e1)',
        bgClass: 'sad-bg',
        description: 'Lirik ini menggambarkan kesedihan mendalam, kehilangan, atau melankolis. Tema-tema tentang patah hati, kerinduan, dan emosi yang menyentuh.'
    },
    marah: {
        name: 'Marah',
        icon: 'fas fa-angry',
        color: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
        bgClass: 'angry-bg',
        description: 'Lirik ini mengandung kemarahan, frustrasi, atau emosi yang intens. Terdapat ekspresi ketidakpuasan, protes, atau pergolakan emosi.'
    },
    takut: {
        name: 'Takut',
        icon: 'fas fa-dizzy',
        color: 'linear-gradient(45deg, #dda0dd, #9370db)',
        bgClass: 'fear-bg',
        description: 'Lirik ini menunjukkan ketakutan, kecemasan, atau kekhawatiran. Tema-tema tentang ketidakpastian, ancaman, atau situasi yang menimbulkan rasa takut.'
    }
};

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    // Mobile navigation
    setupMobileNavigation();
    
    // Character counter
    setupCharacterCounter();
    
    // Form handling
    setupFormHandling();
    
    // Smooth scrolling
    setupSmoothScrolling();
    
    // Animations
    setupAnimations();
    
    // Auto-hide navbar on scroll
    setupNavbarBehavior();
    
    console.log('EmotifyLyrics initialized successfully!');
}

// Mobile Navigation
function setupMobileNavigation() {
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}

// Character Counter
function setupCharacterCounter() {
    if (lyricsInput && charCount) {
        lyricsInput.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            // Update character count color based on length
            if (count < 50) {
                charCount.style.color = '#ff6b6b';
            } else if (count < 200) {
                charCount.style.color = '#ffa500';
            } else {
                charCount.style.color = '#28a745';
            }
        });
    }
}

// Form Handling
function setupFormHandling() {
    if (emotionForm) {
        emotionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEmotionDetection();
        });
    }
}

// Handle emotion detection
async function handleEmotionDetection() {
    if (isProcessing) return;
    
    const lyrics = lyricsInput.value.trim();
    
    if (!lyrics) {
        showNotification('Mohon masukkan lirik lagu terlebih dahulu!', 'error');
        return;
    }

    if (lyrics.length < 50) {
        showNotification('Lirik terlalu pendek. Mohon masukkan lirik yang lebih panjang untuk hasil yang akurat.', 'warning');
        return;
    }

    isProcessing = true;
    showLoadingState();

    try {
        // Simulate API call (replace with actual API endpoint)
        const result = await simulateEmotionDetection(lyrics);
        
        setTimeout(() => {
            displayResult(result);
            isProcessing = false;
            hideLoadingState();
        }, 2000);
        
    } catch (error) {
        console.error('Error detecting emotion:', error);
        showNotification('Terjadi kesalahan saat mendeteksi emosi. Silakan coba lagi.', 'error');
        isProcessing = false;
        hideLoadingState();
    }
}

// Simulate emotion detection (replace with actual API call)
async function simulateEmotionDetection(lyrics) {
    // Simple keyword-based emotion detection for demo
    const words = lyrics.toLowerCase();
    
    // Happiness keywords
    const happyKeywords = ['bahagia', 'senang', 'gembira', 'cinta', 'suka', 'tertawa', 'tersenyum', 'indah', 'cantik', 'amazing', 'wonderful'];
    
    // Sadness keywords
    const sadKeywords = ['sedih', 'menangis', 'sakit', 'hati', 'rindu', 'pergi', 'tinggalkan', 'hancur', 'luka', 'patah', 'sepi'];
    
    // Anger keywords
    const angryKeywords = ['marah', 'benci', 'kesal', 'muak', 'geram', 'jengkel', 'kacau', 'sialan', 'bodoh', 'tidak'];
    
    // Fear keywords
    const fearKeywords = ['takut', 'khawatir', 'cemas', 'gelisah', 'was-was', 'panik', 'ngeri', 'seram', 'menakutkan'];
    
    let scores = {
        bahagia: 0,
        sedih: 0,
        marah: 0,
        takut: 0
    };
    
    // Calculate scores based on keyword presence
    happyKeywords.forEach(keyword => {
        if (words.includes(keyword)) scores.bahagia += 1;
    });
    
    sadKeywords.forEach(keyword => {
        if (words.includes(keyword)) scores.sedih += 1;
    });
    
    angryKeywords.forEach(keyword => {
        if (words.includes(keyword)) scores.marah += 1;
    });
    
    fearKeywords.forEach(keyword => {
        if (words.includes(keyword)) scores.takut += 1;
    });
    
    // If no keywords found, default to random emotion with lower confidence
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    
    if (totalScore === 0) {
        const emotions = ['bahagia', 'sedih', 'marah', 'takut'];
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        return {
            emotion: randomEmotion,
            confidence: Math.floor(Math.random() * 30) + 40 // 40-70% confidence
        };
    }
    
    // Find emotion with highest score
    const maxScore = Math.max(...Object.values(scores));
    const detectedEmotion = Object.keys(scores).find(key => scores[key] === maxScore);
    
    // Calculate confidence based on score ratio
    const confidence = Math.min(95, Math.floor((maxScore / totalScore) * 100) + Math.floor(Math.random() * 15));
    
    return {
        emotion: detectedEmotion,
        confidence: confidence
    };
}

// Display detection result
function displayResult(result) {
    if (!result || !emotionConfig[result.emotion]) {
        showNotification('Hasil deteksi tidak valid', 'error');
        return;
    }
    
    const emotion = emotionConfig[result.emotion];
    currentEmotion = result.emotion;
    currentConfidence = result.confidence;
    
    // Update emotion icon
    if (emotionIcon) {
        emotionIcon.innerHTML = `<i class="${emotion.icon}"></i>`;
        emotionIcon.style.background = emotion.color;
    }
    
    // Update emotion name
    if (emotionName) {
        emotionName.textContent = emotion.name;
    }
    
    // Update confidence bar
    if (confidenceFill && confidencePercentage) {
        confidenceFill.style.width = `${result.confidence}%`;
        confidencePercentage.textContent = `${result.confidence}%`;
    }
    
    // Update description
    if (emotionDescription) {
        emotionDescription.innerHTML = `<p>${emotion.description}</p>`;
    }
    
    // Show result section with animation
    if (resultSection) {
        resultSection.style.display = 'block';
        resultSection.classList.add('fade-in-up');
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Show loading state
function showLoadingState() {
    const btn = document.querySelector('.btn-detect');
    const spinner = btn.querySelector('.loading-spinner');
    const text = btn.querySelector('span');
    
    if (btn && spinner && text) {
        btn.disabled = true;
        spinner.style.display = 'block';
        text.style.opacity = '0';
        btn.style.cursor = 'not-allowed';
    }
}

// Hide loading state
function hideLoadingState() {
    const btn = document.querySelector('.btn-detect');
    const spinner = btn.querySelector('.loading-spinner');
    const text = btn.querySelector('span');
    
    if (btn && spinner && text) {
        btn.disabled = false;
        spinner.style.display = 'none';
        text.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }
}

// Clear form
function clearForm() {
    if (lyricsInput) {
        lyricsInput.value = '';
        lyricsInput.focus();
    }
    
    if (charCount) {
        charCount.textContent = '0';
        charCount.style.color = '#666';
    }
    
    if (resultSection) {
        resultSection.style.display = 'none';
    }
    
    currentEmotion = null;
    currentConfidence = 0;
}

// Analyze again
function analyzeAgain() {
    if (lyricsInput) {
        lyricsInput.focus();
        lyricsInput.select();
    }
    
    if (resultSection) {
        resultSection.style.display = 'none';
    }
}

// Share result
function shareResult() {
    if (!currentEmotion || !currentConfidence) {
        showNotification('Tidak ada hasil untuk dibagikan', 'error');
        return;
    }
    
    const emotion = emotionConfig[currentEmotion];
    const shareText = `Saya baru saja menganalisis emosi lirik lagu dengan EmotifyLyrics! 
Hasilnya: ${emotion.name} dengan tingkat kepercayaan ${currentConfidence}%. 
Coba juga di: ${window.location.origin}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'EmotifyLyrics - Hasil Analisis Emosi',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Hasil berhasil disalin ke clipboard!', 'success');
        }).catch(() => {
            showNotification('Gagal menyalin hasil', 'error');
        });
    }
}

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Setup animations
function setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .emotion-item, .methodology-step, .spec-card, .team-member').forEach(el => {
        observer.observe(el);
    });
}

// Navbar behavior on scroll
function setupNavbarBehavior() {
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (navbar) {
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
            
            // Add shadow when scrolled
            if (currentScrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        lastScrollY = currentScrollY;
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
    }
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return 'linear-gradient(45deg, #28a745, #34ce57)';
        case 'error': return 'linear-gradient(45deg, #dc3545, #e74c3c)';
        case 'warning': return 'linear-gradient(45deg, #ffc107, #ffb347)';
        default: return 'linear-gradient(45deg, #007bff, #0056b3)';
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        margin-left: auto;
    }
    
    .navbar.scrolled {
        backdrop-filter: blur(20px);
        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Export functions for global access
window.clearForm = clearForm;
window.analyzeAgain = analyzeAgain;
window.shareResult = shareResult;

// Console welcome message
console.log(`
%c🎵 EmotifyLyrics 🎵
%cPlatform Deteksi Emosi Lirik Lagu Indonesia
%cDeveloped with ❤️ by EmotifyLyrics Team
`, 
'color: #667eea; font-size: 20px; font-weight: bold;',
'color: #764ba2; font-size: 14px;',
'color: #999; font-size: 12px;'
);