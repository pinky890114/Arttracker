import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ==================================================================
// 🚨 重要設定：請在此處填入您自己的 Firebase 專案資訊
// ==================================================================
// 1. 前往 https://console.firebase.google.com/
// 2. 登入 Google 帳號，點選 "建立專案" (Create Project)
// 3. 專案建立後，點擊首頁的 "Web" 圖示 (</>) 來新增應用程式
// 4. 複製 firebaseConfig 物件的內容，並取代下方的變數值
// ==================================================================

const firebaseConfig = {

  apiKey: "AIzaSyApfy3kcp3f6PAGlAQxiQak227uKDmoqMo",

  authDomain: "gen-lang-client-0662125598.firebaseapp.com",

  projectId: "gen-lang-client-0662125598",

  storageBucket: "gen-lang-client-0662125598.firebasestorage.app",

  messagingSenderId: "130638916899",

  appId: "1:130638916899:web:e9886379a22ace42307096",

  measurementId: "G-4HMV9GHNRK"

};


// 簡單檢查使用者是否已經設定了 Config
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

// Initialize Firebase
// 即使是 Placeholder 設定也直接傳入，避免 getFirestore 因缺少 projectId 而報錯。
// App.tsx 會透過 isFirebaseConfigured 阻擋實際的資料請求。
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);