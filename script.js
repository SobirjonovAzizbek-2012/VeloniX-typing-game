// ==========================================
// TELEGRAM BOT CONFIGURATION (SHU YERGA KIRITING)
// ==========================================
const TELEGRAM_BOT_TOKEN = "8889353569:AAGjiRmXYtDcygpexDGrTKMmFqA7G3SCvB0"; 
const TELEGRAM_CHAT_ID = "8651543732";

const DICTIONARIES = {
    words: [
        "dasturlash", "tizim", "kelajak", "mantiq", "harakat", "tajriba", "bilim",
        "algoritm", "natija", "kompyuter", "muvaffaqiyat", "loyiha", "tezlik", "rivojlanish",
        "tahlil", "kodlash", "interfeys", "xavfsizlik", "imkoniyat", "jarayon", "yechim"
    ],
    numbers: ["1024", "404", "8080", "2026", "31415", "127001", "999", "777", "500", "42"],
    punct: ["console.log();", "if(x > 0)", "array.map()", "VeloniX#1", "user@domain.uz", "{ status: 200 }"]
};

let currentMode = 'words';
let maxTime = 30;
let timer = maxTime;
let timerInterval = null;
let isPlaying = false;

let currentWordsList = [];
let currentWordIdx = 0;
let currentLetterIdx = 0;
let correctLetters = 0;
let errorLetters = 0;
let totalTyped = 0;

// DOM Elements
const wordsWrapper = document.getElementById('words-wrapper');
const hiddenInput = document.getElementById('hidden-input');
const smoothCaret = document.getElementById('smooth-caret');
const timerDisplay = document.getElementById('timer-display');
const liveWpm = document.getElementById('live-wpm');
const liveAcc = document.getElementById('live-acc');
const typingArea = document.getElementById('typing-area');
const focusOverlay = document.getElementById('focus-overlay');

const resultModal = document.getElementById('result-modal');
const resStatus = document.getElementById('res-status');
const nextRoundBtn = document.getElementById('next-round-btn');
const repeatRoundBtn = document.getElementById('repeat-round-btn');

// Report Modal DOM Elements
const reportModal = document.getElementById('report-modal');
const openReportBtn = document.getElementById('open-report-btn');
const closeReportBtn = document.getElementById('close-report-btn');
const reportForm = document.getElementById('report-form');
const reportStatus = document.getElementById('report-status');

function initGame(generateNewWords = true) {
    clearInterval(timerInterval);
    timer = maxTime;
    timerDisplay.innerText = timer;
    isPlaying = false;

    currentWordIdx = 0;
    currentLetterIdx = 0;
    correctLetters = 0;
    errorLetters = 0;
    totalTyped = 0;

    liveWpm.innerText = '0';
    liveAcc.innerText = '100%';
    hiddenInput.value = '';
    wordsWrapper.style.transform = 'translateY(0px)';

    resultModal.classList.add('hidden');
    focusOverlay.classList.add('hidden');

    if (generateNewWords || currentWordsList.length === 0) {
        generateWordsList();
    }

    renderWords();
    updateCaret();
    hiddenInput.focus();
}

function generateWordsList() {
    currentWordsList = [];
    const pool = DICTIONARIES[currentMode];
    for (let i = 0; i < 60; i++) {
        currentWordsList.push(pool[Math.floor(Math.random() * pool.length)]);
    }
}

function renderWords() {
    wordsWrapper.innerHTML = '<div id="smooth-caret"></div>';
    currentWordsList.forEach(wordStr => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';

        wordStr.split('').forEach(char => {
            const letterSpan = document.createElement('span');
            letterSpan.className = 'letter';
            letterSpan.innerText = char;
            wordDiv.appendChild(letterSpan);
        });

        wordsWrapper.appendChild(wordDiv);
    });
}

// Fixed Caret Calculation Logic
function updateCaret() {
    const caretNode = document.getElementById('smooth-caret');
    const words = wordsWrapper.querySelectorAll('.word');
    
    if (words[currentWordIdx]) {
        const letters = words[currentWordIdx].querySelectorAll('.letter');
        let targetLetter = letters[currentLetterIdx];

        let x = 0, y = 0;
        if (targetLetter) {
            x = targetLetter.offsetLeft;
            y = targetLetter.offsetTop;
        } else if (letters.length > 0) {
            const lastLetter = letters[letters.length - 1];
            x = lastLetter.offsetLeft + lastLetter.offsetWidth;
            y = lastLetter.offsetTop;
        } else {
            x = words[currentWordIdx].offsetLeft;
            y = words[currentWordIdx].offsetTop;
        }

        caretNode.style.transform = `translate3d(${x}px, ${y}px, 0)`;

        // Vertical Line Scroll
        const wordTop = words[currentWordIdx].offsetTop;
        if (wordTop > 40) {
            wordsWrapper.style.transform = `translateY(-${wordTop - 5}px)`;
        } else {
            wordsWrapper.style.transform = 'translateY(0px)';
        }
    }
}

function updateLiveStats() {
    const timePassed = maxTime - timer;
    if (timePassed > 0) {
        const minutes = timePassed / 60;
        const wpm = Math.round((correctLetters / 5) / minutes);
        liveWpm.innerText = wpm || 0;
    }
    const acc = totalTyped > 0 ? Math.round((correctLetters / totalTyped) * 100) : 100;
    liveAcc.innerText = `${acc}%`;
}

