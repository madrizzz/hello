// Data struktur yang menyimpan maklumat setiap kad vocab huruf vokal.
const vocalData = {
  A: [
    { word: 'ayam', syllables: 'a + yam', image: 'images/ayam.svg', alt: 'Ayam kartun berwarna merah jambu' },
    { word: 'api', syllables: 'a + pi', image: 'images/api.svg', alt: 'Nyalaan api kartun berwarna jingga' },
    { word: 'anak', syllables: 'a + nak', image: 'images/anak.svg', alt: 'Kanak-kanak kecil tersenyum lebar' },
  ],
  E: [
    { word: 'epal', syllables: 'e + pal', image: 'images/epal.svg', alt: 'Buah epal hijau dalam gaya kartun' },
    { word: 'emas', syllables: 'e + mas', image: 'images/emas.svg', alt: 'Lencana emas berkilau' },
    { word: 'ekor', syllables: 'e + kor', image: 'images/ekor.svg', alt: 'Ekor kucing kartun berjalur' },
  ],
  I: [
    { word: 'ikan', syllables: 'i + kan', image: 'images/ikan.svg', alt: 'Ikan biru dalam gaya kartun' },
    { word: 'itik', syllables: 'i + tik', image: 'images/itik.svg', alt: 'Itik berwarna merah jambu' },
    { word: 'ibu', syllables: 'i + bu', image: 'images/ibu.svg', alt: 'Ibu memeluk anak kecil' },
  ],
  O: [
    { word: 'oren', syllables: 'o + ren', image: 'images/oren.svg', alt: 'Buah oren berwarna terang' },
    { word: 'obor', syllables: 'o + bor', image: 'images/obor.svg', alt: 'Obor dengan api kecil' },
    { word: 'otak', syllables: 'o + tak', image: 'images/otak.svg', alt: 'Ilustrasi otak berwarna kuning' },
  ],
  U: [
    { word: 'ular', syllables: 'u + lar', image: 'images/ular.svg', alt: 'Ular hijau tersenyum' },
    { word: 'udang', syllables: 'u + dang', image: 'images/udang.svg', alt: 'Udang biru kartun' },
    { word: 'ubi', syllables: 'u + bi', image: 'images/ubi.svg', alt: 'Ubi keledek berwarna biru' },
  ],
};

const musicToggle = document.getElementById('musicToggle');
const musicStatus = document.getElementById('musicStatus');

const quizSection = document.getElementById('quiz');
const quizTrigger = document.getElementById('quizTrigger');
const quizClose = document.getElementById('quizClose');
const quizImage = document.getElementById('quizImage');
const quizWord = document.getElementById('quizWord');
const quizFeedback = document.getElementById('quizFeedback');
const nextQuestionButton = document.getElementById('nextQuestion');
const quizOptions = Array.from(document.querySelectorAll('.quiz-option'));

// Pastikan setiap butang kuiz ada label jelas untuk pembaca skrin.
quizOptions.forEach((button) => {
  button.setAttribute('aria-label', `Pilih huruf ${button.dataset.answer}`);
});

/**
 * Pemain muzik latar menggunakan Web Audio API untuk menghasilkan melodi ceria.
 */
class BackgroundMusic {
  constructor(statusElement) {
    this.statusElement = statusElement;
    this.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.isSupported = Boolean(this.AudioContext);
    this.context = null;
    this.masterGain = null;
    this.loopTimer = null;
    this.isPlaying = false;

    if (!this.isSupported) {
      this.updateStatus('Pelayar ini tidak menyokong muzik latar.');
    }
  }

  updateStatus(message) {
    if (this.statusElement) {
      this.statusElement.textContent = message;
    }
  }

  async ensureContext() {
    if (!this.isSupported) {
      throw new Error('Web Audio API tidak disokong.');
    }

    if (!this.context) {
      this.context = new this.AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.18;
      this.masterGain.connect(this.context.destination);
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  playNote(frequency, startTime, duration, peakVolume = 0.22) {
    if (!this.context || !this.masterGain) {
      return;
    }

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakVolume, startTime + 0.06);
    gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.05);
  }

  schedulePattern(startTime) {
    const beat = 0.55;
    const melody = [
      { freq: 523.25, duration: 0.45 }, // C5
      { freq: 659.25, duration: 0.45 }, // E5
      { freq: 783.99, duration: 0.45 }, // G5
      { freq: 659.25, duration: 0.45 },
      { freq: 587.33, duration: 0.45 }, // D5
      { freq: 659.25, duration: 0.45 },
      { freq: 523.25, duration: 0.65 },
      { freq: 392.0, duration: 0.6 },
    ];

    melody.forEach((note, index) => {
      this.playNote(note.freq, startTime + index * beat, note.duration);
    });

    const chimeStart = startTime + melody.length * beat;
    this.playNote(659.25, chimeStart, 0.35, 0.18);
    this.playNote(880.0, chimeStart + 0.22, 0.4, 0.16);

    return chimeStart + 0.9;
  }

