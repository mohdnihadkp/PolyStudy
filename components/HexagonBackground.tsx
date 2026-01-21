
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const HexagonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    // Deep space black
    scene.background = new THREE.Color(0x000000); 
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // --- CAMERA ---
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 18); // Pull back to see everything

    // --- RENDERER ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    // --- CONTROLS ---
    // User can rotate scene 360 degrees
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Prevent interfering with scroll
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.minPolarAngle = Math.PI / 3; // Limit vertical angle
    controls.maxPolarAngle = Math.PI / 1.5;

    // --- TEXTURE LOADER ---
    const textureLoader = new THREE.TextureLoader();
    
    // Fallback/Standard high-res textures
    const earthMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const earthBump = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
    const earthSpec = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-water.png');
    const earthClouds = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png');
    const moonMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

    // --- GROUPS ---
    const mainGroup = new THREE.Group(); // Used for responsive positioning
    scene.add(mainGroup);

    const earthGroup = new THREE.Group(); // Rotates the earth itself
    mainGroup.add(earthGroup);

    // --- EARTH MESH ---
    const earthGeo = new THREE.SphereGeometry(3.5, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthMap,
      normalMap: earthBump,
      roughnessMap: earthSpec,
      roughness: 0.5,
      metalness: 0.1,
      color: 0xffffff
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.rotation.y = -Math.PI / 2; // Show Africa/Europe/Asia side initially
    earthGroup.add(earth);

    // --- CLOUDS MESH ---
    const cloudGeo = new THREE.SphereGeometry(3.56, 64, 64);
    const cloudMat = new THREE.MeshLambertMaterial({
      map: earthClouds,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(clouds);

    // --- ATMOSPHERE GLOW (Sprite) ---
    const atmosphereMat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(generateGlowTexture()),
      color: 0x4ca6ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Sprite(atmosphereMat);
    atmosphere.scale.set(9, 9, 1);
    earthGroup.add(atmosphere);

    // --- MOON ---
    const moonPivot = new THREE.Group();
    earthGroup.add(moonPivot); // Moon orbits Earth
    
    const moonGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      map: moonMap,
      roughness: 0.8,
      metalness: 0
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(6, 0, 0); // Distance from Earth
    moonPivot.add(moon);

    // --- SUN (Visual & Light) ---
    // Place Sun in background top-right relative to center
    const sunPosition = new THREE.Vector3(15, 8, -10);
    
    // Visual Sun
    const sunGeo = new THREE.SphereGeometry(2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffddaa,
      transparent: true,
      opacity: 0.9
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.copy(sunPosition);
    scene.add(sun);

    // Sun Glow
    const sunGlowMat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(generateGlowTexture()),
      color: 0xffaa00,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const sunGlow = new THREE.Sprite(sunGlowMat);
    sunGlow.scale.set(12, 12, 1);
    sun.add(sunGlow);

    // Directional Light (Sunlight)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.copy(sunPosition);
    scene.add(sunLight);

    // Ambient Light (Fill)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2); // Soft shadow fill
    scene.add(ambientLight);

    // --- STARS ---
    const starCount = 3000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        // Spread stars wide
        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200; // Background stars
        
        starPos[i*3] = x;
        starPos[i*3+1] = y;
        starPos[i*3+2] = z;

        // Slight color variation (white, blueish, yellowish)
        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.2, Math.random() * 0.5 + 0.5);
        starColors[i*3] = color.r;
        starColors[i*3+1] = color.g;
        starColors[i*3+2] = color.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- POST PROCESSING (BLOOM) ---
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Resolution, Strength, Radius, Threshold
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.0, // strength
        0.4, // radius
        0.85 // threshold
    );
    composer.addPass(bloomPass);

    // --- RESPONSIVE LAYOUT ---
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);

      // Desktop: Earth Left (-7). Mobile: Earth Bottom (-4)
      if (width > 768) {
        mainGroup.position.set(-7, 0, 0);
        mainGroup.scale.set(1, 1, 1);
        camera.position.z = 18;
      } else {
        mainGroup.position.set(0, -4.5, 0);
        mainGroup.scale.set(0.8, 0.8, 0.8);
        camera.position.z = 24; // Pull back more on mobile
      }
    };
    handleResize(); // Init
    window.addEventListener('resize', handleResize);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Earth rotation (slow day/night cycle)
      earth.rotation.y += 0.05 * delta;
      clouds.rotation.y += 0.07 * delta;
      clouds.rotation.x = Math.sin(elapsed * 0.1) * 0.05; // Slight wobble

      // Moon orbit
      moonPivot.rotation.y += 0.15 * delta;
      moon.rotation.y += 0.1 * delta; // Tidally locked-ish

      // Controls update (AutoRotate)
      controls.update();

      // Render
      composer.render();
    };
    animate();

    // --- CLEANUP ---
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      composer.dispose();
      controls.dispose();
      earthGeo.dispose(); earthMat.dispose();
      cloudGeo.dispose(); cloudMat.dispose();
      moonGeo.dispose(); moonMat.dispose();
      starGeo.dispose(); starMat.dispose();
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
            background: '#000000',
            pointerEvents: 'auto' // Allow interaction
        }} 
    />
  );
};

// Helper to create a radial glow texture on the fly
function generateGlowTexture() {
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
}

export default HexagonBackground;
