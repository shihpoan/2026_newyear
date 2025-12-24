"use client";

import Link from "next/link";
import { useState } from "react";

export default function GameListPage() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const games = [
    {
      id: "animals",
      title: "讀動物挑戰",
      description: "快速記憶並讀出可愛的動物圖片",
      icon: "🐶",
      color: "from-pink-500 to-rose-500",
      difficulty: "簡單",
      href: "/animals",
    },
    {
      id: "memory",
      title: "敬請期待",
      description: "敬請期待",
      icon: "🎴",
      color: "from-blue-500 to-cyan-500",
      difficulty: "中等",
      href: "/game/memory",
      comingSoon: true,
    },
    {
      id: "quiz",
      title: "敬請期待",
      description: "敬請期待",
      icon: "🎊",
      color: "from-purple-500 to-indigo-500",
      difficulty: "中等",
      href: "/game/quiz",
      comingSoon: true,
    },
    {
      id: "puzzle",
      title: "敬請期待",
      description: "敬請期待",
      icon: "🧩",
      color: "from-orange-500 to-red-500",
      difficulty: "困難",
      href: "/game/puzzle",
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative">
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

      {/* 返回首頁按鈕 */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all text-gray-700 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-800 border border-white/20"
        >
          <span className="text-xl md:text-2xl">🏠</span>
          <span className="font-semibold text-sm md:text-base">返回首頁</span>
        </Link>
      </div>

      {/* 主要內容 */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        {/* 標題區域 */}
        <div className="text-center mb-8 md:mb-12 pt-16 md:pt-4">
          <div className="inline-block p-8 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl dark:bg-gray-800/70 border border-white/20">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4">
              🎮 遊戲大廳
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              選擇你喜歡的遊戲,開始挑戰吧!
            </p>
          </div>
        </div>

        {/* 遊戲卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {games.map((game) => (
            <Link
              key={game.id}
              href={game.comingSoon ? "#" : game.href}
              onClick={(e) => {
                if (game.comingSoon) {
                  e.preventDefault();
                  alert("敬請期待! 🎉");
                }
              }}
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
              className={`group relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-gray-800/70 border border-white/20 ${
                game.comingSoon ? "cursor-not-allowed opacity-75" : ""
              }`}
            >
              {/* 漸變背景 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>

              {/* 即將推出標籤 */}
              {game.comingSoon && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg z-10">
                  敬請期待
                </div>
              )}

              {/* 卡片內容 */}
              <div className="relative p-6 md:p-8">
                {/* 圖示 */}
                <div className="text-6xl md:text-8xl mb-4 md:mb-6 transition-transform duration-300 group-hover:scale-110">
                  {game.icon}
                </div>

                {/* 遊戲資訊 */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2 md:mb-3">
                  {game.title}
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
                  {game.description}
                </p>

                {/* 難度標籤 */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                      game.difficulty === "簡單"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : game.difficulty === "中等"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    <span>⭐</span>
                    <span>{game.difficulty}</span>
                  </span>

                  {/* 箭頭指示 */}
                  {!game.comingSoon && (
                    <div
                      className={`transform transition-transform duration-300 ${
                        hoveredGame === game.id ? "translate-x-2" : ""
                      }`}
                    >
                      <span className="text-2xl">▶️</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 裝飾元素 */}
              <div className="absolute -bottom-4 -right-4 text-6xl md:text-8xl opacity-5 group-hover:opacity-10 transition-opacity">
                {game.icon}
              </div>
            </Link>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-500">
            💡 提示: 更多有趣的遊戲正在開發中...
          </p>
        </div>
      </div>
    </div>
  );
}
