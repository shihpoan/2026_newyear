// Google Sheets API 工具函數
// 使用 Google Apps Script Web App 作為中間層來寫入 Google Sheets

export interface SheetRow {
  platinumGroup: string;
  leaderName: string;
  friendName: string;
  gender: string;
  createdAt: string;
}

export interface NewFriend {
  id: string;
  name: string;
  gender: "male" | "female";
}

export interface Registration {
  id: string;
  platinumGroup: string;
  leaderName: string;
  newFriends: NewFriend[];
  createdAt: string;
}

/**
 * 將資料匯出到 Google Sheets
 * @param data 要匯出的資料
 * @param webAppUrl Google Apps Script Web App URL
 */
export async function exportToGoogleSheet(
  data: SheetRow[],
  webAppUrl: string
): Promise<{ success: boolean; message: string; sheetUrl?: string }> {
  try {
    await fetch(webAppUrl, {
      method: "POST",
      mode: "no-cors", // Google Apps Script 需要使用 no-cors
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "addData",
        data: data,
      }),
    });

    // 因為使用 no-cors，無法讀取 response，假設成功
    return {
      success: true,
      message: "資料已成功匯出到 Google Sheets",
    };
  } catch (error) {
    console.error("匯出到 Google Sheets 失敗:", error);
    return {
      success: false,
      message:
        "匯出失敗：" + (error instanceof Error ? error.message : "未知錯誤"),
    };
  }
}

/**
 * 開啟 Google Sheets（如果有 URL）
 */
export function openGoogleSheet(url: string) {
  window.open(url, "_blank");
}

/**
 * 準備匯出資料的格式
 */
export function prepareSheetData(registrations: Registration[]): SheetRow[] {
  const rows: SheetRow[] = [];

  registrations.forEach((reg) => {
    reg.newFriends.forEach((friend) => {
      rows.push({
        platinumGroup: reg.platinumGroup,
        leaderName: reg.leaderName,
        friendName: friend.name,
        gender: friend.gender === "male" ? "男性" : "女性",
        createdAt: new Date(reg.createdAt).toLocaleString("zh-TW"),
      });
    });
  });

  return rows;
}