  loop() {
    if (!this.context || !this.isPlaying) {
      return;
    }

    const now = this.context.currentTime + 0.05;
    const nextEndTime = this.schedulePattern(now);
    const delay = Math.max(0, nextEndTime - this.context.currentTime - 0.1) * 1000;
    this.loopTimer = window.setTimeout(() => this.loop(), delay);
  }

  async start() {
    if (this.isPlaying) {
      return;
    }

    await this.ensureContext();
    this.isPlaying = true;
    this.updateStatus('Muzik latar dimainkan lembut.');
    this.loop();
  }

  stop({ silent = false } = {}) {
    if (!this.context) {
      return;
    }

    this.isPlaying = false;
    if (this.loopTimer) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }

    if (this.context.state === 'running') {
      this.context.suspend();
    }

    if (!silent) {
      this.updateStatus('Muzik latar dihentikan. Tekan butang untuk menyambung.');
    }
  }
}

const backgroundMusic = new BackgroundMusic(musicStatus);
let resumeMusicAfterHide = false;

// Jika pelayar tidak menyokong Web Audio, lumpuhkan butang muzik dan paparkan mesej.
if (musicToggle && !backgroundMusic.isSupported) {
  musicToggle.disabled = true;
  musicToggle.classList.add('music-toggle--disabled');
  musicToggle.textContent = 'Muzik tidak disokong';
}

/**
 * Mengemas kini keadaan visual dan aksesibiliti untuk butang muzik.
 */
function setMusicButtonState(isPlaying) {
  if (!musicToggle) {
    return;
  }

  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicToggle.textContent = isPlaying ? 'Hentikan Muzik' : 'Mainkan Muzik';
}

/**
 * Cuba memulakan muzik latar dan urus mesej status jika pelayar menyekat.
 */
async function attemptStartMusic({ auto = false } = {}) {
  if (!musicToggle || !backgroundMusic.isSupported) {
    return;
  }

  try {
    await backgroundMusic.start();
    setMusicButtonState(true);
  } catch (error) {
    setMusicButtonState(false);
    const message = auto
      ? 'Klik butang “Mainkan Muzik” untuk memulakan melodi ceria.'
      : 'Muzik tidak dapat dimulakan. Cuba tekan butang sekali lagi.';
    backgroundMusic.updateStatus(message);
  }
}

if (musicToggle) {
  musicToggle.addEventListener('click', () => {
    if (!backgroundMusic.isSupported) {
      backgroundMusic.updateStatus('Muzik latar tidak tersedia pada pelayar ini.');
      return;
    }

    if (backgroundMusic.isPlaying) {
      backgroundMusic.stop();
      setMusicButtonState(false);
    } else {
      attemptStartMusic();
    }
  });
}

document.addEventListener(
  'pointerdown',
  () => {
    attemptStartMusic({ auto: true });
  },
  { once: true },
);

// Hentikan muzik apabila tab tidak aktif dan sambung semula jika pengguna kembali.
document.addEventListener('visibilitychange', () => {
  if (!backgroundMusic.isSupported) {
    return;
  }

  if (document.visibilityState === 'hidden') {
    resumeMusicAfterHide = backgroundMusic.isPlaying;
    if (backgroundMusic.isPlaying) {
      backgroundMusic.stop({ silent: true });
      setMusicButtonState(false);
    }
  } else if (resumeMusicAfterHide) {
    attemptStartMusic({ auto: true });
    resumeMusicAfterHide = false;
  }
});

let currentQuestion = null;
let lastFocusedElement = null;
let scrollPosition = 0;

/**
 * Membina elemen kad perkataan lengkap dengan imej, teks dan sebutan digital.
 */
function createCard(letter, item) {
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('data-word', item.word);
  card.setAttribute('data-letter', letter);

  const badge = document.createElement('span');
  badge.className = 'card-letter';
  badge.textContent = letter;

  const figure = document.createElement('figure');
  figure.className = 'card-figure';

  const image = document.createElement('img');
  image.src = item.image;
  image.alt = item.alt;

  const caption = document.createElement('figcaption');
  caption.className = 'card-caption';

  const wordTitle = document.createElement('span');
  wordTitle.className = 'card-word';
  wordTitle.textContent = item.word.toUpperCase();

  const syllableText = document.createElement('span');
  syllableText.className = 'card-syllables';
  syllableText.textContent = item.syllables;

  caption.append(wordTitle, syllableText);
  figure.append(image, caption);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'card-audio';
  button.textContent = 'Dengar';
  button.setAttribute('aria-label', `Dengar sebutan ${item.word}`);

  button.addEventListener('click', () => {
    stopAllSpeech();
    speakWord(item.word, button);
  });

  card.append(badge, figure, button);
  return card;
}

/**
 * Mengisi setiap grid kad berdasarkan atribut data huruf.
 */
function populateCards() {
  const grids = document.querySelectorAll('.card-grid[data-letter]');
  grids.forEach((grid) => {
    const letter = grid.dataset.letter;
    const items = vocalData[letter];
    if (!items) return;

    grid.textContent = '';
    items.forEach((item) => {
      const card = createCard(letter, item);
      grid.appendChild(card);
    });
  });
}

