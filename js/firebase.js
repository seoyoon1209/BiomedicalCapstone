//  초기화 (모든 페이지 공통)
// 여기서 한 번만 앱을 초기화하고, 다른 모듈은 이 파일에서 db/ref 등을 가져다 씁니다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  update,
  onChildAdded,
  onChildChanged
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";
// 개인 설정은 firebase-config.js 에 따로 보관합니다. (git 에 올리지 않음)
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// 자주 쓰는 참조를 미리 만들어 둠
export const sensorRef = ref(db, "/sensors");
export const dailyStatsRef = ref(db, "/daily_stats");

// Firebase 함수도 여기서 다시 내보내서, 다른 모듈이 CDN URL을 몰라도 되게 함
export { ref, get, update, onChildAdded, onChildChanged };
