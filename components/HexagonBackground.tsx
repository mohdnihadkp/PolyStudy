
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
  const sceneRef = useRef<THREE.Scene | null>(null);
  const earthGroupRef = useRef<THREE.Group | null>(null);
  
  // Dynamic Lighting Refs for animation
  const sunOrbitGroupRef = useRef<THREE.Group | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);

  // Handle Theme Changes
  useEffect(() => {
    if (sceneRef.current) {
        // Deep space black for dark mode, subtle slate for light mode (though space is usually black)
        const bgColor = isDarkMode ? 0x000000 : 0x050505;
        sceneRef.current.background = new THREE.Color(bgColor);
        sceneRef.current.fog = new THREE.FogExp2(bgColor, 0.002);
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 1. SETUP & SCENE ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgColor = isDarkMode ? 0x000000 : 0x050505;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.002);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 18); // Optimal viewing distance

    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Cinematic Tone Mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping; 
    renderer.toneMappingExposure = 0.9;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false; // We handle rotation manually for cinematic feel

    // --- 2. ASSETS & TEXTURES ---
    const textureLoader = new THREE.TextureLoader();
    
    // Earth High-Res Textures
    const earthMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const earthBump = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    const earthSpec = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');
    const earthClouds = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png');

    // Solar System Textures
    const txSun = textureLoader.load('https://assets.codepen.io/122136/sun_texture.jpg');
    const txJupiter = textureLoader.load('https://assets.codepen.io/122136/jupiter_1k.jpg');
    const txSaturn = textureLoader.load('https://assets.codepen.io/122136/saturn_1k.jpg');
    const txSaturnRing = textureLoader.load('https://assets.codepen.io/122136/saturn_ring_alpha.png');
    const txMars = textureLoader.load('https://assets.codepen.io/122136/mars_1k.jpg');

    // --- 3. HIGH-FIDELITY STARFIELD (Optimized) ---
    const starCount = 8000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < starCount; i++) {
        // Spherical distribution
        const r = 80 + Math.random() * 400; // Deep depth
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i * 3 + 2] = r * Math.cos(phi);

        // Realistic star temps (Blue/White/Yellow)
        const starType = Math.random();
        if (starType > 0.9) color.setHex(0x9bb0ff); // Blue giant
        else if (starType > 0.6) color.setHex(0xffffff); // White main sequence
        else if (starType > 0.4) color.setHex(0xffcf6f); // Yellow/Orange
        else color.setHex(0x444444); // Dim dwarf

        starColors[i * 3] = color.r;
        starColors[i * 3 + 1] = color.g;
        starColors[i * 3 + 2] = color.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
        size: 0.25,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);
    starsRef.current = starField;

    // --- 4. PHOTOREALISTIC EARTH ---
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // Base Sphere
    const earthGeo = new THREE.SphereGeometry(2.5, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
        map: earthMap,
        normalMap: earthBump,
        roughnessMap: earthSpec,
        roughness: 0.6, // Oceans will be shinier due to map
        metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.rotation.y = -Math.PI / 2;
    earth.castShadow = true;
    earth.receiveShadow = true;
    earthGroup.add(earth);

    // Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(2.53, 64, 64);
    const cloudMat = new THREE.MeshLambertMaterial({
        map: earthClouds,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false, // Prevents Z-fighting
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(clouds);

    // Atmosphere Glow (Shader-like Sprite)
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const ctx = glowCanvas.getContext('2d');
    if (ctx) {
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(60, 160, 255, 0)');
        gradient.addColorStop(0.2, 'rgba(60, 160, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(60, 160, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const atmoMat = new THREE.SpriteMaterial({ 
        map: glowTexture, 
        color: 0x4ca6ff,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const atmosphere = new THREE.Sprite(atmoMat);
    atmosphere.scale.set(7.5, 7.5, 1);
    earthGroup.add(atmosphere);


    // --- 5. DYNAMIC ORBITAL LIGHTING (The Sun) ---
    // The Sun orbits the Earth mesh to create Day/Night cycles
    const sunOrbitGroup = new THREE.Group();
    scene.add(sunOrbitGroup);
    sunOrbitGroupRef.current = sunOrbitGroup;

    // The Light Source
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
    sunLight.position.set(30, 10, 20); // Initial offset relative to orbit center
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    sunOrbitGroup.add(sunLight);

    // The Sun Visual Mesh (Billboarded glow)
    const sunGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ map: txSun, toneMapped: false });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.copy(sunLight.position);
    sunOrbitGroup.add(sunMesh);

    // Sun Lens Flare/Glow
    const sunGlowMat = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffdd44,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const sunGlowSprite = new THREE.Sprite(sunGlowMat);
    sunGlowSprite.scale.set(15, 15, 1);
    sunMesh.add(sunGlowSprite);

    // Fill Light (Subtle Ambient)
    const ambientLight = new THREE.AmbientLight(0x111111, 0.5); // Very dark shadows
    scene.add(ambientLight);


    // --- 6. BACKGROUND PLANETS (Depth) ---
    const bgPlanetsGroup = new THREE.Group();
    scene.add(bgPlanetsGroup);

    // Jupiter (Distant Giant)
    const jupiter = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 32, 32),
        new THREE.MeshStandardMaterial({ map: txJupiter, roughness: 0.8 })
    );
    jupiter.position.set(-25, 8, -30);
    bgPlanetsGroup.add(jupiter);

    // Mars (Small Red Dot)
    const mars = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 32, 32),
        new THREE.MeshStandardMaterial({ map: txMars, roughness: 0.9 })
    );
    mars.position.set(20, -10, -20);
    bgPlanetsGroup.add(mars);

    // Saturn with Ring
    const saturnGroup = new THREE.Group();
    saturnGroup.position.set(15, 12, -40);
    bgPlanetsGroup.add(saturnGroup);
    
    const saturn = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 32, 32),
        new THREE.MeshStandardMaterial({ map: txSaturn, roughness: 0.7 })
    );
    saturnGroup.add(saturn);

    const ringGeo = new THREE.RingGeometry(1.1, 1.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({ 
        map: txSaturnRing, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.8 
    });
    const pos = ringGeo.attributes.position;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++){
        v3.fromBufferAttribute(pos, i);
        ringGeo.attributes.uv.setXY(i, v3.length() < 1.4 ? 0 : 1, 1);
    }
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    saturnGroup.add(ring);


    // --- 7. POST PROCESSING (Cinematic Bloom) ---
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.0, // Strength
        0.5, // Radius
        0.85 // Threshold (High threshold so only Sun and bright reflections glow)
    );
    composer.addPass(bloomPass);


    // --- 8. RESPONSIVE POSITIONING ---
    const handleResize = () => {
        if (!rendererRef.current || !earthGroupRef.current) return;
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        rendererRef.current.setSize(width, height);
        composer.setSize(width, height);

        // Intelligent Positioning
        if (width > 900) {
            // Desktop: Earth on left, Content on right
            // Moves Earth to x = -6.5
            earthGroupRef.current.position.set(-6.5, 0, 0);
            earthGroupRef.current.scale.set(1, 1, 1);
        } else if (width > 600) {
            // Tablet
            earthGroupRef.current.position.set(0, -3, 0);
            earthGroupRef.current.scale.set(0.9, 0.9, 0.9);
        } else {
            // Mobile: Earth at bottom center
            earthGroupRef.current.position.set(0, -3.5, 0);
            earthGroupRef.current.scale.set(0.8, 0.8, 0.8);
        }
    };
    handleResize();
    window.addEventListener('resize', handleResize);


    // --- 9. ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const elapsed = clock.getElapsedTime();

        // 1. Earth Rotation (Day/Night spin)
        earth.rotation.y += 0.03 * delta;
        clouds.rotation.y += 0.04 * delta; // Clouds move faster

        // 2. Sun Orbit (Dynamic Lighting Cycle)
        if (sunOrbitGroupRef.current) {
            // Rotates the light source around the scene
            sunOrbitGroupRef.current.rotation.y += 0.05 * delta;
        }

        // 3. Background Planets Orbit (Slow)
        jupiter.position.x = Math.sin(elapsed * 0.05) * 25;
        jupiter.position.z = Math.cos(elapsed * 0.05) * 30 - 30; // Orbit offset
        jupiter.rotation.y += 0.1 * delta;

        mars.position.y = Math.sin(elapsed * 0.1) * 5 - 10; // Bobbing motion
        mars.rotation.y += 0.2 * delta;

        saturnGroup.rotation.y = elapsed * 0.02; // Slow orbit

        // 4. Starfield subtle drift
        if (starsRef.current) {
            starsRef.current.rotation.y -= 0.005 * delta;
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
        
        // Geometry/Material Disposal
        earthGeo.dispose(); earthMat.dispose();
        cloudGeo.dispose(); cloudMat.dispose();
        starGeo.dispose(); starMat.dispose();
        sunGeo.dispose(); sunMat.dispose();
        
        earthMap.dispose(); earthBump.dispose(); earthSpec.dispose(); earthClouds.dispose();
        txSun.dispose(); txJupiter.dispose(); txSaturn.dispose(); txMars.dispose();
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
            background: isDarkMode ? '#000000' : '#050505',
            pointerEvents: 'auto' // Allows OrbitControls to work
        }} 
    />
  );
};

export default HexagonBackground;
