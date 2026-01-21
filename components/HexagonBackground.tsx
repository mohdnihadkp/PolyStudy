
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// Optimize texture generation
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

const HexagonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE & CAMERA ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505); 
    // scene.fog = new THREE.FogExp2(0x000000, 0.02);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 25); // Zoomed out view

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
    renderer.shadowMap.enabled = true; // Enable shadows for eclipse effects
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 10;
    controls.maxDistance = 60;
    controls.autoRotate = false; // We rotate objects, not camera

    // --- ASSETS ---
    const textureLoader = new THREE.TextureLoader();
    const glowTexture = new THREE.CanvasTexture(generateGlowTexture());
    
    const earthMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const earthBump = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    const earthSpec = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');
    const earthClouds = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png');
    const moonMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

    // --- SYSTEM HIERARCHY ---
    const solarSystemGroup = new THREE.Group();
    solarSystemGroup.position.x = -2; // Offset whole system slightly left
    scene.add(solarSystemGroup);

    // ================= EARTH (Center) =================
    // Reduced Radius: 1.5 (approx 40% of original 3.5)
    const earthRadius = 1.5;
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
    solarSystemGroup.add(earth);

    // Clouds
    const cloudGeo = new THREE.SphereGeometry(earthRadius + 0.03, 64, 64);
    const cloudMat = new THREE.MeshLambertMaterial({
      map: earthClouds,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earth.add(clouds);

    // Atmosphere Glow
    const atmosphereMat = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0x4ca6ff,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Sprite(atmosphereMat);
    atmosphere.scale.set(earthRadius * 2.8, earthRadius * 2.8, 1);
    earth.add(atmosphere);


    // ================= ORBIT GROUPS =================
    // These invisible groups rotate at the center (Earth), carrying their children (planets/sun)

    // 1. SUN ORBIT
    const sunOrbitGroup = new THREE.Group();
    solarSystemGroup.add(sunOrbitGroup);

    const sunDistance = 20;
    const sunGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffddaa });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(sunDistance, 2, 0); // Position relative to center
    sunOrbitGroup.add(sunMesh);

    // Sun Glow
    const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffaa00,
        transparent: true,
        blending: THREE.AdditiveBlending,
    }));
    sunGlow.scale.set(10, 10, 1);
    sunMesh.add(sunGlow);

    // DYNAMIC LIGHT SOURCE (Attached to Sun)
    // This ensures day/night cycle rotates around Earth
    const sunLight = new THREE.PointLight(0xffffff, 2.5, 100);
    sunLight.position.set(0, 0, 0); // At Sun's center
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunMesh.add(sunLight);


    // 2. MOON ORBIT
    const moonOrbitGroup = new THREE.Group();
    // Tilt orbit slightly
    moonOrbitGroup.rotation.z = Math.PI / 8;
    moonOrbitGroup.rotation.x = Math.PI / 8;
    solarSystemGroup.add(moonOrbitGroup);

    const moonDistance = 4;
    const moonGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonMap,
      roughness: 0.8,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(moonDistance, 0, 0);
    moon.castShadow = true;
    moon.receiveShadow = true;
    moonOrbitGroup.add(moon);


    // 3. MARS ORBIT
    const marsOrbitGroup = new THREE.Group();
    marsOrbitGroup.rotation.z = -Math.PI / 12;
    solarSystemGroup.add(marsOrbitGroup);

    const marsDistance = 8;
    const marsGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const marsMat = new THREE.MeshStandardMaterial({ color: 0xbc4e34, roughness: 0.7 });
    const mars = new THREE.Mesh(marsGeo, marsMat);
    mars.position.set(-marsDistance, 1, 0); // Start on opposite side
    mars.castShadow = true;
    mars.receiveShadow = true;
    marsOrbitGroup.add(mars);


    // 4. JUPITER ORBIT
    const jupiterOrbitGroup = new THREE.Group();
    jupiterOrbitGroup.rotation.x = 0.1;
    solarSystemGroup.add(jupiterOrbitGroup);

    const jupiterDistance = 14;
    const jupiterGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const jupiterMat = new THREE.MeshStandardMaterial({ color: 0xc99039, roughness: 0.4 });
    const jupiter = new THREE.Mesh(jupiterGeo, jupiterMat);
    jupiter.position.set(0, 0, jupiterDistance);
    jupiter.castShadow = true;
    jupiter.receiveShadow = true;
    jupiterOrbitGroup.add(jupiter);


    // --- AMBIENT FILL ---
    const ambientLight = new THREE.AmbientLight(0x404040, 0.05); // Very dim fill
    scene.add(ambientLight);


    // --- STARS ---
    const starCount = 5000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const color = new THREE.Color();
    
    for (let i = 0; i < starCount; i++) {
        const r = 100 + Math.random() * 200; // Far away
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        starPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i*3+2] = r * Math.cos(phi);

        color.setHSL(Math.random(), 0.2, Math.random() * 0.5 + 0.5);
        starColors[i*3] = color.r;
        starColors[i*3+1] = color.g;
        starColors[i*3+2] = color.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);


    // --- POST PROCESSING ---
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.2, 0.5, 0.8
    );
    composer.addPass(bloomPass);


    // --- RESIZE ---
    const handleResize = () => {
      if (!rendererRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
      composer.setSize(width, height);

      // Adjust group position based on screen width
      if (width > 768) {
        solarSystemGroup.position.set(-2, 0, 0);
        camera.position.z = 25;
      } else {
        solarSystemGroup.position.set(0, -2, 0); // Shift down on mobile
        camera.position.z = 35; // Zoom out more
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

      // 1. Earth Rotation (Day/Night cycle visualized by Sun orbit, but Earth spins too)
      earth.rotation.y += 0.05 * delta;
      clouds.rotation.y += 0.07 * delta;

      // 2. Sun Orbit (Controls Day/Night Light)
      // Slow rotation for the sun
      sunOrbitGroup.rotation.y += 0.1 * delta;

      // 3. Moon Orbit (Faster)
      moonOrbitGroup.rotation.y += 0.3 * delta;
      moon.rotation.y += 0.1 * delta; // Moon spins

      // 4. Planets Orbits (Different speeds/axes)
      marsOrbitGroup.rotation.y += 0.15 * delta;
      mars.rotation.y += 0.2 * delta;

      jupiterOrbitGroup.rotation.y += 0.05 * delta;
      jupiter.rotation.y += 0.4 * delta;

      // Subtle star movement
      stars.rotation.y -= 0.005 * delta;

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
      sunGeo.dispose(); sunMat.dispose();
      moonGeo.dispose(); moonMat.dispose();
      marsGeo.dispose(); marsMat.dispose();
      jupiterGeo.dispose(); jupiterMat.dispose();
      atmosphereMat.dispose();
      starGeo.dispose(); starMat.dispose();
      glowTexture.dispose();
      
      earthMap.dispose(); earthBump.dispose(); earthSpec.dispose(); earthClouds.dispose(); moonMap.dispose();
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
            background: '#050505',
            pointerEvents: 'auto' 
        }} 
    />
  );
};

export default HexagonBackground;
