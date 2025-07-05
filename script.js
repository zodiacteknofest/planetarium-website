// Horoscope Website Interactive Features
class HoroscopeApp {
  constructor() {
    this.currentSpeaking = null;
    this.speechSynthesis = window.speechSynthesis;
    this.voiceMap = this.createVoiceMap();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupInitialState();
    this.loadVoices();
  }

  createVoiceMap() {
    return {
      scorpio: "vid/AkrepBilgi.mp4", // Your actual Scorpio info audio
      // Add more voice mappings as needed
    };
  }

  setupEventListeners() {
    // Story button event listeners
    document.querySelectorAll(".story-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.toggleStory(e.target);
      });
    });

    // Voice button event listeners
    document.querySelectorAll(".voice-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.playVoice(e.target);
      });
    });

    // Image fullscreen event listeners
    document.querySelectorAll(".horoscope-image").forEach((img) => {
      img.addEventListener("click", (e) => {
        this.openFullscreen(e.target);
      });
    });

    // Stop speech when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.classList.contains("voice-btn") && this.currentSpeaking) {
        this.stopSpeech();
      }
    });
  }

  setupInitialState() {
    // Hide all story texts initially
    document.querySelectorAll(".story-text").forEach((story) => {
      story.classList.add("hidden");
    });
  }

  loadVoices() {
    // Load available voices for text-to-speech
    if (this.speechSynthesis.onvoiceschanged !== undefined) {
      this.speechSynthesis.onvoiceschanged = () => {
        this.voices = this.speechSynthesis.getVoices();
      };
    }
    this.voices = this.speechSynthesis.getVoices();
  }

  toggleStory(button) {
    const sign = button.getAttribute("data-sign");
    const card = button.closest(".horoscope-card");
    const storyText = card.querySelector(".story-text");

    if (storyText.classList.contains("hidden")) {
      // Show story
      storyText.classList.remove("hidden");
      storyText.classList.add("show");
      button.textContent = "🔼 Hikayeyi Gizle";
      button.classList.add("active");

      // Smooth scroll to story
      setTimeout(() => {
        storyText.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    } else {
      // Hide story
      storyText.classList.add("hidden");
      storyText.classList.remove("show");
      button.textContent = "📖 Hikaye";
      button.classList.remove("active");
    }
  }

  async playVoice(button) {
    const sign = button.getAttribute("data-sign");

    // Stop any current speech
    this.stopSpeech();

    // Check if we have a custom audio file for this sign
    if (this.voiceMap[sign]) {
      await this.playCustomAudio(sign, button);
    } else {
      // Use text-to-speech for the story
      this.speakText(sign, button);
    }
  }

  async playCustomAudio(sign, button) {
    try {
      // For Scorpio, try to play the actual audio file
      if (sign === "scorpio") {
        const audio = new Audio(this.voiceMap[sign]);

        button.textContent = "🔊 Çalıyor...";
        button.classList.add("playing");
        this.currentSpeaking = {
          type: "audio",
          element: audio,
          button: button,
        };

        audio.onended = () => {
          this.resetVoiceButton(button);
        };

        audio.onerror = () => {
          console.log("Audio file not found, using text-to-speech instead");
          this.speakText(sign, button);
        };

        await audio.play();
      }
    } catch (error) {
      console.log("Error playing audio:", error);
      // Fallback to text-to-speech
      this.speakText(sign, button);
    }
  }

  speakText(sign, button) {
    const card = button.closest(".horoscope-card");
    const storyText = card.querySelector(".story-text p");
    const placementText = card.querySelector(".placement-info p");

    // Combine placement info and story for speech in Turkish
    const textToSpeak = `${sign} burcu. ${placementText.textContent} ${storyText.textContent}`;

    if (this.speechSynthesis && textToSpeak) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // Configure voice for Turkish
      if (this.voices && this.voices.length > 0) {
        // Try to find a good Turkish voice, fall back to other languages
        const preferredVoice =
          this.voices.find(
            (voice) =>
              voice.lang.includes("tr") && voice.name.includes("Female")
          ) ||
          this.voices.find((voice) => voice.lang.includes("tr")) ||
          this.voices.find(
            (voice) =>
              voice.lang.includes("en") && voice.name.includes("Female")
          ) ||
          this.voices.find((voice) => voice.lang.includes("en")) ||
          this.voices[0];

        utterance.voice = preferredVoice;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        button.textContent = "🔊 Konuşuyor...";
        button.classList.add("playing");
      };

      utterance.onend = () => {
        this.resetVoiceButton(button);
      };

      utterance.onerror = () => {
        this.resetVoiceButton(button);
        console.log("Speech synthesis error");
      };

      this.currentSpeaking = {
        type: "speech",
        element: utterance,
        button: button,
      };
      this.speechSynthesis.speak(utterance);
    }
  }

  stopSpeech() {
    if (this.currentSpeaking) {
      if (this.currentSpeaking.type === "speech") {
        this.speechSynthesis.cancel();
      } else if (this.currentSpeaking.type === "audio") {
        this.currentSpeaking.element.pause();
        this.currentSpeaking.element.currentTime = 0;
      }

      this.resetVoiceButton(this.currentSpeaking.button);
      this.currentSpeaking = null;
    }
  }

  resetVoiceButton(button) {
    button.textContent = "🔊 Sesli";
    button.classList.remove("playing");
    this.currentSpeaking = null;
  }

  openFullscreen(img) {
    // Create fullscreen modal
    const modal = document.createElement("div");
    modal.className = "fullscreen-modal";
    modal.innerHTML = `
      <div class="fullscreen-overlay">
        <div class="fullscreen-content">
          <button class="fullscreen-close" aria-label="Close fullscreen">✕</button>
          <div class="fullscreen-image-container">
            <img src="${img.src}" alt="${img.alt}" class="fullscreen-image">
          </div>
          <div class="fullscreen-info">
            <h3>${img.alt}</h3>
            <p>Takımyıldızı görseli tam ekran görünümü</p>
          </div>
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(modal);

    // Add event listeners
    const closeBtn = modal.querySelector(".fullscreen-close");
    const overlay = modal.querySelector(".fullscreen-overlay");

    closeBtn.addEventListener("click", () => this.closeFullscreen(modal));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        this.closeFullscreen(modal);
      }
    });

    // Add keyboard listener for ESC
    const escHandler = (e) => {
      if (e.key === "Escape") {
        this.closeFullscreen(modal);
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

    // Store the escape handler for cleanup
    modal.escHandler = escHandler;

    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add("show");
    });
  }

  closeFullscreen(modal) {
    // Remove event listener
    if (modal.escHandler) {
      document.removeEventListener("keydown", modal.escHandler);
    }

    // Animate out
    modal.classList.remove("show");
    modal.classList.add("hide");

    // Remove from DOM after animation
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }

  // Utility method to get horoscope info
  getHoroscopeInfo(sign) {
    const horoscopeData = {
      aries: {
        element: "Fire",
        quality: "Cardinal",
        ruler: "Mars",
        symbol: "Ram",
      },
      taurus: {
        element: "Earth",
        quality: "Fixed",
        ruler: "Venus",
        symbol: "Bull",
      },
      gemini: {
        element: "Air",
        quality: "Mutable",
        ruler: "Mercury",
        symbol: "Twins",
      },
      cancer: {
        element: "Water",
        quality: "Cardinal",
        ruler: "Moon",
        symbol: "Crab",
      },
      leo: {
        element: "Fire",
        quality: "Fixed",
        ruler: "Sun",
        symbol: "Lion",
      },
      virgo: {
        element: "Earth",
        quality: "Mutable",
        ruler: "Mercury",
        symbol: "Maiden",
      },
      libra: {
        element: "Air",
        quality: "Cardinal",
        ruler: "Venus",
        symbol: "Scales",
      },
      scorpio: {
        element: "Water",
        quality: "Fixed",
        ruler: "Mars/Pluto",
        symbol: "Scorpion",
      },
      sagittarius: {
        element: "Fire",
        quality: "Mutable",
        ruler: "Jupiter",
        symbol: "Archer",
      },
      capricorn: {
        element: "Earth",
        quality: "Cardinal",
        ruler: "Saturn",
        symbol: "Sea-Goat",
      },
      aquarius: {
        element: "Air",
        quality: "Fixed",
        ruler: "Saturn/Uranus",
        symbol: "Water-Bearer",
      },
      pisces: {
        element: "Water",
        quality: "Mutable",
        ruler: "Jupiter/Neptune",
        symbol: "Fish",
      },
      // New constellations
      orion: {
        element: "Winter",
        quality: "Hunter",
        ruler: "Betelgeuse/Rigel",
        symbol: "Hunter",
      },
      aguila: {
        element: "Summer",
        quality: "Flying",
        ruler: "Altair",
        symbol: "Eagle",
      },
      lyra: {
        element: "Summer",
        quality: "Musical",
        ruler: "Vega",
        symbol: "Harp",
      },
      cygnus: {
        element: "Summer",
        quality: "Flying",
        ruler: "Deneb",
        symbol: "Swan",
      },
      "ursa-major": {
        element: "Circumpolar",
        quality: "Guiding",
        ruler: "Dubhe",
        symbol: "Great Bear",
      },
      "ursa-minor": {
        element: "Circumpolar",
        quality: "Guiding",
        ruler: "Polaris",
        symbol: "Little Bear",
      },
      perseus: {
        element: "Autumn",
        quality: "Heroic",
        ruler: "Algol",
        symbol: "Hero",
      },
      andromeda: {
        element: "Autumn",
        quality: "Royal",
        ruler: "Alpheratz",
        symbol: "Princess",
      },
    };

    return horoscopeData[sign] || null;
  }
}

// Enhanced scroll animations with space theme
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = "0s";
      entry.target.classList.add("animate-in");
      // Add constellation effect when card comes into view
      addConstellationEffect(entry.target);
    }
  });
}, observerOptions);

// Add constellation effect to cards - complete border pattern
function addConstellationEffect(card) {
  // Check if constellation already exists to avoid duplicates
  if (card.querySelector(".constellation-border")) {
    return;
  }

  // Create border container
  const constellationBorder = document.createElement("div");
  constellationBorder.className = "constellation-border";

  // Create multiple star positions around the entire perimeter
  const stars = [
    // Top edge stars
    {
      class: "constellation-star-top-left",
      top: "20px",
      left: "10%",
      content: "✦",
    },
    {
      class: "constellation-star-top-1",
      top: "20px",
      left: "20%",
      content: "✧",
    },
    {
      class: "constellation-star-top-2",
      top: "20px",
      left: "30%",
      content: "✦",
    },
    {
      class: "constellation-star-top-3",
      top: "20px",
      left: "40%",
      content: "✧",
    },
    {
      class: "constellation-star-top-center",
      top: "20px",
      left: "50%",
      content: "✦",
    },
    {
      class: "constellation-star-top-4",
      top: "20px",
      left: "60%",
      content: "✧",
    },
    {
      class: "constellation-star-top-5",
      top: "20px",
      left: "70%",
      content: "✦",
    },
    {
      class: "constellation-star-top-6",
      top: "20px",
      left: "80%",
      content: "✧",
    },
    {
      class: "constellation-star-top-right",
      top: "20px",
      left: "90%",
      content: "✦",
    },

    // Right edge stars
    {
      class: "constellation-star-right-1",
      top: "10%",
      right: "0px",
      content: "✧",
    },
    {
      class: "constellation-star-right-2",
      top: "20%",
      right: "0px",
      content: "✦",
    },
    {
      class: "constellation-star-right-3",
      top: "30%",
      right: "0px",
      content: "✧",
    },
    {
      class: "constellation-star-right-4",
      top: "40%",
      right: "0px",
      content: "✦",
    },
    {
      class: "constellation-star-right-center",
      top: "50%",
      right: "0px",
      content: "✧",
    },
    {
      class: "constellation-star-right-5",
      top: "60%",
      right: "0px",
      content: "✦",
    },
    {
      class: "constellation-star-right-6",
      top: "70%",
      right: "0px",
      content: "✧",
    },
    {
      class: "constellation-star-right-7",
      top: "80%",
      right: "0px",
      content: "✦",
    },
    {
      class: "constellation-star-right-8",
      top: "90%",
      right: "0px",
      content: "✧",
    },

    // Bottom edge stars
    {
      class: "constellation-star-bottom-left",
      bottom: "-6px",
      left: "10%",
      content: "✧",
    },
    {
      class: "constellation-star-bottom-1",
      bottom: "-6px",
      left: "20%",
      content: "✦",
    },
    {
      class: "constellation-star-bottom-2",
      bottom: "-6px",
      left: "30%",
      content: "✧",
    },
    {
      class: "constellation-star-bottom-3",
      bottom: "-6px",
      left: "40%",
      content: "✦",
    },
    {
      class: "constellation-star-bottom-center",
      bottom: "-6px",
      left: "50%",
      content: "✧",
    },
    {
      class: "constellation-star-bottom-4",
      bottom: "-6px",
      left: "60%",
      content: "✦",
    },
    {
      class: "constellation-star-bottom-5",
      bottom: "-6px",
      left: "70%",
      content: "✧",
    },
    {
      class: "constellation-star-bottom-6",
      bottom: "-6px",
      left: "80%",
      content: "✦",
    },
    {
      class: "constellation-star-bottom-right",
      bottom: "-6px",
      left: "90%",
      content: "✧",
    },

    // Left edge stars
    {
      class: "constellation-star-left-1",
      top: "10%",
      left: "12px",
      content: "✦",
    },
    {
      class: "constellation-star-left-2",
      top: "20%",
      left: "12px",
      content: "✧",
    },
    {
      class: "constellation-star-left-3",
      top: "30%",
      left: "12px",
      content: "✦",
    },
    {
      class: "constellation-star-left-4",
      top: "40%",
      left: "12px",
      content: "✧",
    },
    {
      class: "constellation-star-left-center",
      top: "50%",
      left: "12px",
      content: "✦",
    },
    {
      class: "constellation-star-left-5",
      top: "60%",
      left: "12px",
      content: "✧",
    },
    {
      class: "constellation-star-left-6",
      top: "70%",
      left: "12px",
      content: "✦",
    },
    {
      class: "constellation-star-left-7",
      top: "80%",
      left: "12px",
      content: "✧",
    },
    {
      class: "constellation-star-left-8",
      top: "90%",
      left: "12px",
      content: "✦",
    },
  ];

  // Determine font size based on screen width
  const getFontSize = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1200) return "14px";
    if (screenWidth >= 768) return "12px";
    if (screenWidth >= 480) return "10px";
    return "8px";
  };

  const currentFontSize = getFontSize();

  // Create each star element
  stars.forEach((star, index) => {
    const starElement = document.createElement("div");
    starElement.className = `constellation-star ${star.class}`;
    starElement.innerHTML = star.content;

    // Set position
    starElement.style.position = "absolute";
    starElement.style.transform = "translate(-50%, -50%)";
    starElement.style.color = "rgba(255, 255, 255, 0.8)";
    starElement.style.fontSize = currentFontSize;
    starElement.style.textShadow = "0 0 8px rgba(255, 255, 255, 0.6)";
    starElement.style.pointerEvents = "none";
    starElement.style.zIndex = "2";

    // Apply position styles
    if (star.top) starElement.style.top = star.top;
    if (star.bottom) starElement.style.bottom = star.bottom;
    if (star.left) starElement.style.left = star.left;
    if (star.right) starElement.style.right = star.right;

    // Add staggered animation
    starElement.style.animation = `twinkle 4s ease-in-out infinite ${
      index * 0.1
    }s`;

    constellationBorder.appendChild(starElement);
  });

  // Add to card
  card.appendChild(constellationBorder);
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the horoscope app
  new HoroscopeApp();

  // Set up intersection observer for animations
  document.querySelectorAll(".horoscope-card").forEach((card) => {
    observer.observe(card);
  });

  // Add smooth scrolling for the page
  document.documentElement.style.scrollBehavior = "smooth";

  // Add keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Stop any playing audio/speech
      const app = new HoroscopeApp();
      app.stopSpeech();
    }
  });

  // Handle window resize to update constellation border sizes
  window.addEventListener("resize", () => {
    const cards = document.querySelectorAll(".horoscope-card");
    cards.forEach((card) => {
      const constellationBorder = card.querySelector(".constellation-border");
      if (constellationBorder) {
        const stars = constellationBorder.querySelectorAll(
          ".constellation-star"
        );
        const getFontSize = () => {
          const screenWidth = window.innerWidth;
          if (screenWidth >= 1200) return "14px";
          if (screenWidth >= 768) return "12px";
          if (screenWidth >= 480) return "10px";
          return "8px";
        };

        const currentFontSize = getFontSize();
        stars.forEach((star) => {
          star.style.fontSize = currentFontSize;
        });
      }
    });
  });
});

// Add CSS for animate-in class and constellation effects
const style = document.createElement("style");
style.textContent = `
    .horoscope-card.animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .constellation-border {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        border-radius: 20px;
        overflow: visible;
    }
    
    .constellation-star {
        position: absolute;
        pointer-events: none;
        user-select: none;
    }
    
    @keyframes twinkle {
        0%, 100% { 
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
        }
        50% { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
        }
    }
    
    /* Shooting star effect */
    .shooting-star {
        position: fixed;
        width: 2px;
        height: 2px;
        background: white;
        border-radius: 50%;
        opacity: 0;
        animation: shoot 3s linear infinite;
    }
    
    @keyframes shoot {
        0% {
            transform: translateX(-100px) translateY(-100px);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateX(100vw) translateY(100vh);
            opacity: 0;
        }
    }
    
    /* Fullscreen Modal */
    .fullscreen-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    
    .fullscreen-modal.show {
        opacity: 1;
        visibility: visible;
    }
    
    .fullscreen-modal.hide {
        opacity: 0;
        visibility: hidden;
    }
    
    .fullscreen-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(20px);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    
    .fullscreen-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: default;
        animation: scaleIn 0.3s ease-out;
    }
    
    .fullscreen-close {
        position: absolute;
        top: -50px;
        right: -20px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        color: white;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        z-index: 10001;
    }
    
    .fullscreen-close:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
        transform: scale(1.1);
    }
    
    .fullscreen-image-container {
        position: relative;
        margin-bottom: 20px;
    }
    
    .fullscreen-image {
        max-width: 80vw;
        max-height: 70vh;
        border-radius: 20px;
        border: 4px solid rgba(147, 112, 219, 0.6);
        box-shadow: 0 0 60px rgba(147, 112, 219, 0.5), 
                    0 0 120px rgba(100, 149, 237, 0.3),
                    inset 0 0 40px rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    }
    
    .fullscreen-image:hover {
        transform: scale(1.02);
        box-shadow: 0 0 80px rgba(147, 112, 219, 0.7), 
                    0 0 160px rgba(100, 149, 237, 0.4),
                    inset 0 0 60px rgba(255, 255, 255, 0.15);
    }
    
    .fullscreen-info {
        text-align: center;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(15px);
        padding: 15px 25px;
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        margin-top: 10px;
    }
    
    .fullscreen-info h3 {
        color: white;
        font-size: 1.5rem;
        margin: 0 0 8px 0;
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    }
    
    .fullscreen-info p {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1rem;
        margin: 0;
    }
    
    @keyframes scaleIn {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    /* Responsive fullscreen */
    @media (max-width: 768px) {
        .fullscreen-close {
            top: -30px;
            right: -10px;
            width: 35px;
            height: 35px;
            font-size: 16px;
        }
        
        .fullscreen-image {
            max-width: 95vw;
            max-height: 75vh;
            border-radius: 15px;
            border-width: 3px;
        }
        
        .fullscreen-info h3 {
            font-size: 1.2rem;
        }
        
        .fullscreen-info p {
            font-size: 0.9rem;
        }
    }
    
    @media (max-width: 480px) {
        .fullscreen-close {
            top: -25px;
            right: -5px;
            width: 30px;
            height: 30px;
            font-size: 14px;
        }
        
        .fullscreen-image {
            max-width: 98vw;
            max-height: 80vh;
            border-radius: 12px;
            border-width: 2px;
        }
        
        .fullscreen-info {
            padding: 12px 20px;
        }
        
        .fullscreen-info h3 {
            font-size: 1.1rem;
        }
        
        .fullscreen-info p {
            font-size: 0.85rem;
        }
    }
`;
document.head.appendChild(style);

// Add occasional shooting stars
function createShootingStar() {
  const star = document.createElement("div");
  star.className = "shooting-star";
  star.style.left = Math.random() * 100 + "vw";
  star.style.top = Math.random() * 100 + "vh";
  document.body.appendChild(star);

  setTimeout(() => {
    if (star.parentNode) {
      star.parentNode.removeChild(star);
    }
  }, 3000);
}

// Create shooting stars periodically
setInterval(createShootingStar, 5000);
