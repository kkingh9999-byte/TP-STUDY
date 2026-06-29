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

// ── 重點整理 ──────────────────────────────────────────────
function loadNotes() {
    const container = document.getElementById('notes-content');
    if (!container) return;

    const notesHTML = `
<h1 style="font-size:1.8rem;margin-bottom:1.2rem;">🚑 第一週讀書重點整理（第 1 ~ 11 章）</h1>

<div class="glass-card" style="background:rgba(34,197,94,.08);border-left:4px solid #22c55e;padding:1rem 1.5rem;margin-bottom:1.5rem;border-radius:.75rem;">
  <strong>📌 本週學習策略：</strong>第一週內容偏向「行政、法規、派遣與基礎知識」，雖然臨床操作較少，但法規、倫理與派遣系統（第7章）是國考必考的基本盤。請特別留意專有名詞的定義與醫療指導的層級。
</div>

<h2 style="font-size:1.4rem;margin:1.5rem 0 .8rem;color:var(--primary);">📖 核心重點整理</h2>

<h3 style="font-size:1.2rem;margin:.8rem 0 .5rem;">第1~2章：EMS概論與台灣緊急醫療救護體系</h3>
<ul style="line-height:2;padding-left:1.5rem;">
  <li><strong>兩種 EMS 發展模式</strong>：
    <ul>
      <li>🇬🇧 <strong>英美模式 (Scoop and run)</strong>：EMT 初步急救後快速送醫。</li>
      <li>🇩🇪 <strong>德法模式 (Stay and stabilize)</strong>：醫師到現場穩定病人後再送醫。</li>
    </ul>
  </li>
  <li><strong>醫療指導 (Medical Direction)</strong>：
    <ul>
      <li>📞 <strong>線上醫療指導 (On-line)</strong>：救護現場與醫師即時通訊，獲得處置授權。</li>
      <li>📋 <strong>離線醫療指導 (Off-line)</strong>：預立醫療流程 (Protocol)、品質審查、教育訓練。</li>
    </ul>
  </li>
  <li><strong>雙軌派遣 (Two-tiered system)</strong>：同時派遣 BLS 與 ALS 救護車，BLS 先行處置，ALS 後續接手。</li>
</ul>

<h3 style="font-size:1.2rem;margin:.8rem 0 .5rem;">第3~4章：角色責任與法律倫理</h3>
<ul style="line-height:2;padding-left:1.5rem;">
  <li><strong>醫療倫理四原則</strong>：自主 (Autonomy)、不傷害 (Non-maleficence)、行善 (Beneficence)、公平正義 (Justice)。</li>
  <li><strong>告知後同意</strong>：對具「意思能力」的病人，必須告知病情、處置與風險後取得同意。</li>
  <li><strong>推測的同意</strong>：對無意識、危急生命的病人，可依法理推測其同意急救。</li>
  <li><strong>業務過失標準</strong>：以「一般理性的 EMTP 在相同情況下應有的處置」為判斷基準。</li>
</ul>

<h3 style="font-size:1.2rem;margin:.8rem 0 .5rem;">第5~6章：職業安全、傳染病與心理衛生</h3>
<ul style="line-height:2;padding-left:1.5rem;">
  <li><strong>標準防護措施</strong>：將所有病人體液、血液視為具傳染性。</li>
  <li>🫁 <strong>空氣傳染 (Airborne)</strong>：肺結核、麻疹 → 需配戴 <span style="color:var(--primary);font-weight:700;">N95 口罩</span>。</li>
  <li>💧 <strong>飛沫傳染 (Droplet)</strong>：流感、新冠 → 配戴一般外科口罩。</li>
  <li><strong>PTSD</strong>：症狀持續 <span style="color:#ef4444;font-weight:700;">1 個月以上</span>；首選治療：<strong>心理治療 (CBT/EMDR)</strong>，非藥物。</li>
</ul>

<h3 style="font-size:1.2rem;margin:.8rem 0 .5rem;">⭐ 第7~8章：派遣系統與社區醫療反應（高頻考點）</h3>
<div class="glass-card" style="background:rgba(239,68,68,.08);border-left:4px solid #ef4444;padding:1rem 1.5rem;margin-bottom:1rem;border-radius:.75rem;">
  <strong>🚨 DA-CPR 兩大關鍵問題（必背！）</strong><br>
  ① 意識是否清醒？　② 呼吸是否正常？<br>
  ⚠️ 瀕死式呼吸 (Agonal breathing) ≠ 正常呼吸，需立即啟動壓胸指導！
</div>
<ul style="line-height:2;padding-left:1.5rem;">
  <li><strong>MPDS</strong>：透過關鍵問題詢問，決定派遣優先等級，將適當資源派給對的病人。</li>
  <li><strong>第一反應員</strong>：警察、保全等，目標是在 EMT 到達前提供早期急救，但<strong style="color:#ef4444;">無法取代</strong>專業 EMT。</li>
</ul>

<h3 style="font-size:1.2rem;margin:.8rem 0 .5rem;">第9~11章：品質管理、科技與科學思考</h3>
<table style="width:100%;border-collapse:collapse;margin:.5rem 0;">
  <tr style="background:rgba(255,255,255,.05);">
    <th style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);text-align:left;">構面</th>
    <th style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);text-align:left;">說明</th>
    <th style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);text-align:left;">範例</th>
  </tr>
  <tr>
    <td style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);">🏗️ 結構面</td>
    <td style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);">人員、設備、組織</td>
    <td style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);">EMTP 普及率</td>
  </tr>
  <tr style="background:rgba(255,255,255,.03);">
    <td style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);">⚙️ 過程面</td>
    <td style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);">操作流程、處置時間</td>
    <td style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);">接觸到給藥時間</td>
  </tr>
  <tr>
    <td style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);">📊 結果面</td>
    <td style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);">病人最終狀態</td>
    <td style="padding:.6rem 1rem;border:1px solid rgba(255,255,255,.1);">OHCA 存活出院率</td>
  </tr>
</table>

<hr style="border:none;border-top:1px solid rgba(255,255,255,.1);margin:2rem 0;">

<h2 style="font-size:1.4rem;margin:1.5rem 0 .8rem;color:var(--primary);">📝 國考預測測驗（自我檢核）</h2>

<div class="glass-card" style="padding:1.2rem 1.5rem;margin-bottom:1rem;border-radius:.75rem;">
  <p><strong>Q1.</strong> 關於「醫療指導」的敘述，下列何者最正確？</p>
  <p style="color:var(--text-muted);font-size:.95rem;">(A) 預立醫療流程屬於線上醫療指導　(B) 現場打電話請求醫師授權屬於離線醫療指導　(C) 醫療指導醫師不參與品質審查　<span style="color:#22c55e;font-weight:700;">(D) 品質管理與教育訓練屬於離線醫療指導 ✅</span></p>
</div>

<div class="glass-card" style="padding:1.2rem 1.5rem;margin-bottom:1rem;border-radius:.75rem;">
  <p><strong>Q2.</strong> 25歲男性意識清醒但拒絕就醫，你最優先確認？</p>
  <p style="color:var(--text-muted);font-size:.95rem;"><span style="color:#22c55e;font-weight:700;">(A) 是否具備意思能力 ✅</span>　(B) 聯絡警方強制送醫　(C) 適用推測同意　(D) 等家屬到場代簽</p>
</div>

<div class="glass-card" style="padding:1.2rem 1.5rem;margin-bottom:1rem;border-radius:.75rem;">
  <p><strong>Q3.</strong> DA-CPR 兩個關鍵問題是？</p>
  <p style="color:var(--text-muted);font-size:.95rem;">(A) 詢問過去病史才決定壓胸　<span style="color:#22c55e;font-weight:700;">(B) 意識是否清醒 + 呼吸是否正常 ✅</span>　(C) 有喘息聲代表呼吸正常　(D) 救護車到達即掛斷電話</p>
</div>

<div class="glass-card" style="padding:1.2rem 1.5rem;margin-bottom:1rem;border-radius:.75rem;">
  <p><strong>Q4.</strong> 下列何者屬於「結果面 (Outcome)」指標？</p>
  <p style="color:var(--text-muted);font-size:.95rem;">(A) 到場平均時間　(B) EMTP 比例　<span style="color:#22c55e;font-weight:700;">(C) OHCA 出院存活率 ✅</span>　(D) 車上完成12導程心電圖比率</p>
</div>

<div class="glass-card" style="padding:1.2rem 1.5rem;margin-bottom:1rem;border-radius:.75rem;">
  <p><strong>Q5.</strong> 疑似開放性肺結核病人，個人防護裝備應選擇？</p>
  <p style="color:var(--text-muted);font-size:.95rem;">(A) 一般外科口罩即可　(B) 連身型防護衣　<span style="color:#22c55e;font-weight:700;">(C) N95 口罩 ✅</span>　(D) 插管避免散播</p>
</div>
`;
    container.innerHTML = notesHTML;
}
