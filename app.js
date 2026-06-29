// State Management
const STATE = {
    currentChapter: null,
    questions: [],
    currentIndex: 0,
    score: { correct: 0, incorrect: 0 },
    answered: false
};

// LocalStorage Management
function loadProgress() {
    const saved = localStorage.getItem('emtpProgress');
    return saved ? JSON.parse(saved) : {};
}

function saveProgress(progress) {
    localStorage.setItem('emtpProgress', JSON.stringify(progress));
}

function updateChapterProgress(chapterId, qId, isCorrect) {
    const progress = loadProgress();
    if (!progress[chapterId]) {
        progress[chapterId] = { correct: [], incorrect: [] };
    }
    
    // Remove from both first to avoid duplicates if re-answered
    progress[chapterId].correct = progress[chapterId].correct.filter(id => id !== qId);
    progress[chapterId].incorrect = progress[chapterId].incorrect.filter(id => id !== qId);
    
    if (isCorrect) {
        progress[chapterId].correct.push(qId);
    } else {
        progress[chapterId].incorrect.push(qId);
    }
    
    saveProgress(progress);
    updateGlobalStats();
    renderDashboard();
}

// DOM Elements
const views = {
    notes: document.getElementById('notes-view'),
    dashboard: document.getElementById('dashboard'),
    flashcardDashboard: document.getElementById('flashcard-dashboard'),
    quiz: document.getElementById('quiz-view'),
    drugGame: document.getElementById('drug-game-view')
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateGlobalStats();
    renderDashboard();
    loadNotes();

    // Tab Navigation Event Listeners
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Update button styles
            document.querySelectorAll('.nav-tab').forEach(t => {
                t.classList.remove('active-tab', 'btn-primary');
                t.classList.add('btn-secondary');
            });
            e.target.classList.add('active-tab', 'btn-primary');
            e.target.classList.remove('btn-secondary');
            
            // Show target view
            const targetId = e.target.getAttribute('data-target');
            Object.values(views).forEach(v => v.classList.add('hidden'));
            document.getElementById(targetId).classList.remove('hidden');
            window.scrollTo(0, 0);
        });
    });

    // Event Listeners
    document.getElementById('back-to-dash').addEventListener('click', showDashboard);
    document.getElementById('back-dash-result').addEventListener('click', showDashboard);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('finish-btn').addEventListener('click', showResult);
    document.getElementById('restart-btn').addEventListener('click', () => startQuiz(STATE.currentChapter));
    document.getElementById('reset-btn').addEventListener('click', () => {
        if(confirm('確定要清除所有答題紀錄嗎？此動作無法復原。')) {
            localStorage.removeItem('emtpProgress');
            updateGlobalStats();
            renderDashboard();
        }
    });

    // Drug Game Event Listeners
    document.getElementById('start-drug-game-btn').addEventListener('click', startDrugGame);
    document.getElementById('back-to-dash-drug').addEventListener('click', showDashboard);
    document.getElementById('back-dash-drug-result').addEventListener('click', showDashboard);
    document.getElementById('restart-drug-btn').addEventListener('click', startDrugGame);
    document.getElementById('reveal-drug-btn').addEventListener('click', revealDrugAnswer);
    document.getElementById('drug-wrong-btn').addEventListener('click', () => handleDrugResult(false));
    document.getElementById('drug-correct-btn').addEventListener('click', () => handleDrugResult(true));
});

function updateGlobalStats() {
    const progress = loadProgress();
    let totalCorrect = 0;
    let totalIncorrect = 0;
    
    Object.values(progress).forEach(ch => {
        totalCorrect += ch.correct.length;
        totalIncorrect += ch.incorrect.length;
    });
    
    document.getElementById('global-correct').textContent = totalCorrect;
    document.getElementById('global-incorrect').textContent = totalIncorrect;
}

// Dashboard Rendering
function renderDashboard() {
    const list = document.getElementById('chapter-list');
    list.innerHTML = '';
    const progress = loadProgress();

    emtpData.chapters.forEach(ch => {
        if (ch.questionCount === 0) return; // Skip empty chapters

        const chProgress = progress[ch.id] || { correct: [], incorrect: [] };
        const totalAnswered = chProgress.correct.length + chProgress.incorrect.length;
        const totalQs = ch.questionCount;
        
        const correctPct = totalAnswered > 0 ? (chProgress.correct.length / totalQs) * 100 : 0;
        const incorrectPct = totalAnswered > 0 ? (chProgress.incorrect.length / totalQs) * 100 : 0;

        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.onclick = () => startQuiz(ch.id);
        
        card.innerHTML = `
            <h3>${ch.title}</h3>
            <div class="chapter-stats">
                <span>題目: ${totalQs}</span>
                <span>已答: ${totalAnswered}</span>
            </div>
            <div class="progress-track">
                <div class="progress-correct" style="width: ${correctPct}%"></div>
                <div class="progress-incorrect" style="width: ${incorrectPct}%"></div>
            </div>
        `;
        list.appendChild(card);
    });
}

// View Management
function switchView(viewName) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    views[viewName].classList.remove('hidden');
    window.scrollTo(0, 0);
}

function showDashboard() {
    // Determine which dashboard to show based on active tab
    const activeTab = document.querySelector('.nav-tab.active-tab');
    if (activeTab) {
        activeTab.click(); // Trigger the click to handle both style and view
    } else {
        switchView('dashboard');
    }
    renderDashboard();
}

function loadNotes() {
    fetch('Week1_Study_Notes.md')
        .then(response => response.text())
        .then(text => {
            document.getElementById('notes-content').innerHTML = marked.parse(text);
        })
        .catch(err => {
            document.getElementById('notes-content').innerHTML = '<p class="incorrect-color">無法載入筆記，請確認檔案位置。</p>';
            console.error('Error loading notes:', err);
        });
}

