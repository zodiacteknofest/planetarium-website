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
      button.textContent = "🔼 Hide Story";
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
      button.textContent = "📖 Story";
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

        button.textContent = "🔊 Playing...";
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

    // Combine placement info and story for speech
    const textToSpeak = `${sign} horoscope. ${placementText.textContent} ${storyText.textContent}`;

    if (this.speechSynthesis && textToSpeak) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // Configure voice
      if (this.voices && this.voices.length > 0) {
        // Try to find a good voice (English, female preferred)
        const preferredVoice =
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
        button.textContent = "🔊 Speaking...";
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
    button.textContent = "🔊 Voice";
    button.classList.remove("playing");
    this.currentSpeaking = null;
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
    };

    return horoscopeData[sign] || null;
  }
}

// Enhanced scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = "0s";
      entry.target.classList.add("animate-in");
    }
  });
}, observerOptions);

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
});

// Add CSS for animate-in class
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
`;
document.head.appendChild(style);
