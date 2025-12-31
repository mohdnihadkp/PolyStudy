import React, { useEffect, useRef } from 'react';

const HexagonBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let hexGrid: { x: number; y: number; phase: number }[] = [];
    
    // Grid Configuration
    const hexRadius = 22; // Slightly smaller for higher density/resolution
    const hexGap = 2; 
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;
    const xDist = hexWidth + hexGap; 
    const yDist = (1.5 * hexRadius) + hexGap; 

    // Initialize Grid with random phases for twinkling
    const initGrid = () => {
      hexGrid = [];
      // Add extra padding to ensure coverage
      const cols = Math.ceil(window.innerWidth / xDist) + 4;
      const rows = Math.ceil(window.innerHeight / yDist) + 4;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let x = col * xDist;
          let y = row * yDist;
          
          // Offset odd rows
          if (row % 2 === 1) {
            x += xDist / 2;
          }
          
          // Center adjustment
          x -= xDist * 2;
          y -= yDist * 2;

          hexGrid.push({ 
            x, 
            y, 
            phase: Math.random() * Math.PI * 2 // Random starting point for oscillation
          });
        }
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reset mouse to center on first load/resize if untouched
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
      const time = Date.now() * 0.001; // Time for idle animations

      // Smooth "Spring" interpolation for light source
      const dx = mouseRef.current.x - targetRef.current.x;
      const dy = mouseRef.current.y - targetRef.current.y;
      targetRef.current.x += dx * 0.08;
      targetRef.current.y += dy * 0.08;

      // 1. Clear Background
      ctx.fillStyle = '#020408'; // Very dark blue-black
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Ambient Glow (Light source under the floor)
      const gradient = ctx.createRadialGradient(
          targetRef.current.x, targetRef.current.y, 0,
          targetRef.current.x, targetRef.current.y, 600
      );
      // Core highlight
      gradient.addColorStop(0, 'rgba(255, 101, 0, 0.12)'); 
      // Secondary bloom
      gradient.addColorStop(0.3, 'rgba(30, 62, 98, 0.08)'); 
      // Fade out
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.fillStyle = gradient;
      // 'screen' or 'lighter' blend mode makes the glow look additive
      ctx.globalCompositeOperation = 'lighter'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // 3. Render Hexagons
      hexGrid.forEach(hex => {
        const distX = hex.x - targetRef.current.x;
        const distY = hex.y - targetRef.current.y;
        const dist = Math.hypot(distX, distY);
        
        // Calculate Light Intensity (0.0 to 1.0)
        // Using inverse square-like falloff for realism
        const lightRadius = 500;
        const rawIntensity = Math.max(0, 1 - dist / lightRadius);
        const intensity = Math.pow(rawIntensity, 2); // Squared falloff looks more natural

        drawHexPath(hex.x, hex.y, hexRadius);

        // --- Active State (Lit by mouse) ---
        if (intensity > 0.05) {
            // Fill: Subtle glass-like tint
            ctx.fillStyle = `rgba(30, 62, 98, ${intensity * 0.4})`;
            // Core Fill: Hot center
            if (intensity > 0.8) {
               ctx.fillStyle = `rgba(255, 101, 0, ${intensity * 0.25})`; 
            }
            ctx.fill();

            // Stroke: Dynamic Color & Width
            ctx.lineWidth = 1 + (intensity * 2.5);
            
            // Color Interpolation:
            // > 0.9 : White hot
            // > 0.6 : Orange
            // > 0.2 : Blue
            if (intensity > 0.9) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${intensity})`;
            } else if (intensity > 0.6) {
                // Smoothly blend Orange to White
                ctx.strokeStyle = `rgba(255, 140, 50, ${intensity})`;
            } else {
                // Smoothly blend Blue to Orange
                ctx.strokeStyle = `rgba(70, 130, 180, ${0.2 + intensity * 0.8})`;
            }
        } 
        // --- Idle State (Dormant) ---
        else {
            // Twinkle Effect: Sine wave based on time + random phase
            const twinkle = Math.sin(time * 1.5 + hex.phase) * 0.5 + 0.5;
            
            // Only draw faint stroke usually
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'; // Barely visible metallic grid

            // Random sparkles
            if (twinkle > 0.95) {
                ctx.fillStyle = `rgba(255, 255, 255, ${(twinkle - 0.95) * 2})`; // Flash white
                ctx.fill();
            }
        }

        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Event Listeners
    window.addEventListener('resize', resize);
    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initial Start
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] bg-[#020408] pointer-events-none"
    />
  );
};

export default HexagonBackground;
