import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const HexagonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 1. SCENE & CAMERA SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020205); // Very deep space blue/black
    scene.fog = new THREE.FogExp2(0x020205, 0.002);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic lighting
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    // --- 2. POST-PROCESSING (BLOOM) ---
    const renderScene = new RenderPass(scene, camera);
    
    // Resolution, Strength, Radius, Threshold
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.2, // Strength
        0.4, // Radius
        0.85 // Threshold (Only bright objects glow)
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- 3. TEXTURE LOADING ---
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecular = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
    const moonMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

    // --- 4. LIGHTING ---
    const sunColor = 0xffeebb;
    
    // Main Directional Light (Sun rays)
    const sunLight = new THREE.DirectionalLight(sunColor, 3.0);
    sunLight.position.set(20, 10, 10);
    scene.add(sunLight);

    // Point Light (Sun glow source)
    const sunPointLight = new THREE.PointLight(sunColor, 2.0, 500);
    sunPointLight.position.set(20, 10, 10);
    scene.add(sunPointLight);

    // Subtle Ambient Light (Fill for dark side)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);

    // --- 5. OBJECTS ---

    // A. The Earth Group (Earth + Atmosphere + Clouds)
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = 23.5 * Math.PI / 180; // Earth's tilt
    scene.add(earthGroup);

    // A1. Earth Surface
    const earthGeo = new THREE.SphereGeometry(3, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
        map: earthMap,
        normalMap: earthNormal,
        roughnessMap: earthSpecular, // Invert logic visually roughly works, or use rough 0.5
        roughness: 0.5,
        metalness: 0.1,
    });
    // Manually adjust roughness via specular map if needed in loop, but standard material is good.
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    // A2. Atmosphere (Fresnel Shader)
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
            float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
            gl_FragColor = vec4(0.2, 0.5, 1.0, 1.0) * intensity * 2.0; 
        }
    `;
    // Slightly larger than earth
    const atmosGeo = new THREE.SphereGeometry(3.25, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphere); // Add to scene to avoid texture rotation sync issues

    // B. The Moon
    const moonPivot = new THREE.Group(); // Pivot at Earth's center
    scene.add(moonPivot);
    
    const moonGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
        map: moonMap,
        roughness: 0.8,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(8, 0, 0); // Distance from Earth
    moonPivot.add(moon);

    // C. The Sun (Visual Representation)
    const sunGeo = new THREE.SphereGeometry(2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffddaa }); // Basic material glows with Bloom
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(40, 20, 20); // Far back top-right
    scene.add(sunMesh);

    // D. Distant Planets
    const marsGeo = new THREE.SphereGeometry(0.6, 32, 32);
    const marsMat = new THREE.MeshStandardMaterial({ color: 0xcc4422 });
    const mars = new THREE.Mesh(marsGeo, marsMat);
    mars.position.set(-20, 5, -30);
    scene.add(mars);

    const gasGiantGeo = new THREE.SphereGeometry(4, 32, 32);
    const gasGiantMat = new THREE.MeshStandardMaterial({ color: 0xddccaa });
    const gasGiant = new THREE.Mesh(gasGiantGeo, gasGiantMat);
    gasGiant.position.set(30, -10, -60);
    scene.add(gasGiant);

    // E. Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const color = new THREE.Color();

    for(let i=0; i<starCount; i++) {
        const x = (Math.random() - 0.5) * 600;
        const y = (Math.random() - 0.5) * 600;
        const z = (Math.random() - 0.5) * 400 - 50; // Push back
        starPos[i*3] = x;
        starPos[i*3+1] = y;
        starPos[i*3+2] = z;

        // Random star colors (white, blueish, yellowish)
        const type = Math.random();
        if (type > 0.9) color.setHex(0xaaaaff); // Blue
        else if (type > 0.8) color.setHex(0xffddaa); // Yellow
        else color.setHex(0xffffff); // White

        starColors[i*3] = color.r;
        starColors[i*3+1] = color.g;
        starColors[i*3+2] = color.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
        size: 0.25,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- 6. RESPONSIVE LAYOUT LOGIC ---
    const updateLayout = () => {
        const width = window.innerWidth;
        if (width < 768) {
            // Mobile: Bottom Center
            earthGroup.position.set(0, -3.5, 0);
            atmosphere.position.set(0, -3.5, 0);
            moonPivot.position.set(0, -3.5, 0);
            
            // Adjust camera for mobile
            camera.position.z = 20;
        } else {
            // Desktop: Left Side (Hero layout)
            earthGroup.position.set(-6.5, 0, 0);
            atmosphere.position.set(-6.5, 0, 0);
            moonPivot.position.set(-6.5, 0, 0);
            
            camera.position.z = 18;
        }
    };
    updateLayout();

    // --- 7. INTERACTION ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const onMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Increased sensitivity
        targetRotY = x * 0.8; 
        targetRotX = y * 0.5;
    };

    const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        composer.setSize(width, height);
        
        updateLayout();
    };

    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', handleResize);

    // --- 8. ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Earth Rotation (Day/Night cycle)
        earth.rotation.y += 0.0008;

        // Interactive Rotation (LERP for smoothness)
        // We rotate the group, so axis tilt is preserved
        const lerpFactor = 0.05;
        earthGroup.rotation.y += (targetRotY - earthGroup.rotation.y) * lerpFactor;
        earthGroup.rotation.x += (targetRotX - earthGroup.rotation.x) * lerpFactor;

        // Sync atmosphere glow position with earth group manually if needed, 
        // but here we just copy position in layout update. 
        // Atmosphere needs to look at camera usually, but sphere symmetry makes it okay.

        // Orbit Moon
        moonPivot.rotation.y += 0.002;
        moon.rotation.y += 0.005; // Moon spins

        // Orbit Distant Planets (around 0,0,0 or their own logic)
        mars.position.x = Math.sin(elapsedTime * 0.1) * -20;
        mars.position.z = Math.cos(elapsedTime * 0.1) * -30 - 10;
        
        gasGiant.position.x = Math.cos(elapsedTime * 0.05) * 40;
        gasGiant.position.z = Math.sin(elapsedTime * 0.05) * 20 - 50;

        // Render via Composer
        composer.render();
    };

    animate();

    // --- CLEANUP ---
    return () => {
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', handleResize);
        
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }

        // Dispose
        earthGeo.dispose(); earthMat.dispose();
        moonGeo.dispose(); moonMat.dispose();
        atmosGeo.dispose(); atmosMat.dispose();
        sunGeo.dispose(); sunMat.dispose();
        marsGeo.dispose(); marsMat.dispose();
        gasGiantGeo.dispose(); gasGiantMat.dispose();
        starGeo.dispose(); starMat.dispose();
        
        earthMap.dispose(); earthSpecular.dispose(); earthNormal.dispose(); moonMap.dispose();
        
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
