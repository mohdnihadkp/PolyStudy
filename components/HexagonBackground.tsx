
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HexagonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    // Deep space dark background matching the theme
    scene.background = new THREE.Color(0x020205);
    scene.fog = new THREE.FogExp2(0x020205, 0.001);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- PARTICLE SYSTEM (STARFIELD) ---
    const starCount = 6000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const color1 = new THREE.Color(0xffffff); // White
    const color2 = new THREE.Color(0xaaccff); // Blue-ish
    const color3 = new THREE.Color(0xffddaa); // Warm/Yellow-ish

    for (let i = 0; i < starCount; i++) {
        // Cubic distribution for density near center
        const r = 400 * Math.cbrt(Math.random()); 
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        starPositions[i * 3] = x;
        starPositions[i * 3 + 1] = y;
        starPositions[i * 3 + 2] = z;

        // Randomly assign colors
        const rand = Math.random();
        let chosenColor;
        if (rand > 0.9) chosenColor = color2;
        else if (rand > 0.7) chosenColor = color3;
        else chosenColor = color1;

        starColors[i * 3] = chosenColor.r;
        starColors[i * 3 + 1] = chosenColor.g;
        starColors[i * 3 + 2] = chosenColor.b;

        // Random Size
        starSizes[i] = Math.random() * 2;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    // Custom Shader Material for Twinkling Stars
    const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            pixelRatio: { value: renderer.getPixelRatio() }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float pixelRatio;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                
                // Twinkle effect based on position and time
                float twinkle = sin(time * 2.0 + position.x * 0.05 + position.z * 0.05) * 0.5 + 0.5;
                float finalSize = size * (0.8 + 0.4 * twinkle);

                gl_PointSize = finalSize * pixelRatio * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                // Circular soft particle
                float d = distance(gl_PointCoord, vec2(0.5));
                if (d > 0.5) discard;
                
                // Soft edge glow
                float alpha = 1.0 - smoothstep(0.3, 0.5, d);
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const stars = new THREE.Points(starGeo, starMaterial);
    scene.add(stars);

    // --- CENTRAL GEOMETRY (The "Poly" Theme) ---
    // A subtle wireframe icosahedron rotating slowly
    const geoGeometry = new THREE.IcosahedronGeometry(12, 1);
    const geoMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x0ea5e9, // Sky blue
        wireframe: true, 
        transparent: true, 
        opacity: 0.05 
    });
    const centralGeo = new THREE.Mesh(geoGeometry, geoMaterial);
    scene.add(centralGeo);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    let mouseX = 0;
    let mouseY = 0;

    const animate = () => {
        const time = clock.getElapsedTime();
        
        // Update Uniforms
        starMaterial.uniforms.time.value = time;

        // Slow cinematic rotation
        stars.rotation.y = time * 0.03;
        centralGeo.rotation.x = time * 0.05;
        centralGeo.rotation.y = time * 0.1;

        // Subtle Mouse Parallax
        const targetX = (mouseX - window.innerWidth / 2) * 0.0005;
        const targetY = (mouseY - window.innerHeight / 2) * 0.0005;
        
        scene.rotation.x += 0.05 * (targetY - scene.rotation.x);
        scene.rotation.y += 0.05 * (targetX - scene.rotation.y);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        starMaterial.uniforms.pixelRatio.value = renderer.getPixelRatio();
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        starGeo.dispose();
        starMaterial.dispose();
        geoGeometry.dispose();
        geoMaterial.dispose();
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
            pointerEvents: 'none'
        }} 
    />
  );
};

export default HexagonBackground;
