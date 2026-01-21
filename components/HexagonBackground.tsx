import React, { useEffect, useRef, useState, useCallback } from 'react';

// --- Types & Constants ---

type ShapeType = 'hexagon' | 'square' | 'triangle';

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface Palette {
  name: string;
  core: HSL;
  glow: HSL;
  bg: HSL;
  shape: ShapeType;
}

// --- Helpers ---

const hexToHSL = (hex: string): HSL => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  r /= 255; g /= 255; b /= 255;
  const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  return { h, s, l };
};

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = l - c / 2,
      r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;
const lerpHSL = (current: HSL, target: HSL, t: number): HSL => ({
    h: lerp(current.h, target.h, t),
    s: lerp(current.s, target.s, t),
    l: lerp(current.l, target.l, t),
});

const PALETTES: Palette[] = [
  { name: 'Ember', core: {h: 25, s: 100, l: 50}, glow: {h: 215, s: 80, l: 40}, bg: {h: 220, s: 30, l: 5}, shape: 'hexagon' },
  { name: 'Neon', core: {h: 150, s: 100, l: 50}, glow: {h: 320, s: 80, l: 40}, bg: {h: 280, s: 30, l: 5}, shape: 'square' },
  { name: 'Aqua', core: {h: 190, s: 100, l: 50}, glow: {h: 200, s: 80, l: 40}, bg: {h: 200, s: 30, l: 5}, shape: 'triangle' },
  { name: 'Royal', core: {h: 45, s: 100, l: 50}, glow: {h: 260, s: 80, l: 40}, bg: {h: 250, s: 30, l: 5}, shape: 'hexagon' },
  { name: 'Crimson', core: {h: 350, s: 100, l: 60}, glow: {h: 10, s: 80, l: 40}, bg: {h: 240, s: 30, l: 5}, shape: 'triangle' },
  { name: 'Emerald', core: {h: 140, s: 100, l: 50}, glow: {h: 100, s: 80, l: 40}, bg: {h: 150, s: 30, l: 5}, shape: 'square' },
];

const HexagonBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // --- State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState(0);
  
  // We keep local state for the UI inputs so they are editable
  const [uiColors, setUiColors] = useState({
      core: hslToHex(PALETTES[0].core.h, PALETTES[0].core.s, PALETTES[0].core.l),
      glow: hslToHex(PALETTES[0].glow.h, PALETTES[0].glow.s, PALETTES[0].glow.l),
      bg: hslToHex(PALETTES[0].bg.h, PALETTES[0].bg.s, PALETTES[0].bg.l),
  });
  
  const [intensity, setIntensity] = useState(1.0);
  const [currentShape, setCurrentShape] = useState<ShapeType>('hexagon');
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // --- Animation Refs ---
  // These hold the "live" values used by the requestAnimationFrame loop
  const targetThemeRef = useRef<Palette>(PALETTES[0]);
  const currentThemeRef = useRef<Palette>(PALETTES[0]);
  
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const lastSoundPos = useRef({ x: 0, y: 0 });
  const ripplesRef = useRef<{x: number, y: number, startTime: number}[]>([]);
  const clickedCellsRef = useRef<{x: number, y: number, startTime: number, id: string}[]>([]);

  // --- Handlers ---

  const handleColorChange = (key: 'core' | 'glow' | 'bg', hex: string) => {
    setUiColors(prev => ({ ...prev, [key]: hex }));
    
    // Convert to HSL and update target immediately
    const hsl = hexToHSL(hex);
    targetThemeRef.current = {
        ...targetThemeRef.current,
        [key]: hsl
    };
  };

  const cyclePalette = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    
    const nextIndex = (paletteIndex + 1) % PALETTES.length;
    setPaletteIndex(nextIndex);
    
    const p = PALETTES[nextIndex];
    targetThemeRef.current = p;
    setCurrentShape(p.shape);
    
    // Update UI inputs to match preset
    setUiColors({
        core: hslToHex(p.core.h, p.core.s, p.core.l),
        glow: hslToHex(p.glow.h, p.glow.s, p.glow.l),
        bg: hslToHex(p.bg.h, p.bg.s, p.bg.l),
    });
  };

  const toggleAudio = async () => {
      // ... Audio setup logic (same as before) ...
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    
    if (isAudioActive) {
      if (audioContextRef.current) await audioContextRef.current.suspend();
      setIsAudioActive(false);
    } else {
      setIsLoading(true);
      try {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContext();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256; 
          analyser.smoothingTimeConstant = 0.8;
          const masterGain = ctx.createGain();
          masterGain.gain.value = 0.5; 
          analyser.connect(masterGain);
          masterGain.connect(ctx.destination);
          audioContextRef.current = ctx;
          analyserRef.current = analyser;
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        } else if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        setIsAudioActive(true);
        setHasError(false);
      } catch (err) {
        console.error("Audio setup failed:", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- Canvas Logic ---

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let gridPoints: { 
        x: number; 
        y: number; 
        phase: number; 
        id: string; 
        rotSpeed: number; 
        rotOffset: number 
    }[] = [];

    // --- Grid Generation ---
    const initGrid = () => {
      gridPoints = [];
      const radius = 22; // Base radius
      const shape = currentShape; 
      
      let xDist, yDist;
      
      if (shape === 'square') {
         const gap = 2;
         const size = radius * 1.8; 
         xDist = size + gap;
         yDist = size + gap;
         
         const cols = Math.ceil(window.innerWidth / xDist) + 2;
         const rows = Math.ceil(window.innerHeight / yDist) + 2;

         for (let row = 0; row < rows; row++) {
           for (let col = 0; col < cols; col++) {
             gridPoints.push({
               x: col * xDist,
               y: row * yDist,
               phase: Math.random() * Math.PI * 2,
               id: `${row}-${col}`,
               rotSpeed: (Math.random() - 0.5) * 0.5,
               rotOffset: Math.random() * Math.PI * 2
             });
           }
         }
      } else {
         const gap = shape === 'triangle' ? 12 : 4; 
         const hexWidth = Math.sqrt(3) * radius;
         xDist = hexWidth + gap;
         yDist = (1.5 * radius) + gap;

         const cols = Math.ceil(window.innerWidth / xDist) + 3;
         const rows = Math.ceil(window.innerHeight / yDist) + 3;

         for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              let x = col * xDist;
              let y = row * yDist;
              if (row % 2 === 1) x += xDist / 2;
              x -= xDist;
              y -= yDist;
              
              gridPoints.push({
                x,
                y,
                phase: Math.random() * Math.PI * 2,
                id: `${row}-${col}`,
                rotSpeed: (Math.random() - 0.5) * 0.5,
                rotOffset: Math.random() * Math.PI * 2
              });
            }
         }
      }
    };

    // --- Draw Function ---
    const drawShape = (
      ctx: CanvasRenderingContext2D, 
      shape: ShapeType, 
      x: number, y: number, r: number, 
      color: string, 
      rotation: number, 
      isStroke: boolean,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();

      if (shape === 'hexagon') {
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 180) * (30 + 60 * i);
          ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
        }
      } else if (shape === 'square') {
        const size = r * 0.8;
        ctx.rect(-size, -size, size * 2, size * 2);
      } else if (shape === 'triangle') {
        const size = r * 1.2;
        ctx.moveTo(0, -size);
        ctx.lineTo(size * Math.sin(Math.PI/3), size * Math.cos(Math.PI/3));
        ctx.lineTo(-size * Math.sin(Math.PI/3), size * Math.cos(Math.PI/3));
      }
      ctx.closePath();

      if (isStroke) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = alpha;
        ctx.stroke();
      } else {
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, color); 
        grad.addColorStop(1, 'transparent'); 
        ctx.fillStyle = grad;
        ctx.globalAlpha = alpha;
        ctx.fill();
        
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha * 0.6;
        ctx.fill();
      }
      ctx.restore();
    };

    // --- Audio Sound Gen ---
    const playInteractionSound = (type: 'hover' | 'click') => {
        if (!audioContextRef.current || !analyserRef.current || audioContextRef.current.state !== 'running') return;
        const actx = audioContextRef.current;
        const now = actx.currentTime;
        const osc = actx.createOscillator();
        const oscGain = actx.createGain();
        osc.connect(oscGain);
        oscGain.connect(analyserRef.current); 

        if (type === 'hover') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
            oscGain.gain.setValueAtTime(0, now);
            oscGain.gain.linearRampToValueAtTime(0.05 * intensity, now + 0.005);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
            oscGain.gain.setValueAtTime(0.3 * intensity, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    };

    // --- Loop ---
    const animate = () => {
      const nowTime = Date.now();
      const time = nowTime * 0.001;
      
      // Interpolate Theme
      const lerpSpeed = 0.05;
      currentThemeRef.current = {
          name: targetThemeRef.current.name,
          core: lerpHSL(currentThemeRef.current.core, targetThemeRef.current.core, lerpSpeed),
          glow: lerpHSL(currentThemeRef.current.glow, targetThemeRef.current.glow, lerpSpeed),
          bg: lerpHSL(currentThemeRef.current.bg, targetThemeRef.current.bg, lerpSpeed),
          shape: currentShape // Shape flips instantly, colors lerp
      };

      const { core, glow, bg } = currentThemeRef.current;

      // Audio
      let bass = 0, mid = 0, treble = 0;
      if (analyserRef.current && dataArrayRef.current && isAudioActive) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const binCount = dataArrayRef.current.length;
        const bassEnd = Math.floor(binCount * 0.1); 
        const midEnd = Math.floor(binCount * 0.5);  
        for (let i = 0; i < binCount; i++) {
          const val = dataArrayRef.current[i] / 255;
          if (i < bassEnd) bass += val;
          else if (i < midEnd) mid += val;
          else treble += val;
        }
        bass /= bassEnd;
        mid /= (midEnd - bassEnd);
        treble /= (binCount - midEnd);
      }

      // Background
      const bgLightness = bg.l + (bass * 5 * intensity); 
      ctx.fillStyle = `hsl(${bg.h}, ${bg.s}%, ${bgLightness}%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Global Glow
      targetRef.current.x += (mouseRef.current.x - targetRef.current.x) * 0.1;
      targetRef.current.y += (mouseRef.current.y - targetRef.current.y) * 0.1;

      const glowRadius = 800 * intensity;
      const gradient = ctx.createRadialGradient(
          targetRef.current.x, targetRef.current.y, 0,
          targetRef.current.x, targetRef.current.y, glowRadius
      );
      gradient.addColorStop(0, `hsla(${core.h}, ${core.s}%, ${core.l}%, ${0.15 * intensity})`);
      gradient.addColorStop(0.5, `hsla(${glow.h}, ${glow.s}%, ${glow.l}%, ${0.05 * intensity})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Ripples & Click Logic
      ripplesRef.current = ripplesRef.current.filter(r => nowTime - r.startTime < 1500);
      clickedCellsRef.current = clickedCellsRef.current.filter(c => nowTime - c.startTime < 500);

      // Draw Grid
      gridPoints.forEach(point => {
        const dx = point.x - targetRef.current.x;
        const dy = point.y - targetRef.current.y;
        const dist = Math.hypot(dx, dy);
        
        const lightRadius = 400 * intensity;
        const rawIntensity = Math.max(0, 1 - dist / lightRadius);
        const ptIntensity = Math.pow(rawIntensity, 2);

        let rippleBoost = 0;
        ripplesRef.current.forEach(r => {
            const rDist = Math.hypot(point.x - r.x, point.y - r.y);
            const rAge = (nowTime - r.startTime) / 1500;
            const rRadius = rAge * 1000;
            const rWidth = 150;
            if (Math.abs(rDist - rRadius) < rWidth) {
                rippleBoost += (1 - Math.abs(rDist - rRadius) / rWidth) * (1 - rAge);
            }
        });

        const clickAnim = clickedCellsRef.current.find(c => c.id === point.id);
        let clickScale = 0;
        let clickRot = 0;
        if (clickAnim) {
            const cAge = (nowTime - clickAnim.startTime) / 500;
            clickScale = Math.sin(cAge * Math.PI) * 1.5; 
            clickRot = cAge * Math.PI * 2;
        }

        const totalIntensity = Math.min(1, ptIntensity + rippleBoost * 0.8 + (clickAnim ? 1 : 0));
        
        let drawX = point.x;
        let drawY = point.y;

        if (dist < 200) {
            const repulsion = Math.pow(1 - dist/200, 2) * 20 * intensity;
            const angle = Math.atan2(dy, dx);
            drawX += Math.cos(angle) * repulsion;
            drawY += Math.sin(angle) * repulsion;
        }

        // Random Rotation per shape
        const baseRot = point.rotOffset + (time * point.rotSpeed);
        
        if (totalIntensity > 0.05) {
             const size = 22 * (1 + totalIntensity * 0.5 + bass * 0.5 + clickScale);
             const rot = baseRot + (totalIntensity * Math.PI * 0.1) + (treble * 0.5) + clickRot;
             const alpha = totalIntensity * intensity;
             const color = `hsla(${core.h + (mid * 30)}, ${core.s}%, ${core.l + 20}%, ${alpha})`;
             
             drawShape(ctx, currentShape, drawX, drawY, size, color, rot, false, alpha);
        } else {
             const breath = 0.1 + (Math.sin(time + bass * 10) * 0.5 + 0.5) * (0.5 + mid) * 0.2;
             const size = 22;
             const rot = baseRot;
             const alpha = (0.05 + breath * 0.05) * intensity;
             
             drawShape(ctx, currentShape, drawX, drawY, size, `hsla(${bg.h}, ${bg.s}%, ${bg.l + 20}%, ${alpha})`, rot, true, alpha);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initGrid();
    };

    window.addEventListener('resize', resize);
    
    const handleMouseMove = (e: MouseEvent) => {
        const bounds = canvas.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
        
        const dist = Math.hypot(e.clientX - lastSoundPos.current.x, e.clientY - lastSoundPos.current.y);
        if (dist > 50) {
            playInteractionSound('hover');
            lastSoundPos.current = { x: e.clientX, y: e.clientY };
        }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleMouseDown = (e: MouseEvent) => {
        playInteractionSound('click');
        const mx = e.clientX;
        const my = e.clientY;
        
        ripplesRef.current.push({ x: mx, y: my, startTime: Date.now() });

        let closestDist = Infinity;
        let closestId = '';
        gridPoints.forEach(p => {
             const d = Math.hypot(p.x - mx, p.y - my);
             if (d < 44 && d < closestDist) {
                 closestDist = d;
                 closestId = p.id;
             }
        });
        if (closestId) {
            clickedCellsRef.current.push({ x: mx, y: my, startTime: Date.now(), id: closestId });
        }
    };
    window.addEventListener('mousedown', handleMouseDown);

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentShape, isAudioActive, intensity]); // Re-run when shape changes to rebuild grid

  // --- Render ---

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-[-1] bg-[#020408]" />
      
      {/* Settings Panel */}
      <div className={`fixed bottom-24 right-6 z-50 p-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 origin-bottom-right w-64 ${isSettingsOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}>
          <h3 className="text-white text-xs font-bold mb-4 uppercase tracking-wider text-hexCore">Customization</h3>
          
          <div className="space-y-4">
              {/* Colors */}
              {[
                  { label: 'Core Color', key: 'core' },
                  { label: 'Glow Color', key: 'glow' },
                  { label: 'Bg Color', key: 'bg' }
              ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                      <label className="text-xs text-gray-400">{item.label}</label>
                      <div className="flex items-center gap-2">
                          <input 
                              type="color" 
                              value={uiColors[item.key as keyof typeof uiColors]}
                              onChange={(e) => handleColorChange(item.key as any, e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                          />
                          <input 
                            type="text" 
                            value={uiColors[item.key as keyof typeof uiColors]}
                            onChange={(e) => handleColorChange(item.key as any, e.target.value)}
                            className="w-16 bg-white/10 border border-white/10 rounded text-xs px-1 py-0.5 text-white"
                          />
                      </div>
                  </div>
              ))}

              {/* Intensity */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                   <div className="flex justify-between text-xs text-gray-400">
                        <span>Intensity</span>
                        <span>{(intensity * 100).toFixed(0)}%</span>
                   </div>
                   <input 
                        type="range" 
                        min="0.2" max="2.0" step="0.1"
                        value={intensity}
                        onChange={(e) => setIntensity(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-hexCore"
                   />
              </div>
          </div>
      </div>

      {/* Control Bar */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Settings Toggle */}
        <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`group flex items-center justify-center h-12 w-12 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${isSettingsOpen ? 'bg-hexCore text-white border-hexCore' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        </button>

        {/* Theme Cycler */}
        <button
            onClick={cyclePalette}
            className="group relative flex items-center justify-center h-12 w-12 rounded-full backdrop-blur-md border bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {currentShape === 'hexagon' && <path d="M12 2L21 7L21 17L12 22L3 17L3 7Z" />}
                {currentShape === 'square' && <rect x="5" y="5" width="14" height="14" rx="2" />}
                {currentShape === 'triangle' && <path d="M12 3L22 20H2L12 3Z" />}
            </svg>
            <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none px-2 py-1 bg-black/80 border border-white/10 rounded text-xs text-white whitespace-nowrap">
                Next Theme & Shape
            </div>
        </button>

        {/* Audio Toggle */}
        <button
            onClick={toggleAudio}
            disabled={isLoading}
            className={`group relative flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${
                isAudioActive 
                ? 'bg-hexCore/20 border-hexCore text-white hover:bg-hexCore/30 shadow-hexCore/20' 
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
            }`}
        >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-hexCore" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : isAudioActive ? (
                <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hexCore opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-hexCore"></span>
                    </span>
                    <span className="font-semibold text-sm">FX On</span>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-sm">Enable FX</span>
                </>
            )}
        </button>
      </div>

      {hasError && (
          <div className="fixed bottom-24 right-6 z-50 px-4 py-2 bg-red-500/90 text-white text-sm rounded-lg shadow-lg border border-red-400">
              Audio access denied or failed
          </div>
      )}
    </>
  );
};

export default HexagonBackground;