/**
 * Menghentikan semua sebutan agar tidak bertindih antara satu sama lain.
 */
function stopAllSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

let speechWarningShown = false;

/**
 * Menyebutkan perkataan menggunakan Web Speech API.
 */
function speakWord(word, buttonToRefocus) {
  if (!('speechSynthesis' in window)) {
    if (!speechWarningShown) {
      speechWarningShown = true;
      alert('Ciri sebutan suara tidak disokong dalam pelayar ini.');
    }
    return;
  }

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'ms-MY';
  utterance.rate = 0.9;
  utterance.pitch = 1;

  if (buttonToRefocus) {
    utterance.onend = () => {
      buttonToRefocus.focus();
    };
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Memilih soalan kuiz secara rawak dan mengemas kini paparan.
 */
function loadRandomQuestion() {
  const letters = Object.keys(vocalData);
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const words = vocalData[randomLetter];
  const randomWord = words[Math.floor(Math.random() * words.length)];

  currentQuestion = {
    letter: randomLetter,
    ...randomWord,
  };

  quizImage.src = randomWord.image;
  quizImage.alt = randomWord.alt;
  quizWord.textContent = randomWord.word.toUpperCase();
  quizFeedback.textContent = '';
  quizOptions.forEach((button) => {
    button.disabled = false;
    button.classList.remove('is-correct', 'is-wrong');
  });
  nextQuestionButton.disabled = true;
  stopAllSpeech();
}

/**
 * Mendapatkan elemen boleh fokus di dalam tetingkap kuiz.
 */
function getFocusableQuizElements() {
  return Array.from(
    quizSection.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.disabled && el.offsetParent !== null);
}

/**
 * Mengendalikan kitaran fokus agar kekal dalam tetingkap kuiz.
 */
function handleQuizKeydown(event) {
  if (event.key !== 'Tab') {
    return;
  }

  const focusable = getFocusableQuizElements();
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Membuka tetingkap kuiz dan menyimpan elemen fokus terakhir.
 */
function openQuiz() {
  lastFocusedElement = document.activeElement;
  scrollPosition = window.scrollY;
  document.body.style.top = `-${scrollPosition}px`;
  document.body.classList.add('no-scroll');

  quizSection.hidden = false;
  quizSection.setAttribute('aria-hidden', 'false');
  loadRandomQuestion();
  const focusable = getFocusableQuizElements();
  const initialFocus = focusable[0] || quizSection;
  initialFocus.focus();
}

/**
 * Menutup tetingkap kuiz dan memulihkan fokus.
 */
function closeQuiz() {
  quizSection.hidden = true;
  quizSection.setAttribute('aria-hidden', 'true');
  quizFeedback.textContent = '';
  stopAllSpeech();

  document.body.classList.remove('no-scroll');
  document.body.style.top = '';
  window.scrollTo(0, scrollPosition);

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

// Listener untuk butang kuiz utama.
quizTrigger.addEventListener('click', () => {
  openQuiz();
});

// Listener untuk menutup kuiz.
quizClose.addEventListener('click', () => {
  closeQuiz();
});

// Benarkan ESC menutup kuiz untuk kemudahan papan kekunci.
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !quizSection.hidden) {
    closeQuiz();
  }
});

// Pastikan fokus kekal di dalam tetingkap kuiz.
quizSection.addEventListener('keydown', handleQuizKeydown);

// Benarkan klik latar menyahaktifkan kuiz.
quizSection.addEventListener('click', (event) => {
  if (event.target === quizSection) {
    closeQuiz();
  }
});

// Interaksi pilihan jawapan kuiz.
quizOptions.forEach((button) => {
  button.addEventListener('click', () => {
    if (!currentQuestion) return;

    const isCorrect = button.dataset.answer === currentQuestion.letter;
    const uppercaseWord = currentQuestion.word.toUpperCase();
    quizFeedback.textContent = isCorrect
      ? `Hebat! Huruf ${currentQuestion.letter} untuk ${uppercaseWord} adalah betul.`
      : `Cuba lagi! Huruf yang betul ialah ${currentQuestion.letter} untuk ${uppercaseWord}.`;

    quizOptions.forEach((option) => {
      option.disabled = true;
      const correct = option.dataset.answer === currentQuestion.letter;
      option.classList.toggle('is-correct', correct);
      option.classList.toggle('is-wrong', !correct);
    });

    nextQuestionButton.disabled = false;
    nextQuestionButton.focus();
  });
});

// Muatkan soalan baharu apabila pengguna menekan butang seterusnya.
nextQuestionButton.addEventListener('click', () => {
  loadRandomQuestion();
  const focusable = getFocusableQuizElements();
  const firstOption = focusable.find((el) => el.classList.contains('quiz-option'));
  if (firstOption) {
    firstOption.focus();
  }
});

// Bina kandungan kad selepas DOM sedia. Jika DOM sudah siap, panggil serta-merta.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', populateCards);
  document.addEventListener('DOMContentLoaded', () => {
    attemptStartMusic({ auto: true });
  });
} else {
  populateCards();
  attemptStartMusic({ auto: true });
}
