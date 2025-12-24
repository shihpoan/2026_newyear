# Firebase 安裝與配置指南

## 1️⃣ 安裝 Firebase SDK

在專案根目錄執行以下命令安裝 Firebase 套件：

```bash
npm install firebase
```

## 2️⃣ 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」或選擇現有專案
3. 依照指示完成專案建立

## 3️⃣ 啟用 Firestore 資料庫

1. 在 Firebase Console 左側選單中點擊「Firestore Database」
2. 點擊「建立資料庫」
3. 選擇「以測試模式啟動」（開發階段）或「以正式版模式啟動」
4. 選擇資料庫位置（建議選擇 asia-east1 或 asia-southeast1）

## 4️⃣ 取得 Firebase 配置

1. 在 Firebase Console 中，點擊專案設定（齒輪圖示）
2. 在「一般」頁籤中，滾動到「您的應用程式」區塊
3. 點擊「</> Web」圖示新增 Web 應用程式
4. 註冊應用程式後，複製 `firebaseConfig` 物件

## 5️⃣ 更新配置檔案

將複製的配置貼到 `lib/firebase.ts` 檔案中：

```typescript
const firebaseConfig = {
  apiKey: "您的 API Key",
  authDomain: "您的 Auth Domain",
  projectId: "您的 Project ID",
  storageBucket: "您的 Storage Bucket",
  messagingSenderId: "您的 Messaging Sender ID",
  appId: "您的 App ID",
};
```

## 6️⃣ 設定 Firestore 安全性規則

在 Firebase Console 的 Firestore Database 中，點擊「規則」頁籤，設定以下規則：

### 開發環境（允許所有讀寫）

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 正式環境（建議的安全規則）

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /registrations/{document} {
      // 允許所有人讀取報名資料
      allow read: if true;
      // 只允許建立新記錄，不允許修改或刪除
      allow create: if true;
      allow update, delete: if false;
    }
  }
}
```

## 7️⃣ 建立索引（選用）

如果查詢速度較慢，可在 Firestore 中建立複合索引：

1. 在 Firestore Database 點擊「索引」頁籤
2. 點擊「建立索引」
3. Collection ID: `registrations`
4. 新增欄位：
   - `createdAt` (降序)
   - `platinumGroup` (升序)

## 8️⃣ 測試連線

完成配置後，在瀏覽器開發者工具的 Console 中確認沒有 Firebase 相關錯誤訊息。

## 📊 資料庫結構

```
registrations (collection)
  └── [auto-generated-id] (document)
      ├── platinumGroup: string
      ├── leaderName: string
      ├── newFriends: array
      │   └── [0]
      │       ├── id: string
      │       ├── name: string
      │       └── gender: string
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

## ⚠️ 注意事項

1. **不要將 Firebase 配置檔案提交到公開的 Git 倉庫**
2. 建議將 `lib/firebase.ts` 加入 `.gitignore`（或使用環境變數）
3. 正式環境請務必設定適當的安全性規則
4. 定期檢查 Firebase 使用量，避免超出免費額度

## 🚀 完成後

安裝並配置完成後：

- 報名表（`/register`）可以儲存資料到 Firestore
- 管理頁面（`/admin`）可以讀取並匯出報名資料
