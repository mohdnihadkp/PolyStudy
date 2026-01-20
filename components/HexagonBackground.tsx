
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const HexagonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020205); // Deep space black
    scene.fog = new THREE.FogExp2(0x020205, 0.002);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    // --- 2. CONTROLS ---
    // User can rotate around the Earth
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Important: Don't block page scroll
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- 3. POST-PROCESSING (BLOOM) ---
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.0, // Strength
        0.4, // Radius
        0.85 // Threshold (High threshold so only sun/atmos glows)
    );
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- 4. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // Sun Light source
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(20, 5, 5); // Match visual sun position
    scene.add(sunLight);

    // --- 5. OBJECTS ---

    // A. Earth Group Container
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = 23.5 * Math.PI / 180; // Earth Tilt
    scene.add(earthGroup);

    // Load Textures
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecular = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
    const earthClouds = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');
    const moonMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

    // A1. Earth Sphere
    const earthGeo = new THREE.SphereGeometry(2.5, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
        map: earthMap,
        normalMap: earthNormal,
        roughnessMap: earthSpecular, // Use specular map to define roughness
        roughness: 0.5,
        metalness: 0.1,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    // A2. Cloud Sphere
    const cloudGeo = new THREE.SphereGeometry(2.53, 64, 64);
    const cloudMat = new THREE.MeshLambertMaterial({
        map: earthClouds,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(clouds);

    // A3. Atmosphere Glow (Shader)
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
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 2.0;
        }
    `;
    const atmosGeo = new THREE.SphereGeometry(2.7, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosphere);

    // B. The Moon (Orbiting Earth)
    const moonPivot = new THREE.Group();
    earthGroup.add(moonPivot); // Add to earth group so it follows earth position

    const moonGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
        map: moonMap,
        roughness: 0.8,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(6, 0, 0); // Distance from Earth
    moonPivot.add(moon);

    // C. The Sun (Visual Background)
    const sunGeo = new THREE.SphereGeometry(3, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffddaa }); // Basic material glows with Bloom
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(20, 5, 5); // Far background, Top-Right
    scene.add(sun);

    // D. Enhanced Starfield (Particle System with varying sizes and colors)
    const starCount = 5000;
    const starGeo = new THREE.BufferGeometry();
    
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const shifts = new Float32Array(starCount);

    const starColor = new THREE.Color();

    for (let i = 0; i < starCount; i++) {
        // Spherical distribution
        const r = 200 + Math.random() * 800; // Radius between 200 and 1000
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Colors
        const rand = Math.random();
        if (rand > 0.9) starColor.setHex(0x9bb0ff); // Blueish
        else if (rand > 0.7) starColor.setHex(0xffedad); // Yellowish
        else if (rand > 0.6) starColor.setHex(0xffa07a); // Reddish/Orange
        else starColor.setHex(0xffffff); // White

        colors[i * 3] = starColor.r;
        colors[i * 3 + 1] = starColor.g;
        colors[i * 3 + 2] = starColor.b;

        // Size variation
        sizes[i] = Math.random() * 2.0 + 0.5;

        // Shift for twinkling animation
        shifts[i] = Math.random() * Math.PI;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    starGeo.setAttribute('shift', new THREE.BufferAttribute(shifts, 1));

    const starVertexShader = `
        attribute float size;
        attribute float shift;
        uniform float time;
        varying vec3 vColor;
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            
            // Perspective size attenuation
            // Also animate size slightly for twinkling
            float twinkle = sin(time * 1.5 + shift) * 0.3 + 0.9;
            gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
            
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const starFragmentShader = `
        varying vec3 vColor;
        void main() {
            // Circular particle with soft edge
            float d = distance(gl_PointCoord, vec2(0.5));
            if (d > 0.5) discard;
            
            // Gradient opacity
            float alpha = 1.0 - smoothstep(0.0, 0.5, d);
            
            gl_FragColor = vec4(vColor, alpha);
        }
    `;

    const starUniforms = {
        time: { value: 0 }
    };

    const starMat = new THREE.ShaderMaterial({
        uniforms: starUniforms,
        vertexShader: starVertexShader,
        fragmentShader: starFragmentShader,
        transparent: true,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- 6. RESPONSIVE LAYOUT ---
    const updateLayout = () => {
        const width = window.innerWidth;
        if (width < 768) {
            // Mobile: Bottom Center
            const mobileY = -3.2;
            earthGroup.position.set(0, mobileY, 0);
            controls.target.set(0, mobileY, 0);
            earthGroup.scale.set(0.8, 0.8, 0.8);
        } else {
            // Desktop: Left Side
            const desktopX = -6.5;
            earthGroup.position.set(desktopX, 0, 0);
            controls.target.set(desktopX, 0, 0);
            earthGroup.scale.set(1, 1, 1);
        }
        controls.update();
    };
    updateLayout();

    const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        composer.setSize(width, height);
        
        updateLayout();
    };
    window.addEventListener('resize', handleResize);

    // --- 7. ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();

        // Update Star Uniforms
        starUniforms.time.value = elapsedTime;

        // Slow independent rotations
        earth.rotation.y += 0.0005; // Day/Night cycle
        clouds.rotation.y += 0.0007; 
        moonPivot.rotation.y += 0.002; // Moon Orbit
        moon.rotation.y += 0.01; // Moon Spin

        // Slight starfield rotation
        stars.rotation.y += 0.0001;

        controls.update();
        composer.render();
    };
    animate();

    // --- CLEANUP ---
    return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
        
        // Dispose
        earthGeo.dispose(); earthMat.dispose();
        cloudGeo.dispose(); cloudMat.dispose();
        atmosGeo.dispose(); atmosMat.dispose();
        moonGeo.dispose(); moonMat.dispose();
        sunGeo.dispose(); sunMat.dispose();
        starGeo.dispose(); starMat.dispose();
        
        earthMap.dispose(); earthSpecular.dispose(); earthNormal.dispose(); earthClouds.dispose(); moonMap.dispose();
        
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
            background: '#020205',
            // Pointer events must be auto to allow controls interaction
            pointerEvents: 'auto' 
        }} 
    />
  );
};

export default HexagonBackground;
