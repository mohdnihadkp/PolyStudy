
import React, { useEffect, useRef } from 'react';

const HexagonBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let hexGrid: { x: number, y: number }[] = [];
    
    // Grid Configuration
    const hexRadius = 50; // Size of hexagons
    const hexGap = 4; // Gap between hexagons
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;
    const xDist = hexWidth + hexGap; 
    const yDist = (1.5 * hexRadius) + hexGap; 

    // Initialize Grid
    const initGrid = () => {
      hexGrid = [];
      const cols = Math.ceil(window.innerWidth / xDist) + 2;
      const rows = Math.ceil(window.innerHeight / yDist) + 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let x = col * xDist;
          let y = row * yDist;
          
          // Offset odd rows
          if (row % 2 === 1) {
            x += xDist / 2;
          }
          
          // Center the grid coordinates relative to drawing area
          x -= xDist;
          y -= yDist;

          hexGrid.push({ x, y });
        }
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize mouse/target to center on load if not moved
      if (mouseRef.current.x === 0 && mouseRef.current.y === 0) {
          mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
          targetRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
      }
      
      initGrid();
    };

    // Draw single hexagon path
    const drawHex = (x: number, y: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (30 + 60 * i);
        ctx.lineTo(x + hexRadius * Math.cos(angle), y + hexRadius * Math.sin(angle));
      }
      ctx.closePath();
    };

    const animate = () => {
      // Smooth interpolation for flashlight movement
      targetRef.current.x += (mouseRef.current.x - targetRef.current.x) * 0.1;
      targetRef.current.y += (mouseRef.current.y - targetRef.current.y) * 0.1;

      // Clear Canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Grid
      hexGrid.forEach(hex => {
        const dx = hex.x - targetRef.current.x;
        const dy = hex.y - targetRef.current.y;
        const dist = Math.hypot(dx, dy); // Efficient distance calc
        
        drawHex(hex.x, hex.y);

        // --- Lighting Logic ---
        let fillStyle = '#111111'; // Default dark hex color

        // Light radius ~400px
        if (dist < 400) {
            if (dist < 60) {
                fillStyle = '#212129'; // Core: White
            } else if (dist < 150) {
                fillStyle = '#323949'; // Inner Ring: Red/Pink (Rose-600)
            } else if (dist < 250) {
                fillStyle = '#3d3e51'; // Middle Ring: Purple (Violet-600)
            } else if (dist < 350) {
                fillStyle = '#40445a'; // Outer Ring: Blue (Blue-800)
            } else {
                fillStyle = '#4c5265'; // Fade: Slate-900
            }
        }

        ctx.fillStyle = fillStyle;
        ctx.fill();

        // Stroke creates the "gap" effect (drawing black lines between hexes)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Event Listeners
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    });

    // Start
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] bg-black pointer-events-none"
      style={{ touchAction: 'none' }}
    />
  );
};

export default HexagonBackground;
