// Data struktur yang menyimpan maklumat setiap kad vocab huruf vokal.
const vocalData = {
  A: [
    { word: 'ayam', syllables: 'a + yam', image: 'images/ayam.svg', alt: 'Ayam kartun berwarna merah jambu' },
    { word: 'apel', syllables: 'a + pel', image: 'images/apel.svg', alt: 'Buah epal merah bergaya kartun' },
    { word: 'arnab', syllables: 'ar + nab', image: 'images/arnab.svg', alt: 'Arnab comel berwarna kuning' },
  ],
  E: [
    { word: 'epal', syllables: 'e + pal', image: 'images/epal.svg', alt: 'Buah epal hijau' },
    { word: 'emas', syllables: 'e + mas', image: 'images/emas.svg', alt: 'Hiasan emas bersinar' },
    { word: 'elok', syllables: 'e + lok', image: 'images/elok.svg', alt: 'Lencana senyuman bertulisan elok' },
  ],
  I: [
    { word: 'ikan', syllables: 'i + kan', image: 'images/ikan.svg', alt: 'Ikan biru dalam gaya kartun' },
    { word: 'itik', syllables: 'i + tik', image: 'images/itik.svg', alt: 'Itik berwarna merah jambu' },
    { word: 'ilah', syllables: 'i + lah', image: 'images/ilah.svg', alt: 'Kad bertulis Ilah' },
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

const quizSection = document.getElementById('quiz');
const quizTrigger = document.getElementById('quizTrigger');
const quizClose = document.getElementById('quizClose');
const quizImage = document.getElementById('quizImage');
const quizWord = document.getElementById('quizWord');
const quizFeedback = document.getElementById('quizFeedback');
const nextQuestionButton = document.getElementById('nextQuestion');
const quizOptions = Array.from(document.querySelectorAll('.quiz-option'));

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

  card.append(figure, button);
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
    quizFeedback.textContent = isCorrect
      ? 'Tahniah! Jawapan kamu betul.'
      : `Cuba lagi! Huruf yang betul ialah ${currentQuestion.letter}.`;

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
} else {
  populateCards();
}
