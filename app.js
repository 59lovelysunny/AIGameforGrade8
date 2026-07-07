const banks = {
  logic: {
    label: "AI逻辑密室闯关",
    source: "./questions.md",
  },
  folk: {
    label: "AI节气民俗抢答",
    source: "./folk-questions.md",
  },
};

const state = {
  activeBank: "folk",
  questionsByBank: {},
  drawnIdsByBank: {},
  current: null,
  timerId: null,
  remainingSeconds: 30,
};

const els = {
  questionId: document.querySelector("#question-id"),
  questionText: document.querySelector("#question-text"),
  answerPanel: document.querySelector("#answer-panel"),
  answerText: document.querySelector("#answer-text"),
  drawButton: document.querySelector("#draw-button"),
  answerButton: document.querySelector("#answer-button"),
  timer: document.querySelector("#timer"),
  tabs: Array.from(document.querySelectorAll("[data-bank]")),
};

function parseQuestions(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\| \d+ \|/.test(line))
    .map((line) => {
      const cells = line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());

      return {
        id: Number(cells[0]),
        question: cells[1],
        answer: cells[2],
      };
    });
}

function currentQuestions() {
  return state.questionsByBank[state.activeBank] || [];
}

function currentDrawnIds() {
  if (!state.drawnIdsByBank[state.activeBank]) {
    state.drawnIdsByBank[state.activeBank] = new Set();
  }
  return state.drawnIdsByBank[state.activeBank];
}

function availablePool() {
  const drawnIds = currentDrawnIds();
  return currentQuestions().filter((item) => !drawnIds.has(item.id));
}

function setTimer(seconds) {
  state.remainingSeconds = seconds;
  els.timer.textContent = String(seconds);
  els.timer.classList.toggle("is-low", seconds <= 10);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startTimer() {
  stopTimer();
  setTimer(30);
  state.timerId = window.setInterval(() => {
    setTimer(Math.max(0, state.remainingSeconds - 1));
    if (state.remainingSeconds === 0) {
      stopTimer();
    }
  }, 1000);
}

function resetQuestionView(message = "点击“AI请出题”开始。") {
  state.current = null;
  els.questionId.textContent = "--";
  els.questionText.textContent = message;
  els.answerPanel.hidden = true;
  els.answerButton.disabled = true;
  els.answerButton.textContent = "查看答案";
  stopTimer();
  setTimer(30);
}

function drawQuestion() {
  const available = availablePool();
  if (!available.length) {
    els.questionId.textContent = "已抽完";
    els.questionText.textContent = "本轮题目已抽完，刷新页面后可以重新抽题。";
    els.answerPanel.hidden = true;
    els.answerButton.disabled = true;
    stopTimer();
    setTimer(0);
    return;
  }

  const index = Math.floor(Math.random() * available.length);
  const question = available[index];
  state.current = question;
  currentDrawnIds().add(question.id);

  els.questionId.textContent = `第 ${question.id} 题`;
  els.questionText.textContent = question.question;
  els.answerText.textContent = question.answer;
  els.answerPanel.hidden = true;
  els.answerButton.disabled = false;
  els.answerButton.textContent = "查看答案";
  startTimer();
}

function revealAnswer() {
  if (!state.current) return;
  els.answerPanel.hidden = !els.answerPanel.hidden;
  els.answerButton.textContent = els.answerPanel.hidden ? "查看答案" : "隐藏答案";
}

async function loadBank(bankName) {
  if (state.questionsByBank[bankName]) return;

  const response = await fetch(banks[bankName].source, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const questions = parseQuestions(await response.text());
  if (!questions.length) throw new Error("题库为空");
  state.questionsByBank[bankName] = questions;
}

async function switchBank(bankName) {
  state.activeBank = bankName;
  els.tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.bank === bankName);
  });

  els.drawButton.disabled = true;
  resetQuestionView("题库加载中...");

  try {
    await loadBank(bankName);
    resetQuestionView("点击“AI请出题”开始。");
    els.drawButton.disabled = false;
  } catch (error) {
    els.questionText.textContent = "题库加载失败，请确认题库文件与网页文件在同一目录。";
    console.error(error);
  }
}

els.drawButton.addEventListener("click", drawQuestion);
els.answerButton.addEventListener("click", revealAnswer);
els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchBank(tab.dataset.bank));
});

setTimer(30);
switchBank(state.activeBank);
