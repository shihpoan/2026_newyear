"use client";

import { useState } from "react";
import Link from "next/link";
import { addRegistration } from "@/lib/firestore";

// 新朋友資料型別
interface NewFriend {
  id: string;
  name: string;
  gender: "male" | "female" | "";
}

// 表單資料型別
interface FormData {
  platinumGroup: string;
  leaderName: string;
  newFriends: NewFriend[];
}

// 白金小組選項
const PLATINUM_GROUPS = [
  "彥淳小組",
  "治宏小組",
  "威傑小組",
  "EVANS小組",
  "淑娟小組",
  "文硯小組",
];

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    platinumGroup: "",
    leaderName: "",
    newFriends: [{ id: crypto.randomUUID(), name: "", gender: "" }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // 新增新朋友欄位
  const addNewFriend = () => {
    setFormData((prev) => ({
      ...prev,
      newFriends: [
        ...prev.newFriends,
        { id: crypto.randomUUID(), name: "", gender: "" },
      ],
    }));
  };

  // 移除新朋友欄位
  const removeNewFriend = (id: string) => {
    if (formData.newFriends.length <= 1) {
      alert("至少需要一位新朋友資料");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      newFriends: prev.newFriends.filter((friend) => friend.id !== id),
    }));
  };

  // 更新新朋友資料
  const updateNewFriend = (
    id: string,
    field: "name" | "gender",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      newFriends: prev.newFriends.map((friend) =>
        friend.id === id ? { ...friend, [field]: value } : friend
      ),
    }));
  };

  // 更新一般欄位
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    // 驗證所有新朋友都有填寫姓名和性別
    const hasEmptyFields = formData.newFriends.some(
      (friend) => !friend.name || !friend.gender
    );

    if (hasEmptyFields) {
      setSubmitMessage("❌ 請填寫所有新朋友的姓名和性別");
      setIsSubmitting(false);
      return;
    }

    try {
      // 儲存到 Firebase Firestore
      const docId = await addRegistration({
        platinumGroup: formData.platinumGroup,
        leaderName: formData.leaderName,
        newFriends: formData.newFriends as Array<{
          id: string;
          name: string;
          gender: "male" | "female";
        }>,
      });

      console.log("資料已儲存到 Firebase，文檔 ID:", docId);

      setSubmitMessage("✅ 報名成功！感謝您的報名。");
      setIsSubmitting(false);

      // 重置表單
      setFormData({
        platinumGroup: "",
        leaderName: "",
        newFriends: [{ id: crypto.randomUUID(), name: "", gender: "" }],
      });
    } catch (error) {
      console.error("提交失敗:", error);
      setSubmitMessage(
        "❌ 提交失敗，請稍後再試。" +
          (error instanceof Error ? error.message : "")
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative py-8 px-4">
      {/* 桌面版背景 */}
      <div
        className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/banner.png')" }}
      ></div>

      {/* 手機版背景 */}
      <div
        className="md:hidden absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/mobile_banner.png')" }}
      ></div>

      <div className="relative z-10 max-w-4xl mx-auto">
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

        {/* 表單容器 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10">
          {/* 標題 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              新朋友住宿登記表
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              請填寫以下資訊完成報名
            </p>
          </div>

          {/* 表單 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 白金小組 */}
            <div>
              <label
                htmlFor="platinumGroup"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                白金小組 <span className="text-red-500">*</span>
              </label>
              <select
                id="platinumGroup"
                name="platinumGroup"
                required
                value={formData.platinumGroup}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">請選擇白金小組</option>
                {PLATINUM_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {/* 領導人姓名 */}
            <div>
              <label
                htmlFor="leaderName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                領導人姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="leaderName"
                name="leaderName"
                required
                value={formData.leaderName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="請輸入領導人姓名"
              />
            </div>

            {/* 新朋友資料區塊 */}
            <div className="border-t pt-6 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  新朋友資料
                </h3>
                <button
                  type="button"
                  onClick={addNewFriend}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 min-h-12 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base"
                >
                  <span>➕</span>
                  <span>新增新朋友</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.newFriends.map((friend, index) => (
                  <div
                    key={friend.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">
                        新朋友 #{index + 1}
                      </h4>
                      {formData.newFriends.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeNewFriend(friend.id)}
                          className="inline-flex items-center gap-1 px-3 py-2 min-h-11 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 active:scale-95 rounded-lg transition-all text-sm"
                        >
                          🗑️ <span className="hidden sm:inline">移除</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 姓名 */}
                      <div>
                        <label
                          htmlFor={`friend-name-${friend.id}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          姓名 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id={`friend-name-${friend.id}`}
                          required
                          value={friend.name}
                          onChange={(e) =>
                            updateNewFriend(friend.id, "name", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="請輸入姓名"
                        />
                      </div>

                      {/* 性別 */}
                      <div>
                        <label
                          htmlFor={`friend-gender-${friend.id}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          性別 <span className="text-red-500">*</span>
                        </label>
                        <select
                          id={`friend-gender-${friend.id}`}
                          required
                          value={friend.gender}
                          onChange={(e) =>
                            updateNewFriend(friend.id, "gender", e.target.value)
                          }
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        >
                          <option value="">請選擇性別</option>
                          <option value="male">男性</option>
                          <option value="female">女性</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 提交按鈕 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-95 text-white font-bold py-4 px-6 min-h-14 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base sm:text-lg"
            >
              {isSubmitting ? "提交中..." : "🎉 確認登記"}
            </button>

            {/* 提交訊息 */}
            {submitMessage && (
              <div
                className={`p-4 rounded-lg text-center ${
                  submitMessage.includes("成功")
                    ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                    : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                }`}
              >
                {submitMessage}
              </div>
            )}
          </form>
        </div>

        {/* 底部說明 */}
        <div className="mt-6 text-center text-sm text-gray-900 dark:text-gray-900">
          <p>如有任何問題，請聯繫活動負責人</p>
        </div>
      </div>
    </div>
  );
}
