const state = {
  questions: [],
  range: "all",
  drawnIds: new Set(),
  current: null,
  timerId: null,
  remainingSeconds: 30,
};

const ranges = {
  all: { label: "全部 100", min: 1, max: 100 },
  normal: { label: "普通 1-60", min: 1, max: 60 },
  challenge: { label: "挑战 61-90", min: 61, max: 90 },
  final: { label: "终极 91-100", min: 91, max: 100 },
};

const els = {
  drawCount: document.querySelector("#draw-count"),
  questionId: document.querySelector("#question-id"),
  questionText: document.querySelector("#question-text"),
  answerPanel: document.querySelector("#answer-panel"),
  answerText: document.querySelector("#answer-text"),
  drawButton: document.querySelector("#draw-button"),
  answerButton: document.querySelector("#answer-button"),
  copyButton: document.querySelector("#copy-button"),
  resetButton: document.querySelector("#reset-button"),
  timer: document.querySelector("#timer"),
  bankStatus: document.querySelector("#bank-status"),
  rangeStatus: document.querySelector("#range-status"),
  remainingStatus: document.querySelector("#remaining-status"),
  chips: Array.from(document.querySelectorAll("[data-range]")),
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

function currentPool() {
  const range = ranges[state.range];
  return state.questions.filter((item) => item.id >= range.min && item.id <= range.max);
}

function availablePool() {
  return currentPool().filter((item) => !state.drawnIds.has(item.id));
}

function updateStatus() {
  const pool = currentPool();
  const available = availablePool();
  els.drawCount.textContent = String(state.drawnIds.size);
  els.bankStatus.textContent = state.questions.length ? `${state.questions.length} 题已加载` : "加载失败";
  els.rangeStatus.textContent = ranges[state.range].label;
  els.remainingStatus.textContent = `${available.length} / ${pool.length}`;
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

function drawQuestion() {
  const available = availablePool();
  if (!available.length) {
    els.questionId.textContent = "本范围已抽完";
    els.questionText.textContent = "点击“重置记录”后可以重新抽题。";
    els.answerPanel.hidden = true;
    els.answerButton.disabled = true;
    els.copyButton.disabled = true;
    stopTimer();
    setTimer(0);
    updateStatus();
    return;
  }

  const index = Math.floor(Math.random() * available.length);
  const question = available[index];
  state.current = question;
  state.drawnIds.add(question.id);

  els.questionId.textContent = `第 ${question.id} 题`;
  els.questionText.textContent = question.question;
  els.answerText.textContent = question.answer;
  els.answerPanel.hidden = true;
  els.answerButton.disabled = false;
  els.answerButton.textContent = "查看答案";
  els.copyButton.disabled = false;
  startTimer();
  updateStatus();
}

function revealAnswer() {
  if (!state.current) return;
  els.answerPanel.hidden = !els.answerPanel.hidden;
  els.answerButton.textContent = els.answerPanel.hidden ? "查看答案" : "隐藏答案";
}

async function copyCurrent() {
  if (!state.current) return;
  const text = `第 ${state.current.id} 题：${state.current.question}\n答案：${state.current.answer}`;
  try {
    await navigator.clipboard.writeText(text);
    els.copyButton.textContent = "已复制";
    window.setTimeout(() => {
      els.copyButton.textContent = "复制题目";
    }, 1200);
  } catch {
    window.alert(text);
  }
}

function setRange(rangeName) {
  state.range = rangeName;
  state.current = null;
  els.chips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.range === rangeName);
  });
  els.questionId.textContent = "--";
  els.questionText.textContent = "点击“随机抽题”开始。";
  els.answerPanel.hidden = true;
  els.answerButton.disabled = true;
  els.copyButton.disabled = true;
  stopTimer();
  setTimer(30);
  updateStatus();
}

function resetDraws() {
  state.drawnIds.clear();
  state.current = null;
  els.questionId.textContent = "--";
  els.questionText.textContent = "记录已重置，点击“随机抽题”开始。";
  els.answerPanel.hidden = true;
  els.answerButton.disabled = true;
  els.copyButton.disabled = true;
  stopTimer();
  setTimer(30);
  updateStatus();
}

async function init() {
  try {
    const response = await fetch("./questions.md", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.questions = parseQuestions(await response.text());
    if (state.questions.length !== 100) {
      throw new Error(`题库数量异常：${state.questions.length}`);
    }
    els.drawButton.disabled = false;
    updateStatus();
  } catch (error) {
    els.bankStatus.textContent = "加载失败";
    els.questionText.textContent = "题库加载失败，请确认 questions.md 与网页文件在同一目录，并通过 HTTP 服务访问。";
    els.drawButton.disabled = true;
    console.error(error);
  }
}

els.drawButton.addEventListener("click", drawQuestion);
els.answerButton.addEventListener("click", revealAnswer);
els.copyButton.addEventListener("click", copyCurrent);
els.resetButton.addEventListener("click", resetDraws);
els.chips.forEach((chip) => {
  chip.addEventListener("click", () => setRange(chip.dataset.range));
});

setTimer(30);
init();
