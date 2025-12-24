# Firebase 資料庫結構設計

## Collection: registrations

每筆報名記錄的資料結構：

```typescript
{
  id: string,                    // 自動生成的文檔 ID
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

## 索引建議

- `createdAt` (降序) - 用於時間排序
- `platinumGroup` - 用於按小組篩選
- `leaderName` - 用於搜尋領導人

## 白金小組清單

預設的白金小組選項（可在程式中調整）：

- 喜樂小組
- 恩典小組
- 平安小組
- 信心小組
- 盼望小組
- 愛心小組
- 和平小組
- 智慧小組

## Excel 匯出欄位

匯出時展開的欄位結構：

1. 白金小組
2. 領導人姓名
3. 新朋友姓名
4. 性別
5. 報名時間

（每位新朋友會佔一行，同一領導人的多位新朋友會重複顯示小組和領導人資訊）
