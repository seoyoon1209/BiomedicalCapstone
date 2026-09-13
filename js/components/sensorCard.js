// 센서 카드 컴포넌트
// createSensorCard(...) 는 카드 DOM 요소를 "만들어서 반환"만 합니다.
// 어디에 붙일지는 호출한 쪽에서 결정합니다. (append 는 호출부 책임)
import { db, ref, update } from "../firebase.js";
import { openDailyChart } from "./chartModal.js";
import { icon } from "../icons.js";

/**
 * 상태값(value)에 따른 CSS 클래스를 카드에 적용합니다.
 * 0: 정상(초록), 1: 주의(주황), 2: 긴급(빨강), 3: 파랑
 */
function applyStatusClass(card, value) {
  if (value === 2) card.classList.add("warning");
  if (value === 3) card.classList.add("status-blue");
}

function makeStatusDot(value) {
  const dot = document.createElement("div");
  dot.className = "sensor-status";
  if (value === 0) dot.classList.add("status-green");
  if (value === 1) dot.classList.add("status-orange");
  if (value === 2) dot.classList.add("status-red");
  if (value === 3) dot.classList.add("status-blue");
  return dot;
}

function makeInfoRow(className, text) {
  const el = document.createElement("div");
  el.className = `sensor-item ${className}`;
  el.textContent = text;
  return el;
}

/**
 * 센서 한 명의 카드를 만들어 반환합니다.
 * @param {string} id      센서 ID
 * @param {object} sensor  센서 데이터
 * @param {object} opts    { isEmergency, onAfterReset }
 * @returns {HTMLElement}
 */
export function createSensorCard(id, sensor, opts = {}) {
  const { isEmergency = false, onAfterReset } = opts;
  const value = Number(sensor.value);

  const card = document.createElement("div");
  card.className = "sensor-card";
  applyStatusClass(card, value);
  if (isEmergency) card.classList.add("emergency");

  // --- 상단: 정보 줄 ---
  const topRow = document.createElement("div");
  topRow.className = "sensor-row";

  const nameBox = makeInfoRow("sensor-name", `이름: ${sensor.name || id}`);

  const averageBox = makeInfoRow(
    "sensor-average",
    `감지 횟수 평균값: ${sensor.averagePressCount ?? 0}`
  );
  averageBox.style.cursor = "pointer";
  averageBox.title = "클릭하면 일별 그래프를 볼 수 있어요";
  averageBox.onclick = () => openDailyChart(id);

  topRow.append(
    nameBox,
    makeStatusDot(value),
    makeInfoRow("sensor-address", `주소: ${sensor.address || "-"}`),
    makeInfoRow("sensor-phone", `전화번호: ${sensor.phone || "-"}`),
    makeInfoRow("sensor-waketime", `기상시간: ${sensor.time || "-"}`),
    makeInfoRow("sensor-count", `감지 횟수: ${sensor.number ?? 0}회`),
    averageBox
  );

  // --- 하단: 버튼 줄 ---
  const buttonBox = document.createElement("div");
  buttonBox.style.display = "flex";
  buttonBox.style.gap = "8px";

  const alertBtn = document.createElement("button");
  alertBtn.append(icon("bell"), document.createTextNode(" 알림"));
  alertBtn.onclick = () => alert(`${sensor.name || id} 알림!`);

  const resetBtn = document.createElement("button");
  resetBtn.append(icon("rotate-left"), document.createTextNode(" 리셋"));
  resetBtn.onclick = () => {
    update(ref(db, `/sensors/${id}`), { command: "reset", value: 0 }).then(() => {
      if (typeof onAfterReset === "function") onAfterReset();
    });
  };

  buttonBox.append(alertBtn, resetBtn);
  card.append(topRow, buttonBox);
  return card;
}
