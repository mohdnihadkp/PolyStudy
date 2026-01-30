
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
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const solarSystemGroupRef = useRef<THREE.Group | null>(null);
  const starsMeshRef = useRef<THREE.InstancedMesh | null>(null);

  // Handle Theme Changes
  useEffect(() => {
    if (sceneRef.current) {
        const bgColor = isDarkMode ? 0x000000 : 0xf0f2f5;
        sceneRef.current.background = new THREE.Color(bgColor);
        sceneRef.current.fog = new THREE.FogExp2(bgColor, isDarkMode ? 0.002 : 0.02);

        // Hide background elements in light mode for cleaner look
        if (starsMeshRef.current) {
            starsMeshRef.current.visible = isDarkMode;
        }
        if (solarSystemGroupRef.current) {
            solarSystemGroupRef.current.visible = isDarkMode;
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
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- ASSETS & TEXTURES ---
    const textureLoader = new THREE.TextureLoader();
    const glowTexture = new THREE.CanvasTexture(generateGlowTexture());

    const earthMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const earthBump = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    const earthSpec = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');
    const earthClouds = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png');

    const txSun = textureLoader.load('https://assets.codepen.io/122136/sun_texture.jpg');
    const txMercury = textureLoader.load('https://assets.codepen.io/122136/mercury_1k.jpg');
    const txVenus = textureLoader.load('https://assets.codepen.io/122136/venus_1k.jpg');
    const txMars = textureLoader.load('https://assets.codepen.io/122136/mars_1k.jpg');
    const txJupiter = textureLoader.load('https://assets.codepen.io/122136/jupiter_1k.jpg');
    const txSaturn = textureLoader.load('https://assets.codepen.io/122136/saturn_1k.jpg');
    const txSaturnRing = textureLoader.load('https://assets.codepen.io/122136/saturn_ring_alpha.png');
    const txNeptune = textureLoader.load('https://assets.codepen.io/122136/neptune_1k.jpg');

    // --- HERO EARTH GROUP (Foreground) ---
    const earthGroup = new THREE.Group();
    // Initial position set by handleResize
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Earth (Scaled to 0.5 as requested)
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

    // Atmosphere
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

    // --- HELIOCENTRIC SOLAR SYSTEM (Background) ---
    const solarSystemGroup = new THREE.Group();
    // Position solar system deeper in background to not interfere with Earth
    solarSystemGroup.position.set(20, 5, -40); 
    solarSystemGroup.rotation.z = Math.PI / 8; // Tilt
    scene.add(solarSystemGroup);
    solarSystemGroupRef.current = solarSystemGroup;

    // Sun (Center of Solar System)
    const sunGeo = new THREE.SphereGeometry(3, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ map: txSun });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    solarSystemGroup.add(sun);

    // Sun Glow
    const sunGlowMat = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffaa00,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.8
    });
    const sunGlow = new THREE.Sprite(sunGlowMat);
    sunGlow.scale.set(12, 12, 1);
    sun.add(sunGlow);

    // Planets Logic
    const planets: { mesh: THREE.Group, speed: number, distance: number, angle: number }[] = [];

    const createOrbitingPlanet = (radius: number, texture: THREE.Texture, distance: number, speed: number, hasRing = false) => {
        const orbitGroup = new THREE.Group();
        solarSystemGroup.add(orbitGroup);

        const planetGroup = new THREE.Group();
        planetGroup.position.set(distance, 0, 0);
        orbitGroup.add(planetGroup);

        const geo = new THREE.SphereGeometry(radius, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        planetGroup.add(mesh);

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
            planetGroup.add(ring);
        }

        // Orbit path visual
        const orbitPathGeo = new THREE.RingGeometry(distance - 0.1, distance + 0.1, 128);
        const orbitPathMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.05 });
        const orbitPath = new THREE.Mesh(orbitPathGeo, orbitPathMat);
        orbitPath.rotation.x = Math.PI / 2;
        solarSystemGroup.add(orbitPath);

        planets.push({ mesh: orbitGroup, speed, distance, angle: Math.random() * Math.PI * 2 });
    };

    createOrbitingPlanet(0.4, txMercury, 6, 0.04);
    createOrbitingPlanet(0.9, txVenus, 10, 0.015);
    createOrbitingPlanet(0.5, txMars, 16, 0.008); 
    createOrbitingPlanet(2.5, txJupiter, 24, 0.002);
    createOrbitingPlanet(2.0, txSaturn, 34, 0.0009, true);
    createOrbitingPlanet(1.8, txNeptune, 44, 0.0004);


    // --- STATIC LIGHTING (Requested Update) ---
    // AmbientLight intensity 0.8
    const ambientLight = new THREE.AmbientLight(0x404040, 0.8); 
    scene.add(ambientLight);

    // DirectionalLight at (5, 3, 5) with intensity 3.0
    const dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
    dirLight.position.set(5, 3, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);


    // --- OPTIMIZED STARFIELD (InstancedMesh) ---
    const starCount = 5000;
    const starGeo = new THREE.IcosahedronGeometry(0.05, 0); // Very low poly
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starsMesh = new THREE.InstancedMesh(starGeo, starMat, starCount);
    
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < starCount; i++) {
        const r = 100 + Math.random() * 800; // Far field
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        dummy.position.x = r * Math.sin(phi) * Math.cos(theta);
        dummy.position.y = r * Math.sin(phi) * Math.sin(theta);
        dummy.position.z = r * Math.cos(phi);
        
        const scale = 0.5 + Math.random() * 1.5;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        
        starsMesh.setMatrixAt(i, dummy.matrix);

        // Subtle color variation
        const t = Math.random();
        if (t > 0.95) color.setHex(0x9bb0ff);
        else if (t > 0.7) color.setHex(0xffffff);
        else if (t > 0.5) color.setHex(0xffcf6f);
        else color.setHex(0xaaaaaa);

        starsMesh.setColorAt(i, color);
    }
    
    starsMesh.instanceMatrix.needsUpdate = true;
    if (starsMesh.instanceColor) starsMesh.instanceColor.needsUpdate = true;
    scene.add(starsMesh);
    starsMeshRef.current = starsMesh;


    // --- POST PROCESSING (Bloom) ---
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.2, // Strength
        0.4, // Radius
        0.85 // Threshold
    );
    composer.addPass(bloomPass);


    // --- RESIZE HANDLER & RESPONSIVE POSITIONING ---
    const handleResize = () => {
      if (!rendererRef.current || !earthGroupRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
      composer.setSize(width, height);

      // --- RESPONSIVE EARTH LOGIC (Requested Update) ---
      // Scale 0.5 always.
      // Desktop: x = -4
      // Mobile: x = 0, y = -2.5
      earthGroupRef.current.scale.set(0.5, 0.5, 0.5);

      if (width > 768) {
        earthGroupRef.current.position.set(-4, 0, 0);
      } else {
        earthGroupRef.current.position.set(0, -2.5, 0);
      }
    };
    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);


    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Rotate Hero Earth
      earth.rotation.y += 0.05 * delta;
      clouds.rotation.y += 0.07 * delta;

      // Rotate Planets around Sun
      planets.forEach(p => {
          // Update angle
          p.angle += p.speed * delta * 5; 
          // Update position relative to solar system center
          p.mesh.position.x = Math.cos(p.angle) * p.distance;
          p.mesh.position.z = Math.sin(p.angle) * p.distance;
          // Rotate planet itself
          p.mesh.children[0].children[0].rotation.y += delta;
      });

      // Slowly rotate starfield
      if (starsMeshRef.current) {
          starsMeshRef.current.rotation.y += 0.005 * delta;
      }
      
      // Rotate solar system group slightly
      if (solarSystemGroupRef.current) {
          solarSystemGroupRef.current.rotation.y += 0.01 * delta;
      }

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
      starGeo.dispose(); starMat.dispose();
      
      earthMap.dispose(); earthBump.dispose(); earthSpec.dispose(); earthClouds.dispose();
      txSun.dispose(); txMercury.dispose(); txVenus.dispose(); txMars.dispose(); 
      txJupiter.dispose(); txSaturn.dispose(); txSaturnRing.dispose(); txNeptune.dispose();
    };
  }, [isDarkMode]);

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
