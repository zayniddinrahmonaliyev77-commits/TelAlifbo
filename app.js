/**
 * ALIFBE.UZ - Asosiy Dastur Mantiqi (App Engine)
 * O'zbek alifbosini 0 dan interaktiv o'rganish
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. TIZIM HOLATI VA XOTIRA (STATE & LOCAL STORAGE)
  // =========================================================================
  const STATE_KEY = 'alifbe_uz_state_v1';

  let state = {
    learnedLetters: [],     // O'rganilgan harf ID lari
    stars: 0,               // Jami to'plangan yulduzlar
    quizScore: 0,           // Viktorina balli
    quizStreak: 0,          // Ketma-ket to'g'ri topishlar
    wordsSolved: 0,         // To'g'ri terilgan so'zlar soni
    memoryWins: 0,          // Yutilgan xotira o'yinlari
    canvasTracedCount: 0,   // Qalamda chizilgan harflar soni
    unlockedBadges: [],     // Ochilgan nishonlar
    isDark: false,          // Qorong'u rejim
    isMuted: false          // Ovoz holati
  };

  // Saqlangan holatni yuklash
  function loadState() {
    try {
      const saved = localStorage.getItem(STATE_KEY);
      if (saved) {
        state = { ...state, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Ma'lumotlarni yuklashda xato:", e);
    }
  }

  // Holatni saqlash
  function saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Ma'lumotlarni saqlashda xato:", e);
    }
    updateGlobalUI();
  }

  // =========================================================================
  // 2. DARALAR VA YUTUQLAR TIZIMI
  // =========================================================================
  function getLevelInfo(stars) {
    if (stars < 30) return { title: "🌱 Boshlovchi", rank: "Yangi Boshlovchi" };
    if (stars < 80) return { title: "🌿 Qiziquvchan", rank: "Qiziquvchan O'quvchi" };
    if (stars < 160) return { title: "⭐ Bilimdon", rank: "Alifbo Bilimdoni" };
    if (stars < 300) return { title: "🎖️ Alifbo Ustasi", rank: "Harflar Ustasi" };
    return { title: "👑 Zukko Olim", rank: "Mukammal Zukko Olim" };
  }

  function checkBadges() {
    let newlyUnlocked = false;

    // 1. Ilk qadam (1-harf o'rganildi)
    if (state.learnedLetters.length >= 1 && !state.unlockedBadges.includes("first_letter")) {
      state.unlockedBadges.push("first_letter");
      showBadgeToast("Ilk Qadam", "🌱");
      newlyUnlocked = true;
    }

    // 2. Unlilar donosi (barcha 6 ta unli o'rganildi)
    const vowels = ALPHABET_DATA.filter(item => item.type === 'unli').map(i => i.id);
    const learnedVowels = vowels.every(id => state.learnedLetters.includes(id));
    if (learnedVowels && !state.unlockedBadges.includes("vowels_master")) {
      state.unlockedBadges.push("vowels_master");
      showBadgeToast("Unlilar Donosi", "👑");
      newlyUnlocked = true;
    }

    // 3. Mergan zehn (5 ta ketma-ket to'g'ri)
    if (state.quizStreak >= 5 && !state.unlockedBadges.includes("quiz_streak_5")) {
      state.unlockedBadges.push("quiz_streak_5");
      showBadgeToast("Mergan Zehn", "🎯");
      newlyUnlocked = true;
    }

    // 4. Zukko xotira
    if (state.memoryWins >= 1 && !state.unlockedBadges.includes("memory_champ")) {
      state.unlockedBadges.push("memory_champ");
      showBadgeToast("Zukko Xotira", "🧩");
      newlyUnlocked = true;
    }

    // 5. So'z ustasi
    if (state.wordsSolved >= 3 && !state.unlockedBadges.includes("word_builder")) {
      state.unlockedBadges.push("word_builder");
      showBadgeToast("So'z Ustasi", "📚");
      newlyUnlocked = true;
    }

    // 6. Sehrli mo'yqalam
    if (state.canvasTracedCount >= 1 && !state.unlockedBadges.includes("artist")) {
      state.unlockedBadges.push("artist");
      showBadgeToast("Sehrli Mo'yqalam", "🎨");
      newlyUnlocked = true;
    }

    // 7. Alifbo qahramoni
    if (state.stars >= 100 && !state.unlockedBadges.includes("alphabet_pro")) {
      state.unlockedBadges.push("alphabet_pro");
      showBadgeToast("Alifbo Qahramoni", "🏆");
      newlyUnlocked = true;
    }

    if (newlyUnlocked) {
      if (window.soundEffects) window.soundEffects.playSparkle();
      triggerConfetti();
      saveState();
    }
  }

  function addStars(count, reason) {
    state.stars += count;
    saveState();
    if (count > 0) {
      showToast(`+${count} ⭐️ ${reason || ''}`);
    }
    checkBadges();
  }

  // =========================================================================
  // 3. GLOBAL INTERFEYSNI YANGILASH
  // =========================================================================
  const headerStarsCount = document.getElementById('headerStarsCount');
  const headerLevelTitle = document.getElementById('headerLevelTitle');
  const alphabetProgressBar = document.getElementById('alphabetProgressBar');
  const learnedCountText = document.getElementById('learnedCountText');

  function updateGlobalUI() {
    if (headerStarsCount) headerStarsCount.textContent = state.stars;
    const lvl = getLevelInfo(state.stars);
    if (headerLevelTitle) headerLevelTitle.textContent = lvl.title;

    // Taraqqiyot paneli (Alifbo)
    const totalLetters = 29; // Asosiy 29 harf
    const learnedCount = state.learnedLetters.length;
    const pct = Math.min(100, Math.round((learnedCount / totalLetters) * 100));

    if (alphabetProgressBar) alphabetProgressBar.style.width = `${pct}%`;
    if (learnedCountText) learnedCountText.textContent = `O'rganildi: ${learnedCount} / ${totalLetters}`;

    // Yutuqlar bo'limi yangilanishi
    const statTotalStars = document.getElementById('statTotalStars');
    const statLettersExplored = document.getElementById('statLettersExplored');
    const statQuizHighscore = document.getElementById('statQuizHighscore');
    const statWordsMastered = document.getElementById('statWordsMastered');
    const profileRankTitle = document.getElementById('profileRankTitle');
    const profileLevelText = document.getElementById('profileLevelText');

    if (statTotalStars) statTotalStars.textContent = state.stars;
    if (statLettersExplored) statLettersExplored.textContent = `${learnedCount} / ${totalLetters}`;
    if (statQuizHighscore) statQuizHighscore.textContent = state.quizScore;
    if (statWordsMastered) statWordsMastered.textContent = state.wordsSolved;
    if (profileRankTitle) profileRankTitle.textContent = lvl.rank;
    if (profileLevelText) profileLevelText.textContent = `${lvl.title} (${state.stars} ta yulduz)`;

    renderBadgesList();
  }

  // =========================================================================
  // 4. TOAST VA BILDIRISHNOMALAR
  // =========================================================================
  const toastMsg = document.getElementById('toastMsg');
  const toastText = document.getElementById('toastText');
  const toastIcon = document.getElementById('toastIcon');
  let toastTimer = null;

  function showToast(text, icon = '✨') {
    if (!toastMsg) return;
    clearTimeout(toastTimer);
    toastText.textContent = text;
    toastIcon.textContent = icon;
    toastMsg.classList.add('show');
    toastTimer = setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 2400);
  }

  function showBadgeToast(title, icon) {
    showToast(`Yangi nishon: ${title}!`, icon);
  }

  // =========================================================================
  // 5. PASTKI NAVIGATSIYA (TABS)
  // =========================================================================
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');

  function switchTab(tabId) {
    navItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    tabContents.forEach(tab => {
      if (tab.id === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Maxsus harakatlar tab ochilganda
    if (tabId === 'tabQalam') {
      resizeCanvas();
      drawLetterGuide();
    } else if (tabId === 'tabOyinlar') {
      // O'yin ochilganda
      if (currentQuizQuestion === null) {
        generateQuizQuestion();
      }
    }

    if (window.soundEffects) window.soundEffects.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // =========================================================================
  // 6. 1-BO'LIM: ALIFBO BOG'I (ALPHABET EXPLORER)
  // =========================================================================
  const alphabetGrid = document.getElementById('alphabetGrid');
  const filterChips = document.querySelectorAll('.filter-scroll .chip');
  let currentFilter = 'all';

  function renderAlphabet(filter = 'all') {
    if (!alphabetGrid) return;
    alphabetGrid.innerHTML = '';

    const filtered = ALPHABET_DATA.filter(item => {
      if (filter === 'all') return true;
      if (filter === 'unli') return item.type === 'unli';
      if (filter === 'undosh') return item.type === 'undosh';
      if (filter === 'special') {
        return ['o_star', 'g_star', 'sh', 'ch', 'ng'].includes(item.id);
      }
      return true;
    });

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = `letter-card ${item.type}`;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');

      const isLearned = state.learnedLetters.includes(item.id);

      card.innerHTML = `
        <div class="letter-big">${item.upper}${item.lower !== item.upper ? item.lower : ''}</div>
        <div class="letter-emoji">${item.emoji}</div>
        <div class="letter-word">${item.word}</div>
        <div class="letter-type-tag">
          ${item.type === 'unli' ? 'Unli' : item.type === 'undosh' ? 'Undosh' : 'Belgi'}
        </div>
        ${isLearned ? '<span style="position: absolute; top: 6px; right: 6px; font-size: 0.85rem;">✅</span>' : ''}
      `;

      card.addEventListener('click', () => {
        openLetterModal(item);
      });

      alphabetGrid.appendChild(card);
    });
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute('data-filter');
      if (window.soundEffects) window.soundEffects.playClick();
      renderAlphabet(currentFilter);
    });
  });

  // =========================================================================
  // 7. HARF MODAL OYNASI (LETTER DETAIL MODAL)
  // =========================================================================
  const letterModalOverlay = document.getElementById('letterModalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTypeTag = document.getElementById('modalTypeTag');
  const modalLetterPair = document.getElementById('modalLetterPair');
  const modalEmojiBanner = document.getElementById('modalEmojiBanner');
  const modalWordMain = document.getElementById('modalWordMain');
  const modalDescBox = document.getElementById('modalDescBox');
  const modalExamplesGrid = document.getElementById('modalExamplesGrid');
  const modalSpeakBtn = document.getElementById('modalSpeakBtn');
  const modalTraceBtn = document.getElementById('modalTraceBtn');
  const modalPrevBtn = document.getElementById('modalPrevBtn');
  const modalNextBtn = document.getElementById('modalNextBtn');

  let currentModalLetter = null;

  function openLetterModal(item) {
    currentModalLetter = item;

    // Yangi o'rganilgan harf bo'lsa ro'yxatga qo'shish
    if (!state.learnedLetters.includes(item.id)) {
      state.learnedLetters.push(item.id);
      addStars(2, "yangi harf kashf qilindi");
      renderAlphabet(currentFilter);
    }

    modalTypeTag.textContent = item.type === 'unli' ? '🔴 Unli tovush' : item.type === 'undosh' ? '🔵 Undosh tovush' : '✨ Tutuq belgisi';
    modalTypeTag.className = `letter-type-tag ${item.type}`;

    modalLetterPair.textContent = `${item.upper} ${item.lower !== item.upper ? item.lower : ''}`;
    modalEmojiBanner.textContent = item.emoji;
    modalWordMain.textContent = item.word;
    modalDescBox.textContent = item.description;

    // Qo'shimcha so'zlar ro'yxati
    modalExamplesGrid.innerHTML = '';
    item.examples.forEach(ex => {
      const pill = document.createElement('div');
      pill.className = 'example-pill';
      pill.innerHTML = `<span>🔊</span> <span>${ex}</span>`;
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.soundEffects) window.soundEffects.playClick();
        if (window.speechEngine) window.speechEngine.speakWord(ex);
      });
      modalExamplesGrid.appendChild(pill);
    });

    letterModalOverlay.classList.add('active');
    letterModalOverlay.setAttribute('aria-hidden', 'false');

    // Avtomatik ovoz talaffuz
    if (window.soundEffects) window.soundEffects.playPop?.();
    if (window.speechEngine) {
      setTimeout(() => {
        window.speechEngine.speakLetter(item);
      }, 150);
    }
  }

  function closeLetterModal() {
    letterModalOverlay.classList.remove('active');
    letterModalOverlay.setAttribute('aria-hidden', 'true');
    if (window.soundEffects) window.soundEffects.playClick();
  }

  modalCloseBtn.addEventListener('click', closeLetterModal);
  letterModalOverlay.addEventListener('click', (e) => {
    if (e.target === letterModalOverlay) {
      closeLetterModal();
    }
  });

  modalSpeakBtn.addEventListener('click', () => {
    if (window.soundEffects) window.soundEffects.playClick();
    if (window.speechEngine && currentModalLetter) {
      window.speechEngine.speakLetter(currentModalLetter);
    }
  });

  modalTraceBtn.addEventListener('click', () => {
    if (currentModalLetter) {
      selectCanvasLetter(currentModalLetter);
      closeLetterModal();
      switchTab('tabQalam');
    }
  });

  modalPrevBtn.addEventListener('click', () => {
    if (!currentModalLetter) return;
    const currentIndex = ALPHABET_DATA.findIndex(i => i.id === currentModalLetter.id);
    const prevIndex = (currentIndex - 1 + ALPHABET_DATA.length) % ALPHABET_DATA.length;
    openLetterModal(ALPHABET_DATA[prevIndex]);
  });

  modalNextBtn.addEventListener('click', () => {
    if (!currentModalLetter) return;
    const currentIndex = ALPHABET_DATA.findIndex(i => i.id === currentModalLetter.id);
    const nextIndex = (currentIndex + 1) % ALPHABET_DATA.length;
    openLetterModal(ALPHABET_DATA[nextIndex]);
  });

  // =========================================================================
  // 8. 2-BO'LIM: O'YINLAR (VIKTORINA, XOTIRA, SO'Z TERISH)
  // =========================================================================
  const gameTabBtns = document.querySelectorAll('.game-tab-btn');
  const gameCardViews = document.querySelectorAll('.game-card-view');

  gameTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const gameType = btn.getAttribute('data-game');
      gameTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      gameCardViews.forEach(view => view.classList.remove('active'));

      if (gameType === 'quiz') {
        document.getElementById('gameQuizView').classList.add('active');
        if (currentQuizQuestion === null) generateQuizQuestion();
      } else if (gameType === 'memory') {
        document.getElementById('gameMemoryView').classList.add('active');
        if (memoryCards.length === 0) startNewMemoryGame();
      } else if (gameType === 'words') {
        document.getElementById('gameWordsView').classList.add('active');
        if (!currentWordTarget) loadNextWordBuilder();
      }

      if (window.soundEffects) window.soundEffects.playClick();
    });
  });

  // -------------------------------------------------------------------------
  // 8.1. VIKTORINA: "HARFNI TOP"
  // -------------------------------------------------------------------------
  const quizScore = document.getElementById('quizScore');
  const quizStreak = document.getElementById('quizStreak');
  const quizPromptText = document.getElementById('quizPromptText');
  const quizClueVisual = document.getElementById('quizClueVisual');
  const quizAudioHintBtn = document.getElementById('quizAudioHintBtn');
  const quizOptionsGrid = document.getElementById('quizOptionsGrid');

  let currentQuizQuestion = null;
  let isQuizAnswering = false;

  function generateQuizQuestion() {
    isQuizAnswering = false;
    quizScore.textContent = state.quizScore;
    quizStreak.textContent = `🔥 ${state.quizStreak}`;

    // Harflardan tasodifiy bittasini to'g'ri javob sifatida tanlash
    const pool = ALPHABET_DATA.filter(i => i.type !== 'belgi'); // Tutuq belgisidan tashqari
    const targetItem = pool[Math.floor(Math.random() * pool.length)];

    // 3 ta noto'g'ri variant tanlash
    const otherPool = pool.filter(i => i.id !== targetItem.id);
    const shuffledOthers = [...otherPool].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3);

    const options = [targetItem, ...distractors].sort(() => 0.5 - Math.random());

    // Savol turi (1: rasm orqali, 2: ovoz/harf orqali)
    const questionMode = Math.random() > 0.5 ? 'visual_word' : 'letter_sound';

    currentQuizQuestion = {
      target: targetItem,
      options: options,
      mode: questionMode
    };

    if (questionMode === 'visual_word') {
      quizPromptText.textContent = `"${targetItem.word}" qaysi harfdan boshlanadi?`;
      quizClueVisual.textContent = targetItem.emoji;
    } else {
      quizPromptText.textContent = `Tovushni tinglang: qaysi biri "${targetItem.upper}" harfi?`;
      quizClueVisual.textContent = '🔊';
      if (window.speechEngine) {
        setTimeout(() => {
          window.speechEngine.speak(`${targetItem.upper} harfini toping!`, { rate: 0.9 });
        }, 150);
      }
    }

    // Variant tugmalarini chiqarish
    quizOptionsGrid.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-btn';
      btn.textContent = `${opt.upper} ${opt.lower}`;
      btn.addEventListener('click', () => handleQuizAnswer(btn, opt));
      quizOptionsGrid.appendChild(btn);
    });
  }

  function handleQuizAnswer(btnElement, chosenItem) {
    if (isQuizAnswering || !currentQuizQuestion) return;
    isQuizAnswering = true;

    const isCorrect = chosenItem.id === currentQuizQuestion.target.id;

    if (isCorrect) {
      btnElement.classList.add('correct');
      if (window.soundEffects) window.soundEffects.playCorrect();

      state.quizScore += 10;
      state.quizStreak += 1;
      addStars(1, "to'g'ri javob");

      // Ketma-ket 3 tadan oshsa konfetti
      if (state.quizStreak >= 3) {
        triggerConfetti();
      }

      setTimeout(() => {
        generateQuizQuestion();
      }, 700);
    } else {
      btnElement.classList.add('wrong');
      if (window.soundEffects) window.soundEffects.playWrong();

      state.quizStreak = 0;
      quizStreak.textContent = `🔥 0`;

      // To'g'ri javobni ko'rsatib qo'yish
      const buttons = quizOptionsGrid.querySelectorAll('.quiz-btn');
      buttons.forEach(b => {
        if (b.textContent.includes(currentQuizQuestion.target.upper)) {
          b.classList.add('correct');
        }
      });

      setTimeout(() => {
        generateQuizQuestion();
      }, 1200);
    }

    saveState();
  }

  quizAudioHintBtn.addEventListener('click', () => {
    if (!currentQuizQuestion) return;
    if (window.soundEffects) window.soundEffects.playClick();
    if (window.speechEngine) {
      window.speechEngine.speakLetter(currentQuizQuestion.target);
    }
  });

  quizClueVisual.addEventListener('click', () => {
    if (!currentQuizQuestion) return;
    if (window.speechEngine) {
      window.speechEngine.speakWord(currentQuizQuestion.target.word);
    }
  });

  // -------------------------------------------------------------------------
  // 8.2. JUFTINI TOP: XOTIRA O'YINI (MEMORY MATCH)
  // -------------------------------------------------------------------------
  const memoryGrid = document.getElementById('memoryGrid');
  const memoryMoves = document.getElementById('memoryMoves');
  const memoryMatches = document.getElementById('memoryMatches');
  const restartMemoryBtn = document.getElementById('restartMemoryBtn');

  let memoryCards = [];
  let flippedCards = [];
  let movesCount = 0;
  let matchesCount = 0;
  let isMemoryLocked = false;

  function startNewMemoryGame() {
    if (!memoryGrid) return;
    memoryGrid.innerHTML = '';
    flippedCards = [];
    movesCount = 0;
    matchesCount = 0;
    isMemoryLocked = false;

    memoryMoves.textContent = movesCount;
    memoryMatches.textContent = `0 / 6 juft`;

    // Tasodifiy 6 ta harf tanlash
    const pool = ALPHABET_DATA.filter(i => i.type !== 'belgi');
    const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, 6);

    // 12 ta karta yaratish (6 ta harf kartasi + 6 ta so'z/rasm kartasi)
    const cardsDeck = [];
    selected.forEach((item, index) => {
      // 1-karta: Harf
      cardsDeck.push({
        pairId: index,
        type: 'letter',
        content: item.upper,
        sound: item.upper,
        item: item
      });
      // 2-karta: Rasm va so'z
      cardsDeck.push({
        pairId: index,
        type: 'picture',
        content: `${item.emoji} ${item.word}`,
        sound: item.word,
        item: item
      });
    });

    // Kartalarni aralashtirish
    cardsDeck.sort(() => 0.5 - Math.random());
    memoryCards = cardsDeck;

    // Dom elementlarini chiqarish
    cardsDeck.forEach((cardData, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-front">❓</div>
          <div class="memory-card-back">${cardData.content}</div>
        </div>
      `;

      cardEl.addEventListener('click', () => handleMemoryCardClick(cardEl, cardData));
      memoryGrid.appendChild(cardEl);
    });

    if (window.soundEffects) window.soundEffects.playPop?.();
  }

  function handleMemoryCardClick(cardEl, cardData) {
    if (isMemoryLocked) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    // Kartani ag'darish
    cardEl.classList.add('flipped');
    if (window.soundEffects) window.soundEffects.playFlip();
    if (window.speechEngine) window.speechEngine.speak(cardData.sound, { rate: 0.9 });

    flippedCards.push({ element: cardEl, data: cardData });

    if (flippedCards.length === 2) {
      movesCount++;
      memoryMoves.textContent = movesCount;
      checkMemoryPair();
    }
  }

  function checkMemoryPair() {
    isMemoryLocked = true;
    const [c1, c2] = flippedCards;

    if (c1.data.pairId === c2.data.pairId) {
      // Juftlik topildi!
      setTimeout(() => {
        c1.element.classList.add('matched');
        c2.element.classList.add('matched');
        if (window.soundEffects) window.soundEffects.playCorrect();

        matchesCount++;
        memoryMatches.textContent = `${matchesCount} / 6 juft`;
        flippedCards = [];
        isMemoryLocked = false;

        // O'yin g'alaba bilan tugadi
        if (matchesCount === 6) {
          state.memoryWins++;
          addStars(15, "xotira o'yini g'alabasi");
          if (window.soundEffects) window.soundEffects.playVictory();
          triggerConfetti();
          showToast("Ajoyib! Barcha juftliklarni topdingiz! 🎉", "🏆");
          saveState();
        }
      }, 400);
    } else {
      // Noto'g'ri juftlik, yopish
      setTimeout(() => {
        c1.element.classList.remove('flipped');
        c2.element.classList.remove('flipped');
        if (window.soundEffects) window.soundEffects.playWrong();
        flippedCards = [];
        isMemoryLocked = false;
      }, 900);
    }
  }

  restartMemoryBtn.addEventListener('click', () => {
    if (window.soundEffects) window.soundEffects.playClick();
    startNewMemoryGame();
  });

  // -------------------------------------------------------------------------
  // 8.3. SO'Z TERISH (WORD BUILDER)
  // -------------------------------------------------------------------------
  const wordBuilderVisual = document.getElementById('wordBuilderVisual');
  const wordTargetHint = document.getElementById('wordTargetHint');
  const wordSlotsContainer = document.getElementById('wordSlotsContainer');
  const wordLettersPool = document.getElementById('wordLettersPool');
  const wordsSolvedCount = document.getElementById('wordsSolvedCount');
  const skipWordBtn = document.getElementById('skipWordBtn');

  // Bolalar va o'rganuvchilar uchun qulay so'zlar ro'yxati
  const WORDS_LIST = [
    { word: "OLMA", emoji: "🍎", hint: "Mazali meva" },
    { word: "BALIQ", emoji: "🐟", hint: "Suvda suzadi" },
    { word: "NON", emoji: "🍞", hint: "Dasturxon ko'rki" },
    { word: "GUL", emoji: "🌸", hint: "Bahor hidi" },
    { word: "FIL", emoji: "🐘", hint: "Xartumli ulkan hayvon" },
    { word: "UZUM", emoji: "🍇", hint: "Shirin uzum" },
    { word: "KITOB", emoji: "📖", hint: "Bilim manbayi" },
    { word: "SHAR", emoji: "🎈", hint: "Uchuvchi pufak" },
    { word: "CHOY", emoji: "🫖", hint: "Issiq ichimlik" },
    { word: "SABZI", emoji: "🥕", hint: "Foydali sabzavot" },
    { word: "YULDUZ", emoji: "⭐", hint: "Tungi osmonda porlaydi" },
    { word: "RAKETA", emoji: "🚀", hint: "Koinotga uchadi" }
  ];

  let currentWordTarget = null;
  let currentPlacedLetters = []; // Foydalanuvchi joylashtirgan harflar

  function loadNextWordBuilder() {
    wordsSolvedCount.textContent = `${state.wordsSolved} ta so'z`;
    currentPlacedLetters = [];

    // Tasodifiy yangi so'z
    currentWordTarget = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
    wordBuilderVisual.textContent = currentWordTarget.emoji;
    wordTargetHint.textContent = `${currentWordTarget.word} (${currentWordTarget.hint})`;

    // Katakchalarni tayyorlash
    wordSlotsContainer.innerHTML = '';
    const letters = currentWordTarget.word.split('');
    letters.forEach((_, idx) => {
      const slot = document.createElement('div');
      slot.className = 'word-slot';
      slot.dataset.index = idx;
      slot.addEventListener('click', () => removePlacedLetter(idx));
      wordSlotsContainer.appendChild(slot);
    });

    // Harflar havzasini aralashtirish
    wordLettersPool.innerHTML = '';
    const shuffledLetters = [...letters].sort(() => 0.5 - Math.random());

    shuffledLetters.forEach((char, poolIndex) => {
      const btn = document.createElement('button');
      btn.className = 'scramble-letter-btn';
      btn.textContent = char;
      btn.dataset.poolId = poolIndex;
      btn.addEventListener('click', () => placeLetter(char, btn));
      wordLettersPool.appendChild(btn);
    });

    // Ovoz
    if (window.speechEngine) {
      setTimeout(() => {
        window.speechEngine.speakWord(currentWordTarget.word);
      }, 200);
    }
  }

  function placeLetter(char, buttonEl) {
    // Bo'sh turgan birinchi katakni topish
    const slots = wordSlotsContainer.querySelectorAll('.word-slot');
    let emptyIndex = -1;
    for (let i = 0; i < slots.length; i++) {
      if (!slots[i].textContent) {
        emptyIndex = i;
        break;
      }
    }

    if (emptyIndex === -1) return; // Hammasi to'lgan

    if (window.soundEffects) window.soundEffects.playClick();
    if (window.speechEngine) window.speechEngine.speak(char, { rate: 0.95 });

    buttonEl.classList.add('used');
    slots[emptyIndex].textContent = char;
    slots[emptyIndex].classList.add('filled');
    slots[emptyIndex].dataset.fromPool = buttonEl.dataset.poolId;

    currentPlacedLetters[emptyIndex] = char;

    // Agar so'z to'liq terilgan bo'lsa, tekshirish
    if (currentPlacedLetters.length === currentWordTarget.word.length && !currentPlacedLetters.includes(undefined)) {
      checkCompletedWord();
    }
  }

  function removePlacedLetter(slotIndex) {
    const slots = wordSlotsContainer.querySelectorAll('.word-slot');
    const slot = slots[slotIndex];
    if (!slot || !slot.textContent) return;

    const poolId = slot.dataset.fromPool;
    if (poolId !== undefined) {
      const poolBtn = wordLettersPool.querySelector(`[data-pool-id="${poolId}"]`);
      if (poolBtn) poolBtn.classList.remove('used');
    }

    slot.textContent = '';
    slot.classList.remove('filled');
    delete slot.dataset.fromPool;
    currentPlacedLetters[slotIndex] = undefined;
    if (window.soundEffects) window.soundEffects.playClick();
  }

  function checkCompletedWord() {
    const constructed = currentPlacedLetters.join('');
    const slots = wordSlotsContainer.querySelectorAll('.word-slot');

    if (constructed === currentWordTarget.word) {
      // To'g'ri terildi!
      if (window.soundEffects) window.soundEffects.playCorrect();
      if (window.speechEngine) window.speechEngine.speakWord(currentWordTarget.word);

      slots.forEach(s => {
        s.style.backgroundColor = 'var(--success)';
        s.style.borderColor = 'var(--success)';
      });

      state.wordsSolved++;
      addStars(10, `"${currentWordTarget.word}" so'zi to'g'ri terildi`);
      triggerConfetti();

      setTimeout(() => {
        loadNextWordBuilder();
      }, 1200);
    } else {
      // Xato bo'lsa
      if (window.soundEffects) window.soundEffects.playWrong();
      slots.forEach(s => {
        s.style.backgroundColor = 'var(--danger)';
        s.style.borderColor = 'var(--danger)';
      });

      showToast("Qaytadan urinib ko'ring!", "❌");

      setTimeout(() => {
        slots.forEach((s, idx) => {
          s.style.backgroundColor = '';
          s.style.borderColor = '';
          removePlacedLetter(idx);
        });
      }, 800);
    }
  }

  skipWordBtn.addEventListener('click', () => {
    if (window.soundEffects) window.soundEffects.playClick();
    loadNextWordBuilder();
  });

  // =========================================================================
  // 9. 3-BO'LIM: SEHRLI QALAM (CANVAS LETTER TRACING)
  // =========================================================================
  const tracingCanvas = document.getElementById('tracingCanvas');
  const canvasCtx = tracingCanvas ? tracingCanvas.getContext('2d') : null;
  const currentCanvasLetterDisplay = document.getElementById('currentCanvasLetterDisplay');
  const speakCanvasLetterBtn = document.getElementById('speakCanvasLetterBtn');
  const clearCanvasBtn = document.getElementById('clearCanvasBtn');
  const checkCanvasBtn = document.getElementById('checkCanvasBtn');
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const quickLetterScroll = document.getElementById('quickLetterScroll');

  let activeCanvasLetter = ALPHABET_DATA[0]; // Boshlang'ich 'A' harfi
  let isDrawing = false;
  let currentColor = '#4f46e5';
  let brushSize = 14;

  // Harflar karuselini to'ldirish
  function initQuickLetterScroll() {
    if (!quickLetterScroll) return;
    quickLetterScroll.innerHTML = '';
    ALPHABET_DATA.forEach(item => {
      const btn = document.createElement('button');
      btn.className = `quick-letter-btn ${item.id === activeCanvasLetter.id ? 'active' : ''}`;
      btn.textContent = item.upper;
      btn.dataset.id = item.id;
      btn.addEventListener('click', () => {
        selectCanvasLetter(item);
      });
      quickLetterScroll.appendChild(btn);
    });
  }

  function selectCanvasLetter(item) {
    activeCanvasLetter = item;
    if (currentCanvasLetterDisplay) {
      currentCanvasLetterDisplay.textContent = `${item.upper} ${item.lower !== item.upper ? item.lower : ''}`;
    }

    // Karuseldagi faol tugmani yangilash
    const btns = quickLetterScroll.querySelectorAll('.quick-letter-btn');
    btns.forEach(b => {
      if (b.dataset.id === item.id) {
        b.classList.add('active');
        b.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      } else {
        b.classList.remove('active');
      }
    });

    clearCanvasAndRedraw();
    if (window.soundEffects) window.soundEffects.playClick();
    if (window.speechEngine) window.speechEngine.speakLetter(item);
  }

  function resizeCanvas() {
    if (!tracingCanvas) return;
    const rect = tracingCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    tracingCanvas.width = rect.width * dpr;
    tracingCanvas.height = 290 * dpr;
    tracingCanvas.style.width = `${rect.width}px`;
    tracingCanvas.style.height = `290px`;

    if (canvasCtx) {
      canvasCtx.scale(dpr, dpr);
      canvasCtx.lineCap = 'round';
      canvasCtx.lineJoin = 'round';
    }
  }

  // Harf andozasini chizish (Dashed guide letter)
  function drawLetterGuide() {
    if (!canvasCtx || !tracingCanvas) return;
    const width = parseFloat(tracingCanvas.style.width) || 350;
    const height = 290;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, width, height);

    // Fon to'ri yoki yozuv chiziqlari (Husnixat daftari kabi)
    canvasCtx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
    canvasCtx.lineWidth = 1;

    // Yuqori va pastki yo'naltiruvchi chiziqlar
    canvasCtx.beginPath();
    canvasCtx.moveTo(20, height * 0.25);
    canvasCtx.lineTo(width - 20, height * 0.25);
    canvasCtx.moveTo(20, height * 0.5);
    canvasCtx.lineTo(width - 20, height * 0.5);
    canvasCtx.moveTo(20, height * 0.78);
    canvasCtx.lineTo(width - 20, height * 0.78);
    canvasCtx.stroke();

    // Namuna harfni chizish
    canvasCtx.font = `bold 140px ${getComputedStyle(document.body).fontFamily}`;
    canvasCtx.textAlign = 'center';
    canvasCtx.textBaseline = 'middle';

    // Ichki rang va chegaralangan qora chiziq
    canvasCtx.fillStyle = 'rgba(226, 232, 240, 0.65)';
    canvasCtx.fillText(activeCanvasLetter.upper, width / 2, height / 2 + 5);

    canvasCtx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    canvasCtx.lineWidth = 2.5;
    canvasCtx.setLineDash([6, 6]);
    canvasCtx.strokeText(activeCanvasLetter.upper, width / 2, height / 2 + 5);

    canvasCtx.restore();
  }

  function clearCanvasAndRedraw() {
    drawLetterGuide();
  }

  // Chizish hodisalari (Touch & Pointer events)
  function getCanvasCoords(e) {
    const rect = tracingCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    isDrawing = true;
    const { x, y } = getCanvasCoords(e);
    canvasCtx.beginPath();
    canvasCtx.moveTo(x, y);
    canvasCtx.strokeStyle = currentColor;
    canvasCtx.lineWidth = brushSize;
    canvasCtx.lineCap = 'round';
    canvasCtx.setLineDash([]);
  }

  function drawStroke(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    canvasCtx.lineTo(x, y);
    canvasCtx.stroke();
  }

  function stopDrawing() {
    if (isDrawing) {
      canvasCtx.closePath();
      isDrawing = false;
    }
  }

  if (tracingCanvas) {
    // Sichqoncha
    tracingCanvas.addEventListener('mousedown', startDrawing);
    tracingCanvas.addEventListener('mousemove', drawStroke);
    window.addEventListener('mouseup', stopDrawing);

    // Sensorli ekranlar (Mobil telefonlar uchun)
    tracingCanvas.addEventListener('touchstart', startDrawing, { passive: false });
    tracingCanvas.addEventListener('touchmove', drawStroke, { passive: false });
    window.addEventListener('touchend', stopDrawing);
  }

  // Rang tanlash
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      currentColor = swatch.getAttribute('data-color');
      if (window.soundEffects) window.soundEffects.playClick();
    });
  });

  clearCanvasBtn.addEventListener('click', () => {
    if (window.soundEffects) window.soundEffects.playClick();
    clearCanvasAndRedraw();
  });

  checkCanvasBtn.addEventListener('click', () => {
    state.canvasTracedCount++;
    addStars(5, `"${activeCanvasLetter.upper}" harfi muvaffaqiyatli chizildi!`);
    if (window.soundEffects) window.soundEffects.playVictory();
    triggerConfetti();
    showToast("Ofarin! Judayam chiroyli yozdingiz! 🌟", "🎉");
  });

  speakCanvasLetterBtn.addEventListener('click', () => {
    if (window.soundEffects) window.soundEffects.playClick();
    if (window.speechEngine && activeCanvasLetter) {
      window.speechEngine.speakLetter(activeCanvasLetter);
    }
  });

  // =========================================================================
  // 10. 4-BO'LIM: YUTUQLAR RO'YXATI VA SOZLAMALAR
  // =========================================================================
  const badgesContainer = document.getElementById('badgesContainer');
  const resetProgressBtn = document.getElementById('resetProgressBtn');

  function renderBadgesList() {
    if (!badgesContainer) return;
    badgesContainer.innerHTML = '';

    BADGES.forEach(badge => {
      const isUnlocked = state.unlockedBadges.includes(badge.id);
      const item = document.createElement('div');
      item.className = `badge-item ${isUnlocked ? 'unlocked' : 'locked'}`;

      item.innerHTML = `
        <div class="badge-icon">${badge.icon}</div>
        <div class="badge-info">
          <div class="badge-title">${badge.title}</div>
          <div class="badge-desc">${badge.desc}</div>
        </div>
        <div class="badge-status">${isUnlocked ? '✅' : '🔒'}</div>
      `;

      badgesContainer.appendChild(item);
    });
  }

  resetProgressBtn.addEventListener('click', () => {
    const confirmReset = window.confirm("Rostdan ham barcha to'plangan yulduzlar va natijalarni qayta boshlamoqchimisiz?");
    if (confirmReset) {
      state.learnedLetters = [];
      state.stars = 0;
      state.quizScore = 0;
      state.quizStreak = 0;
      state.wordsSolved = 0;
      state.memoryWins = 0;
      state.canvasTracedCount = 0;
      state.unlockedBadges = [];
      saveState();
      renderAlphabet(currentFilter);
      showToast("Natijalar muvaffaqiyatli qayta boshlandi!", "🔄");
    }
  });

  // =========================================================================
  // 11. OVOZ VA TUN/KUN REJIMI (THEME & SOUND)
  // =========================================================================
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');

  function applyTheme(isDark) {
    if (isDark) {
      document.body.classList.add('dark-mode');
      if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
    } else {
      document.body.classList.remove('dark-mode');
      if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
    }
  }

  function applyMute(isMuted) {
    if (window.soundEffects) {
      window.soundEffects.muted = isMuted;
    }
    if (soundToggleBtn) {
      soundToggleBtn.textContent = isMuted ? '🔇' : '🔊';
    }
  }

  soundToggleBtn.addEventListener('click', () => {
    state.isMuted = !state.isMuted;
    applyMute(state.isMuted);
    saveState();
    if (!state.isMuted && window.soundEffects) {
      window.soundEffects.playClick();
    }
  });

  themeToggleBtn.addEventListener('click', () => {
    state.isDark = !state.isDark;
    applyTheme(state.isDark);
    saveState();
    if (window.soundEffects) window.soundEffects.playClick();
  });

  // =========================================================================
  // 12. KONFETTI BAYRAMI (CONFETTI PARTICLE ENGINE)
  // =========================================================================
  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let confettiParticles = [];
  let confettiAnimationId = null;

  function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  window.addEventListener('resize', () => {
    resizeConfettiCanvas();
    resizeCanvas();
    drawLetterGuide();
  });

  function triggerConfetti(count = 70) {
    if (!confettiCanvas || !confettiCtx) return;
    resizeConfettiCanvas();

    const colors = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];

    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 80,
        y: window.innerHeight * 0.4 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (!confettiAnimationId) {
      updateConfetti();
    }
  }

  function updateConfetti() {
    if (!confettiCtx || confettiParticles.length === 0) {
      confettiAnimationId = null;
      if (confettiCtx) confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      return;
    }

    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravitatsiya
      p.vx *= 0.98; // Qarshilik
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.012;

      if (p.opacity <= 0 || p.y > window.innerHeight) {
        confettiParticles.splice(i, 1);
        continue;
      }

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.globalAlpha = Math.max(0, p.opacity);
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    }

    confettiAnimationId = requestAnimationFrame(updateConfetti);
  }

  // =========================================================================
  // 13. ILOVA BOSHLANISHI (INIT)
  // =========================================================================
  function initApp() {
    loadState();
    applyTheme(state.isDark);
    applyMute(state.isMuted);

    renderAlphabet('all');
    initQuickLetterScroll();
    updateGlobalUI();

    // Dastlabki kanvas o'lchami
    setTimeout(() => {
      resizeCanvas();
      drawLetterGuide();
    }, 200);

    console.log("Alifbe.uz muvaffaqiyatli ishga tushirildi!");
  }

  initApp();
});
