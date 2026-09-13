// ✅ 지역 필터 컴포넌트 (시/도 → 시/군/구 → 동 단계별 선택)
// lo_fixed.json 을 읽어 select 3개를 채우고,
// 검색 버튼을 누르면 선택된 지역을 콜백으로 넘겨줍니다.

/**
 * @param {object} config
 *   sidoEl, sigunguEl, dongEl : <select> 요소
 *   searchButton             : 검색 <button>
 *   onSearch(selection)      : 검색 시 { sido, sigungu, dong } 전달
 * @returns {object} { getSelection() }  -- 현재 선택값 조회용
 */
export async function mountLocationFilter(config) {
  const { sidoEl, sigunguEl, dongEl, searchButton, onSearch } = config;

  const res = await fetch("lo_fixed.json");
  const locationData = await res.json();

  const fillSelect = (selectEl, values) => {
    selectEl.innerHTML = "";
    values.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = opt.textContent = v;
      selectEl.appendChild(opt);
    });
  };

  const uniq = (arr) => [...new Set(arr)];

  // 시/도 채우기
  fillSelect(sidoEl, uniq(locationData.map((d) => d.sido)));

  // 시/도 변경 → 시/군/구 갱신
  sidoEl.onchange = () => {
    const sigungus = uniq(
      locationData.filter((d) => d.sido === sidoEl.value).map((d) => d.sigungu)
    );
    fillSelect(sigunguEl, sigungus);
    sigunguEl.dispatchEvent(new Event("change"));
  };

  // 시/군/구 변경 → 동 갱신
  sigunguEl.onchange = () => {
    const dongs = locationData
      .filter((d) => d.sido === sidoEl.value && d.sigungu === sigunguEl.value)
      .map((d) => d.dong);
    fillSelect(dongEl, dongs);
  };

  // 초기 1회 연쇄 실행
  sidoEl.dispatchEvent(new Event("change"));

  const getSelection = () => ({
    sido: sidoEl.value,
    sigungu: sigunguEl.value,
    dong: dongEl.value
  });

  if (searchButton && typeof onSearch === "function") {
    searchButton.addEventListener("click", () => onSearch(getSelection()));
  }

  return { getSelection, locationData };
}
