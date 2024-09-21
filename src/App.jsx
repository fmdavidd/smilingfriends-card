import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function App() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const texture1 = loader.load('/images/image1.jpg');
    const texture2 = loader.load('/images/image2.jpg');

    const material = new THREE.ShaderMaterial({
      uniforms: {
        texture1: { value: texture1 },
        texture2: { value: texture2 },
        mixRatio: { value: 0.5 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D texture1;
        uniform sampler2D texture2;
        uniform float mixRatio;
        varying vec2 vUv;
        void main() {
          vec4 tex1 = texture2D(texture1, vUv);
          vec4 tex2 = texture2D(texture2, vUv);
          gl_FragColor = mix(tex1, tex2, mixRatio);
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(10, 10);
    const lenticularCard = new THREE.Mesh(geometry, material);
    scene.add(lenticularCard);

    camera.position.z = 15;

    const handleMouseMove = (event) => {
      const { clientX, clientY } = event;
      const halfWidth = window.innerWidth / 2;
      const halfHeight = window.innerHeight / 2;

      const mixRatio = clientX / window.innerWidth;
      material.uniforms.mixRatio.value = mixRatio;

      const rotationX = (clientY - halfHeight) / halfHeight * 0.2;
      const rotationY = (clientX - halfWidth) / halfWidth * 0.2;

      lenticularCard.rotation.x = -rotationX;
      lenticularCard.rotation.y = rotationY;
    };

    const handleTouchMove = (event) => {
      const touch = event.touches[0];
      const halfWidth = window.innerWidth / 2;
      const halfHeight = window.innerHeight / 2;

      const mixRatio = touch.clientX / window.innerWidth;
      material.uniforms.mixRatio.value = mixRatio;

      const rotationX = (touch.clientY - halfHeight) / halfHeight * 0.2;
      const rotationY = (touch.clientX - halfWidth) / halfWidth * 0.2;

      lenticularCard.rotation.x = -rotationX;
      lenticularCard.rotation.y = rotationY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef}></div>;
}

export default App;
