import Link from "next/link";

export default function Home() {
  // 檢查是否為 12/31
  const now = new Date();
  const isDecember31 = now.getMonth() === 11 && now.getDate() === 31;

  return (
    <div className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat">
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
      {/* <div className="absolute inset-0 bg-linear-to-br from-red-50/80 via-orange-50/80 to-yellow-50/80 dark:from-gray-900/90 dark:to-gray-800/90"></div> */}

      <main className="relative z-10 flex w-full max-w-6xl flex-col items-center justify-center gap-6 md:gap-8 px-4 md:px-8 py-8 md:py-16 mt-32 md:mt-80">
        <div
          className={`grid w-full gap-4 md:gap-6 ${
            isDecember31
              ? "grid-cols-1 place-items-center"
              : "grid-cols-1 md:grid-cols-3"
          }`}
        >
          {/* GAME 卡片 */}
          <Link
            href="/game"
            className="group relative flex flex-col items-center justify-center rounded-2xl bg-white/70 backdrop-blur-md p-6 md:p-8 shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:bg-white/80 dark:bg-gray-800/70 dark:hover:bg-gray-800/80 overflow-hidden border border-white/20 w-full max-w-sm"
          >
            {/* 卡片裝飾鑽石 */}
            <div className="absolute top-2 right-2 text-xl md:text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
              💎
            </div>
            <div className="absolute bottom-2 left-2 text-lg md:text-xl opacity-20 group-hover:opacity-40 transition-opacity">
              💎
            </div>

            <div className="mb-3 md:mb-4 text-5xl md:text-6xl">🎮</div>
            <h2 className="mb-2 text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
              GAME
            </h2>
            <p className="text-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              點擊進入遊戲
            </p>
          </Link>

          {/* 報名表卡片 - 12/31 不顯示 */}
          {!isDecember31 && (
            <Link
              href="/register"
              className="group relative flex flex-col items-center justify-center rounded-2xl bg-white/70 backdrop-blur-md p-6 md:p-8 shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:bg-white/80 dark:bg-gray-800/70 dark:hover:bg-gray-800/80 overflow-hidden border border-white/20 w-full max-w-sm"
            >
              {/* 卡片裝飾鑽石 */}
              <div className="absolute top-2 left-2 text-lg md:text-xl opacity-20 group-hover:opacity-40 transition-opacity">
                💎
              </div>
              <div className="absolute bottom-2 right-2 text-xl md:text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
                💎
              </div>

              <div className="mb-3 md:mb-4 text-5xl md:text-6xl">📝</div>
              <h2 className="mb-2 text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                住宿登記表
              </h2>
              <p className="text-center text-sm md:text-base text-gray-600 dark:text-gray-400">
                立即登記
              </p>
            </Link>
          )}

          {/* 住宿列表卡片 - 12/31 不顯示 */}
          {!isDecember31 && (
            <Link
              href="/admin"
              className="group relative flex flex-col items-center justify-center rounded-2xl bg-white/70 backdrop-blur-md p-6 md:p-8 shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:bg-white/80 dark:bg-gray-800/70 dark:hover:bg-gray-800/80 overflow-hidden border border-white/20 w-full max-w-sm"
            >
              {/* 卡片裝飾鑽石 */}
              <div className="absolute top-2 right-2 text-xl md:text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
                💎
              </div>
              <div className="absolute bottom-2 left-2 text-lg md:text-xl opacity-20 group-hover:opacity-40 transition-opacity">
                💎
              </div>

              <div className="mb-3 md:mb-4 text-5xl md:text-6xl">📊</div>
              <h2 className="mb-2 text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                住宿列表
              </h2>
              <p className="text-center text-sm md:text-base text-gray-600 dark:text-gray-400">
                查看管理資料
              </p>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
