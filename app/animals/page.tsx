"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const Page = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [level, setLevel] = useState<number>(0);

  const [displayImages, setDisplayImages] = useState<string[]>([]);

  const [countdown, setCountdown] = useState<number | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [animationTimer, setAnimationTimer] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 圖片池 - 移到 useMemo 以避免每次渲染時重新創建

  const images = React.useMemo(
    () => [
      { url: "/images/dog.jpg", level: [0, 1, 2] },

      { url: "/images/cat.jpg", level: [0, 1, 2] },

      { url: "/images/pig.jpg", level: [2] },
      { url: "/images/spa.jpeg", level: [2] },
      { url: "/images/heg.jpeg", level: [2] },
    ],

    []
  );

  // 根據等級篩選並隨機選擇8張圖片

  const getRandomImages = useCallback(() => {
    const availableImages = images.filter((img) => img.level.includes(level));

    const selected: string[] = [];

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * availableImages.length);

      selected.push(availableImages[randomIndex].url);
    }

    return selected;
  }, [level, images]);

  useEffect(() => {
    setDisplayImages(getRandomImages());
  }, [level, getRandomImages]);

  const startAnimation = useCallback(() => {
    // 清理之前的計時器
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    let repeatCount = 0;
    setCycleCount(0);
    setAnimationTimer(0);

    // 啟動動畫計時器（每0.1秒更新）
    const animationStartTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - animationStartTime) / 1000;
      setAnimationTimer(Number(elapsed.toFixed(1)));
    }, 100);

    const runOneCycle = () => {
      setCycleCount((prev) => prev + 1);

      // 🔧 使用時間戳而非計數器來控制動畫
      const cycleStartTime = Date.now();
      let lastIndex = -1;

      const checkFrame = () => {
        const elapsed = Date.now() - cycleStartTime;
        const currentIndex = Math.floor(elapsed / 333); // 每300ms一張圖

        if (currentIndex < 8) {
          // 只在索引改變時更新（避免重複渲染）
          if (currentIndex !== lastIndex) {
            setActiveIndex(currentIndex);
            lastIndex = currentIndex;
          }
          cycleIntervalRef.current = setTimeout(checkFrame, 16); // 每16ms檢查一次（約60fps）
        } else {
          if (cycleIntervalRef.current) {
            clearTimeout(cycleIntervalRef.current);
          }
          setActiveIndex(null);
          repeatCount++;

          if (repeatCount < 10) {
            // 1.5秒後換圖片
            setTimeout(() => {
              setDisplayImages(getRandomImages());
            }, 1500);

            // 2.55秒後開始下一輪動畫
            animationTimeoutRef.current = setTimeout(() => {
              runOneCycle();
            }, 2550);
          } else {
            // 動畫結束，停止計時器
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
          }
        }
      };

      checkFrame();
    };

    // 第一次等3.5秒
    animationTimeoutRef.current = setTimeout(() => {
      runOneCycle();
    }, 3500);
  }, [getRandomImages]);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (cycleIntervalRef.current) {
        clearTimeout(cycleIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      //   if (animationFrameRef.current) {
      //     cancelAnimationFrame(animationFrameRef.current);
      //   }
    };
  }, []);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);
  const handleStartGame = useCallback(() => {
    console.log("🎮 遊戲開始 - 倒數5秒");

    // 清理之前可能存在的計時器
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
    }

    // 開始倒數
    setCountdown(3);
    let count = 3;

    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);

      if (count === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);

        // 倒數結束後才播放音樂和開始動畫
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          const playPromise = audioRef.current.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("✅ 音訊播放成功");
                // 🔧 判斷設備類型：電腦延遲15ms，手機延遲700ms
                const isMobile =
                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    navigator.userAgent
                  );
                const delay = isMobile ? 700 : 150;
                setTimeout(() => {
                  startAnimation();
                }, delay);
              })
              .catch((error) => {
                console.error("❌ 音訊播放失敗:", error);
                // 嘗試靜音播放來解鎖音訊
                if (audioRef.current) {
                  audioRef.current.muted = true;
                  audioRef.current
                    .play()
                    .then(() => {
                      if (audioRef.current) {
                        audioRef.current.muted = false;
                      }
                      // 即使靜音播放也要開始動畫
                      const isMobile =
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                          navigator.userAgent
                        );
                      const delay = isMobile ? 700 : 15;
                      setTimeout(() => {
                        startAnimation();
                      }, delay);
                    })
                    .catch((e) => {
                      console.error("靜音播放也失敗:", e);
                      // 播放失敗仍然執行動畫
                      const isMobile =
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                          navigator.userAgent
                        );
                      const delay = isMobile ? 700 : 15;
                      setTimeout(() => {
                        startAnimation();
                      }, delay);
                    });
                }
              });
          } else {
            // 如果沒有 playPromise，直接開始動畫
            startAnimation();
          }
        } else {
          // 如果沒有音訊元素，直接開始動畫
          startAnimation();
        }
      }
    }, 1000);

    // 倒數期間先預加載音樂（不播放）
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [startAnimation]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();

        handleStartGame();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleStartGame]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-x-hidden">
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

      <audio ref={audioRef} preload="auto" playsInline crossOrigin="anonymous">
        <source src="/audios/bk.m4a" type="audio/mpeg" />
      </audio>

      {/* 返回遊戲列表按鈕 */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <Link
          href="/game"
          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all text-gray-700 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-800 border border-white/20"
        >
          <span className="text-xl md:text-2xl">🎮</span>
          <span className="font-semibold text-sm md:text-base">遊戲列表</span>
        </Link>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        {/* 標題區 */}

        <div className="text-center mb-6 md:mb-10">
          <div className="inline-block p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-md shadow-xl dark:bg-gray-800/70 border border-white/20">
            <h1 className="text-3xl md:text-5xl font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2 md:mb-3">
              🐾 讀動物挑戰 🐾
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg">
              讀出所有可愛的動物朋友！
            </p>
          </div>
        </div>

        {/* 等級設定區 */}

        <div className="max-w-lg mx-auto mb-6 md:mb-10 bg-gray-800/90 backdrop-blur-sm p-4 md:p-8 rounded-2xl shadow-xl border border-emerald-500/30">
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <span className="text-lg md:text-xl font-bold text-gray-100 flex items-center gap-2">
              <span className="text-2xl md:text-3xl">🎯</span>
              難度等級
            </span>

            <span className="px-3 py-1.5 md:px-5 md:py-2.5 bg-linear-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg text-base md:text-lg">
              Level {level}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="2"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="w-full h-3 bg-linear-to-r from-emerald-200 to-teal-200 rounded-full appearance-none cursor-pointer accent-emerald-600 mb-2 md:mb-3"
            style={{
              background: `linear-gradient(to right, rgb(52 211 153) 0%, rgb(52 211 153) ${
                level * 50
              }%, rgb(200 250 215) ${level * 50}%, rgb(200 250 215) 100%)`,
            }}
          />

          <div className="flex justify-between text-xs md:text-sm font-medium">
            <span
              className={`${
                level === 0 ? "text-emerald-400 font-bold" : "text-gray-400"
              }`}
            >
              😊 簡單
            </span>

            <span
              className={`${
                level === 1 ? "text-emerald-400 font-bold" : "text-gray-400"
              }`}
            >
              🤔 普通
            </span>

            <span
              className={`${
                level === 2 ? "text-emerald-400 font-bold" : "text-gray-400"
              }`}
            >
              😤 困難
            </span>
          </div>
        </div>

        {/* 開始按鈕/提示文字 */}

        <div className="text-center mb-6 md:mb-8">
          {/* 倒數計時顯示 */}
          {countdown !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-9xl font-bold text-emerald-400 mb-4 animate-pulse">
                  {countdown === 0 ? "GO!" : countdown}
                </div>
                <p className="text-2xl text-gray-300">準備開始...</p>
              </div>
            </div>
          )}

          {/* 手機版：按鈕 */}

          <button
            onClick={handleStartGame}
            disabled={countdown !== null}
            className="md:hidden bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-emerald-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              開始遊戲
            </span>
          </button>

          {/* 桌面版：鍵盤提示 */}

          <div className="hidden md:block md:absolute md:top-12 md:right-10 bg-gray-800/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-purple-500/50">
            <p className="text-gray-200 text-base font-medium flex items-center gap-2 justify-center">
              <span className="text-xl">⌨️</span>
              按下{" "}
              <kbd className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm font-bold shadow">
                Space
              </kbd>{" "}
              開始遊戲
            </p>
          </div>
        </div>

        {/* 圖片網格 */}

        <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-6xl mx-auto px-2 md:px-0">
          {displayImages.map((imageUrl, index) => (
            <div
              key={index}
              className={`group relative bg-gray-800 rounded-xl md:rounded-2xl p-2 md:p-4 transition-all duration-200 ${
                activeIndex === index
                  ? "ring-2 md:ring-4 ring-yellow-400 shadow-2xl shadow-yellow-400/50 scale-105"
                  : "shadow-lg shadow-emerald-900/50"
              }`}
            >
              <div className="aspect-square bg-linear-to-br from-gray-700 to-gray-600 rounded-lg md:rounded-xl overflow-hidden relative">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`動物 ${index + 1}`}
                    fill
                    className="object-cover"
                    loading="eager"
                    sizes="(max-width: 768px) 25vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-300 text-xl md:text-2xl font-bold">
                      {index + 1}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 音樂播放條和動畫進度 */}
        {/* <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-emerald-500/30 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-3" id='音樂進度條'>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>🎵 音樂播放</span>
                <span>
                  {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-100"
                  style={{
                    width: `${
                      duration > 0 ? (currentTime / duration) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div> */}

        {/* 動畫進度 */}
        {/* <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>⏱️ 動畫進度</span>
                <span>
                  第 {cycleCount} 輪 | {animationTimer.toFixed(1)}s
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-yellow-500 to-orange-500 transition-all duration-100"
                  style={{ width: `${(cycleCount / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Page;
