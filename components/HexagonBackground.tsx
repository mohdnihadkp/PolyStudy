
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

const HexagonBackground: React.FC<HexagonBackgroundProps> = ({ isDarkMode = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);

  useEffect(() => {
    if (sceneRef.current) {
        // Dynamic background color adjustment based on theme
        const bgColor = isDarkMode ? 0x000000 : 0x050505;
        sceneRef.current.background = new THREE.Color(bgColor);
        sceneRef.current.fog = new THREE.FogExp2(bgColor, 0.002);
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgColor = isDarkMode ? 0x000000 : 0x050505;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.002); // Deep space fog

    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 0, 20);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Tone Mapping setup for cinematic look
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- 2. ASSETS LOADING ---
    const textureLoader = new THREE.TextureLoader();
    
    // Earth Textures
    const earthMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const earthBump = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    const earthSpec = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');
    const earthClouds = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png');
    
    // Solar System Textures
    const moonMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');
    const sunMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/sun.jpg');
    const mercuryMap = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/3/30/Mercury_Coloris_Basin.jpg'); // Fallback or procedural
    const venusMap = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/1/1c/Venus-real_color.jpg');
    const marsMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/mars_1k.jpg');
    const jupiterMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter_2k.jpg');
    const saturnMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/saturn_2k.jpg');
    const saturnRingMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/saturn_ring_alpha.png');

    // --- 3. LIGHTING (VISIBILITY FIX) ---
    // Sun Orbit Group: The light source rotates around the scene
    const sunOrbitGroup = new THREE.Group();
    scene.add(sunOrbitGroup);

    // A. Main Sun Light (Directional - Creates the day/night cycle)
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
    sunLight.position.set(50, 20, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    sunOrbitGroup.add(sunLight);

    // B. Global Ambient Light (CRITICAL FIX: Increased from 0.1 to 1.2)
    // This ensures textures are visible even without direct sunlight
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); 
    scene.add(ambientLight);

    // C. Fill Light (Hemisphere - Softens harsh shadows)
    // Sky color (light blue tint) vs Ground color (darker)
    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 0.5);
    scene.add(hemiLight);

    // Visible Sun Mesh (Billboarded)
    const sunGeo = new THREE.SphereGeometry(3, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ 
        map: sunMap, 
        color: 0xffddaa,
        toneMapped: false // Keeps it bright despite tone mapping
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.copy(sunLight.position);
    sunOrbitGroup.add(sunMesh);

    // Sun Glow Sprite (Atmosphere)
    const spriteMaterial = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(generateGlowTexture(255, 200, 100)),
        color: 0xffaa00,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const sunGlow = new THREE.Sprite(spriteMaterial);
    sunGlow.scale.set(25, 25, 1);
    sunMesh.add(sunGlow);


    // --- 4. HERO EARTH & MOON ---
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Earth Base
    const earthGeo = new THREE.SphereGeometry(2.5, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
        map: earthMap,
        normalMap: earthBump,
        normalScale: new THREE.Vector2(0.8, 0.8),
        roughnessMap: earthSpec,
        roughness: 0.5,
        metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.castShadow = true;
    earth.receiveShadow = true;
    earth.rotation.y = -Math.PI / 2; // Show Africa/Europe/Asia initially
    earthGroup.add(earth);

    // Clouds
    const cloudGeo = new THREE.SphereGeometry(2.53, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
        map: earthClouds,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(clouds);

    // Atmosphere Rim (Blue Glow)
    const atmoSpriteMat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(generateGlowTexture(60, 160, 255)),
        color: 0x4ca6ff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const atmosphere = new THREE.Sprite(atmoSpriteMat);
    atmosphere.scale.set(7.8, 7.8, 1);
    earthGroup.add(atmosphere);

    // The Moon
    const moonGroup = new THREE.Group();
    earthGroup.add(moonGroup); // Moon orbits Earth
    
    const moonGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
        map: moonMap,
        bumpMap: moonMap, // Reuse map for crater depth
        bumpScale: 0.02,
        roughness: 0.8
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(6, 0, 0); // Distance from Earth
    moon.castShadow = true;
    moon.receiveShadow = true;
    moonGroup.add(moon);

    // Rahu & Ketu (Shadow Nodes) - Subtle markers
    const nodeGeo = new THREE.TorusGeometry(6, 0.02, 16, 100);
    const nodeMat = new THREE.MeshBasicMaterial({ 
        color: 0x333333, 
        transparent: true, 
        opacity: 0.2 
    });
    const orbitPath = new THREE.Mesh(nodeGeo, nodeMat);
    orbitPath.rotation.x = Math.PI / 2;
    earthGroup.add(orbitPath);

    // --- 5. COMPLETE SOLAR SYSTEM (Background) ---
    const bgGroup = new THREE.Group();
    scene.add(bgGroup);

    // Mercury (Inner Planet)
    const mercury = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({ map: mercuryMap, color: 0xaaaaaa }) // Tint if texture fails
    );
    mercury.position.set(10, 5, -15);
    bgGroup.add(mercury);

    // Venus (Inner Planet)
    const venus = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 32, 32),
        new THREE.MeshStandardMaterial({ map: venusMap, color: 0xeebb88 })
    );
    venus.position.set(-8, -4, -12);
    bgGroup.add(venus);

    // Mars
    const mars = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 32, 32),
        new THREE.MeshStandardMaterial({ map: marsMap })
    );
    mars.position.set(-15, 5, -25);
    bgGroup.add(mars);

    // Jupiter
    const jupiter = new THREE.Mesh(
        new THREE.SphereGeometry(2.2, 32, 32),
        new THREE.MeshStandardMaterial({ map: jupiterMap })
    );
    jupiter.position.set(25, -8, -40);
    bgGroup.add(jupiter);

    // Saturn & Rings
    const saturnGroup = new THREE.Group();
    saturnGroup.position.set(-20, 12, -50);
    bgGroup.add(saturnGroup);

    const saturn = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 32, 32),
        new THREE.MeshStandardMaterial({ map: saturnMap })
    );
    saturn.castShadow = true;
    saturn.receiveShadow = true;
    saturnGroup.add(saturn);

    const ringGeo = new THREE.RingGeometry(2.2, 3.5, 64);
    const pos = ringGeo.attributes.position;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++){
        v3.fromBufferAttribute(pos, i);
        ringGeo.attributes.uv.setXY(i, v3.length() < 2.8 ? 0 : 1, 1);
    }
    const ringMat = new THREE.MeshStandardMaterial({
        map: saturnRingMap,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    ring.receiveShadow = true;
    saturnGroup.add(ring);


    // --- 6. STARFIELD & NEBULAE ---
    const starCount = 5000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);
    const starColor = new THREE.Color();

    for (let i = 0; i < starCount; i++) {
        const r = 100 + Math.random() * 900;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i * 3 + 2] = r * Math.cos(phi);

        // Realistic Star Temps
        const type = Math.random();
        if (type > 0.95) starColor.setHex(0x9bb0ff); // Blue Giant
        else if (type > 0.7) starColor.setHex(0xffffff); // Main Sequence
        else if (type > 0.5) starColor.setHex(0xffddaa); // Yellow
        else starColor.setHex(0xff5533); // Red Dwarf

        starCols[i * 3] = starColor.r;
        starCols[i * 3 + 1] = starColor.g;
        starCols[i * 3 + 2] = starColor.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.4, vertexColors: true, transparent: true, opacity: 0.8 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);


    // --- 7. POST PROCESSING (BLOOM) ---
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        1.2, // Strength
        0.4, // Radius
        0.85 // Threshold (High to only glow brights)
    );
    composer.addPass(bloomPass);


    // --- 8. RESPONSIVE LOGIC ---
    const handleResize = () => {
        if (!cameraRef.current || !rendererRef.current || !composerRef.current || !earthGroupRef.current) return;
        
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        
        rendererRef.current.setSize(w, h);
        composerRef.current.setSize(w, h);

        // Intelligent Positioning
        if (w > 768) {
            // Desktop: Earth Left, scaled normally
            earthGroupRef.current.position.set(-6.5, 0, 0);
            earthGroupRef.current.scale.set(1, 1, 1);
        } else {
            // Mobile: Earth Bottom Center, scaled down slightly
            earthGroupRef.current.position.set(0, -3.5, 0);
            earthGroupRef.current.scale.set(0.85, 0.85, 0.85);
        }
    };
    handleResize();
    window.addEventListener('resize', handleResize);


    // --- 9. ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
        frameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        // Rotations
        earth.rotation.y += 0.02 * delta;
        clouds.rotation.y += 0.025 * delta;
        moonGroup.rotation.y += 0.05 * delta; // Moon Orbit
        moon.rotation.y += 0.01 * delta; // Moon Spin

        sunOrbitGroup.rotation.y += 0.03 * delta; // Day/Night Cycle

        // Background Planet Motions
        mercury.rotation.y += 0.05 * delta;
        venus.rotation.y -= 0.02 * delta; // Retrograde
        mars.rotation.y += 0.1 * delta;
        jupiter.rotation.y += 0.08 * delta;
        saturnGroup.rotation.y = elapsed * 0.05;
        
        // Subtle Parallax drift
        starField.rotation.y -= 0.002 * delta;

        controls.update();
        composer.render();
    };
    animate();

    // --- CLEANUP ---
    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameId);
        
        if (mountRef.current && rendererRef.current) {
            mountRef.current.removeChild(rendererRef.current.domElement);
        }

        renderer.dispose();
        composer.dispose();
        
        // Geometry Disposal
        earthGeo.dispose(); cloudGeo.dispose(); moonGeo.dispose();
        sunGeo.dispose(); nodeGeo.dispose(); starGeo.dispose();
        
        // Material Disposal
        earthMat.dispose(); cloudMat.dispose(); moonMat.dispose();
        sunMat.dispose(); nodeMat.dispose(); starMat.dispose();
        
        // Texture Disposal
        earthMap.dispose(); earthBump.dispose(); earthSpec.dispose(); earthClouds.dispose();
        moonMap.dispose(); sunMap.dispose(); marsMap.dispose(); jupiterMap.dispose();
        mercuryMap.dispose(); venusMap.dispose();
    };
  }, [isDarkMode]);

  return (
    <div 
        ref={mountRef} 
        className="fixed top-0 left-0 w-full h-full -z-10 bg-black pointer-events-auto"
        style={{ background: isDarkMode ? '#000000' : '#050505' }}
    />
  );
};

// Helper: Generate Glow Texture for Sprites
function generateGlowTexture(r: number, g: number, b: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.1)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.4)`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
    }
    return canvas;
}

export default HexagonBackground;
