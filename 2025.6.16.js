// ✅ 메인 대시보드 페이지 진입점
// 실제 로직은 js/ 아래 컴포넌트 모듈에 있고, 여기서는 "조립"만 합니다.
import { sensorRef, get, onChildAdded, onChildChanged } from "./js/firebase.js";
import { createSensorCard } from "./js/components/sensorCard.js";
import { mountChartModal } from "./js/components/chartModal.js";
import { mountLocationFilter } from "./js/components/locationFilter.js";

// --- DOM 참조 ---
const mainContainer = document.getElementById("mainContainer");     // 긴급 센서
const container = document.getElementById("sensorContainer");       // 전체 센서
const filteredContainer = document.getElementById("filteredContainer"); // 검색 결과
const userListContainer = document.getElementById("userList");      // 사이드바 사용자 목록
const toggleButton = document.getElementById("toggleButton");
const enableAudioBtn = document.getElementById("enableAudioBtn");

let allSensorData = {};
let locationData = [];
let selectedUsers = {};

// 차트 팝업을 한 번만 붙여둠
mountChartModal();

// ✅ 전체 센서를 "긴급(value===2)" 과 "일반" 으로 나눠 렌더링
function renderMainSensors() {
  container.classList.remove("hidden");
  mainContainer.innerHTML = "";
  container.innerHTML = "";

  Object.entries(allSensorData).forEach(([id, sensor]) => {
    const isEmergency = Number(sensor.value) === 2;
    const target = isEmergency ? mainContainer : container;
    target.appendChild(
      createSensorCard(id, sensor, { isEmergency, onAfterReset: renderMainSensors })
    );
  });
}

// ✅ 사이드바에서 체크한 사용자만 카드로 표시
function renderSelectedUsers() {
  filteredContainer.innerHTML = "";
  Object.entries(selectedUsers).forEach(([id, sensor]) => {
    filteredContainer.appendChild(
      createSensorCard(id, sensor, { onAfterReset: renderSelectedUsers })
    );
  });
}

// ✅ 선택한 지역에 속한 센서들의 체크박스 목록을 만든다
function buildUserList({ sido, sigungu, dong }) {
  userListContainer.innerHTML = "";
  filteredContainer.innerHTML = "";
  selectedUsers = {};

  const fullFilter = `${sido} ${sigungu} ${dong}`;

  Object.entries(allSensorData).forEach(([id, sensor]) => {
    if (!sensor.address) return;

    const match = locationData.find(
      (loc) =>
        sensor.address.includes(loc.sido) &&
        sensor.address.includes(loc.sigungu) &&
        sensor.address.includes(loc.dong)
    );
    if (!match) return;
    if (`${match.sido} ${match.sigungu} ${match.dong}` !== fullFilter) return;

    const item = document.createElement("div");
    item.className = "user-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.onchange = (e) => {
      if (e.target.checked) selectedUsers[id] = sensor;
      else delete selectedUsers[id];
      renderSelectedUsers();
    };

    const label = document.createElement("span");
    label.textContent = sensor.name || id;

    item.append(checkbox, label);
    userListContainer.appendChild(item);
  });

  if (!userListContainer.children.length) {
    userListContainer.innerHTML =
      '<div style="color:gray;">해당 지역의 센서가 없습니다.</div>';
  }
}

// ✅ 지역 필터 초기화
mountLocationFilter({
  sidoEl: document.getElementById("sidebarSido"),
  sigunguEl: document.getElementById("sidebarSigungu"),
  dongEl: document.getElementById("sidebarDong"),
  searchButton: document.getElementById("searchButton"),
  onSearch: buildUserList
}).then((filter) => {
  locationData = filter.locationData;
});

// ✅ Firebase 실시간 연동
get(sensorRef).then((snapshot) => {
  allSensorData = snapshot.val() || {};
  renderMainSensors();
});
onChildAdded(sensorRef, (snap) => {
  allSensorData[snap.key] = snap.val();
  renderMainSensors();
});
onChildChanged(sensorRef, (snap) => {
  allSensorData[snap.key] = snap.val();
  renderMainSensors();
});

// ✅ 더보기 토글
toggleButton.addEventListener("click", () => {
  container.classList.toggle("hidden");
  toggleButton.textContent = container.classList.contains("hidden")
    ? "더보기 열기"
    : "더보기 닫기";
});

// ✅ 알림 소리 활성화 (브라우저는 사용자가 클릭해야 소리를 허용함)
enableAudioBtn.addEventListener("click", () => {
  const audio = document.getElementById("alertSoundTemplate");
  if (!audio) return;
  audio
    .play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      enableAudioBtn.textContent = "알림 소리 활성화됨";
    })
    .catch(() => {
      // sounds/alert.mp3 파일이 아직 없으면 여기로 옵니다.
      alert("알림 사운드 파일(sounds/alert.mp3)이 없어 소리를 활성화하지 못했습니다.");
    });
});
