import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ==================================================================
// 請在此處貼上您的 FIREBASE 設定
// ==================================================================
// 1. 前往 Firebase Console > Project Settings
// 2. 複製 firebaseConfig 物件的內容並取代下方變數
// ==================================================================

const firebaseConfig = {

  apiKey: "AIzaSyAgfzJAlhGowci25Q4ELjPbb_yz9b1SgKE",

  authDomain: "commission-tracker-e6da0.firebaseapp.com",

  projectId: "commission-tracker-e6da0",

  storageBucket: "commission-tracker-e6da0.firebasestorage.app",

  messagingSenderId: "859578190938",

  appId: "1:859578190938:web:cb6274fb81816183501c63",

  measurementId: "G-2GGNJ16VZK"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);