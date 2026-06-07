import React, { useEffect, useRef, useState } from 'react';
import { asmrPlayer } from '../utils/audio';

interface InkBleedAnimationProps {
  onComplete: () => void;
  accentColor: string;
}

export default function InkBleedAnimation({ onComplete, accentColor }: InkBleedAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'falling' | 'bleeding' | 'fade-out'>('falling');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use ResizeObserver for responsive canvas scaling
    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth || 600;
    let height = canvas.height = canvas.offsetHeight || 600;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const centerX = width / 2;
    const centerY = height / 2;

    // Animation variables
    let startTime = performance.now();
    const fallDuration = 700; // ms to fall from top to center
    const bleedDuration = 1500; // ms to spread ink

    // Particle tracking for fibrous bleed details
    const particles: Array<{
      angle: number;
      speed: number;
      size: number;
      maxRadius: number;
      growth: number;
      opacity: number;
    }> = [];

    // Initialize smaller satellite bleeding branches
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 0.5 + Math.random() * 1.5;
      const maxRadius = 30 + Math.random() * 70;
      particles.push({
        angle,
        speed,
        size: 5 + Math.random() * 10,
        maxRadius,
        growth: speed * 1.2,
        opacity: 0.2 + Math.random() * 0.5
      });
    }

    let checkAudioTriggered = false;

    const tick = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      const elapsed = now - startTime;

      if (elapsed < fallDuration) {
        // --- 1. FALLING PHASE ---
        setPhase('falling');
        const progress = elapsed / fallDuration;
        
        // Easing curve for falling droplet
        const y = progress * centerY;

        // Draw falling droplet
        ctx.save();
        ctx.fillStyle = accentColor;
        
        // Droplet shape with tail
        ctx.beginPath();
        ctx.moveTo(centerX, y);
        // Left curve
        ctx.bezierCurveTo(centerX - 8, y + 8, centerX - 12, y + 16, centerX, y + 24);
        // Right curve
        ctx.bezierCurveTo(centerX + 12, y + 16, centerX + 8, y + 8, centerX, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

      } else if (elapsed < fallDuration + bleedDuration) {
        // --- 2. BLEEDING / FLOODING PHASE ---
        if (!checkAudioTriggered) {
          checkAudioTriggered = true;
          setPhase('bleeding');
          // Trigger the synthesized realistic audio sequence!
          asmrPlayer.playInkDropSequence();
        }

        const bleedElapsed = elapsed - fallDuration;
        const progress = bleedElapsed / bleedDuration;

        // Custom easing out for spreading
        const spreadFactor = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        const primaryRadius = 45 + spreadFactor * 120;
        
        ctx.save();
        
        // Draw elegant water-ink aura (background soft bleed)
        const auraGrad = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, primaryRadius * 1.5
        );
        auraGrad.addColorStop(0, `${accentColor}44`); // 27% opacity
        auraGrad.addColorStop(0.3, `${accentColor}22`); // 13% opacity
        auraGrad.addColorStop(0.6, `${accentColor}0b`); // 4% opacity
        auraGrad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, primaryRadius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Draw primary ink pool (fully saturated core)
        const coreGrad = ctx.createRadialGradient(
          centerX, centerY, primaryRadius * 0.1,
          centerX, centerY, primaryRadius
        );
        // Smooth shades of dark ink
        coreGrad.addColorStop(0, accentColor);
        coreGrad.addColorStop(0.5, `${accentColor}ea`);
        coreGrad.addColorStop(0.85, `${accentColor}be`);
        coreGrad.addColorStop(0.98, `${accentColor}55`);
        coreGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, primaryRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw capillary bleeding fibers / particles
        particles.forEach((p) => {
          const distance = Math.min(p.maxRadius, p.growth * bleedElapsed * 0.15);
          const px = centerX + Math.cos(p.angle) * distance;
          const py = centerY + Math.sin(p.angle) * distance;
          const currentSize = p.size * (1 - distance / p.maxRadius);

          if (currentSize > 0.5) {
            const opacityHex = Math.floor(p.opacity * (1 - distance / p.maxRadius) * 255)
              .toString(16)
              .padStart(2, '0');
            ctx.fillStyle = `${accentColor}${opacityHex}`;
            
            ctx.beginPath();
            ctx.arc(px, py, currentSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Connect back to the center with faint trails to look like branches
            ctx.beginPath();
            ctx.strokeStyle = `${accentColor}11`;
            ctx.lineWidth = currentSize * 0.4;
            ctx.moveTo(centerX, centerY);
            ctx.quadraticCurveTo((centerX + px) / 2 + (Math.random() - 0.5) * 10, (centerY + py) / 2 + (Math.random() - 0.5) * 10, px, py);
            ctx.stroke();
          }
        });
        
        ctx.restore();

      } else {
        // --- 3. FADE OUT AND TRANSITION ---
        setPhase('fade-out');
        // Complete animation sequence
        onComplete();
        return;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [onComplete, accentColor]);

  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col justify-center items-center w-full h-[380px] bg-transparent overflow-hidden"
    >
      {/* SVG Turbulence filter to distort the drawing canvas and form realistic ink bleeds */}
      <svg className="absolute w-0 h-0 pointer-events-none">
        <defs>
          <filter id="ink-bleed-filter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.035" 
              numOctaves="4" 
              result="noise" 
              seed={Math.floor(Math.random() * 100)}
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale="24" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      {/* The Animated Canvas with the SVG Filter applied dynamically via inline CSS */}
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[450px] max-h-[450px]"
        style={{ filter: 'url(#ink-bleed-filter)' }}
      />

      <div className="absolute bottom-4 flex flex-col items-center select-none text-neutral-800 pointer-events-none">
        <p className="font-serif tracking-[0.3em] text-sm text-neutral-400 animate-pulse duration-1000">
          {phase === 'falling' && '凝神...墨滴即落'}
          {phase === 'bleeding' && '水漫宣纸，墨色自润'}
          {phase === 'fade-out' && '毫端起烟，墨候成象'}
        </p>
      </div>
    </div>
  );
}
