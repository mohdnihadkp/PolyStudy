import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HexagonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Deep space black

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 12); // Distance to see the whole Earth

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // ACES Filmic Tone Mapping for realistic light falloff
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    // --- 2. ASSETS & TEXTURES ---
    const textureLoader = new THREE.TextureLoader();
    
    // Using stable raw URLs from Three.js examples
    const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecular = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
    const earthClouds = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');

    // Group to rotate everything together based on mouse
    const earthGroup = new THREE.Group();
    // Tilted axis like real Earth (approx 23.5 degrees)
    earthGroup.rotation.z = 23.5 * Math.PI / 180; 
    scene.add(earthGroup);

    // --- 3. EARTH SURFACE ---
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        map: earthMap,
        specularMap: earthSpecular,
        normalMap: earthNormal,
        specular: new THREE.Color(0x333333), // Greyish reflection for ocean
        shininess: 15,
    });
    const earth = new THREE.Mesh(geometry, material);
    earthGroup.add(earth);

    // --- 4. CLOUDS ---
    const cloudGeometry = new THREE.SphereGeometry(2.02, 64, 64); // Slightly larger
    const cloudMaterial = new THREE.MeshLambertMaterial({
        map: earthClouds,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earthGroup.add(clouds);

    // --- 5. ATMOSPHERE GLOW (CUSTOM SHADER) ---
    // This creates the realistic "fresnel" rim lighting effect
    const atmosphereVertexShader = `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const atmosphereFragmentShader = `
        varying vec3 vNormal;
        void main() {
            // Calculate intensity based on the angle to the camera
            float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
            // Light Blue Atmosphere Color
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.5;
        }
    `;

    const atmosphereGeometry = new THREE.SphereGeometry(2.25, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide, // Render on the inside of the sphere behind Earth
        transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere); // Add to scene, not group, so it doesn't rotate with Earth textures

    // --- 6. LIGHTING (THE SUN) ---
    const sunLight = new THREE.PointLight(0xffffff, 2.5);
    sunLight.position.set(50, 10, 20); // Far right
    scene.add(sunLight);

    // Visual Sun Mesh
    const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffddaa });
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.position.copy(sunLight.position);
    scene.add(sunMesh);

    // Ambient light for the dark side (city lights simulation not included, so just dim light)
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    // --- 7. STARS BACKGROUND ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPos = new Float32Array(starCount * 3);
    for(let i=0; i<starCount * 3; i++) {
        starPos[i] = (Math.random() - 0.5) * 600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        transparent: true,
        opacity: 0.8,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- 8. INTERACTION & ANIMATION ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onDocumentMouseMove = (event: MouseEvent) => {
        // Normalize mouse position -1 to 1
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', handleResize);

    const animate = () => {
        requestAnimationFrame(animate);

        // 1. Earth Rotation (Auto + Mouse)
        // Auto rotation
        earth.rotation.y += 0.0005;
        // Clouds move slightly faster
        clouds.rotation.y += 0.0007;

        // Mouse Interaction (Smooth LERP)
        // We rotate the entire group based on mouse position
        targetRotationY = mouseX * 0.5; 
        targetRotationX = mouseY * 0.3;

        earthGroup.rotation.y += 0.05 * (targetRotationY - earthGroup.rotation.y);
        earthGroup.rotation.x += 0.05 * (targetRotationX - earthGroup.rotation.x);

        // 2. Stars drifting
        stars.rotation.y -= 0.0002;

        renderer.render(scene, camera);
    };

    animate();

    // --- CLEANUP ---
    return () => {
        document.removeEventListener('mousemove', onDocumentMouseMove);
        window.removeEventListener('resize', handleResize);
        
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }

        // Dispose heavy assets
        geometry.dispose(); material.dispose();
        cloudGeometry.dispose(); cloudMaterial.dispose();
        atmosphereGeometry.dispose(); atmosphereMaterial.dispose();
        starGeo.dispose(); starMat.dispose();
        renderer.dispose();
        
        // Dispose Textures
        earthMap.dispose();
        earthSpecular.dispose();
        earthNormal.dispose();
        earthClouds.dispose();
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
