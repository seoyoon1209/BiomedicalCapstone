// ✅ 지역별 상세 페이지 진입점
// URL 파라미터(?sido=..&sigungu=..&dong=..)로 지역을 받아,
// 해당 지역 센서만 걸러서 보여줍니다. 컴포넌트는 메인 페이지와 공유합니다.
import { sensorRef, get, onChildAdded, onChildChanged } from "./js/firebase.js";
import { createSensorCard } from "./js/components/sensorCard.js";
import { mountChartModal } from "./js/components/chartModal.js";

const mainContainer = document.getElementById("mainContainer");
const container = document.getElementById("sensorContainer");
const toggleButton = document.getElementById("toggleButton");

// URL 에서 지역 정보 읽기
const params = new URLSearchParams(window.location.search);
const sido = params.get("sido") || "";
const sigungu = params.get("sigungu") || "";
const dong = params.get("dong") || "";

let allSensorData = {};

mountChartModal();

// ✅ 지역이 일치하는 센서만 렌더링
function renderRegionSensors() {
  mainContainer.innerHTML = "";
  container.innerHTML = "";
  let found = false;

  Object.entries(allSensorData).forEach(([id, sensor]) => {
    if (!sensor.address) return;

    const matched =
      sensor.address.includes(sido) &&
      sensor.address.includes(sigungu) &&
      sensor.address.includes(dong);
    if (!matched) return;

    found = true;
    const isEmergency = Number(sensor.value) === 2;
    const target = isEmergency ? mainContainer : container;
    target.appendChild(
      createSensorCard(id, sensor, { isEmergency, onAfterReset: renderRegionSensors })
    );
  });

  if (!found) {
    container.innerHTML =
      '<div style="text-align:center;color:gray;font-weight:bold;">해당 지역 센서가 없습니다.</div>';
  }
}

// ✅ Firebase 실시간 연동
get(sensorRef).then((snapshot) => {
  allSensorData = snapshot.val() || {};
  renderRegionSensors();
});
onChildAdded(sensorRef, (snap) => {
  allSensorData[snap.key] = snap.val();
  renderRegionSensors();
});
onChildChanged(sensorRef, (snap) => {
  allSensorData[snap.key] = snap.val();
  renderRegionSensors();
});

// ✅ 더보기 토글
toggleButton.addEventListener("click", () => {
  container.classList.toggle("hidden");
  toggleButton.textContent = container.classList.contains("hidden")
    ? "더보기 열기"
    : "더보기 닫기";
});
