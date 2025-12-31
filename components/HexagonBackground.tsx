import React, { useEffect, useRef, useState } from 'react';

// Palette Definitions
const PALETTES = [
  { name: 'Ember', coreHue: 25, glowHue: 215, bgHue: 220, shape: 'circle' },   
  { name: 'Neon', coreHue: 150, glowHue: 320, bgHue: 280, shape: 'square' },   
  { name: 'Aqua', coreHue: 190, glowHue: 200, bgHue: 200, shape: 'triangle' },   
  { name: 'Royal', coreHue: 45, glowHue: 260, bgHue: 250, shape: 'hexagon' },
  { name: 'Crimson', coreHue: 350, glowHue: 10, bgHue: 240, shape: 'diamond' }, // New: Deep Red/Dark Blue
  { name: 'Emerald', coreHue: 140, glowHue: 100, bgHue: 150, shape: 'pentagon' }, // New: Green/Forest
  { name: 'Solar', coreHue: 50, glowHue: 30, bgHue: 40, shape: 'star' },     // New: Bright Yellow/Gold
];

const HexagonBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  // Interaction State
  const lastSoundPos = useRef({ x: 0, y: 0 });
  const ripplesRef = useRef<{x: number, y: number, startTime: number}[]>([]);
  
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Palette State
  const [paletteIndex, setPaletteIndex] = useState(0);
  const activePalette = PALETTES[paletteIndex];

  // Clean up AudioContext on unmount only
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const cyclePalette = () => {
      // Haptic Feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
      setPaletteIndex(prev => (prev + 1) % PALETTES.length);
  };

  // Audio Toggle Handler
  const toggleAudio = async () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
    }
    
    if (isAudioActive) {
      // Pause/Suspend
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          await audioContextRef.current.suspend();
        } catch (e) {
          console.warn("Failed to suspend audio context", e);
        }
        setIsAudioActive(false);
      } else {
        // If it's already closed or null, just update state
        setIsAudioActive(false);
      }
    } else {
      setIsLoading(true);
      try {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          // Initialize Audio Context
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContext();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256; 
          analyser.smoothingTimeConstant = 0.8;

          const masterGain = ctx.createGain();
          masterGain.gain.value = 0.5; 
          
          // --- CONNECT ANALYSER TO OUTPUT ---
          // Interaction sounds will inject directly into analyser
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let hexGrid: { x: number; y: number; phase: number }[] = [];
    
    // Feature: Responsive Grid
    const isMobile = window.innerWidth < 768;
    const hexRadius = isMobile ? 28 : 22; 
    const hexGap = 4; 
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;
    const xDist = hexWidth + hexGap; 
    const yDist = (1.5 * hexRadius) + hexGap; 

    // Initialize Grid
    const initGrid = () => {
      hexGrid = [];
      const cols = Math.ceil(window.innerWidth / xDist) + 3;
      const rows = Math.ceil(window.innerHeight / yDist) + 3;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let x = col * xDist;
          let y = row * yDist;
          if (row % 2 === 1) x += xDist / 2;
          x -= xDist * 1.5;
          y -= yDist * 1.5;

          hexGrid.push({ 
            x, 
            y, 
            phase: Math.random() * Math.PI * 2 
          });
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

    // Feature: Sophisticated 3D Lighting (Simplified Blinn-Phong approach for 2D Canvas)
    const drawHex3D = (
        x: number, 
        y: number, 
        r: number, 
        hue: number,
        saturation: number,
        lightness: number,
        rotation: number = 0, 
        intensity: number = 0
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      // Light source vector (simulated based on mouse position relative to hex)
      // Normalize vector from hex to mouse
      let lx = targetRef.current.x - x;
      let ly = targetRef.current.y - y;
      const lDist = Math.hypot(lx, ly) || 1;
      lx /= lDist;
      ly /= lDist;

      const angleStep = Math.PI / 3; // 60 degrees

      // 1. Draw Bevels (The slanted sides)
      // We draw 6 trapezoids. The brightness depends on the dot product of the side normal and light vector.
      const innerR = r * 0.8; // Inner face size
      
      for (let i = 0; i < 6; i++) {
          const angleStart = (Math.PI / 180) * 30 + i * angleStep;
          const angleEnd = angleStart + angleStep;
          
          // Calculate Normal of this edge (approximate direction outwards)
          const midAngle = angleStart + angleStep / 2;
          const nx = Math.cos(midAngle);
          const ny = Math.sin(midAngle);
          
          // Dot product for diffuse lighting on bevel
          // Light is coming from (lx, ly). Normal is (nx, ny).
          // We want how much they align. 
          const dot = lx * nx + ly * ny; 
          
          // Map dot (-1 to 1) to lightness modifier
          // A side facing the light (dot=1) should be brighter. Facing away (dot=-1) darker.
          const bevelLightness = lightness + (dot * 20); 

          ctx.beginPath();
          ctx.moveTo(r * Math.cos(angleStart), r * Math.sin(angleStart));
          ctx.lineTo(r * Math.cos(angleEnd), r * Math.sin(angleEnd));
          ctx.lineTo(innerR * Math.cos(angleEnd), innerR * Math.sin(angleEnd));
          ctx.lineTo(innerR * Math.cos(angleStart), innerR * Math.sin(angleStart));
          ctx.closePath();
          
          ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${Math.max(0, Math.min(100, bevelLightness))}%)`;
          ctx.fill();
      }

      // 2. Draw Top Face
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * 30 + i * angleStep;
        ctx.lineTo(innerR * Math.cos(angle), innerR * Math.sin(angle));
      }
      ctx.closePath();

      // Specular Highlight approximation on Top Face
      // If the mouse is close (high intensity), the top face gets a "shine" gradient
      if (intensity > 0.5) {
          // Gradient moves with light source
          const grad = ctx.createRadialGradient(
              -lx * innerR * 0.5, -ly * innerR * 0.5, 0,
              0, 0, innerR
          );
          // Highlight
          grad.addColorStop(0, `hsla(${hue}, ${Math.max(0, saturation - 30)}%, ${Math.min(100, lightness + 40)}%, 0.9)`);
          // Base color
          grad.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`);
          ctx.fillStyle = grad;
      } else {
          ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      }
      
      ctx.fill();

      // 3. Edge Highlight (Stroke) for definition
      ctx.lineWidth = 1;
      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${Math.max(0, lightness - 20)}%, 0.3)`;
      ctx.stroke();

      ctx.restore();
    };

    // --- Sound Synthesis Helpers ---
    const playInteractionSound = (type: 'hover' | 'click') => {
        if (!audioContextRef.current || !analyserRef.current || audioContextRef.current.state !== 'running') return;

        const actx = audioContextRef.current;
        const now = actx.currentTime;

        const osc = actx.createOscillator();
        const oscGain = actx.createGain();

        // Direct connection to analyser (bypassing drone gain)
        osc.connect(oscGain);
        oscGain.connect(analyserRef.current); 

        if (type === 'hover') {
            // "Glassy Tick"
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
            oscGain.gain.setValueAtTime(0, now);
            oscGain.gain.linearRampToValueAtTime(0.05, now + 0.005);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'click') {
            // "Sonar Pulse" - Deeper, resonant
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
            oscGain.gain.setValueAtTime(0.3, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    };

    const animate = () => {
      const nowTime = Date.now();
      const time = nowTime * 0.001;
      
      // --- Audio Analysis ---
      let bass = 0;
      let mid = 0;
      let treble = 0;

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

      // Feature: Audio-Reactive Breathing
      const breathSpeed = 1.5 + (bass * 8); 
      const breathIntensity = 0.5 + (mid * 0.5);
      const globalBreath = (Math.sin(time * breathSpeed) * 0.5 + 0.5) * breathIntensity; 

      // Smooth interpolation for light source
      const dx = mouseRef.current.x - targetRef.current.x;
      const dy = mouseRef.current.y - targetRef.current.y;
      targetRef.current.x += dx * 0.08;
      targetRef.current.y += dy * 0.08;

      // 1. Clear Background
      const bgLightness = 2 + (bass * 8); 
      ctx.fillStyle = `hsl(${activePalette.bgHue}, 30%, ${bgLightness}%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Ambient Glow
      const glowRadius = 600 + (bass * 400);
      const gradient = ctx.createRadialGradient(
          targetRef.current.x, targetRef.current.y, 0,
          targetRef.current.x, targetRef.current.y, glowRadius
      );
      
      const coreHue = activePalette.coreHue + (mid * 30); 
      const glowHue = activePalette.glowHue + (treble * 30); 

      gradient.addColorStop(0, `hsla(${coreHue}, 100%, 50%, 0.15)`); 
      gradient.addColorStop(0.3, `hsla(${glowHue}, 60%, 40%, 0.1)`); 
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'lighter'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Manage Ripples
      ripplesRef.current = ripplesRef.current.filter(r => nowTime - r.startTime < 1000);

      // 3. Render Hexagons
      hexGrid.forEach(hex => {
        const distX = hex.x - targetRef.current.x;
        const distY = hex.y - targetRef.current.y;
        const dist = Math.hypot(distX, distY);
        
        // Basic Light Logic
        const lightRadius = 500 + (bass * 200);
        const rawIntensity = Math.max(0, 1 - dist / lightRadius);
        const intensity = Math.pow(rawIntensity, 2);
        
        // Feature: Click Ripple Effect
        let rippleBoost = 0;
        ripplesRef.current.forEach(ripple => {
            const rDist = Math.hypot(hex.x - ripple.x, hex.y - ripple.y);
            const rAge = (nowTime - ripple.startTime) / 1000; // 0 to 1
            const rRadius = rAge * 800; // Expands to 800px
            const rThickness = 100 * (1 - rAge);
            
            if (Math.abs(rDist - rRadius) < rThickness) {
                // Hex is inside the ripple ring
                rippleBoost += (1 - Math.abs(rDist - rRadius) / rThickness) * (1 - rAge);
            }
        });

        // Mouse Hover Displacement
        let drawX = hex.x;
        let drawY = hex.y;
        
        if (dist < 300) {
            const repulsion = Math.pow(1 - dist / 300, 3) * 20; 
            const angle = Math.atan2(hex.y - targetRef.current.y, hex.x - targetRef.current.x);
            drawX += Math.cos(angle) * repulsion;
            drawY += Math.sin(angle) * repulsion;
        }

        // Feature: Frequency Mapping
        // Bass -> Size pulsing
        const dynamicRadius = hexRadius + (intensity * bass * 6) + (rippleBoost * 5);
        
        // Treble -> Subtle Rotation (active hexes only)
        const rotation = (intensity > 0.1 || rippleBoost > 0) ? (treble * Math.PI * 0.2) + (rippleBoost * Math.PI) : 0;

        // Draw
        if (intensity > 0.05 || rippleBoost > 0.05) {
            const totalIntensity = Math.min(1, intensity + rippleBoost);
            
            // Mid -> Saturation/Hue shift
            const hue = coreHue + (mid * 60);
            const sat = 50 + (totalIntensity * 50);
            const lit = 20 + (totalIntensity * 40) + (rippleBoost * 20);

            // Use new 3D Draw function
            drawHex3D(drawX, drawY, dynamicRadius, hue, sat, lit, rotation, totalIntensity);
        } else {
            // Idle State
            const twinkleSpeed = 1.5 + (treble * 5);
            const twinkle = Math.sin(time * twinkleSpeed + hex.phase) * 0.5 + 0.5;
            
            // Audio-reactive breath for idle lines
            const breathingOpacity = 0.03 + (globalBreath * 0.06);
            
            ctx.beginPath();
            // Simple line drawing for idle to save perf (no gradients)
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 180) * (30 + 60 * i);
                const px = drawX + hexRadius * Math.cos(angle);
                const py = drawY + hexRadius * Math.sin(angle);
                if (i===0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            
            ctx.strokeStyle = `hsla(${activePalette.bgHue}, 20%, 70%, ${breathingOpacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            if (twinkle > 0.95) {
                ctx.fillStyle = `rgba(255, 255, 255, ${(twinkle - 0.95) * 2})`;
                ctx.fill();
            }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Listeners
    window.addEventListener('resize', resize);
    
    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
        
        // Hover Sound
        const dist = Math.hypot(e.clientX - lastSoundPos.current.x, e.clientY - lastSoundPos.current.y);
        if (dist > 40) {
            playInteractionSound('hover');
            lastSoundPos.current = { x: e.clientX, y: e.clientY };
        }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleMouseDown = (e: MouseEvent) => {
        // Haptic Feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }

        playInteractionSound('click');
        // Register ripple
        ripplesRef.current.push({
            x: e.clientX,
            y: e.clientY,
            startTime: Date.now()
        });
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
  }, [isAudioActive, paletteIndex]);

  // Helper for Shape rendering in button
  const renderShapeIcon = (shape: string) => {
      switch(shape) {
          case 'circle': return <circle cx="12" cy="12" r="9" />;
          case 'square': return <rect x="4" y="4" width="16" height="16" rx="2" />;
          case 'triangle': return <path d="M12 3 L22 20 L2 20 Z" />;
          case 'hexagon': return <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" />;
          case 'diamond': return <path d="M12 2 L22 12 L12 22 L2 12 Z" />;
          case 'pentagon': return <path d="M12 2 L22 9 L18 21 L6 21 L2 9 Z" />;
          case 'star': return <path d="M12 2 L15 9 L22 9 L17 14 L19 21 L12 17 L5 21 L7 14 L2 9 L9 9 Z" />;
          default: return <circle cx="12" cy="12" r="9" />;
      }
  };

  return (
    <>
        <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-[-1] bg-[#020408]"
        />
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
            {/* Palette Switcher - Shape Shifting Button */}
            <button
                onClick={cyclePalette}
                className="group flex items-center justify-center h-14 w-14 rounded-full backdrop-blur-md border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg text-gray-200"
                title={`Theme: ${activePalette.name} (Click to change shape & color)`}
                aria-label="Change Color Theme"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 transition-all duration-500 ease-in-out group-hover:stroke-hexCore group-hover:fill-hexCore/20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                   {renderShapeIcon(activePalette.shape || 'circle')}
                </svg>
            </button>

            {/* Audio Toggle */}
            <button
                onClick={toggleAudio}
                disabled={isLoading}
                className={`flex items-center gap-3 px-5 py-4 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg active:scale-95 ${
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
            {hasError && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-red-500/80 text-white text-xs rounded-md whitespace-nowrap">
                    Failed to initialize audio
                </div>
            )}
        </div>
    </>
  );
};

export default HexagonBackground;
