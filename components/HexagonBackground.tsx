import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const HexagonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    // Fog to fade out distant planets/stars
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 18); // Close enough to see details

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    // --- 2. POST-PROCESSING (BLOOM) ---
    const renderScene = new RenderPass(scene, camera);

    // Resolution, Strength, Radius, Threshold
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,  // Strength
      0.4,  // Radius
      0.85  // Threshold (only very bright things glow)
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- 3. LIGHTING (Dramatic Sun) ---
    const sunPosition = new THREE.Vector3(-30, 10, -40);
    
    const sunLight = new THREE.PointLight(0xffffff, 3.5, 500);
    sunLight.position.copy(sunPosition);
    scene.add(sunLight);

    // Very subtle fill light for the dark side (so it's not 100% black invisible)
    const fillLight = new THREE.AmbientLight(0x404040, 0.05); 
    scene.add(fillLight);

    // --- 4. OBJECTS ---

    // A. The Sun (Mesh)
    const sunGeo = new THREE.SphereGeometry(4, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffddaa }); // Bright color for bloom
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.copy(sunPosition);
    scene.add(sunMesh);

    // B. The Earth Group
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // B1. Earth Ocean (Base)
    const earthGeo = new THREE.SphereGeometry(3, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
        color: 0x001e4d, // Deep Ocean Blue
        roughness: 0.2,   // Shiny water
        metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    // B2. Procedural Continents (Canvas Texture)
    // We generate a "noise-like" texture on the fly to simulate land
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#00000000'; // Transparent
        ctx.fillRect(0, 0, 512, 256);
        
        // Draw random "continents"
        ctx.fillStyle = '#2d4c1e'; // Dark Green/Brown land
        for(let i=0; i<40; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            const r = Math.random() * 40 + 10;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    const landTexture = new THREE.CanvasTexture(canvas);
    
    const landGeo = new THREE.SphereGeometry(3.01, 64, 64); // Slightly larger
    const landMat = new THREE.MeshStandardMaterial({
        map: landTexture,
        transparent: true,
        roughness: 0.9, // Land is matte
        metalness: 0.0,
        opacity: 0.9
    });
    const land = new THREE.Mesh(landGeo, landMat);
    earthGroup.add(land);

    // B3. Atmosphere (Custom Shader)
    const vertexShader = `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    const fragmentShader = `
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
            gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0) * intensity * 1.5;
        }
    `;
    const atmosGeo = new THREE.SphereGeometry(3.3, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosphere);

    // C. Other Planets (Mars & Gas Giant)
    const marsGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const marsMat = new THREE.MeshStandardMaterial({ color: 0xaa4422, roughness: 0.8 });
    const mars = new THREE.Mesh(marsGeo, marsMat);
    scene.add(mars);

    const giantGeo = new THREE.SphereGeometry(1.8, 32, 32);
    const giantMat = new THREE.MeshStandardMaterial({ color: 0xddaacc, roughness: 0.4 });
    const giant = new THREE.Mesh(giantGeo, giantMat);
    scene.add(giant);

    // D. Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPos = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i++) {
        starPos[i] = (Math.random() - 0.5) * 400; // Wide spread
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        transparent: true,
        opacity: 0.8
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- 5. INTERACTION ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
        // Map mouse position to rotation angles
        mouseX = (event.clientX - windowHalfX) / 100;
        mouseY = (event.clientY - windowHalfY) / 100;
    };

    const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        composer.setSize(width, height);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', handleResize);

    // --- 6. ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // 1. Interactive Earth Rotation
        targetRotationY = mouseX * 0.5; // Look left/right
        targetRotationX = mouseY * 0.3; // Look up/down

        // Smooth Lerp
        earthGroup.rotation.y += 0.05 * (targetRotationY - earthGroup.rotation.y);
        earthGroup.rotation.x += 0.05 * (targetRotationX - earthGroup.rotation.x);
        
        // Auto-spin base slightly
        earth.rotation.y += 0.0005;
        land.rotation.y += 0.0005;

        // 2. Planet Orbits
        const marsAngle = elapsedTime * 0.2;
        mars.position.set(Math.cos(marsAngle) * 12, 0, Math.sin(marsAngle) * 12 - 5);
        mars.rotation.y += 0.01;

        const giantAngle = elapsedTime * 0.1 + 2;
        giant.position.set(Math.cos(giantAngle) * 20, Math.sin(giantAngle)*2, Math.sin(giantAngle) * 20 - 10);
        giant.rotation.y += 0.005;

        // 3. Render via Composer (for Bloom)
        composer.render();
    };

    animate();

    // --- CLEANUP ---
    return () => {
        document.removeEventListener('mousemove', onDocumentMouseMove);
        window.removeEventListener('resize', handleResize);
        
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }

        // Dispose Three.js objects
        earthGeo.dispose(); earthMat.dispose();
        landGeo.dispose(); landMat.dispose(); landTexture.dispose();
        atmosGeo.dispose(); atmosMat.dispose();
        sunGeo.dispose(); sunMat.dispose();
        marsGeo.dispose(); marsMat.dispose();
        giantGeo.dispose(); giantMat.dispose();
        starGeo.dispose(); starMat.dispose();
        renderer.dispose();
        composer.dispose();
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
            pointerEvents: 'none'
        }} 
        aria-hidden="true"
    />
  );
};

export default HexagonBackground;
