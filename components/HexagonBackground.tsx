import React, { useEffect, useRef, useState, useMemo } from 'react';

// --- Types & Constants ---

type ShapeType = 'hexagon' | 'square' | 'triangle';

interface Palette {
  name: string;
  coreHue: number;
  glowHue: number;
  bgHue: number;
  shapeIcon: React.ReactNode;
}

// Helper: Linear Interpolation
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

// Palette Definitions
const PALETTES: Palette[] = [
  { name: 'Ember', coreHue: 25, glowHue: 215, bgHue: 220, shapeIcon: <circle cx="12" cy="12" r="6" /> },
  { name: 'Neon', coreHue: 150, glowHue: 320, bgHue: 280, shapeIcon: <rect x="6" y="6" width="12" height="12" rx="2" /> },
  { name: 'Aqua', coreHue: 190, glowHue: 200, bgHue: 200, shapeIcon: <path d="M12 4L20 18H4L12 4Z" /> },
  { name: 'Royal', coreHue: 45, glowHue: 260, bgHue: 250, shapeIcon: <path d="M12 2L21 7L21 17L12 22L3 17L3 7Z" /> },
  { name: 'Crimson', coreHue: 350, glowHue: 10, bgHue: 240, shapeIcon: <path d="M12 2L22 12L12 22L2 12Z" /> },
  { name: 'Emerald', coreHue: 140, glowHue: 100, bgHue: 150, shapeIcon: <path d="M12 2L22 9L18 21L6 21L2 9Z" /> },
  { name: 'Solar', coreHue: 50, glowHue: 30, bgHue: 40, shapeIcon: <path d="M12 2L15 9L22 9L17 14L19 21L12 17L5 21L7 14L2 9L9 9Z" /> },
];

const HexagonBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- State ---
  // Core Visual Parameters
  const [controls, setControls] = useState({
    radius: 22,      // Grid cell size
    speed: 1.0,      // Animation speed multiplier
    intensity: 1.0,  // Glow/Color intensity multiplier
    shape: 'hexagon' as ShapeType,
  });

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // --- Refs for Animation Logic ---
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 }); // Smooth mouse follow
  
  // Interpolated Palette Values (for smooth transitions)
  const currentPaletteRef = useRef({
    coreHue: PALETTES[0].coreHue,
    glowHue: PALETTES[0].glowHue,
    bgHue: PALETTES[0].bgHue,
  });

  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  // Interaction Refs
  const lastSoundPos = useRef({ x: 0, y: 0 });
  const ripplesRef = useRef<{x: number, y: number, startTime: number}[]>([]);
  // Store clicked hexes for individual animations: { gridIndex, startTime, x, y }
  const clickedCellsRef = useRef<{x: number, y: number, startTime: number, id: string}[]>([]);

  // --- Effects ---

  // Cleanup Audio
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // --- Handlers ---

  const cyclePalette = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    setPaletteIndex(prev => (prev + 1) % PALETTES.length);
  };

  const toggleAudio = async () => {
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
    let gridPoints: { x: number; y: number; phase: number; id: string }[] = [];

    // --- Grid Generation ---
    const initGrid = () => {
      gridPoints = [];
      const { radius, shape } = controls;
      
      // Calculate grid spacing based on shape
      let xDist, yDist;
      
      if (shape === 'square') {
         // Standard Cartesian Grid
         const gap = 2;
         const size = radius * 1.8; // Adjust visual size relative to radius
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
               id: `${row}-${col}`
             });
           }
         }
      } else {
         // Hexagon / Triangle (Honeycomb Grid)
         const gap = shape === 'triangle' ? 12 : 4; // More gap for triangles
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
                id: `${row}-${col}`
              });
            }
         }
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (mouseRef.current.x === 0 && mouseRef.current.y === 0) {
          mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
          targetRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
      }
      initGrid();
    };

    // --- Drawing Primitives ---
    
    const drawShape = (
      ctx: CanvasRenderingContext2D, 
      shape: ShapeType, 
      x: number, 
      y: number, 
      r: number, 
      color: string, 
      rotation: number, 
      isStroke: boolean = false,
      alpha: number = 1
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
        // Equilateral triangle
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
        // Gradient Fill for active shapes
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        grad.addColorStop(0, color); // Center
        grad.addColorStop(1, 'transparent'); // Edge
        ctx.fillStyle = grad;
        ctx.globalAlpha = alpha;
        ctx.fill();
        
        // Solid core for better visibility
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha * 0.6;
        ctx.fill();
      }

      ctx.restore();
    };

    // --- Audio Helper ---
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
            oscGain.gain.linearRampToValueAtTime(0.05 * controls.intensity, now + 0.005);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
            oscGain.gain.setValueAtTime(0.3 * controls.intensity, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    };

    // --- Main Animation Loop ---
    const animate = () => {
      const nowTime = Date.now();
      const time = nowTime * 0.001;
      
      // 1. Palette Interpolation (Smooth Transitions)
      const targetPalette = PALETTES[paletteIndex];
      const lerpSpeed = 0.05;
      currentPaletteRef.current.coreHue = lerp(currentPaletteRef.current.coreHue, targetPalette.coreHue, lerpSpeed);
      currentPaletteRef.current.glowHue = lerp(currentPaletteRef.current.glowHue, targetPalette.glowHue, lerpSpeed);
      currentPaletteRef.current.bgHue = lerp(currentPaletteRef.current.bgHue, targetPalette.bgHue, lerpSpeed);

      const { coreHue, glowHue, bgHue } = currentPaletteRef.current;

      // 2. Audio Analysis
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

      // 3. Global Calculations
      const globalBreath = (Math.sin(time * controls.speed + bass * 10) * 0.5 + 0.5) * (0.5 + mid); 
      
      // Mouse Smooth Follow
      targetRef.current.x += (mouseRef.current.x - targetRef.current.x) * 0.1;
      targetRef.current.y += (mouseRef.current.y - targetRef.current.y) * 0.1;

      // 4. Background Clear
      const bgLightness = 2 + (bass * 5 * controls.intensity); 
      ctx.fillStyle = `hsl(${bgHue}, 30%, ${bgLightness}%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 5. Global Glow
      const glowRadius = 800 * controls.intensity;
      const gradient = ctx.createRadialGradient(
          targetRef.current.x, targetRef.current.y, 0,
          targetRef.current.x, targetRef.current.y, glowRadius
      );
      gradient.addColorStop(0, `hsla(${coreHue}, 80%, 50%, ${0.1 * controls.intensity})`);
      gradient.addColorStop(0.5, `hsla(${glowHue}, 60%, 30%, ${0.05 * controls.intensity})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Filter expired effects
      ripplesRef.current = ripplesRef.current.filter(r => nowTime - r.startTime < 1500);
      clickedCellsRef.current = clickedCellsRef.current.filter(c => nowTime - c.startTime < 500);

      // 6. Draw Grid
      gridPoints.forEach(point => {
        const dx = point.x - targetRef.current.x;
        const dy = point.y - targetRef.current.y;
        const dist = Math.hypot(dx, dy);
        
        // Intensity based on mouse distance
        const lightRadius = 400 * controls.intensity;
        const rawIntensity = Math.max(0, 1 - dist / lightRadius);
        const intensity = Math.pow(rawIntensity, 2);

        // Check for click ripple influence
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

        // Check for specific clicked cell animation
        const clickAnim = clickedCellsRef.current.find(c => c.id === point.id);
        let clickScale = 0;
        let clickRot = 0;
        
        if (clickAnim) {
            const cAge = (nowTime - clickAnim.startTime) / 500; // 0 to 1
            // Pop effect: Scale up then back down
            clickScale = Math.sin(cAge * Math.PI) * 1.5; 
            // Spin effect
            clickRot = cAge * Math.PI * 2;
        }

        const totalIntensity = Math.min(1, intensity + rippleBoost * 0.8 + (clickAnim ? 1 : 0));
        
        let drawX = point.x;
        let drawY = point.y;

        // Hover Repulsion
        if (dist < 200) {
            const repulsion = Math.pow(1 - dist/200, 2) * 20 * controls.intensity;
            const angle = Math.atan2(dy, dx);
            drawX += Math.cos(angle) * repulsion;
            drawY += Math.sin(angle) * repulsion;
        }

        const hue = coreHue + (mid * 30);
        
        if (totalIntensity > 0.05) {
             // Active Cell
             const size = controls.radius * (1 + totalIntensity * 0.5 + bass * 0.5 + clickScale);
             const rot = (totalIntensity * Math.PI * 0.1) + (treble * 0.5) + clickRot;
             const alpha = totalIntensity * controls.intensity;
             const color = `hsla(${hue}, 80%, 60%, ${alpha})`;
             
             drawShape(ctx, controls.shape, drawX, drawY, size, color, rot, false, alpha);
        } else {
             // Idle Cell
             const breath = 0.1 + globalBreath * 0.2;
             const size = controls.radius;
             const rot = point.phase + (time * 0.2 * controls.speed);
             const alpha = (0.05 + breath * 0.05) * controls.intensity;
             
             drawShape(ctx, controls.shape, drawX, drawY, size, `hsla(${bgHue}, 20%, 80%, ${alpha})`, rot, true, alpha);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // --- Listeners ---
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
        
        // Find closest grid point for specific animation
        let closestDist = Infinity;
        let closestId = '';
        const mx = e.clientX;
        const my = e.clientY;

        // Simple distance check to find clicked cell (optimization: checking all is fine for < 2000 points)
        gridPoints.forEach(p => {
             const d = Math.hypot(p.x - mx, p.y - my);
             if (d < controls.radius * 2 && d < closestDist) {
                 closestDist = d;
                 closestId = p.id;
             }
        });

        if (closestId) {
            clickedCellsRef.current.push({
                x: mx, y: my, startTime: Date.now(), id: closestId
            });
        }

        // Global Ripple
        ripplesRef.current.push({
            x: mx,
            y: my,
            startTime: Date.now()
        });
    };
    window.addEventListener('mousedown', handleMouseDown);

    // Init
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [controls, isAudioActive, paletteIndex]); // Re-run if controls change (e.g. shape)

  // --- Render Helpers ---

  // Custom Control Button Component
  const ControlBtn = ({ 
    onClick, 
    active, 
    icon, 
    label 
  }: { onClick: () => void, active?: boolean, icon: React.ReactNode, label: string }) => (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-center h-12 w-12 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${
        active 
        ? 'bg-hexCore/20 border-hexCore text-white shadow-hexCore/20' 
        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      {icon}
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none px-2 py-1 bg-black/80 border border-white/10 rounded text-xs text-white whitespace-nowrap">
        {label}
      </div>
    </button>
  );

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-[-1] bg-[#020408]"
      />
      
      {/* --- Main Controls (Bottom Right) --- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3" ref={containerRef}>
        
        {/* Settings Panel Popout */}
        <div className={`mb-2 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 origin-bottom-right ${isPanelOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none absolute'}`}>
            <h3 className="text-white text-sm font-bold mb-4 uppercase tracking-wider text-hexCore">Visual Settings</h3>
            
            <div className="space-y-4 w-56">
                {/* Shape Selector */}
                <div className="space-y-1">
                    <label className="text-xs text-gray-400">Grid Shape</label>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                        {['hexagon', 'square', 'triangle'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setControls(c => ({...c, shape: s as ShapeType}))}
                                className={`flex-1 py-1 rounded-md text-xs font-medium capitalize transition-colors ${controls.shape === s ? 'bg-hexCore text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                {s.slice(0,3)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sliders */}
                {[
                    { label: 'Grid Size', key: 'radius', min: 10, max: 50, step: 1 },
                    { label: 'Anim Speed', key: 'speed', min: 0.1, max: 3, step: 0.1 },
                    { label: 'Glow Intensity', key: 'intensity', min: 0.2, max: 2, step: 0.1 },
                ].map(slider => (
                    <div key={slider.key} className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>{slider.label}</span>
                            <span>{controls[slider.key as keyof typeof controls]}</span>
                        </div>
                        <input 
                            type="range" 
                            min={slider.min} max={slider.max} step={slider.step}
                            value={controls[slider.key as keyof typeof controls] as number}
                            onChange={(e) => setControls(c => ({...c, [slider.key]: parseFloat(e.target.value)}))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-hexCore"
                        />
                    </div>
                ))}
            </div>
        </div>

        <div className="flex items-center gap-3">
            {/* Settings Toggle */}
            <ControlBtn
                active={isPanelOpen}
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                label="Customize Visuals"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                }
            />

            {/* Palette Switcher */}
            <ControlBtn
                onClick={cyclePalette}
                label={`Theme: ${PALETTES[paletteIndex].name}`}
                icon={
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                    >
                        {PALETTES[paletteIndex].shapeIcon}
                    </svg>
                }
            />

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
                <div className="absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none px-2 py-1 bg-black/80 border border-white/10 rounded text-xs text-white whitespace-nowrap">
                   {isAudioActive ? 'Mute Interaction Sounds' : 'Enable Interaction Sounds'}
                </div>
            </button>
        </div>
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
