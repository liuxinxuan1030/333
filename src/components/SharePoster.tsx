import React, { useRef, useState } from 'react';
import { InkResult } from '../types';

interface SharePosterProps {
  result: InkResult;
  onClose: () => void;
}

export default function SharePoster({ result, onClose }: SharePosterProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draws the high-resolution poster onto a canvas and downloads it
  const downloadPoster = () => {
    setIsGenerating(true);
    setDownloadSuccess(false);

    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Poster Dimensions: 800 x 1200 px
        canvas.width = 800;
        canvas.height = 1200;

        // 1. Draw Paper Texture Background (宣纸微黄底)
        ctx.fillStyle = '#fbfaf7'; // Rice paper cream white
        ctx.fillRect(0, 0, 800, 1200);

        // Add subtle paper pulse fibers (procedural organic noise)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.015)';
        for (let i = 0; i < 4000; i++) {
          const rx = Math.random() * 800;
          const ry = Math.random() * 1200;
          const rw = 1 + Math.random() * 2;
          const rh = 1 + Math.random() * 1.5;
          ctx.fillRect(rx, ry, rw, rh);
        }

        // Draw elegant marginal frame line (禅意细边框)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(30, 30, 740, 1140);
        ctx.strokeRect(35, 35, 730, 1130);

        // 2. Draw Massive Translucent Calligraphy Background Letter (大字留白背景)
        ctx.save();
        ctx.font = '360px "Ma Shan Zheng", "STSong", "Songti SC", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'; // Subtle ink wash ghost text
        // Draw the first character of the fortune as the background
        ctx.fillText(result.inkFortune[0], 400, 480);
        ctx.restore();

        // 3. Header Texts "今日墨候"
        ctx.fillStyle = '#1c1c1c';
        ctx.textAlign = 'center';
        
        ctx.font = 'letter-spacing: 0.4em; 16px "JetBrains Mono", sans-serif';
        ctx.fillText('• TODAY\'S INK OBSERVED •', 400, 95);
        ctx.font = '300 28px "Noto Serif SC", serif';
        ctx.fillText('今 日 墨 候', 400, 145);

        // Thin horizontal separator line
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.moveTo(320, 175);
        ctx.lineTo(480, 175);
        ctx.stroke();

        // 4. Main Ink Fortune Displays (今日墨运)
        ctx.textAlign = 'center';
        ctx.fillStyle = result.colorHex;
        ctx.font = 'bold 76px "Noto Serif SC", serif';
        ctx.fillText(result.inkFortune, 400, 275);

        // Character Style Sub-title (今日字气)
        ctx.fillStyle = '#666';
        ctx.font = '300 24px "Noto Serif SC", serif';
        ctx.fillText(`字气「${result.inkCharacter}」 •  纸性「${result.paperType}」`, 400, 325);

        // 5. Personality Details
        ctx.fillStyle = '#444';
        ctx.font = '300 20px "Noto Serif SC", serif';
        ctx.fillText(result.personality, 400, 385);

        // 6. Tiba Text in Vertical or beautiful centered style (今日题跋)
        ctx.save();
        ctx.fillStyle = '#111';
        ctx.font = '400 32px "Noto Serif SC", "STSong", serif';
        ctx.textAlign = 'center';
        // Elegant quotation brackets or side decorations
        ctx.fillText(`“ ${result.tiba} ”`, 400, 520);
        ctx.restore();

        // 7. Cinnabar Red Seal Stamp (朱砂印章 - "试墨")
        ctx.save();
        const stampX = 580;
        const stampY = 580;
        const stampSize = 65;

        // Draw slightly rough wobbly stamp container
        ctx.strokeStyle = '#c22a1e';
        ctx.lineWidth = 3.5;
        ctx.fillStyle = 'transparent';
        
        ctx.beginPath();
        ctx.moveTo(stampX + Math.random()*2 - 1, stampY + Math.random()*2 - 1);
        ctx.lineTo(stampX + stampSize + Math.random()*2 - 1, stampY + Math.random()*2 - 1);
        ctx.lineTo(stampX + stampSize + Math.random()*2 - 1, stampY + stampSize + Math.random()*2 - 1);
        ctx.lineTo(stampX + Math.random()*2 - 1, stampY + stampSize + Math.random()*2 - 1);
        ctx.closePath();
        ctx.stroke();

        // Little dynamic red specks inside the stamp for aged look
        ctx.fillStyle = 'rgba(194, 42, 30, 0.1)';
        for (let j = 0; j < 12; j++) {
          ctx.fillRect(stampX + Math.random()*stampSize, stampY + Math.random()*stampSize, 2, 2);
        }

        // Stamp text
        ctx.fillStyle = '#c22a1e';
        ctx.font = 'bold 24px "Noto Serif SC", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('试', stampX + stampSize/4 + 4, stampY + stampSize/3);
        ctx.fillText('墨', stampX + stampSize*3/4 - 4, stampY + stampSize*2/3 + 4);
        ctx.restore();

        // 8. Separator rule above Todo
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.beginPath();
        ctx.moveTo(100, 710);
        ctx.lineTo(700, 710);
        ctx.stroke();

        // 9. Everyday Activities: Ideals (宜) & Avoids (忌)
        // Draw elegant split blocks
        ctx.save();
        
        // --- LEFT COLUMN: YI 宜 (Should) ---
        ctx.textAlign = 'center';
        ctx.fillStyle = '#2e7d32'; // Aesthetic green for Yi
        ctx.font = 'bold 36px "Noto Serif SC", serif';
        ctx.fillText('宜', 260, 785);

        ctx.fillStyle = '#333';
        ctx.font = '400 24px "Noto Serif SC", serif';
        // Draw the two ideals stacked vertically or beside each other
        result.ideals.forEach((item, idx) => {
          ctx.fillText(`• ${item}`, 260, 845 + idx * 45);
        });

        // Split Divider line
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.beginPath();
        ctx.moveTo(400, 750);
        ctx.lineTo(400, 1000);
        ctx.stroke();

        // --- RIGHT COLUMN: JI 忌 (Avoid) ---
        ctx.fillStyle = '#c22a1e'; // Red for Ji
        ctx.font = 'bold 36px "Noto Serif SC", serif';
        ctx.fillText('忌', 540, 785);

        ctx.fillStyle = '#333';
        ctx.font = '400 24px "Noto Serif SC", serif';
        ctx.fillText(`• ${result.avoid}`, 540, 855);
        ctx.restore();

        // 10. Poster footer (Bottom info)
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.fillText(`癸卯年五月 • 公历 ${result.dateStr}`, 400, 1075);
        
        ctx.font = '300 12px "Noto Serif SC", sans-serif';
        ctx.fillText('一日试墨 • 见心留白 • 今日试墨小程序', 400, 1105);

        // Convert canvas drawing to download link
        const imgUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `今日试墨_${result.dateStr}_${result.inkFortune}.png`;
        link.href = imgUrl;
        link.click();

        setDownloadSuccess(true);
      } catch (err) {
        console.error('Failed to render poster canvas:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="relative flex flex-col w-full max-w-[430px] max-h-[92vh] bg-neutral-50 rounded-2xl border border-neutral-200 shadow-2xl flex-shrink-0 overflow-y-auto">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white sticky top-0 z-10">
          <h3 className="font-serif font-medium text-neutral-800">今日墨候海报</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Panel / Visual Poster Preview */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-center items-center">
          
          {/* Aesthetic Poster Preview (Exact HTML mirror of the canvas download layout) */}
          <div id="poster-preview" className="relative w-full max-w-[340px] aspect-[1/1.5] bg-[#fbfaf7] border border-neutral-200/60 shadow-xl p-5 select-none text-neutral-800 flex flex-col justify-between font-serif">
            
            {/* Fine border decoration */}
            <div className="absolute inset-2 border-2 border-double border-neutral-900/5 pointer-events-none" />

            {/* Ghost Calligraphy Letter Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-brush text-[11rem] leading-none text-black/[0.025] select-none">
                {result.inkFortune[0]}
              </span>
            </div>

            {/* Poster Header */}
            <div className="text-center relative z-10 pt-2">
              <span className="block font-mono text-[9px] tracking-[0.25em] text-neutral-400/80 mb-0.5">• TODAY'S INK OBSERVED •</span>
              <h4 className="font-serif font-light text-base tracking-[0.4em] text-neutral-700 pl-[0.4em]">今日墨候</h4>
              <div className="w-16 h-px bg-neutral-200 mx-auto mt-2" />
            </div>

            {/* Poster Body Info */}
            <div className="text-center relative z-10 select-none">
              <h2 
                className="font-serif font-semibold text-4xl tracking-widest my-1 drop-shadow-sm"
                style={{ color: result.colorHex }}
              >
                {result.inkFortune}
              </h2>
              <p className="text-[10px] text-neutral-500 font-serif font-light mt-1.5 tracking-wider">
                字气「{result.inkCharacter}」 • 纸性「{result.paperType}」
              </p>
              <p className="text-[9px] text-neutral-400 max-w-[200px] mx-auto mt-1 tracking-wider leading-relaxed">
                {result.personality}
              </p>
            </div>

            {/* Tiba */}
            <div className="text-center relative z-10 px-4 my-1">
              <span className="block text-sm md:text-base font-serif italic text-neutral-800 tracking-wider">
                “ {result.tiba} ”
              </span>
            </div>

            {/* Red Stamp */}
            <div className="absolute top-[52%] right-6 flex items-center justify-center w-8 h-8 border-2 border-red-700/80 rounded-sm stroke-medium -rotate-6 select-none opacity-85">
              <span className="font-serif text-[11px] font-bold text-red-700/90 tracking-tighter leading-none text-center">试墨</span>
            </div>

            {/* Everyday Activities (Todo Ideal & Avoid) */}
            <div className="relative z-10 border-t border-neutral-900/5 pt-3.5 pb-2">
              <div className="grid grid-cols-2 gap-4">
                {/* 宜 */}
                <div className="text-center border-r border-neutral-900/5 pr-2">
                  <span className="font-serif font-semibold text-sm text-green-700 block mb-1">宜</span>
                  <div className="space-y-0.5">
                    {result.ideals.map((ideal, i) => (
                      <span key={i} className="block text-[10px] text-neutral-700 tracking-wider">• {ideal}</span>
                    ))}
                  </div>
                </div>

                {/* 忌 */}
                <div className="text-center pl-2 flex flex-col justify-center">
                  <span className="font-serif font-semibold text-sm text-red-600 block mb-1">忌</span>
                  <span className="text-[10px] text-neutral-700 tracking-wider block">• {result.avoid}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center relative z-10 pb-1">
              <span className="block font-mono text-[8px] text-neutral-400 tracking-wider">
                公历 {result.dateStr}
              </span>
              <span className="block text-[7px] text-neutral-400 tracking-widest scale-95 mt-0.5">
                一日试墨 • 见心留白 • 今日试墨
              </span>
            </div>

          </div>

          <p className="text-xs text-neutral-400 mt-4 text-center max-w-[300px]">
            海报已加入朱印章与宣纸纹理微调，下载后将保存为高清PNG图片，风格典雅
          </p>
        </div>

        {/* Bottom Button Panel */}
        <div className="p-6 border-t border-neutral-100 bg-white space-y-3 sticky bottom-0">
          <button
            onClick={downloadPoster}
            disabled={isGenerating}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-serif tracking-wider text-sm rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                正在晕染出图...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                保存今日墨候
              </>
            )}
          </button>

          {downloadSuccess && (
            <div className="flex items-center justify-center gap-1.5 p-2 bg-green-50 rounded-lg text-green-700 text-xs text-center animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>海报生成并已开始下载！</span>
            </div>
          )}
        </div>

        {/* Hidden high-res compiler canvas */}
        <canvas ref={canvasRef} className="hidden" />

      </div>
    </div>
  );
}
