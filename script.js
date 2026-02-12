// 로그인 체크
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    location.href = 'login.html';
}

let currentQuestions = [];
let currentIndex = 0;
let userAnswers = [];

const urlParams = new URLSearchParams(window.location.search);
const subjectType = urlParams.get('type') || '지적기능사';

document.getElementById('subject-title').innerText = subjectType;

// 데이터 경로 설정
const dataPath = `./Data/${subjectType}/`;

function loadData() {
    const script = document.createElement('script');
    script.src = `${dataPath}questions.js`;
    script.onload = () => {
        if (typeof questions !== 'undefined') {
            currentQuestions = questions;
            currentIndex = 0;
            renderQuestion();
        } else {
            alert('데이터를 찾을 수 없습니다. 스크래퍼를 먼저 실행해주세요.');
        }
    };
    script.onerror = () => {
        alert('데이터 파일(questions.js)이 없습니다. 스크래핑이 필요합니다.');
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

    html += `<div class="options">`;
    q.options.forEach((opt, idx) => {
        const optNum = idx + 1;
        html += `
            <div class="option" onclick="checkAnswer(${optNum}, this)">
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

    html += `</div>`;
    container.innerHTML = html;
}

function checkAnswer(selected, element) {
    const q = currentQuestions[currentIndex];
    const options = document.querySelectorAll('.option');
    
    // 이미 답을 골랐다면 무시
    if (element.parentElement.classList.contains('answered')) return;
    element.parentElement.classList.add('answered');

    options.forEach((opt, idx) => {
        const optNum = idx + 1;
        if (optNum === q.answer) {
            opt.classList.add('correct');
        } else if (optNum === selected) {
            opt.classList.add('wrong');
        }
    });
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