function startTimer() {
    isPlaying = true;
    timerInterval = setInterval(() => {
        timer--;
        timerDisplay.innerText = timer;
        updateLiveStats();

        if (timer <= 0) endGame();
    }, 1000);
}

hiddenInput.addEventListener('input', (e) => {
    if (!isPlaying && timer > 0) startTimer();

    const words = wordsWrapper.querySelectorAll('.word');
    const currentWord = words[currentWordIdx];
    if (!currentWord) return;

    const letters = currentWord.querySelectorAll('.letter');
    const typedChar = e.data;

    // Backspace
    if (e.inputType === 'deleteContentBackward') {
        if (currentLetterIdx > 0) {
            currentLetterIdx--;
            letters[currentLetterIdx].classList.remove('correct', 'incorrect');
        }
        updateCaret();
        return;
    }

    // Space Bar
    if (typedChar === ' ') {
        hiddenInput.value = '';
        currentWordIdx++;
        currentLetterIdx = 0;
        updateCaret();
        return;
    }

    if (currentLetterIdx < letters.length) {
        totalTyped++;
        const targetLetter = letters[currentLetterIdx];
        const targetChar = targetLetter.innerText;

        if (typedChar === targetChar) {
            targetLetter.classList.add('correct');
            correctLetters++;
        } else {
            targetLetter.classList.add('incorrect');
            errorLetters++;
        }

        currentLetterIdx++;
        updateCaret();
        updateLiveStats();
    }
});

function endGame() {
    clearInterval(timerInterval);
    isPlaying = false;

    const minutes = maxTime / 60;
    const finalWpm = Math.round((correctLetters / 5) / minutes);
    const finalAcc = totalTyped > 0 ? Math.round((correctLetters / totalTyped) * 100) : 0;

    document.getElementById('res-wpm').innerText = finalWpm;
    document.getElementById('res-acc').innerText = `${finalAcc}%`;
    document.getElementById('res-correct').innerText = correctLetters;
    document.getElementById('res-errors').innerText = errorLetters;

    if (finalWpm >= 65) resStatus.innerText = "GODLIKE LEVEL";
    else if (finalWpm >= 40) resStatus.innerText = "PRO TYPER";
    else resStatus.innerText = "AMATEUR";

    resultModal.classList.remove('hidden');
}

// Mode / Time Selector
document.querySelectorAll('#mode-selector .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#mode-selector .pill-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentMode = e.target.dataset.mode;
        initGame(true);
    });
});

document.querySelectorAll('#time-selector .pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#time-selector .pill-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        maxTime = parseInt(e.target.dataset.time);
        initGame(true);
    });
});

typingArea.addEventListener('click', () => {
    hiddenInput.focus();
    focusOverlay.classList.add('hidden');
});

hiddenInput.addEventListener('blur', () => {
    if (isPlaying) focusOverlay.classList.remove('hidden');
});

document.getElementById('quick-restart-btn').addEventListener('click', () => initGame(true));
nextRoundBtn.addEventListener('click', () => initGame(true));
repeatRoundBtn.addEventListener('click', () => initGame(false));

// ==========================================
// TELEGRAM BUG REPORT LOGIC
// ==========================================
openReportBtn.addEventListener('click', () => {
    reportModal.classList.remove('hidden');
});

closeReportBtn.addEventListener('click', () => {
    reportModal.classList.add('hidden');
    reportStatus.innerText = '';
});

reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (TELEGRAM_BOT_TOKEN === "YOUR_TELEGRAM_BOT_TOKEN_HERE" || TELEGRAM_CHAT_ID === "YOUR_TELEGRAM_CHAT_ID_HERE") {
        reportStatus.style.color = "#ef4444";
        reportStatus.innerText = "Kodu ichida Bot Token va Chat ID kiritilmagan!";
        return;
    }

    const textInput = document.getElementById('report-text').value;
    const fileInput = document.getElementById('report-file').files[0];
    const submitBtn = document.getElementById('send-report-btn');

    submitBtn.disabled = true;
    reportStatus.style.color = "#00f0ff";
    reportStatus.innerText = "Yuborilmoqda...";

    const messageText = `⚠️ <b>Yangi Xatolik Xabari!</b>\n\n<b>Xabar:</b> ${textInput}`;

    try {
        if (fileInput) {
            // Rasm va Matn yuborish
            const formData = new FormData();
            formData.append('chat_id', TELEGRAM_CHAT_ID);
            formData.append('photo', fileInput);
            formData.append('caption', messageText);
            formData.append('parse_mode', 'HTML');

            const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                reportStatus.style.color = "#10b981";
                reportStatus.innerText = "Xabar va rasm botga muvaffaqiyatli yuborildi!";
                reportForm.reset();
            } else {
                throw new Error("Telegram API xatosi");
            }
        } else {
            // Faqat Matn yuborish
            const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: messageText,
                    parse_mode: 'HTML'
                })
            });

            if (res.ok) {
                reportStatus.style.color = "#10b981";
                reportStatus.innerText = "Xabar botga muvaffaqiyatli yuborildi!";
                reportForm.reset();
            } else {
                throw new Error("Telegram API xatosi");
            }
        }
    } catch (err) {
        reportStatus.style.color = "#ef4444";
        reportStatus.innerText = "Xabarni yuborishda xatolik yuz berdi.";
    } finally {
        submitBtn.disabled = false;
    }
});



initGame(true);