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
    scene.background = new THREE.Color(0x020205); // Deep space black/blue
    scene.fog = new THREE.FogExp2(0x020205, 0.002);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Cinematic tone mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    // --- 2. CONTROLS ---
    // Allow user to rotate around the earth
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Prevent scrolling interference
    controls.enablePan = false;  // Keep earth centered in its zone
    controls.rotateSpeed = 0.5;

    // --- 3. POST-PROCESSING (BLOOM) ---
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.2, // Strength
        0.4, // Radius
        0.85 // Threshold
    );
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- 4. LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Increased intensity
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffeebb, 2.5); // Bright sun
    sunLight.position.set(5, 3, 5); // Top-right front
    scene.add(sunLight);

    // Visual Sun (for bloom)
    const sunGeo = new THREE.SphereGeometry(2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffddaa });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(40, 20, -20);
    scene.add(sunMesh);

    // --- 5. EARTH GROUP ---
    const earthGroup = new THREE.Group();
    // Earth's tilt
    earthGroup.rotation.z = 23.5 * Math.PI / 180;
    scene.add(earthGroup);

    // Load Textures
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecular = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
    const earthClouds = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');

    // Earth Mesh
    const earthGeo = new THREE.SphereGeometry(2.5, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
        map: earthMap,
        specularMap: earthSpecular,
        normalMap: earthNormal,
        specular: new THREE.Color(0x333333),
        shininess: 15
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    // Clouds Mesh
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

    // Atmosphere Glow (Shader)
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
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.8;
        }
    `;
    const atmosGeo = new THREE.SphereGeometry(2.75, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosphere);

    // --- 6. REALISTIC STARFIELD ---
    const starCount = 3000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);
    const color = new THREE.Color();

    for(let i = 0; i < starCount; i++) {
        // Random positions
        const x = (Math.random() - 0.5) * 600;
        const y = (Math.random() - 0.5) * 600;
        const z = (Math.random() - 0.5) * 600;
        starPos[i*3] = x;
        starPos[i*3+1] = y;
        starPos[i*3+2] = z;

        // Random colors (White, Blueish, Yellowish)
        const type = Math.random();
        if (type > 0.9) color.setHex(0xaaaaff); // Blue tint
        else if (type > 0.8) color.setHex(0xffddaa); // Yellow tint
        else color.setHex(0xffffff); // White

        starCols[i*3] = color.r;
        starCols[i*3+1] = color.g;
        starCols[i*3+2] = color.b;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));

    const starMat = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true, // Use the colors we generated
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true // Distant stars look smaller
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- 7. RESPONSIVE LAYOUT & LOGIC ---
    const updateLayout = () => {
        const width = window.innerWidth;
        
        if (width < 768) {
            // Mobile: Bottom Center
            earthGroup.position.set(0, -3.0, 0);
            // Ensure orbit controls rotate around the new earth position
            controls.target.set(0, -3.0, 0);
        } else {
            // Desktop: Left Side
            earthGroup.position.set(-6.5, 0, 0);
            controls.target.set(-6.5, 0, 0);
        }
        controls.update();
    };
    
    // Initial call
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

    // --- 8. ANIMATION LOOP ---
    const animate = () => {
        requestAnimationFrame(animate);

        // Auto-rotation (Slow)
        // Note: Manual rotation works because controls update camera position relative to target
        // We rotate the Earth mesh itself for day/night cycle simulation independently of camera
        earth.rotation.y += 0.0005;
        clouds.rotation.y += 0.0007; // Clouds move slightly faster
        
        // Update controls
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

        // Dispose assets
        earthGeo.dispose(); earthMat.dispose();
        cloudGeo.dispose(); cloudMat.dispose();
        atmosGeo.dispose(); atmosMat.dispose();
        sunGeo.dispose(); sunMat.dispose();
        starGeo.dispose(); starMat.dispose();
        
        earthMap.dispose(); earthSpecular.dispose(); earthNormal.dispose(); earthClouds.dispose();
        
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
            // pointerEvents must be 'auto' or unset to allow OrbitControls to work
        }} 
    />
  );
};

export default HexagonBackground;
