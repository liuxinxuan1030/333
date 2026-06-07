import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateDailyInkResult, getAlternateResultForTimestamp } from './data/inkDatabase';
import { InkResult } from './types';
import InkBleedAnimation from './components/InkBleedAnimation';
import SharePoster from './components/SharePoster';
import { Volume2, VolumeX, Sparkles, RefreshCw, PenTool, Share2 } from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'animating' | 'result'>('home');
  const [currentResult, setCurrentResult] = useState<InkResult | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Format today's date key
  const getTodayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  // On mount, check if there's already an active save for today in localStorage
  useEffect(() => {
    const todayKey = getTodayKey();
    const stored = localStorage.getItem('today_ink_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as InkResult;
        if (parsed.dateStr === todayKey) {
          setCurrentResult(parsed);
        }
      } catch (e) {
        console.error('Failed to parse stored ink result', e);
      }
    }
  }, []);

  // Handler to generate completely new custom result (e.g., if re-testing)
  const triggerNewInkFlow = (seeded: boolean) => {
    let result: InkResult;
    if (seeded) {
      result = generateDailyInkResult(new Date());
    } else {
      // Dynamic test seeded with random timestamp to give fun variations
      result = getAlternateResultForTimestamp(Date.now());
    }

    setCurrentResult(result);
    setActiveScreen('animating');
  };

  // Saves to localStorage if it's the daily default result
  const handleAnimationComplete = () => {
    if (currentResult) {
      const todayKey = getTodayKey();
      if (currentResult.dateStr === todayKey) {
        localStorage.setItem('today_ink_data', JSON.stringify(currentResult));
      }
    }
    setActiveScreen('result');
  };

  // Traditional date presentation formatting (e.g., "乙巳年五月 • 廿一")
  const getTraditionalDateString = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = today.toLocaleDateString('zh-CN', options);
    
    // Simple custom Chinese year cycle equivalent (roughly estimated for calendar atmosphere)
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const startYear = 1984; // 甲子 year
    const cycle = (today.getFullYear() - startYear) % 60;
    const yearStem = stems[cycle % 10];
    const yearBranch = branches[cycle % 12];
    
    return `${yearStem}${yearBranch}年 • 今日立案`;
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between items-center paper-bg-pattern px-4 py-6 md:py-10 text-neutral-800 font-sans selection:bg-neutral-200 select-none overflow-hidden">
      
      {/* Left side text header with custom vector brand logo */}
      <div className="absolute top-4 left-4 flex items-center gap-2.5 opacity-90 select-none">
        <svg className="w-5.5 h-5.5 text-neutral-900" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          {/* Top Outer Hook Frame */}
          <path d="M 40 37 H 26 C 23.5 37 22.5 36 22.5 33.5 V 19 C 22.5 16.5 23.5 15.5 26.5 15.5 H 73.5 C 76.5 15.5 77.5 16.5 77.5 19 V 33.5 C 77.5 36 76.5 37 74 37 H 60" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Upper central floating pill */}
          <path d="M 41 25.5 H 59" strokeWidth="5.5" strokeLinecap="round" />
          
          {/* Central Gold/Mustard Calligraphy Brush */}
          <rect x="47.6" y="31.5" width="4.8" height="29" rx="1.5" fill="#bc9501" stroke="none" />
          <path d="M 47.6 60 L 50 73 L 52.4 60 Z" fill="#bc9501" stroke="none" />
          
          {/* Left and Right pill pairs */}
          <path d="M 22.5 49 H 41" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 22.5 60.5 H 41" strokeWidth="5.5" strokeLinecap="round" />
          
          <path d="M 59 49 H 77.5" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 59 60.5 H 77.5" strokeWidth="5.5" strokeLinecap="round" />
          
          {/* Bottom character horizontal support and double logs */}
          <path d="M 22.5 74.5 H 77.5" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 50 74.5 V 86" strokeWidth="5.5" />
          <path d="M 22.5 86.5 H 77.5" strokeWidth="5.5" strokeLinecap="round" />
        </svg>
        <span className="font-serif tracking-[0.25em] text-xs text-neutral-800 font-medium pb-0.5">今日试墨</span>
      </div>

      {/* Volume Sound controller & Zen Status Indicator top right */}
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors focus:outline-none"
          title={isMuted ? "开启ASMR声音" : "静音"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
        </button>
        <span className="h-2 w-2 rounded-full bg-neutral-300 pointer-events-none" />
      </div>

      {/* Main Section */}
      <div className="w-full max-w-[480px] flex-1 flex flex-col justify-center py-4 relative z-10 select-none">
        
        <AnimatePresence mode="wait">
          
          {/* SCREEN 1: HOME */}
          {activeScreen === 'home' && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center text-center space-y-12 py-8"
            >
              {/* Spiritual calligraphy frame with Chinese 毛笔尖 (pointed brush) */}
              <div className="relative p-7 w-28 h-28 border border-neutral-200/50 rounded-full flex items-center justify-center bg-white/20 shadow-inner">
                <div className="absolute inset-2 border border-dashed border-neutral-300/45 rounded-full" />
                <svg className="w-20 h-20 text-neutral-800 transition-all duration-300 hover:scale-110 active:scale-95" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Top Hanging Loop (Slender Oval) */}
                  <path d="M 66 18 C 69 13, 73 6, 76.5 11 C 79 14.5, 74.5 19, 71.5 22.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Top cap */}
                  <path d="M 64.5 19 L 72.5 22.5 C 73.5 21, 74.5 19.5, 73.5 18 C 72.5 16.5, 68.5 14.5, 66 16.5 Z" fill="#fbfaf7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Long Shaft / Handle (filled with white to prevent line showing) */}
                  <path d="M 65 21 L 68.5 22.5 L 47.5 69.5 L 44 68 Z" fill="#fbfaf7" />
                  <path d="M 65 21 L 44 68 M 68.5 22.5 L 47.5 69.5" stroke="currentColor" strokeWidth="1.8" />
                  
                  {/* Bottom ferrule / collar */}
                  <path d="M 44 68 L 41.5 76 L 49.5 78.5 L 47.5 69.5 Z" fill="#fbfaf7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Pointed Calligraphy hair tip */}
                  <path d="M 41.5 76 C 36 82, 34 89, 30.5 107 C 35.5 101, 46 95, 49.5 78.5 Z" fill="#fbfaf7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Internal hair textures from the drawing */}
                  <path d="M 39 81 C 36 86, 35.5 93, 33 100" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M 43.5 82 C 40 88, 38.5 94, 35.5 102" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              <div className="space-y-4">
                <h1 className="font-serif text-3xl font-light tracking-[0.35em] text-neutral-900 leading-relaxed pl-[0.35em]">
                  今日，请试一方墨。
                </h1>
                <p className="font-serif text-xs tracking-widest text-neutral-400 max-w-[280px] mx-auto leading-relaxed">
                  一隅留白，万事未定。<br />
                  每一落笔，皆是不期而遇。
                </p>
              </div>

              {/* Central Branch buttons based on state */}
              <div className="flex flex-col gap-4 w-full px-8 pt-4">
                {currentResult ? (
                  // User already performed today's click ritual
                  <div className="space-y-4">
                    <button
                      onClick={() => setActiveScreen('result')}
                      className="w-full py-3.5 px-6 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl shadow-lg font-serif tracking-widest text-sm transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>回看今日墨候</span>
                      <span className="text-xs bg-white/15 px-1.5 py-0.5 rounded text-neutral-200">
                        {currentResult.inkFortune}
                      </span>
                    </button>
                    
                    <button
                      onClick={() => triggerNewInkFlow(false)}
                      className="w-full py-3 px-6 bg-transparent hover:bg-neutral-100 text-neutral-600 border border-neutral-200/60 rounded-xl font-serif tracking-widest text-xs transition-all duration-200"
                    >
                      再拂素笺，重书一笔（随机体验）
                    </button>
                  </div>
                ) : (
                  // Safe initial state clicker
                  <button
                    onClick={() => triggerNewInkFlow(true)}
                    className="w-full py-4 px-8 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl shadow-xl font-serif tracking-[0.4em] text-sm tracking-widest transition-all duration-300 hover:shadow-xl active:scale-95"
                  >
                    落 墨
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: INK CONTACT ASMR ANIMATION */}
          {activeScreen === 'animating' && (
            <motion.div
              key="animation-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-4"
            >
              <InkBleedAnimation 
                accentColor={currentResult?.colorHex || '#111111'}
                onComplete={handleAnimationComplete}
              />
            </motion.div>
          )}

          {/* SCREEN 3: RESULTS CONTAINER */}
          {activeScreen === 'result' && currentResult && (
            <motion.div
              key="result-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col space-y-6 md:space-y-8 select-none text-neutral-800"
            >
              
              {/* Standard Calligraphy Header info */}
              <div className="text-center space-y-1">
                <span className="block font-mono text-[9px] tracking-[0.3em] text-neutral-400">
                  {getTraditionalDateString()}
                </span>
                <span className="inline-block px-2.5 py-0.5 font-serif text-[10px] tracking-wider text-neutral-400 rounded-full border border-neutral-200/40 bg-neutral-50/50">
                  纸性 • {currentResult.paperType}
                </span>
              </div>

              {/* Large, beautiful card for Fortune and Personality */}
              <div className="relative p-6 py-8 bg-white/40 border border-neutral-200/50 rounded-2xl shadow-sm text-center overflow-hidden flex flex-col items-center">
                
                {/* Visual Accent drop */}
                <div 
                  className="w-3.5 h-3.5 rounded-full mb-3 shadow-inner" 
                  style={{ backgroundColor: currentResult.colorHex }}
                />

                <span className="block font-serif font-light text-neutral-400 text-xs tracking-widest mb-1.5">- 今日墨运 -</span>
                <h2 
                  className="font-serif font-bold text-5xl tracking-widest pl-[0.1em]"
                  style={{ color: currentResult.colorHex }}
                >
                  {currentResult.inkFortune}
                </h2>
                
                <span className="inline-block mt-3 px-3 py-1 font-serif text-xs font-light text-neutral-500 tracking-wider bg-neutral-100/50 rounded-md">
                  字气：{currentResult.inkCharacter}
                </span>

                <div className="w-12 h-px bg-neutral-200 my-4" />

                <div className="space-y-1.5 max-w-[280px]">
                  <span className="font-serif text-[11px] uppercase tracking-[0.15em] text-neutral-400 block">今日人格</span>
                  <p className="font-serif text-sm text-neutral-700 leading-relaxed tracking-wide">
                    {currentResult.personality}
                  </p>
                </div>

                {/* Background watermark character behind core panel */}
                <div className="absolute -bottom-6 -right-6 select-none pointer-events-none opacity-[0.03]">
                  <span className="font-brush text-[8rem] leading-none">
                    {currentResult.inkFortune}
                  </span>
                </div>
              </div>

              {/* Literary Tiba quote center */}
              <div className="py-4 text-center">
                <span className="block font-serif text-xs tracking-widest text-neutral-400/80 mb-2">- 题 跋 -</span>
                <p className="font-serif text-lg leading-relaxed text-neutral-800 tracking-widest pl-[0.1em] font-medium animate-fade-in">
                  “ {currentResult.tiba} ”
                </p>
              </div>

              {/* Young/Humorous Activities: YI AND JI */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* 宜 Block */}
                <div className="p-4 rounded-xl border border-emerald-100/60 bg-emerald-50/20 backdrop-blur-sm shadow-inner flex flex-col justify-between">
                  <div>
                    <span className="font-serif font-semibold text-xs text-emerald-800 tracking-[0.2em] block mb-2.5">宜</span>
                    <div className="space-y-1.5">
                      {currentResult.ideals.map((ideal, index) => (
                        <div key={index} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span className="font-serif text-[13px] text-neutral-700 tracking-wider font-light">{ideal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="block font-mono text-[8px] text-emerald-600/60 tracking-wider mt-4">Today Should</span>
                </div>

                {/* 忌 Block */}
                <div className="p-4 rounded-xl border border-rose-100/60 bg-rose-50/20 backdrop-blur-sm shadow-inner flex flex-col justify-between">
                  <div>
                    <span className="font-serif font-semibold text-xs text-rose-800 tracking-[0.2em] block mb-2.5">忌</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-rose-400" />
                      <span className="font-serif text-[13px] text-neutral-700 tracking-wider font-light">{currentResult.avoid}</span>
                    </div>
                  </div>
                  <span className="block font-mono text-[8px] text-rose-600/60 tracking-wider mt-4">Today Avoid</span>
                </div>

              </div>

              {/* Share & Alternative trigger controls */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-neutral-950 hover:bg-neutral-800 text-white font-serif text-sm tracking-wider rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  <Share2 className="w-4 h-4 ml-0.5 text-neutral-300" />
                  <span>生成墨候纸笺</span>
                </button>

                <button
                  onClick={() => triggerNewInkFlow(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200/60 font-serif text-xs tracking-wider rounded-xl transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                  <span>再试一笔 (随机体验)</span>
                </button>
              </div>

              {/* Back to intro link */}
              <div className="text-center pt-2">
                <button
                  onClick={() => setActiveScreen('home')}
                  className="text-[11px] font-serif text-neutral-400 hover:text-neutral-600 transition-colors tracking-widest"
                >
                  ← 返回卷首
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Footer minimal info */}
      <footer className="w-full text-center py-2 text-[10px] font-mono text-neutral-400 mt-6 select-none pointer-events-none relative z-10">
        <p className="tracking-wide">© 《今日试墨》一隅留白</p>
      </footer>

      {/* Share / Download Poster Modals */}
      {showShareModal && currentResult && (
        <SharePoster 
          result={currentResult} 
          onClose={() => setShowShareModal(false)} 
        />
      )}

    </main>
  );
}
