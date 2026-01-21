
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

// Generate glow texture for sprites
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
  const starsRef = useRef<THREE.Points | null>(null);

  // Handle Theme Changes dynamically
  useEffect(() => {
    if (sceneRef.current) {
        const bgColor = isDarkMode ? 0x050505 : 0xf0f2f5;
        const fogColor = isDarkMode ? 0x050505 : 0xf0f2f5;
        
        // Smooth transition could be added here, but direct set is efficient
        sceneRef.current.background = new THREE.Color(bgColor);
        sceneRef.current.fog = new THREE.FogExp2(fogColor, 0.02);

        // Adjust star visibility in light mode (invert or fade)
        if (starsRef.current) {
            starsRef.current.visible = isDarkMode;
        }
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE & CAMERA ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Initial Theme Set
    const bgColor = isDarkMode ? 0x050505 : 0xf0f2f5;
    scene.background = new THREE.Color(bgColor); 
    scene.fog = new THREE.FogExp2(bgColor, 0.02);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);

    // --- RENDERER ---
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- ASSETS ---
    const textureLoader = new THREE.TextureLoader();
    const glowTexture = new THREE.CanvasTexture(generateGlowTexture());
    
    const earthMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const earthBump = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    const earthSpec = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');
    const earthClouds = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png');

    // --- STATIC LIGHTING (High Intensity, Fixed) ---
    // Make the scene bright and visible
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 3.0);
    mainLight.position.set(5, 3, 5); // Fixed Top-Right
    scene.add(mainLight);

    // --- UNIVERSE GROUP (Slow Rotation) ---
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // ================= EARTH (Main Focus - Scaled Down) =================
    const earthGroup = new THREE.Group();
    // Default position (will be updated by resize)
    earthGroup.position.set(-4, 0, 0); 
    scene.add(earthGroup); // Earth is separate from universe rotation for control

    // Earth Sphere (Scale 0.5 of original ~3.5 -> Radius ~1.75)
    const earthRadius = 1.75;
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
    earthGroup.add(earth);

    // Clouds
    const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.02, 64, 64);
    const cloudMat = new THREE.MeshLambertMaterial({
      map: earthClouds,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(clouds);

    // Atmosphere Glow
    const atmosphereMat = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x4ca6ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Sprite(atmosphereMat);
    atmosphere.scale.set(earthRadius * 2.5, earthRadius * 2.5, 1);
    earthGroup.add(atmosphere);


    // ================= SOLAR SYSTEM (Background) =================
    
    // 1. The Sun (Distant Giant)
    const sunGeo = new THREE.SphereGeometry(10, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(0, 0, -100);
    universeGroup.add(sun);
    
    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffdd00,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.6
    }));
    sunGlow.scale.set(60, 60, 1);
    sun.add(sunGlow);

    // 2. Planets Helper
    const createPlanet = (radius: number, color: number, x: number, z: number = 0, ring?: boolean) => {
        const geo = new THREE.SphereGeometry(radius, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0, z);
        universeGroup.add(mesh);

        if (ring) {
            const ringGeo = new THREE.RingGeometry(radius * 1.4, radius * 2.2, 32);
            const ringMat = new THREE.MeshBasicMaterial({ 
                color: 0xcfb08c, 
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = Math.PI / 2.5;
            mesh.add(ringMesh);
        }
        return mesh;
    };

    createPlanet(0.6, 0xaaaaaa, 10, -20); // Mercury
    createPlanet(1.2, 0xe3bb76, 18, -15); // Venus
    createPlanet(0.8, 0xc1440e, -15, -10); // Mars
    createPlanet(3.5, 0xd8ca9d, 35, -30); // Jupiter
    createPlanet(3.0, 0xcfb08c, 50, -40, true); // Saturn
    createPlanet(2.0, 0xadd8e6, -40, -50); // Uranus
    createPlanet(2.0, 0x3e54e8, -55, -60); // Neptune

    // 3. Black Hole (Stylized)
    const blackHoleGroup = new THREE.Group();
    blackHoleGroup.position.set(-40, 15, -60);
    universeGroup.add(blackHoleGroup);

    const singularity = new THREE.Mesh(
        new THREE.SphereGeometry(3, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    blackHoleGroup.add(singularity);

    const accretionDisk = new THREE.Mesh(
        new THREE.TorusGeometry(6, 1.5, 16, 100),
        new THREE.MeshBasicMaterial({ color: 0x8a2be2, side: THREE.DoubleSide })
    );
    accretionDisk.rotation.x = Math.PI / 3;
    accretionDisk.scale.z = 0.1;
    blackHoleGroup.add(accretionDisk);

    // ================= STARS & GALAXY =================
    const starCount = 3000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < starCount; i++) {
        // Spread stars in a wide volume
        const x = (Math.random() - 0.5) * 400;
        const y = (Math.random() - 0.5) * 400;
        const z = (Math.random() - 0.5) * 400;
        
        starPos[i*3] = x;
        starPos[i*3+1] = y;
        starPos[i*3+2] = z;

        // Multicoloured Galaxy Feel
        const choice = Math.random();
        if (choice > 0.8) color.setHex(0xffd700); // Gold
        else if (choice > 0.5) color.setHex(0x4ca6ff); // Blue
        else color.setHex(0xffffff); // White

        starColors[i*3] = color.r;
        starColors[i*3+1] = color.g;
        starColors[i*3+2] = color.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    
    const starMat = new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    starsRef.current = stars; // Ref for toggling visibility

    // --- POST PROCESSING ---
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, 0.4, 0.85
    );
    composer.addPass(bloomPass);

    // --- RESIZE & LAYOUT ---
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
        earthGroup.position.set(-4, 0, 0);
        camera.position.z = 20;
      } else {
        // Mobile: Bottom Center
        earthGroup.position.set(0, -3.5, 0);
        camera.position.z = 28; // Zoom out more on mobile
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

      // Earth Spin
      earth.rotation.y += 0.05 * delta;
      clouds.rotation.y += 0.07 * delta;

      // Slow Universe Rotation
      universeGroup.rotation.y += 0.02 * delta;

      // Subtle Star Drift
      if (starsRef.current) {
          starsRef.current.rotation.y -= 0.005 * delta;
      }

      // Black Hole Pulse
      const scale = 1 + Math.sin(elapsed * 2) * 0.05;
      accretionDisk.scale.set(1 * scale, 1 * scale, 0.1);

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
      
      // Cleanup Geometries & Materials
      earthGeo.dispose(); earthMat.dispose();
      cloudGeo.dispose(); cloudMat.dispose();
      sunGeo.dispose(); sunMat.dispose();
      starGeo.dispose(); starMat.dispose();
      atmosphereMat.dispose();
      glowTexture.dispose();
      earthMap.dispose(); earthBump.dispose(); 
      earthSpec.dispose(); earthClouds.dispose();
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
            background: isDarkMode ? '#050505' : '#f0f2f5',
            pointerEvents: 'auto',
            transition: 'background-color 0.5s ease'
        }} 
    />
  );
};

export default HexagonBackground;
