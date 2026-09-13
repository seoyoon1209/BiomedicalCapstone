// 일별 통계 차트 팝업 컴포넌트
// mountChartModal() 로 한 번 화면에 붙여두고,
// openDailyChart(sensorId) 로 특정 센서의 일별 그래프를 띄웁니다.
import { dailyStatsRef, get } from "../firebase.js";
import { icon } from "../icons.js";

let modalEl = null;    // 팝업 전체(배경 포함)
let chartInstance = null;

/** 팝업 DOM 을 body 에 한 번만 붙입니다. */
export function mountChartModal() {
  if (modalEl) return; // 중복 생성 방지

  modalEl = document.createElement("div");
  modalEl.id = "chartModal";
  modalEl.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.6);" +
    "display:none;align-items:center;justify-content:center;z-index:1000;";

  const box = document.createElement("div");
  box.style.cssText =
    "background:#fff;padding:20px;border-radius:10px;max-width:700px;width:90%;position:relative;";

  const closeBtn = document.createElement("button");
  closeBtn.style.cssText = "position:absolute;top:10px;right:10px;";
  closeBtn.append(icon("xmark"));
  closeBtn.title = "닫기";
  closeBtn.onclick = () => (modalEl.style.display = "none");

  const canvas = document.createElement("canvas");
  canvas.id = "popupChart";
  canvas.width = 600;
  canvas.height = 350;

  box.append(closeBtn, canvas);
  modalEl.append(box);
  document.body.appendChild(modalEl);

  // 배경(어두운 영역) 클릭 시 닫기
  modalEl.addEventListener("click", (e) => {
    if (e.target === modalEl) modalEl.style.display = "none";
  });
}

/** 특정 센서의 일별 평균/총 감지 횟수를 선 그래프로 표시합니다. */
export function openDailyChart(sensorId) {
  if (!modalEl) mountChartModal();

  get(dailyStatsRef).then((snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const labels = [];
    const averages = [];
    const counts = [];
    Object.entries(data).forEach(([date, sensors]) => {
      if (sensors[sensorId]) {
        labels.push(date);
        averages.push(sensors[sensorId].average);
        counts.push(sensors[sensorId].pressCount);
      }
    });

    const ctx = document.getElementById("popupChart").getContext("2d");
    modalEl.style.display = "flex";

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "평균 감지 횟수", data: averages, borderColor: "blue", borderWidth: 2, fill: false },
          { label: "감지 총횟수", data: counts, borderColor: "red", borderWidth: 2, fill: false }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "top" } },
        scales: {
          x: { title: { display: true, text: "날짜" } },
          y: { beginAtZero: true, title: { display: true, text: "횟수" } }
        }
      }
    });
  });
}
