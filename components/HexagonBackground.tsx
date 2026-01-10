import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HexagonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    // Deep dark space background (slightly off-black for aesthetics)
    scene.background = new THREE.Color(0x020205);
    // Add some fog for depth fading
    scene.fog = new THREE.FogExp2(0x020205, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Position camera to see both Sun and Earth
    camera.position.z = 20;
    camera.position.x = 0;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    mountRef.current.appendChild(renderer.domElement);

    // --- OBJECTS ---

    // 1. STARFIELD (Particles)
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const posArray = new Float32Array(starCount * 3);
    
    for(let i = 0; i < starCount * 3; i++) {
        // Random positions in a large cube
        posArray[i] = (Math.random() - 0.5) * 200; 
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
    });
    const starMesh = new THREE.Points(starGeometry, starMaterial);
    scene.add(starMesh);

    // 2. SUN (Center)
    // Core geometry
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa33 }); 
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Sun Glow (Transparent sphere slightly larger)
    const glowGeometry = new THREE.SphereGeometry(3.2, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffaa33, 
        transparent: true, 
        opacity: 0.3 
    });
    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(sunGlow);

    // Light Source (Point light from Sun)
    const sunLight = new THREE.PointLight(0xffffff, 2, 300);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    // Dim ambient light so shadow side of Earth isn't pitch black
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2); 
    scene.add(ambientLight);

    // 3. EARTH (Offset)
    const earthGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const earthMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1E90FF, // Dodger Blue
        roughness: 0.6,
        metalness: 0.1,
        emissive: 0x112244, // Slight self-illumination for atmosphere hint
        emissiveIntensity: 0.2
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    
    // Position Earth to the right and slightly front
    earth.position.set(10, 0, 5);
    // Tilt Earth axis slightly
    earth.rotation.z = 23.5 * (Math.PI / 180); 
    scene.add(earth);

    // --- INTERACTION ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX - windowHalfX) * 0.001; // Scale down for sensitivity
        mouseY = (event.clientY - windowHalfY) * 0.001;
    };

    const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', handleResize);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
        const elapsedTime = clock.getElapsedTime();

        // 1. Rotate Objects
        // Sun rotates slowly
        sun.rotation.y += 0.002;
        sunGlow.rotation.y += 0.002;

        // Earth rotates on its axis
        earth.rotation.y += 0.01; 
        
        // Optional: Earth orbits Sun very slowly
        earth.position.x = Math.cos(elapsedTime * 0.1) * 10;
        earth.position.z = Math.sin(elapsedTime * 0.1) * 10;

        // Rotate starfield slowly for cinematic effect
        starMesh.rotation.y -= 0.0002;

        // 2. Mouse Parallax (Smooth interpolation)
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;

        // Move camera slightly opposite to mouse
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
        
        // Make camera always look at scene center
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();

    // --- CLEANUP ---
    return () => {
        document.removeEventListener('mousemove', onDocumentMouseMove);
        window.removeEventListener('resize', handleResize);
        
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }

        // Three.js Cleanup
        sunGeometry.dispose();
        sunMaterial.dispose();
        glowGeometry.dispose();
        glowMaterial.dispose();
        earthGeometry.dispose();
        earthMaterial.dispose();
        starGeometry.dispose();
        starMaterial.dispose();
        renderer.dispose();
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
            pointerEvents: 'none' // Important: Allows clicks to pass through to the app
        }} 
        aria-hidden="true"
    />
  );
};

export default HexagonBackground;
