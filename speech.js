/**
 * Ovozli talaffuz tizimi (Web Speech API)
 * Harflar, so'zlar va iboralarni aniq talaffuz qilish uchun
 */

class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.bestVoice = null;
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;

    const updateVoices = () => {
      this.voices = this.synth.getVoices();
      // O'zbek yoki turkiy tillariga eng mos ovozni topish
      this.bestVoice = this.voices.find(v => v.lang.startsWith('uz')) ||
                       this.voices.find(v => v.lang.startsWith('tr')) ||
                       this.voices.find(v => v.lang.startsWith('ru')) ||
                       this.voices.find(v => v.lang.startsWith('en')) ||
                       this.voices[0] || null;
    };

    updateVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = updateVoices;
    }
  }

  speak(text, options = {}) {
    if (!this.synth) {
      console.warn("Speech Synthesis qo'llab-quvvatlanmaydi");
      return;
    }

    // Oldingi gaplashishni to'xtatish
    this.synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    if (this.bestVoice) {
      utter.voice = this.bestVoice;
    }

    utter.rate = options.rate || 0.85; // Bolalar va yangi o'rganuvchilar uchun qulay sekin tezlik
    utter.pitch = options.pitch || 1.1; // Bolalar uchun quvnoq ohang
    utter.volume = options.volume !== undefined ? options.volume : 1;

    // Tilni aniqlash
    if (this.bestVoice && this.bestVoice.lang.startsWith('uz')) {
      utter.lang = 'uz-UZ';
    } else if (this.bestVoice && this.bestVoice.lang.startsWith('tr')) {
      utter.lang = 'tr-TR';
    }

    this.synth.speak(utter);
  }

  // Harfni va namunaviy so'zni talaffuz qilish
  speakLetter(item) {
    if (!item) return;
    let textToSpeak = "";
    if (item.type === 'belgi') {
      textToSpeak = `Tutuq belgisi. Misol: ${item.word}`;
    } else {
      textToSpeak = `${item.upper}! ${item.word}!`;
    }
    this.speak(textToSpeak, { rate: 0.8, pitch: 1.05 });
  }

  // To'liq so'zni talaffuz qilish
  speakWord(word) {
    this.speak(word, { rate: 0.85, pitch: 1.1 });
  }
}

window.speechEngine = new SpeechEngine();

