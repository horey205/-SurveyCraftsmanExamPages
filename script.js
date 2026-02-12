// 로그인 체크
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    location.href = 'login.html';
}

let currentQuestions = [];
let currentIndex = 0;
let userAnswers = [];

const urlParams = new URLSearchParams(window.location.search);
const subjectType = urlParams.get('type') || '지적기능사';
const mode = urlParams.get('mode') || 'study';

document.getElementById('subject-title').innerText = `${subjectType} (${mode === 'exam' ? '모의고사' : '기출학습'})`;

// 데이터 경로 설정
const dataPath = `./Data/${subjectType}/`;

function loadData() {
    const script = document.createElement('script');
    script.src = `${dataPath}questions.js`;
    script.onload = () => {
        if (typeof questions !== 'undefined') {
            if (mode === 'exam') {
                // 모의고사: 랜덤 60문제 (문제 수가 60개보다 적으면 전체 사용)
                currentQuestions = [...questions].sort(() => Math.random() - 0.5).slice(0, 60);
            } else {
                // 기출학습: 전체 문제 순차적
                currentQuestions = questions;
            }
            currentIndex = 0;
            userAnswers = new Array(currentQuestions.length).fill(null);
            renderQuestion();
        } else {
            alert('데이터를 찾을 수 없습니다.');
        }
    };
    script.onerror = () => {
        alert('데이터 파일(questions.js)이 없습니다.');
    };
    document.head.appendChild(script);
}

function renderQuestion() {
    const container = document.getElementById('quiz-container');
    const q = currentQuestions[currentIndex];

    if (!q) return;

    document.getElementById('progress').innerText = `${currentIndex + 1} / ${currentQuestions.length}`;

    let html = `
        <div class="question-card">
            <div class="q-header">
                <span>번호: ${currentIndex + 1}</span>
                <span>출처: ${q.source || ''}</span>
            </div>
            <div class="q-text">${q.text}</div>
    `;

    if (q.local_images && q.local_images.length > 0) {
        q.local_images.forEach(img => {
            html += `<img src="${dataPath}${img}" class="q-img">`;
        });
    }

    const selectedAnswer = userAnswers[currentIndex];
    const isAnswered = selectedAnswer !== null;

    html += `<div class="options ${isAnswered ? 'answered' : ''}">`;
    q.options.forEach((opt, idx) => {
        const optNum = idx + 1;
        let className = 'option';
        if (isAnswered) {
            if (optNum === q.answer) className += ' correct';
            else if (optNum === selectedAnswer) className += ' wrong';
        }

        html += `
            <div class="${className}" onclick="checkAnswer(${optNum}, this)">
                <span class="opt-id">${optNum}.</span>
                <span class="opt-text">${opt}</span>
            </div>
        `;
    });
    html += `</div>`;

    html += `
        <div class="nav-btns">
            <button onclick="prevQuestion()" ${currentIndex === 0 ? 'disabled' : ''}>이전</button>
            <button onclick="nextQuestion()" ${currentIndex === currentQuestions.length - 1 ? 'disabled' : ''}>다음</button>
        </div>
    `;

    // 마지막 문제고 모의고사면 결과 보기 버튼 표시
    if (currentIndex === currentQuestions.length - 1 && mode === 'exam') {
        html += `
            <div style="margin-top: 1rem; text-align: center;">
                <button onclick="showResult()" style="background-color: #10b981; width: 100%;">결과 확인하기</button>
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;
}

function checkAnswer(selected, element) {
    if (userAnswers[currentIndex] !== null) return; // 이미 답변함

    userAnswers[currentIndex] = selected;
    renderQuestion();
}

function showResult() {
    let correctCount = 0;
    currentQuestions.forEach((q, idx) => {
        if (userAnswers[idx] === q.answer) correctCount++;
    });

    const score = Math.round((correctCount / currentQuestions.length) * 100);
    const passStatus = score >= 60 ? '<span style="color: #10b981">합격</span>' : '<span style="color: #ef4444">불합격</span>';

    const container = document.getElementById('quiz-container');
    container.innerHTML = `
        <div class="question-card" style="text-align: center;">
            <h2>시험 결과</h2>
            <div style="font-size: 3rem; font-weight: bold; margin: 2rem 0;">${score}점</div>
            <p style="font-size: 1.5rem; margin-bottom: 2rem;">최종 결과: ${passStatus}</p>
            <div style="color: var(--text-muted); margin-bottom: 2rem;">
                맞은 개수: ${correctCount} / ${currentQuestions.length}
            </div>
            <button onclick="location.href='index.html'" style="width: 100%;">메인으로 돌아가기</button>
        </div>
    `;
}

function nextQuestion() {
    if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        renderQuestion();
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

// 시작
loadData();
