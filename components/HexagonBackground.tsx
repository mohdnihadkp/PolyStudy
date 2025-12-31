import React, { useEffect, useRef, useState } from 'react';

const HexagonBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Audio Toggle Handler
  const toggleAudio = async () => {
    if (isAudioActive) {
      // Pause/Suspend
      if (audioContextRef.current) {
        await audioContextRef.current.suspend();
        setIsAudioActive(false);
      }
    } else {
      setIsLoading(true);
      try {
        if (!audioContextRef.current) {
          // Initialize Audio Context
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContext();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256; // Use 256 for manageable data size (128 bins)
          analyser.smoothingTimeConstant = 0.8;

          const gainNode = ctx.createGain();
          gainNode.gain.value = 0.4; // Lower volume slightly

          // Fetch Audio (Cyberpunk/Tech style track)
          const response = await fetch('https://cdn.pixabay.com/audio/2022/03/24/audio_346bf89947.mp3'); 
          if (!response.ok) throw new Error('Network response was not ok');
          
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.loop = true;
          
          // Connect Graph: Source -> Analyser -> Gain -> Destination
          source.connect(analyser);
          analyser.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          source.start(0);

          audioContextRef.current = ctx;
          analyserRef.current = analyser;
          sourceRef.current = source;
          gainNodeRef.current = gainNode;
          dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        } else {
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
    
    // Grid Configuration
    const hexRadius = 22; 
    const hexGap = 2; 
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;
    const xDist = hexWidth + hexGap; 
    const yDist = (1.5 * hexRadius) + hexGap; 

    // Initialize Grid
    const initGrid = () => {
      hexGrid = [];
      const cols = Math.ceil(window.innerWidth / xDist) + 4;
      const rows = Math.ceil(window.innerHeight / yDist) + 4;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let x = col * xDist;
          let y = row * yDist;
          if (row % 2 === 1) x += xDist / 2;
          x -= xDist * 2;
          y -= yDist * 2;

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

    const drawHexPath = (x: number, y: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (30 + 60 * i);
        ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
      }
      ctx.closePath();
    };

    const animate = () => {
      const time = Date.now() * 0.001;

      // Audio Analysis
      let bass = 0;
      let mid = 0;
      let treble = 0;

      if (analyserRef.current && dataArrayRef.current && isAudioActive) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const binCount = dataArrayRef.current.length;
        
        // Simple Frequency Bands
        const bassEnd = Math.floor(binCount * 0.1); // 0-10%
        const midEnd = Math.floor(binCount * 0.5);  // 10-50%
        
        // Calculate averages (normalized 0-1)
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

      // Smooth interpolation for light source
      const dx = mouseRef.current.x - targetRef.current.x;
      const dy = mouseRef.current.y - targetRef.current.y;
      targetRef.current.x += dx * 0.08;
      targetRef.current.y += dy * 0.08;

      // 1. Clear Background with Dynamic Bass Pulse
      // Base color is #020408. We lighten it slightly on bass hits.
      const bgLightness = 2 + (bass * 5); 
      ctx.fillStyle = `hsl(220, 30%, ${bgLightness}%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Ambient Glow
      // Radius expands with bass
      const glowRadius = 600 + (bass * 300);
      const gradient = ctx.createRadialGradient(
          targetRef.current.x, targetRef.current.y, 0,
          targetRef.current.x, targetRef.current.y, glowRadius
      );
      
      // Dynamic Colors based on Mid/Treble
      const coreHue = 25 + (mid * 50); // Orange -> Yellow/Green shift
      const glowHue = 210 + (treble * 40); // Blue -> Purple shift

      gradient.addColorStop(0, `hsla(${coreHue}, 100%, 50%, 0.15)`); 
      gradient.addColorStop(0.3, `hsla(${glowHue}, 60%, 40%, 0.1)`); 
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = 'lighter'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // 3. Render Hexagons
      hexGrid.forEach(hex => {
        const distX = hex.x - targetRef.current.x;
        const distY = hex.y - targetRef.current.y;
        const dist = Math.hypot(distX, distY);
        
        const lightRadius = 500 + (bass * 200);
        const rawIntensity = Math.max(0, 1 - dist / lightRadius);
        const intensity = Math.pow(rawIntensity, 2);

        // Dynamic Radius Pulse on Beat
        const dynamicRadius = hexRadius + (intensity * bass * 4);

        drawHexPath(hex.x, hex.y, dynamicRadius);

        // Active State
        if (intensity > 0.05) {
            // Fill
            const alpha = intensity * 0.4 + (mid * 0.2); // Boost fill on mids
            ctx.fillStyle = `rgba(30, 62, 98, ${alpha})`;
            
            // Core Hot Spot
            if (intensity > 0.8) {
               ctx.fillStyle = `hsla(${coreHue}, 100%, 60%, ${intensity * 0.4})`; 
            }
            ctx.fill();

            // Stroke
            ctx.lineWidth = 1 + (intensity * 2.5) + (treble * 3); // Thicken on treble
            
            if (intensity > 0.9) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${intensity})`;
            } else if (intensity > 0.6) {
                ctx.strokeStyle = `hsla(${coreHue}, 100%, 70%, ${intensity})`;
            } else {
                ctx.strokeStyle = `hsla(${glowHue}, 70%, 50%, ${0.2 + intensity * 0.8})`;
            }
        } 
        // Idle State
        else {
            // Twinkle speed affected by treble
            const twinkleSpeed = 1.5 + (treble * 5);
            const twinkle = Math.sin(time * twinkleSpeed + hex.phase) * 0.5 + 0.5;
            
            ctx.lineWidth = 1;
            // Base grid visibility pulses with mid
            const gridOpacity = 0.03 + (mid * 0.05);
            ctx.strokeStyle = `rgba(255, 255, 255, ${gridOpacity})`;

            if (twinkle > 0.95) {
                ctx.fillStyle = `rgba(255, 255, 255, ${(twinkle - 0.95) * 2})`;
                ctx.fill();
            }
        }

        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      // Don't necessarily stop audio on unmount to prevent abrupt cuts if navigating (though this app is single page)
      // But good practice:
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
      }
    };
  }, [isAudioActive]); // Re-bind if audio state changes significantly? Actually just runs once, audio state read from refs/state in closure. 
  // Note: 'isAudioActive' inside animate will be stale if not careful. 
  // However, we rely on checking 'analyserRef.current' which is mutable.

  return (
    <>
        <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-[-1] bg-[#020408] pointer-events-none"
        />
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={toggleAudio}
                disabled={isLoading}
                className={`flex items-center gap-3 px-5 py-3 rounded-full backdrop-blur-md border transition-all duration-300 shadow-lg ${
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
                        <span className="font-semibold text-sm">Immersive Mode On</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-sm">Enable Audio</span>
                    </>
                )}
            </button>
            {hasError && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-red-500/80 text-white text-xs rounded-md whitespace-nowrap">
                    Failed to load audio
                </div>
            )}
        </div>
    </>
  );
};

export default HexagonBackground;
