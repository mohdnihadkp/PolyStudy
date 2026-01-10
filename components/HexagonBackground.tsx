import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HexagonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Pure black space
    // Subtle fog to fade distant stars
    scene.fog = new THREE.FogExp2(0x000000, 0.0003); 

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Tone mapping helps with the high dynamic range of the sun light
    renderer.toneMapping = THREE.ACESFilmicToneMapping; 
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    // 1. Sun Light (Main dramatic source)
    const sunLight = new THREE.PointLight(0xffffff, 3.5, 300); 
    sunLight.position.set(0, 0, 0); // Emits from the sun mesh
    scene.add(sunLight);

    // 2. Ambient Light (Very dim to keep shadows dark)
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);

    // --- OBJECTS ---

    // 1. THE SUN
    const sunGeo = new THREE.SphereGeometry(3.5, 64, 64);
    const sunMat = new THREE.MeshBasicMaterial({ 
        color: 0xffddaa, // Warm white center
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // Sun Corona/Glow (Simulated with transparent larger sphere)
    const sunGlowGeo = new THREE.SphereGeometry(4.2, 64, 64);
    const sunGlowMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00, // Orange glow
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide, // Render on inside to avoid occlusion issues
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    scene.add(sunGlow);

    // 2. THE EARTH GROUP (For Orbiting)
    const earthGroup = new THREE.Group();
    earthGroup.position.set(14, 0, 0); // Initial distance from sun
    // Tilt the Earth's axis
    earthGroup.rotation.z = 23.5 * Math.PI / 180; 
    scene.add(earthGroup);

    // Earth Sphere
    const earthGeo = new THREE.SphereGeometry(1.5, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
        color: 0x1a44aa, // Deep Ocean Blue
        emissive: 0x001133, // Night side isn't pitch black (city lights/atmosphere)
        specular: 0x444444, // Water reflection
        shininess: 25,
        flatShading: false
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    // Atmospheric Glow (Custom Shader)
    // Calculates intensity based on "Fresnel" effect (view angle relative to surface normal)
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
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity; // Cyan/Blue glow
        }
    `;
    
    const atmosGeo = new THREE.SphereGeometry(1.7, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosphere);

    // 3. REALISTIC STARFIELD (Custom Point Shader)
    const starsCount = 4000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    const starSizes = new Float32Array(starsCount);

    for(let i=0; i<starsCount; i++) {
        // Distribute stars in a large sphere
        const r = 80 + Math.random() * 200; 
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        starPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i*3+2] = r * Math.cos(phi);

        // Randomize size for depth perception
        starSizes[i] = Math.random() * 2.0; 
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    // Shader to render soft circular stars instead of squares
    const starVertex = `
        attribute float size;
        void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z); // Size attenuation
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
    const starFragment = `
        void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            if(dist > 0.5) discard; // Make it round
            
            // Soft gradient from center
            float strength = 1.0 - (dist * 2.0);
            strength = pow(strength, 2.0); 
            
            gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
        }
    `;

    const starMat = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: starVertex,
        fragmentShader: starFragment,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- INTERACTION ---
    let mouseX = 0;
    let mouseY = 0;
    
    const onMouseMove = (e: MouseEvent) => {
        // Normalize mouse position -1 to 1
        mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
        mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
    };

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', handleResize);

    // --- ANIMATION LOOP ---
    const animate = () => {
        requestAnimationFrame(animate);

        // 1. Rotate Objects
        sun.rotation.y += 0.001;
        
        // Earth spins on its axis
        earth.rotation.y += 0.005; 
        
        // Earth group orbits around the sun (center)
        earthGroup.rotation.y += 0.0015; 
        
        // Stars drift very slowly
        stars.rotation.y -= 0.0001;

        // 2. Smooth Parallax (Linear Interpolation)
        // Camera moves slightly opposite to mouse to create depth
        const targetX = mouseX * 8;
        const targetY = mouseY * 8;
        
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    };

    animate();

    // --- CLEANUP ---
    return () => {
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', handleResize);
        
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }

        renderer.dispose();
        sunGeo.dispose(); sunMat.dispose();
        sunGlowGeo.dispose(); sunGlowMat.dispose();
        earthGeo.dispose(); earthMat.dispose();
        atmosGeo.dispose(); atmosMat.dispose();
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
            pointerEvents: 'none'
        }} 
        aria-hidden="true"
    />
  );
};

export default HexagonBackground;
