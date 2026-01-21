
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

interface HexagonBackgroundProps {
    isDarkMode?: boolean;
}

// Helper to create glow texture for sprites
const generateGlowTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (context) {
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
    }
    return canvas;
};

const HexagonBackground: React.FC<HexagonBackgroundProps> = ({ isDarkMode = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const starsGroupRef = useRef<THREE.Group | null>(null);

  // Handle Theme Changes
  useEffect(() => {
    if (sceneRef.current) {
        const bgColor = isDarkMode ? 0x000000 : 0xf0f2f5;
        sceneRef.current.background = new THREE.Color(bgColor);
        sceneRef.current.fog = new THREE.FogExp2(bgColor, isDarkMode ? 0.002 : 0.02);

        // Hide stars in light mode for cleaner look
        if (starsGroupRef.current) {
            starsGroupRef.current.visible = isDarkMode;
        }
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const initialColor = isDarkMode ? 0x000000 : 0xf0f2f5;
    scene.background = new THREE.Color(initialColor);
    scene.fog = new THREE.FogExp2(initialColor, isDarkMode ? 0.002 : 0.02);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 22);

    // --- RENDERER ---
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // ACESFilmicToneMapping handles bright lights better
    renderer.toneMapping = THREE.ACESFilmicToneMapping; 
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Disable scroll zoom
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5; // Slow cinematic rotation

    // --- LIGHTING (Static & Bright) ---
    // Ambient light ensures base visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Main Sun Light (Fixed Position)
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
    sunLight.position.set(5, 3, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // --- ASSETS & TEXTURES ---
    const textureLoader = new THREE.TextureLoader();
    const glowTexture = new THREE.CanvasTexture(generateGlowTexture());

    // Earth Textures
    const earthMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const earthBump = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    const earthSpec = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');
    const earthClouds = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png');

    // Planet Textures (Using reliable assets from codepen demos for stability)
    const txMercury = textureLoader.load('https://assets.codepen.io/122136/mercury_1k.jpg');
    const txVenus = textureLoader.load('https://assets.codepen.io/122136/venus_1k.jpg');
    const txMars = textureLoader.load('https://assets.codepen.io/122136/mars_1k.jpg');
    const txJupiter = textureLoader.load('https://assets.codepen.io/122136/jupiter_1k.jpg');
    const txSaturn = textureLoader.load('https://assets.codepen.io/122136/saturn_1k.jpg');
    const txSaturnRing = textureLoader.load('https://assets.codepen.io/122136/saturn_ring_alpha.png');
    const txNeptune = textureLoader.load('https://assets.codepen.io/122136/neptune_1k.jpg');

    // --- GROUPS ---
    const universeGroup = new THREE.Group(); // Background rotation
    scene.add(universeGroup);

    const earthGroup = new THREE.Group(); // Independent Earth position
    earthGroup.position.set(-6.5, 0, 0); // Default Desktop
    scene.add(earthGroup);

    // ================= EARTH (Hero) =================
    // Scale 0.5 -> Radius 1.6
    const earthRadius = 1.6;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthMap,
      normalMap: earthBump,
      roughnessMap: earthSpec,
      roughness: 0.5,
      metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.rotation.y = -Math.PI / 2;
    earth.castShadow = true;
    earth.receiveShadow = true;
    earthGroup.add(earth);

    // Clouds
    const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.03, 64, 64);
    const cloudMat = new THREE.MeshLambertMaterial({
      map: earthClouds,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earth.add(clouds);

    // Atmosphere Glow
    const atmosphereMat = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x4ca6ff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Sprite(atmosphereMat);
    atmosphere.scale.set(earthRadius * 2.6, earthRadius * 2.6, 1);
    earthGroup.add(atmosphere);


    // ================= SOLAR SYSTEM (Background) =================
    
    // Helper for Planets
    const createPlanet = (radius: number, texture: THREE.Texture, x: number, z: number, hasRing = false) => {
        const geo = new THREE.SphereGeometry(radius, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.7 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        universeGroup.add(mesh);

        // Saturn Ring
        if (hasRing) {
            const ringGeo = new THREE.RingGeometry(radius * 1.4, radius * 2.2, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                map: txSaturnRing,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            // Align UVs for ring texture
            const pos = ringGeo.attributes.position;
            const v3 = new THREE.Vector3();
            for (let i = 0; i < pos.count; i++){
                v3.fromBufferAttribute(pos, i);
                ringGeo.attributes.uv.setXY(i, v3.length() < radius * 1.8 ? 0 : 1, 1);
            }
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2.2;
            mesh.add(ring);
        }
        return mesh;
    };

    createPlanet(0.6, txMercury, 12, -15);
    createPlanet(1.1, txVenus, 20, -10);
    createPlanet(0.8, txMars, -15, -12);
    createPlanet(4.0, txJupiter, 40, -40);
    createPlanet(3.5, txSaturn, 60, -50, true);
    createPlanet(3.0, txNeptune, -50, -60);

    // ================= BLACK HOLE (Cinematic) =================
    const blackHoleGroup = new THREE.Group();
    blackHoleGroup.position.set(-30, 10, -80);
    blackHoleGroup.rotation.x = Math.PI / 6;
    universeGroup.add(blackHoleGroup);

    // Event Horizon (Core)
    const bhCore = new THREE.Mesh(
        new THREE.SphereGeometry(4, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    blackHoleGroup.add(bhCore);

    // Accretion Disk (Glowing)
    const diskGeo = new THREE.TorusGeometry(8, 2, 16, 100);
    const diskMat = new THREE.MeshBasicMaterial({ 
        color: 0x8a2be2, // Violet
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8 
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.rotation.x = Math.PI / 2;
    disk.scale.z = 0.1; // Flatten it
    blackHoleGroup.add(disk);

    // Add bright glow sprite to black hole
    const bhGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0x9370db,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.5
    }));
    bhGlow.scale.set(30, 30, 1);
    blackHoleGroup.add(bhGlow);


    // ================= STARFIELD (ENHANCED) =================
    const starsGroup = new THREE.Group();
    scene.add(starsGroup);
    starsGroupRef.current = starsGroup;

    // 1. Distant Background Stars (Dusty/Faint)
    const bgStarCount = 5000;
    const bgStarGeo = new THREE.BufferGeometry();
    const bgStarPos = new Float32Array(bgStarCount * 3);
    const bgStarColors = new Float32Array(bgStarCount * 3);
    
    for (let i = 0; i < bgStarCount; i++) {
        // Distribute in a large volume
        const r = 200 + Math.random() * 600;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        bgStarPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        bgStarPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        bgStarPos[i*3+2] = r * Math.cos(phi);

        // Faint colors (Grey/White)
        const intensity = 0.4 + Math.random() * 0.3;
        bgStarColors[i*3] = intensity;
        bgStarColors[i*3+1] = intensity;
        bgStarColors[i*3+2] = intensity;
    }
    bgStarGeo.setAttribute('position', new THREE.BufferAttribute(bgStarPos, 3));
    bgStarGeo.setAttribute('color', new THREE.BufferAttribute(bgStarColors, 3));
    
    const bgStarMat = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });
    const bgStars = new THREE.Points(bgStarGeo, bgStarMat);
    starsGroup.add(bgStars);

    // 2. Foreground Bright Stars (Cinematic)
    const fgStarCount = 1500;
    const fgStarGeo = new THREE.BufferGeometry();
    const fgStarPos = new Float32Array(fgStarCount * 3);
    const fgStarColors = new Float32Array(fgStarCount * 3);
    const fgColor = new THREE.Color();

    for (let i = 0; i < fgStarCount; i++) {
        const r = 120 + Math.random() * 400; // Closer range
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        fgStarPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        fgStarPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        fgStarPos[i*3+2] = r * Math.cos(phi);

        // Realistic Spectral Colors
        const t = Math.random();
        if (t > 0.9) fgColor.setHex(0x9bb0ff); // Blue Giant
        else if (t > 0.6) fgColor.setHex(0xffffff); // White
        else if (t > 0.3) fgColor.setHex(0xffcf6f); // Yellow
        else fgColor.setHex(0xffcc6f); // Orange/Red

        fgStarColors[i*3] = fgColor.r;
        fgStarColors[i*3+1] = fgColor.g;
        fgStarColors[i*3+2] = fgColor.b;
    }
    fgStarGeo.setAttribute('position', new THREE.BufferAttribute(fgStarPos, 3));
    fgStarGeo.setAttribute('color', new THREE.BufferAttribute(fgStarColors, 3));

    const fgStarMat = new THREE.PointsMaterial({
        size: 1.2, // Larger
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });
    const fgStars = new THREE.Points(fgStarGeo, fgStarMat);
    starsGroup.add(fgStars);


    // --- POST PROCESSING (Bloom) ---
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.0, // Strength
        0.4, // Radius
        0.85 // Threshold
    );
    composer.addPass(bloomPass);


    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!rendererRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
      composer.setSize(width, height);

      // Responsive Earth Position
      if (width > 768) {
        // Desktop: Left side
        earthGroup.position.set(-6.5, 0, 0);
      } else {
        // Mobile: Bottom Center
        earthGroup.position.set(0, -3, 0);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);


    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Rotate Earth independently
      earth.rotation.y += 0.05 * delta;
      clouds.rotation.y += 0.07 * delta;

      // Slowly rotate the entire universe background
      universeGroup.rotation.y += 0.02 * delta;

      // Rotate Celestial Sphere (Stars)
      if (starsGroupRef.current) {
          starsGroupRef.current.rotation.y -= 0.002 * delta;
      }

      // Pulse the Black Hole Disk
      const pulse = 1 + Math.sin(elapsed * 2) * 0.05;
      disk.scale.set(1 * pulse, 1 * pulse, 0.1);

      controls.update();
      composer.render();
    };
    animate();

    // --- CLEANUP ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      renderer.dispose();
      composer.dispose();
      controls.dispose();
      
      earthGeo.dispose(); earthMat.dispose();
      cloudGeo.dispose(); cloudMat.dispose();
      diskGeo.dispose(); diskMat.dispose();
      atmosphereMat.dispose();
      glowTexture.dispose();
      
      // Cleanup Stars
      bgStarGeo.dispose(); bgStarMat.dispose();
      fgStarGeo.dispose(); fgStarMat.dispose();
      
      // Dispose textures
      earthMap.dispose(); earthBump.dispose(); earthSpec.dispose(); earthClouds.dispose();
      txMercury.dispose(); txVenus.dispose(); txMars.dispose(); 
      txJupiter.dispose(); txSaturn.dispose(); txSaturnRing.dispose(); txNeptune.dispose();
    };
  }, []);

  return (
    <div 
        ref={mountRef} 
        style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            zIndex: -1, 
            background: isDarkMode ? '#000000' : '#f0f2f5',
            transition: 'background-color 0.5s ease',
            pointerEvents: 'auto'
        }} 
    />
  );
};

export default HexagonBackground;
