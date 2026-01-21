
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HexagonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 40;
    camera.position.y = 10;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffaa00, 2, 300);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    // --- OBJECTS ---

    // 1. Sun
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    
    // Sun Glow (Sprite)
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/glow.png'), 
        color: 0xffaa00, 
        transparent: true, 
        blending: THREE.AdditiveBlending 
    });
    const sunGlow = new THREE.Sprite(spriteMaterial);
    sunGlow.scale.set(25, 25, 1.0);
    sun.add(sunGlow);
    scene.add(sun);

    // 2. Earth System (Group)
    const earthOrbitGroup = new THREE.Group();
    scene.add(earthOrbitGroup);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x2233ff, 
        emissive: 0x112244,
        specular: 0x111111,
        shininess: 10
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.x = 20; // Distance from Sun
    earthOrbitGroup.add(earth);

    // 3. Moon System (Group child of Earth)
    const moonOrbitGroup = new THREE.Group();
    earth.add(moonOrbitGroup);

    // Moon
    const moonGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const moonMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.x = 3.5; // Distance from Earth
    moonOrbitGroup.add(moon);

    // --- STARS ---
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i++) {
        starPositions[i] = (Math.random() - 0.5) * 400;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // --- ANIMATION ---
    const animate = () => {
        requestAnimationFrame(animate);

        // Rotations
        sun.rotation.y += 0.002;
        
        // Orbits
        earthOrbitGroup.rotation.y += 0.005; // Earth around Sun
        earth.rotation.y += 0.02; // Earth axis rotation
        
        moonOrbitGroup.rotation.y += 0.03; // Moon around Earth
        
        // Stars slow rotation
        stars.rotation.y -= 0.0002;

        renderer.render(scene, camera);
    };

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        sunGeometry.dispose();
        sunMaterial.dispose();
        earthGeometry.dispose();
        earthMaterial.dispose();
        moonGeometry.dispose();
        moonMaterial.dispose();
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
    />
  );
};

export default HexagonBackground;
