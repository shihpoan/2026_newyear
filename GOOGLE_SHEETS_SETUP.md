# Google Sheets 整合設定指南

## 📋 概述

本系統使用 Google Apps Script 作為中間層，將報名資料寫入 Google Sheets。這種方式比直接使用 Google Sheets API 更簡單，不需要 OAuth 認證。

## 🚀 設定步驟

### 步驟 1：建立 Google Sheets 試算表

1. 前往 [Google Sheets](https://sheets.google.com/)
2. 建立新的試算表
3. 將試算表命名為「新朋友報名資料」或您喜歡的名稱
4. 在第一列建立標題列（系統會自動建立，但建議先手動設定）：
   - A1: 白金小組
   - B1: 領導人姓名
   - C1: 新朋友姓名
   - D1: 性別
   - E1: 報名時間

### 步驟 2：開啟 Apps Script 編輯器

1. 在試算表中，點擊上方選單：**擴充功能** → **Apps Script**
2. 會開啟一個新的 Apps Script 專案視窗

### 步驟 3：貼上 Apps Script 程式碼

刪除預設的程式碼，貼上以下內容：

```javascript
// Google Apps Script Web App 用於接收報名資料

function doPost(e) {
  try {
    // 取得試算表
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 解析請求資料
    const requestData = JSON.parse(e.postData.contents);

    if (requestData.action === "addData") {
      const data = requestData.data;

      // 確保有標題列
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "白金小組",
          "領導人姓名",
          "新朋友姓名",
          "性別",
          "報名時間",
        ]);
      }

      // 將每筆資料新增到試算表
      data.forEach((row) => {
        sheet.appendRow([
          row.platinumGroup,
          row.leaderName,
          row.friendName,
          row.gender,
          row.createdAt,
        ]);
      });

      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: "資料已成功寫入",
          rowsAdded: data.length,
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "未知的操作",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// 測試用的 GET 方法
function doGet() {
  return ContentService.createTextOutput(
    "Google Sheets API is running"
  ).setMimeType(ContentService.MimeType.TEXT);
}
```

### 步驟 4：部署為 Web App

1. 點擊右上角的 **部署** → **新增部署作業**
2. 在「選取類型」旁點擊齒輪圖示，選擇「**網頁應用程式**」
3. 設定如下：
   - **說明**：新朋友報名系統 API（可自訂）
   - **執行身分**：我（您的 Google 帳號）
   - **具有存取權的使用者**：任何人
4. 點擊 **部署**
5. 授權應用程式（可能需要點擊「進階」→「前往專案名稱（不安全）」）
6. 複製「**網頁應用程式 URL**」（類似：`https://script.google.com/macros/s/xxxxx/exec`）

### 步驟 5：更新前端配置

開啟 `app/admin/page.tsx`，找到以下兩個常數並更新：

```typescript
// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"; // 替換為步驟 4 複製的 URL

// Google Sheet URL（供使用者查看）
const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit"; // 替換為您的試算表 URL
```

取得試算表 URL 的方法：

1. 回到您的 Google Sheets
2. 複製瀏覽器網址列的 URL
3. 格式通常為：`https://docs.google.com/spreadsheets/d/[試算表ID]/edit`

### 步驟 6：測試功能

1. 在瀏覽器中開啟管理頁面：`http://localhost:3000/admin`
2. 點擊「匯出到 Google Sheets」按鈕
3. 應該會看到成功訊息
4. 點擊「開啟 Google Sheet」檢查資料是否正確寫入

## 🔧 進階設定（選用）

### 自動格式化試算表

在 Apps Script 中新增以下函數來美化試算表：

```javascript
function formatSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // 設定標題列樣式
  const headerRange = sheet.getRange(1, 1, 1, 5);
  headerRange.setBackground("#4285f4");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");

  // 自動調整欄寬
  sheet.autoResizeColumns(1, 5);

  // 凍結標題列
  sheet.setFrozenRows(1);
}
```

然後在 `doPost` 函數的 `forEach` 迴圈後面加上：

```javascript
// 格式化試算表（只在第一次寫入時執行）
if (sheet.getLastRow() === data.length + 1) {
  formatSheet();
}
```

### 加入時間戳記

如果想記錄資料何時寫入試算表，可以在標題列加入「寫入時間」欄位：

```javascript
sheet.appendRow([
  row.platinumGroup,
  row.leaderName,
  row.friendName,
  row.gender,
  row.createdAt,
  new Date().toLocaleString("zh-TW"), // 寫入時間
]);
```

## 🔒 安全性考量

1. **Web App 設定為「任何人」可存取**

   - 這表示任何人知道 URL 都能寫入資料
   - 建議定期更換部署版本以改變 URL
   - 或在 Apps Script 中加入簡單的驗證機制（例如密鑰）

2. **加入簡單驗證（選用）**

在 Apps Script 中加入密鑰驗證：

```javascript
const API_KEY = "your-secret-key-here";

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);

    // 驗證 API Key
    if (requestData.apiKey !== API_KEY) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: "無效的 API Key"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ... 其餘程式碼
  }
}
```

然後在前端的 `lib/googlesheets.ts` 中加入 API Key：

```typescript
body: JSON.stringify({
  action: "addData",
  data: data,
  apiKey: "your-secret-key-here",  // 加入 API Key
}),
```

## 📊 試算表欄位說明

| 欄位       | 說明               | 範例                     |
| ---------- | ------------------ | ------------------------ |
| 白金小組   | 小組名稱           | 喜樂小組                 |
| 領導人姓名 | 帶領新朋友的領導人 | 張三                     |
| 新朋友姓名 | 新朋友的姓名       | 李四                     |
| 性別       | 新朋友的性別       | 男性 / 女性              |
| 報名時間   | 報名的時間戳記     | 2025/12/24 上午 10:30:00 |

## ⚠️ 注意事項

1. **Apps Script 執行限制**

   - 免費帳號每天有執行次數限制
   - 單次請求最多 6 分鐘執行時間
   - 如果資料量大，建議分批匯出

2. **更新部署**

   - 修改 Apps Script 程式碼後，需要建立新的部署版本
   - 或更新現有部署的版本號

3. **資料格式**
   - 確保日期時間格式正確
   - 中文字元應該能正常顯示

## 🎉 完成

設定完成後，您就可以：

- ✅ 從管理頁面直接匯出資料到 Google Sheets
- ✅ 點擊按鈕開啟 Google Sheets 查看完整報表
- ✅ 在 Google Sheets 中進一步分析和處理資料
- ✅ 與團隊成員分享試算表

如有問題，請檢查：

1. Apps Script 是否正確部署
2. URL 是否正確複製到前端
3. 瀏覽器 Console 是否有錯誤訊息