// Quiz Logic
function startQuiz(chapterId) {
    STATE.currentChapter = chapterId;
    STATE.questions = shuffleArray([...emtpData.questions[chapterId]]);
    STATE.currentIndex = 0;
    STATE.score = { correct: 0, incorrect: 0 };
    
    const chapter = emtpData.chapters.find(c => c.id === chapterId);
    document.getElementById('quiz-chapter-title').textContent = chapter.title;
    
    document.getElementById('question-container').classList.remove('hidden');
    document.getElementById('result-container').classList.add('hidden');
    
    switchView('quiz');
    loadQuestion();
}

function loadQuestion() {
    STATE.answered = false;
    const q = STATE.questions[STATE.currentIndex];
    
    // Update Progress info
    document.getElementById('quiz-progress-text').textContent = `進度: ${STATE.currentIndex + 1} / ${STATE.questions.length}`;
    document.getElementById('quiz-progress-bar').style.width = `${((STATE.currentIndex) / STATE.questions.length) * 100}%`;
    
    // UI resets
    document.getElementById('action-bar').classList.add('hidden');
    document.getElementById('explanation-container').classList.add('hidden');
    
    document.getElementById('q-year').textContent = `${q.year}年度`;
    document.getElementById('q-num').textContent = `第 ${q.num} 題`;
    document.getElementById('q-text').textContent = q.text;
    
    const optList = document.getElementById('options-list');
    optList.innerHTML = '';
    
    Object.entries(q.options).forEach(([key, val]) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<span class="opt-label">(${key})</span> <span class="opt-text">${val}</span>`;
        btn.onclick = () => handleAnswer(key, btn);
        optList.appendChild(btn);
    });
}

function handleAnswer(selectedKey, btnEl) {
    if (STATE.answered) return;
    STATE.answered = true;
    
    const q = STATE.questions[STATE.currentIndex];
    
    // Some answers in raw data might be "A(C)", parse it.
    // We treat it as correct if selectedKey is in the answer string.
    const isCorrect = q.answer.includes(selectedKey);
    
    // Disable all buttons
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => {
        b.disabled = true;
        const optKey = b.querySelector('.opt-label').textContent.replace(/[()]/g, '');
        if (q.answer.includes(optKey)) {
            b.classList.add('correct');
        } else if (optKey === selectedKey && !isCorrect) {
            b.classList.add('wrong');
        }
    });

    // Save state
    if (isCorrect) STATE.score.correct++;
    else STATE.score.incorrect++;
    
    updateChapterProgress(STATE.currentChapter, q.id, isCorrect);

    // Show Explanation
    const expContainer = document.getElementById('explanation-container');
    const expText = document.getElementById('exp-text');
    
    // Use marked.js to render Markdown
    expText.innerHTML = marked.parse(q.explanation || "目前無教官詳解。");
    expContainer.classList.remove('hidden');

    // Show Actions
    document.getElementById('action-bar').classList.remove('hidden');
    if (STATE.currentIndex === STATE.questions.length - 1) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('finish-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('finish-btn').classList.add('hidden');
    }
}

function nextQuestion() {
    STATE.currentIndex++;
    loadQuestion();
}

function showResult() {
    document.getElementById('quiz-progress-bar').style.width = '100%';
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('explanation-container').classList.add('hidden');
    document.getElementById('result-container').classList.remove('hidden');
    
    document.getElementById('res-correct').textContent = STATE.score.correct;
    document.getElementById('res-incorrect').textContent = STATE.score.incorrect;
    
    const total = STATE.score.correct + STATE.score.incorrect;
    const rate = total > 0 ? Math.round((STATE.score.correct / total) * 100) : 0;
    document.getElementById('res-rate').textContent = `${rate}%`;
}

// Helper: Fisher-Yates shuffle
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ==========================================
// Drug Game Logic
// ==========================================
let currentDrugDeck = [];
let currentDrugCard = null;

function startDrugGame() {
    // Check if drugGameData is available
    if (typeof drugGameData === 'undefined') {
        alert('無法載入藥物資料庫！');
        return;
    }
    currentDrugDeck = shuffleArray([...drugGameData]);
    document.getElementById('drug-flashcard').classList.remove('hidden');
    document.getElementById('drug-result-container').classList.add('hidden');
    switchView('drugGame');
    loadNextDrugCard();
}

function loadNextDrugCard() {
    if (currentDrugDeck.length === 0) {
        document.getElementById('drug-flashcard').classList.add('hidden');
        document.getElementById('drug-result-container').classList.remove('hidden');
        return;
    }
    
    currentDrugCard = currentDrugDeck[0];
    document.getElementById('drug-progress-text').textContent = `剩餘卡片: ${currentDrugDeck.length}`;
    document.getElementById('drug-category').textContent = currentDrugCard.category;
    document.getElementById('drug-question').textContent = currentDrugCard.question;
    document.getElementById('drug-hint').textContent = `提示: ${currentDrugCard.hint}`;
    
    document.getElementById('drug-answer-container').classList.add('hidden');
    document.getElementById('drug-reveal-action').classList.remove('hidden');
}

function revealDrugAnswer() {
    document.getElementById('drug-reveal-action').classList.add('hidden');
    document.getElementById('drug-answer-text').textContent = currentDrugCard.answer;
    document.getElementById('drug-answer-container').classList.remove('hidden');
}

function handleDrugResult(isCorrect) {
    const card = currentDrugDeck.shift(); // remove the first card
    if (!isCorrect) {
        // if wrong, put it back at the end of the deck
        currentDrugDeck.push(card);
    }
    loadNextDrugCard();
}
