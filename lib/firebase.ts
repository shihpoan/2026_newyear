// Firebase 配置檔案
// 使用說明：
// 1. 前往 Firebase Console (https://console.firebase.google.com/)
// 2. 建立新專案或選擇現有專案
// 3. 在專案設定中找到「SDK 設定和配置」
// 4. 複製您的 Firebase 配置並貼上到下方的 firebaseConfig 物件中

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: 替換為您的 Firebase 專案配置
const firebaseConfig = {
  apiKey: "AIzaSyDcMkcmobzzJibOq9NEcfvDg1cok1HO9Bs",
  authDomain: "newyear-f3593.firebaseapp.com",
  projectId: "newyear-f3593",
  storageBucket: "newyear-f3593.firebasestorage.app",
  messagingSenderId: "160165499342",
  appId: "1:160165499342:web:5e944a0fcf955c3db11b9f",
  measurementId: "G-X60N7RMWVK",
};

// 初始化 Firebase（避免重複初始化）
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 初始化 Firestore
export const db = getFirestore(app);

export default app;
