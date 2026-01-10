import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HexagonBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    // Keep background transparent to blend with CSS gradient if needed, or black
    scene.background = new THREE.Color(0x000000); 

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 16); 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // --- 2. LIGHTING (Bright & Visible) ---
    // Ambient light ensures the texture is visible even in shadow
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
    scene.add(ambientLight);

    // Main Sun Light - Positioned top-right-front to light up the face
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // --- 3. OBJECTS GROUP ---
    const earthGroup = new THREE.Group();
    // Tilt the earth
    earthGroup.rotation.z = 23.5 * Math.PI / 180;
    scene.add(earthGroup);

    // --- 4. TEXTURES & MATERIALS ---
    const textureLoader = new THREE.TextureLoader();
    const earthMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
    const earthSpecular = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    const earthNormal = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');
    const earthClouds = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png');

    // EARTH SPHERE
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

    // CLOUDS SPHERE
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

    // ATMOSPHERE GLOW (Shader)
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
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.5;
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
    // Add atmosphere to scene (not group) so it doesn't rotate with texture, 
    // OR add to group if you want the glow shape to rotate (usually better static relative to camera).
    // Here we add to group for simplicity of position tracking, but we won't rotate it in animation loop.
    earthGroup.add(atmosphere);

    // --- 5. STARS ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i++) {
        starPos[i] = (Math.random() - 0.5) * 600;
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

    // --- 6. RESPONSIVE POSITIONING ---
    const updateEarthPosition = () => {
        const width = window.innerWidth;
        if (width > 900) {
            // Desktop: Move to Right
            earthGroup.position.set(7, 0, 0);
            earthGroup.scale.set(1.2, 1.2, 1.2);
        } else if (width > 600) {
            // Tablet: Slightly Right
            earthGroup.position.set(4, -1, 0);
            earthGroup.scale.set(1, 1, 1);
        } else {
            // Mobile: Move to Bottom
            earthGroup.position.set(0, -3.5, 0);
            earthGroup.scale.set(0.9, 0.9, 0.9);
        }
    };
    
    // Initial call
    updateEarthPosition();

    // --- 7. INTERACTION ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onDocumentMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateEarthPosition();
    };

    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', handleResize);

    // --- 8. ANIMATION LOOP ---
    const animate = () => {
        requestAnimationFrame(animate);

        // Slow constant rotation
        earth.rotation.y += 0.0008;
        clouds.rotation.y += 0.0011;
        stars.rotation.y -= 0.0002;

        // Mouse interaction (Smooth Lerp)
        targetRotationY = mouseX * 0.3;
        targetRotationX = mouseY * 0.2;

        earthGroup.rotation.y += 0.05 * (targetRotationY - earthGroup.rotation.y);
        earthGroup.rotation.x += 0.05 * (targetRotationX - earthGroup.rotation.x);

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

        // Dispose assets
        earthGeo.dispose(); earthMat.dispose();
        cloudGeo.dispose(); cloudMat.dispose();
        atmosGeo.dispose(); atmosMat.dispose();
        starGeo.dispose(); starMat.dispose();
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
            pointerEvents: 'none'
        }} 
        aria-hidden="true"
    />
  );
};

export default HexagonBackground;
