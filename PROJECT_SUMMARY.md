# 新朋友報名系統 - 專案說明

## 📋 功能概述

這是一個用於管理白金小組新朋友報名的系統，包含以下功能：

### 1. 報名表頁面 (`/register`)

- ✅ 白金小組下拉選單（8 個預設小組）
- ✅ 領導人姓名欄位
- ✅ 新朋友資料（可動態新增多筆）
  - 姓名
  - 性別（男性/女性）
- ✅ 表單驗證
- ✅ 資料提交到 Firebase Firestore

### 2. 管理頁面 (`/admin`)

- ✅ 報名資料一覽表
- ✅ 統計資訊顯示
  - 報名筆數
  - 新朋友總數
  - 男女人數統計
- ✅ Google Sheets 報表匯出功能
- ✅ 直接開啟 Google Sheets 查看報表

## 🗂️ 檔案結構

```
app/
├── register/
│   └── page.tsx          # 報名表頁面
├── admin/
│   └── page.tsx          # 管理頁面
lib/
├── firebase.ts           # Firebase 初始化配置
├── firestore.ts          # Firestore 資料庫操作工具
└── googlesheets.ts       # Google Sheets 匯出工具
DATABASE_SCHEMA.md        # 資料庫結構設計文件
FIREBASE_SETUP.md         # Firebase 安裝配置指南
GOOGLE_SHEETS_SETUP.md    # Google Sheets 整合設定指南
```

## 🔧 安裝步驟

### 1. 安裝 Firebase SDK

```bash
npm install firebase
```

### 2. 配置 Firebase

請參考 `FIREBASE_SETUP.md` 文件完成以下步驟：

1. 建立 Firebase 專案
2. 啟用 Firestore 資料庫
3. 取得並更新 Firebase 配置到 `lib/firebase.ts`
4. 設定 Firestore 安全性規則

### 3. 配置 Google Sheets（用於報表匯出）

請參考 `GOOGLE_SHEETS_SETUP.md` 文件完成以下步驟：

1. 建立 Google Sheets 試算表
2. 設定 Google Apps Script Web App
3. 部署並取得 Web App URL
4. 更新前端配置

### 4. 啟動開發伺服器

```bash
npm run dev
```

## 📊 資料庫結構

```typescript
{
  id: string,                    // Firestore 自動生成
  platinumGroup: string,         // 白金小組名稱
  leaderName: string,            // 領導人姓名
  newFriends: [                  // 新朋友陣列
    {
      id: string,                // 前端生成的唯一 ID
      name: string,              // 新朋友姓名
      gender: 'male' | 'female'  // 性別
    }
  ],
  createdAt: Timestamp,          // 建立時間
  updatedAt: Timestamp           // 更新時間
}
```

## 🎯 使用流程

### 報名流程

1. 訪問 `/register` 頁面
2. 選擇白金小組
3. 填寫領導人姓名
4. 填寫新朋友資料（可新增多位）
5. 點擊「確認報名」提交

### 管理流程

1. 訪問 `/admin` 頁面
2. 查看報名統計資料
3. 瀏覽報名清單
4. 點擊「匯出到 Google Sheets」將資料寫入試算表
5. 點擊「開啟 Google Sheet」查看完整報表

## 📊 Google Sheets 匯出格式

匯出到 Google Sheets 的資料包含以下欄位：

- 白金小組
- 領導人姓名
- 新朋友姓名
- 性別
- 報名時間

每位新朋友佔一行，方便在 Google Sheets 中進行統計分析、圖表製作等進階操作。

匯出的 CSV 檔案包含以下欄位：

- 白金小組
- 領導人姓名
- 新朋友姓名
- 性別
- 報名時間

每位新朋友佔一行，Excel 可直接開啟並進行後續處理。

## 🎨 白金小組清單

預設的 8 個小組：

1. 喜樂小組
2. 恩典小組
3. 平安小組
4. 信心小組
5. 盼望小組
6. 愛心小組
7. 和平小組
8. 智慧小組

如需修改小組清單，請編輯 `app/register/page.tsx` 中的 `PLATINUM_GROUPS` 常數。

## ⚡ 待整合功能

目前報名表和管理頁面使用模擬資料。待 Firebase 和 Google Sheets 配置完成後，需要：

### 報名表頁面 (`app/register/page.tsx`)

在 `handleSubmit` 函數中，將以下註解區塊：

```typescript
// TODO: 在此處加入 Firebase 儲存邏輯
```

替換為：

```typescript
import { addRegistration } from "@/lib/firestore";

// 在 handleSubmit 中
await addRegistration({
  platinumGroup: formData.platinumGroup,
  leaderName: formData.leaderName,
  newFriends: formData.newFriends,
});
```

### 管理頁面 (`app/admin/page.tsx`)

1. 移除模擬資料
2. 使用 `useEffect` 從 Firestore 載入資料：

```typescript
import { useEffect } from "react";
import { getRegistrations } from "@/lib/firestore";

useEffect(() => {
  const loadData = async () => {
    const data = await getRegistrations();
    setRegistrations(data);
  };
  loadData();
}, []);
```

3. 更新 Google Sheets 配置：

```typescript
// 將這兩個 URL 替換為您的實際 URL
const GOOGLE_SCRIPT_URL = "您的 Google Apps Script Web App URL";
const GOOGLE_SHEET_URL = "您的 Google Sheets 試算表 URL";
```

## 🔒 安全性建議

1. 設定適當的 Firestore 安全性規則
2. 考慮為管理頁面加入身份驗證
3. 不要將 Firebase 配置提交到公開倉庫
4. 為 Google Apps Script 加入 API Key 驗證（參考 `GOOGLE_SHEETS_SETUP.md`）
5. 定期備份資料庫和試算表

## 📱 響應式設計

所有頁面都支援響應式設計，可在手機、平板和桌面裝置上正常使用。

## 🎉 完成狀態

- ✅ 報名表設計與實作
- ✅ 管理頁面與統計功能
- ✅ Google Sheets 匯出功能
- ✅ Firebase 配置檔案與文件
- ✅ Google Sheets 整合文件
- ⏳ Firebase 實際整合（待您配置後完成）
- ⏳ Google Sheets 實際整合（待您配置後完成）

---

如有任何問題，請參考：

- `FIREBASE_SETUP.md` - Firebase 設定說明
- `GOOGLE_SHEETS_SETUP.md` - Google Sheets 設定說明
- 程式碼註解
