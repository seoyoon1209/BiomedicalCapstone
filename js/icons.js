// 아이콘 헬퍼 (Font Awesome)
/**
 * <i class="fa-solid fa-{name}"> 요소를 만들어 반환합니다.
 * @param {string} name  Font Awesome 아이콘 이름 (예: "bell", "location-dot")
 * @param {string} extra 추가로 붙일 클래스 (선택)
 */
export function icon(name, extra = "") {
  const el = document.createElement("i");
  el.className = `fa-solid fa-${name} ${extra}`.trim();
  el.setAttribute("aria-hidden", "true");
  return el;
}

/**
 * 아이콘 + 텍스트를 나란히 넣은 요소를 만들어 반환합니다.
 * 주로 버튼/제목에 사용합니다.
 */
export function iconLabel(name, text, tag = "span") {
  const wrap = document.createElement(tag);
  wrap.style.display = "inline-flex";
  wrap.style.alignItems = "center";
  wrap.style.gap = "6px";
  wrap.append(icon(name), document.createTextNode(text));
  return wrap;
}
