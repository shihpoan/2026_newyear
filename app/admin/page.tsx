"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { prepareSheetData, exportToGoogleSheet } from "@/lib/googlesheets";
import {
  getRegistrations,
  getUnexportedRegistrations,
  markAsExported,
  updateRegistration,
  deleteRegistration,
} from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";

// 新朋友資料型別
interface NewFriend {
  id: string;
  name: string;
  gender: "male" | "female";
}

// 報名記錄型別
interface Registration {
  id: string;
  platinumGroup: string;
  leaderName: string;
  newFriends: NewFriend[];
  exportedToSheet?: boolean;
  exportedAt?: Timestamp | string;
  createdAt: string;
}

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  // 篩選條件
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterLeader, setFilterLeader] = useState<string>("");
  const [filterExportStatus, setFilterExportStatus] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // 分頁
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 編輯狀態
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Registration | null>(null);

  // 白金小組選項
  const PLATINUM_GROUPS = [
    "彥淳小組",
    "治宏小組",
    "威傑小組",
    "EVANS小組",
    "淑娟小組",
    "文硯小組",
  ];

  // 從 Firebase 載入資料
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getRegistrations();

        // 將 Timestamp 轉換為字串
        const formattedData = data.map((reg) => ({
          ...reg,
          createdAt:
            reg.createdAt instanceof Timestamp
              ? reg.createdAt.toDate().toISOString()
              : reg.createdAt,
        }));

        setRegistrations(formattedData);
        setLoadError("");
      } catch (error) {
        console.error("載入資料失敗:", error);
        setLoadError("載入資料失敗，請重新整理頁面");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Google Apps Script Web App URL
  // TODO: 替換為您的 Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxdJV-VOsWY3MMUZ3UHJgrRD39Y10X9T56wBJvSTbqCffqjrovjEqJAP6MOtUmA9S9bDw/exec";

  // Google Sheet URL（供使用者查看）
  const GOOGLE_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/1CZX196MXeHwlIyXQ0saqBwwnunINyN2s4okP8HYKISc/edit?usp=sharing";

  // 匯出到 Google Sheets
  const exportToSheets = async () => {
    setIsExporting(true);
    setExportMessage("");

    try {
      // 只取得未匯出的資料
      const unexportedData = await getUnexportedRegistrations();

      if (unexportedData.length === 0) {
        setExportMessage("✅ 沒有新資料需要匯出");
        setIsExporting(false);
        setTimeout(() => setExportMessage(""), 3000);
        return;
      }

      // 轉換 Timestamp 為字串
      const formattedUnexported = unexportedData.map((reg) => ({
        ...reg,
        createdAt:
          reg.createdAt instanceof Timestamp
            ? reg.createdAt.toDate().toISOString()
            : reg.createdAt,
      }));

      // 準備匯出資料
      const sheetData = prepareSheetData(formattedUnexported);
      const result = await exportToGoogleSheet(sheetData, GOOGLE_SCRIPT_URL);

      if (result.success) {
        // 標記為已匯出
        const exportedIds = unexportedData.map((reg) => reg.id);
        await markAsExported(exportedIds);

        setExportMessage(
          `✅ 成功匯出 ${unexportedData.length} 筆資料到 Google Sheets！`
        );

        // 重新載入資料以更新狀態
        const updatedData = await getRegistrations();
        const formattedData = updatedData.map((reg) => ({
          ...reg,
          createdAt:
            reg.createdAt instanceof Timestamp
              ? reg.createdAt.toDate().toISOString()
              : reg.createdAt,
        }));
        setRegistrations(formattedData);

        // 3 秒後清除訊息
        setTimeout(() => setExportMessage(""), 3000);
      } else {
        setExportMessage("❌ " + result.message);
      }
    } catch (error) {
      console.error("匯出失敗:", error);
      setExportMessage("❌ 匯出失敗，請稍後再試");
    } finally {
      setIsExporting(false);
    }
  };

  // 開啟 Google Sheet
  const openSheet = () => {
    window.open(GOOGLE_SHEET_URL, "_blank");
  };

  // 開始編輯
  const startEdit = (reg: Registration) => {
    setEditingId(reg.id);
    setEditForm(JSON.parse(JSON.stringify(reg))); // 深拷貝
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  // 儲存編輯
  const saveEdit = async () => {
    if (!editForm) return;

    try {
      await updateRegistration(editForm.id, {
        platinumGroup: editForm.platinumGroup,
        leaderName: editForm.leaderName,
        newFriends: editForm.newFriends,
      });

      // 重新載入資料
      const updatedData = await getRegistrations();
      const formattedData = updatedData.map((reg) => ({
        ...reg,
        createdAt:
          reg.createdAt instanceof Timestamp
            ? reg.createdAt.toDate().toISOString()
            : reg.createdAt,
      }));
      setRegistrations(formattedData);

      setEditingId(null);
      setEditForm(null);
      setExportMessage("✅ 資料已更新");
      setTimeout(() => setExportMessage(""), 3000);
    } catch (error) {
      console.error("更新失敗:", error);
      setExportMessage("❌ 更新失敗");
      setTimeout(() => setExportMessage(""), 3000);
    }
  };

  // 刪除資料
  const handleDelete = async (id: string, leaderName: string) => {
    if (!confirm(`確定要刪除「${leaderName}」的報名資料嗎？此操作無法復原。`)) {
      return;
    }

    try {
      await deleteRegistration(id);

      // 重新載入資料
      const updatedData = await getRegistrations();
      const formattedData = updatedData.map((reg) => ({
        ...reg,
        createdAt:
          reg.createdAt instanceof Timestamp
            ? reg.createdAt.toDate().toISOString()
            : reg.createdAt,
      }));
      setRegistrations(formattedData);

      setExportMessage("✅ 資料已刪除");
      setTimeout(() => setExportMessage(""), 3000);
    } catch (error) {
      console.error("刪除失敗:", error);
      setExportMessage("❌ 刪除失敗");
      setTimeout(() => setExportMessage(""), 3000);
    }
  };

  // 更新編輯表單的新朋友
  const updateEditFriend = (
    friendId: string,
    field: "name" | "gender",
    value: string
  ) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      newFriends: editForm.newFriends.map((friend) =>
        friend.id === friendId ? { ...friend, [field]: value } : friend
      ),
    });
  };

  // 新增編輯表單的新朋友
  const addEditFriend = () => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      newFriends: [
        ...editForm.newFriends,
        { id: crypto.randomUUID(), name: "", gender: "male" },
      ],
    });
  };

  // 移除編輯表單的新朋友
  const removeEditFriend = (friendId: string) => {
    if (!editForm || editForm.newFriends.length <= 1) {
      alert("至少需要一位新朋友資料");
      return;
    }
    setEditForm({
      ...editForm,
      newFriends: editForm.newFriends.filter((f) => f.id !== friendId),
    });
  };

  // 取得所有白金小組列表（用於篩選）
  const allGroups = Array.from(
    new Set(registrations.map((reg) => reg.platinumGroup))
  ).sort();

  // 套用篩選
  const filteredRegistrations = registrations.filter((reg) => {
    // 篩選白金小組
    if (filterGroup !== "all" && reg.platinumGroup !== filterGroup) {
      return false;
    }

    // 篩選領導人（模糊搜尋）
    if (
      filterLeader &&
      !reg.leaderName.toLowerCase().includes(filterLeader.toLowerCase())
    ) {
      return false;
    }

    // 篩選匯出狀態
    if (filterExportStatus === "exported" && !reg.exportedToSheet) {
      return false;
    }
    if (filterExportStatus === "unexported" && reg.exportedToSheet) {
      return false;
    }

    return true;
  });

  // 分頁計算
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRegistrations = filteredRegistrations.slice(
    startIndex,
    endIndex
  );

  // 當篩選條件改變時，重置到第一頁
  useEffect(() => {
    setCurrentPage(1);
  }, [filterGroup, filterLeader, filterExportStatus]);

  // 統計資訊（基於所有資料）
  const totalRegistrations = registrations.length;
  const totalNewFriends = registrations.reduce(
    (sum, reg) => sum + reg.newFriends.length,
    0
  );
  const maleCount = registrations.reduce(
    (sum, reg) =>
      sum + reg.newFriends.filter((f) => f.gender === "male").length,
    0
  );
  const femaleCount = registrations.reduce(
    (sum, reg) =>
      sum + reg.newFriends.filter((f) => f.gender === "female").length,
    0
  );
  const unexportedCount = registrations.filter(
    (reg) => !reg.exportedToSheet
  ).length;

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative py-8 px-4">
      {/* 桌面版背景 */}
      <div
        className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat"
        // style={{ backgroundImage: "url('/banner.png')" }}
      ></div>

      {/* 手機版背景 */}
      <div
        className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/mobile_banner.png')" }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* 返回首頁按鈕 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all text-gray-700 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-800 border border-white/20"
          >
            <span className="text-xl md:text-2xl">🏠</span>
            <span className="font-semibold text-sm md:text-base">返回首頁</span>
          </Link>
        </div>

        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            📊 住宿登記管理系統
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            查看所有住宿資料並匯出報表
          </p>
        </div>

        {/* 統計卡片 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <div className="text-gray-600 dark:text-gray-400">
              載入資料中...
            </div>
          </div>
        ) : loadError ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-6 rounded-lg mb-8 text-center">
            {loadError}
          </div>
        ) : (
          <>
            {/* 統計卡片 - 手機版可橫向滾動 */}
            <div className="mb-8 overflow-x-auto">
              <div
                className="flex md:grid md:grid-cols-5 gap-4 pb-2 md:pb-0"
                style={{ minWidth: "min-content" }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-w-37.5 md:min-w-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    報名筆數
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {totalRegistrations}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-w-37.5 md:min-w-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    新朋友總數
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {totalNewFriends}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-w-37.5 md:min-w-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    男性人數
                  </div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {maleCount}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-w-37.5 md:min-w-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    女性人數
                  </div>
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                    {femaleCount}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 min-w-37.5 md:min-w-0">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    待匯出筆數
                  </div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {unexportedCount}
                  </div>
                </div>
              </div>
            </div>

            {/* 篩選區域 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
              {/* 篩選標題與切換按鈕 */}
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    篩選條件
                  </h3>
                  {(filterGroup !== "all" ||
                    filterLeader ||
                    filterExportStatus !== "all") && (
                    <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      使用中
                    </span>
                  )}
                </div>
                <span
                  className={`text-gray-500 dark:text-gray-400 transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* 篩選內容 */}
              {isFilterOpen && (
                <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {/* 白金小組篩選 */}
                    <div>
                      <label
                        htmlFor="filterGroup"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        白金小組
                      </label>
                      <select
                        id="filterGroup"
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="all">全部小組</option>
                        {allGroups.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 領導人篩選 */}
                    <div>
                      <label
                        htmlFor="filterLeader"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        領導人姓名
                      </label>
                      <input
                        type="text"
                        id="filterLeader"
                        value={filterLeader}
                        onChange={(e) => setFilterLeader(e.target.value)}
                        placeholder="輸入姓名搜尋..."
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* 匯出狀態篩選 */}
                    <div>
                      <label
                        htmlFor="filterExportStatus"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        匯出狀態
                      </label>
                      <select
                        id="filterExportStatus"
                        value={filterExportStatus}
                        onChange={(e) => setFilterExportStatus(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="all">全部狀態</option>
                        <option value="unexported">待匯出</option>
                        <option value="exported">已匯出</option>
                      </select>
                    </div>
                  </div>

                  {/* 篩選結果摘要與清除按鈕 */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      顯示 {filteredRegistrations.length} 筆資料
                      {filteredRegistrations.length !== totalRegistrations &&
                        ` (共 ${totalRegistrations} 筆)`}
                    </div>
                    {(filterGroup !== "all" ||
                      filterLeader ||
                      filterExportStatus !== "all") && (
                      <button
                        onClick={() => {
                          setFilterGroup("all");
                          setFilterLeader("");
                          setFilterExportStatus("all");
                        }}
                        className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        清除篩選
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 匯出按鈕 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end mb-6">
              <button
                onClick={openSheet}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-12 bg-linear-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 active:scale-95 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 text-sm sm:text-base"
              >
                <span>📊</span>
                <span>開啟 Google Sheet</span>
              </button>
              <button
                onClick={exportToSheets}
                disabled={isExporting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-12 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:scale-95 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              >
                <span>{isExporting ? "⏳" : "📤"}</span>
                <span>
                  {isExporting ? "匯出中..." : "匯出到 Google Sheets"}
                </span>
              </button>
            </div>
          </>
        )}

        {/* 匯出訊息 */}
        {exportMessage && (
          <div
            className={`mb-6 p-4 rounded-lg text-center ${
              exportMessage.includes("成功")
                ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            }`}
          >
            {exportMessage}
          </div>
        )}

        {/* 資料表格 */}
        {!isLoading && !loadError && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {/* 桌面版表格 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      白金小組
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      領導人
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      新朋友
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      人數
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      報名時間
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      匯出狀態
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentRegistrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      {editingId === reg.id && editForm ? (
                        // 編輯模式
                        <>
                          <td className="px-6 py-4">
                            <select
                              value={editForm.platinumGroup}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  platinumGroup: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              {PLATINUM_GROUPS.map((group) => (
                                <option key={group} value={group}>
                                  {group}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.leaderName}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  leaderName: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {editForm.newFriends.map((friend) => (
                                <div
                                  key={friend.id}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="text"
                                    value={friend.name}
                                    onChange={(e) =>
                                      updateEditFriend(
                                        friend.id,
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    placeholder="姓名"
                                    className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                  <select
                                    value={friend.gender}
                                    onChange={(e) =>
                                      updateEditFriend(
                                        friend.id,
                                        "gender",
                                        e.target.value
                                      )
                                    }
                                    className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  >
                                    <option value="male">男</option>
                                    <option value="female">女</option>
                                  </select>
                                  {editForm.newFriends.length > 1 && (
                                    <button
                                      onClick={() =>
                                        removeEditFriend(friend.id)
                                      }
                                      className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                onClick={addEditFriend}
                                className="text-sm text-blue-500 hover:text-blue-700"
                              >
                                + 新增新朋友
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {editForm.newFriends.length} 位
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(reg.createdAt).toLocaleString("zh-TW")}
                          </td>
                          <td className="px-6 py-4">
                            {reg.exportedToSheet ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                ✓ 已匯出
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                                ⏳ 待匯出
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={saveEdit}
                                className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                              >
                                儲存
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                              >
                                取消
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // 顯示模式
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {reg.platinumGroup}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {reg.leaderName}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {reg.newFriends.map((friend) => (
                                <div
                                  key={friend.id}
                                  className="text-sm text-gray-700 dark:text-gray-300"
                                >
                                  {friend.name} (
                                  {friend.gender === "male" ? "男" : "女"})
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {reg.newFriends.length} 位
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(reg.createdAt).toLocaleString("zh-TW")}
                          </td>
                          <td className="px-6 py-4">
                            {reg.exportedToSheet ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                ✓ 已匯出
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                                ⏳ 待匯出
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(reg)}
                                className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                              >
                                編輯
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(reg.id, reg.leaderName)
                                }
                                className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                              >
                                刪除
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 手機版卡片列表 */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {currentRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {editingId === reg.id && editForm ? (
                    // 編輯模式
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                          白金小組
                        </label>
                        <select
                          value={editForm.platinumGroup}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              platinumGroup: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {PLATINUM_GROUPS.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                          領導人
                        </label>
                        <input
                          type="text"
                          value={editForm.leaderName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              leaderName: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                          新朋友 ({editForm.newFriends.length} 位)
                        </label>
                        <div className="space-y-2">
                          {editForm.newFriends.map((friend) => (
                            <div
                              key={friend.id}
                              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                            >
                              <input
                                type="text"
                                value={friend.name}
                                onChange={(e) =>
                                  updateEditFriend(
                                    friend.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="姓名"
                                className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <select
                                value={friend.gender}
                                onChange={(e) =>
                                  updateEditFriend(
                                    friend.id,
                                    "gender",
                                    e.target.value
                                  )
                                }
                                className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="male">男</option>
                                <option value="female">女</option>
                              </select>
                              {editForm.newFriends.length > 1 && (
                                <button
                                  onClick={() => removeEditFriend(friend.id)}
                                  className="text-red-500 hover:text-red-700 px-2"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={addEditFriend}
                            className="w-full py-2 text-sm text-blue-500 hover:text-blue-700 border border-dashed border-blue-300 dark:border-blue-700 rounded"
                          >
                            + 新增新朋友
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={saveEdit}
                          className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                        >
                          儲存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 顯示模式
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            白金小組
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {reg.platinumGroup}
                          </div>
                        </div>
                        <div>
                          {reg.exportedToSheet ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                              ✓ 已匯出
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200">
                              ⏳ 待匯出
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          領導人
                        </div>
                        <div className="text-gray-900 dark:text-white">
                          {reg.leaderName}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          新朋友 ({reg.newFriends.length} 位)
                        </div>
                        <div className="space-y-1">
                          {reg.newFriends.map((friend) => (
                            <div
                              key={friend.id}
                              className="text-sm text-gray-700 dark:text-gray-300 pl-2"
                            >
                              • {friend.name} (
                              {friend.gender === "male" ? "男" : "女"})
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                        報名時間:{" "}
                        {new Date(reg.createdAt).toLocaleString("zh-TW")}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => startEdit(reg)}
                          className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(reg.id, reg.leaderName)}
                          className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 空狀態 */}
            {filteredRegistrations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <div className="text-gray-600 dark:text-gray-400">
                  {registrations.length === 0
                    ? "目前沒有報名資料"
                    : "沒有符合篩選條件的資料"}
                </div>
              </div>
            )}

            {/* 分頁控制 */}
            {filteredRegistrations.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                  顯示第 {startIndex + 1} 到{" "}
                  {Math.min(endIndex, filteredRegistrations.length)} 筆，共{" "}
                  {filteredRegistrations.length} 筆
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    上一頁
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // 只顯示當前頁附近的頁碼
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg transition-all ${
                                currentPage === page
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span
                              key={page}
                              className="text-gray-500 dark:text-gray-400 px-1"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    下一頁
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 底部說明 */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            💡 提示：點擊「匯出到 Google Sheets」將資料新增到 Google
            試算表，點擊「開啟 Google Sheet」查看完整報表
          </p>
        </div>
      </div>
    </div>
  );
}
