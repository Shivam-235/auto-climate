import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Instance, Instances } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import EnvizioLoader from '../components/EnvizioLoader';
import './LandingPageNew.css';

// --- 3D SCENE COMPONENTS ---

function NeptunePlanet({ isWarping }) {
  const { scene } = useGLTF('/src/assets/neptune/scene.gltf');
  const planetRef = useRef();

  useFrame((state, delta) => {
    if (planetRef.current) {
      // Rotate faster when warping to simulate speed relative to planet
      const speed = isWarping ? 0.05 : 0.002;
      planetRef.current.rotation.y += speed;
    }
  });

  return <primitive ref={planetRef} object={scene} scale={1} />;
}

function StarScene() {
  const { scene } = useGLTF('/src/assets/need_some_space.glb');
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.toneMapped = false;
        if (child.material.emissive) child.material.emissiveIntensity = 2;
      }
    });
  }, [scene]);
  return <primitive object={scene} scale={1} />;
}

// The ambient dust particles (fades out during warp)
function ParticleField({ opacity }) {
  const particlesRef = useRef();
  const count = 2000;
  
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.material.opacity = THREE.MathUtils.lerp(
        particlesRef.current.material.opacity,
        opacity,
        0.05
      );
      
      // Stop moving particles if hidden to save performance
      if (opacity < 0.1) return;

      const currentPos = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        currentPos[i * 3] += velocities[i * 3];
        currentPos[i * 3 + 1] += velocities[i * 3 + 1];
        currentPos[i * 3 + 2] += velocities[i * 3 + 2];
        if (Math.abs(currentPos[i * 3]) > 25) velocities[i * 3] *= -1;
        if (Math.abs(currentPos[i * 3 + 1]) > 25) velocities[i * 3 + 1] *= -1;
        if (Math.abs(currentPos[i * 3 + 2]) > 25) velocities[i * 3 + 2] *= -1;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// --- WARP TUNNEL COMPONENT ---
// Renders "Speed Lines" (stretched cylinders) that only appear during warp
function SpeedTunnel({ active }) {
  const groupRef = useRef();
  const count = 200;
  
  // Data for the speed lines (positions arranged in a tunnel)
  const tunnelData = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 30, // Wide X spread
        (Math.random() - 0.5) * 30, // Wide Y spread
        (Math.random() - 0.5) * 100 // Deep Z spread
      ],
      rotation: [0, 0, 0],
      scale: [0.1, 0.1, 5 + Math.random() * 10], // Stretched Z
      speed: 1 + Math.random() * 2
    }));
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Animate the tunnel opacity based on active state
    groupRef.current.children.forEach(mesh => {
       // Only if material exists
       if(mesh.material) {
         const targetOpacity = active ? 0.8 : 0;
         mesh.material.opacity = THREE.MathUtils.lerp(mesh.material.opacity, targetOpacity, delta * 2);
         mesh.visible = mesh.material.opacity > 0.01;
       }
    });

    if (!active) return;

    // Move the lines rapidly towards camera (Positive Z) to create passing effect
    // But since we are moving the CAMERA forward (Negative Z), we actually want these to stay relative 
    // or move against us. Let's move them towards +Z to enhance speed.
    groupRef.current.children.forEach((mesh, i) => {
       mesh.position.z += tunnelData[i].speed * 2;
       if (mesh.position.z > 20) {
         mesh.position.z = -100; // Reset far ahead
       }
    });
  });

  return (
    <group ref={groupRef}>
      {tunnelData.map((data, i) => (
        <mesh key={i} position={data.position} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, data.scale[2], 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} />
          <Bloom intensity={10} emissive="#ffffff" />
          
        </mesh>
      ))}
    </group>
  );
}

// --- CAMERA RIG CONTROLLER ---
// Handles the "Slow then Fast" movement logic
function WarpRig({ active, onWarpComplete }) {
  const { camera } = useThree();
  const timeRef = useRef(0);
  const startPos = useRef(new THREE.Vector3(0, 0, 10));
  
  useFrame((state, delta) => {
    if (!active) {
      // Reset timer if not active
      timeRef.current = 0;
      return;
    }

    // Increment timer
    timeRef.current += delta;
    const t = timeRef.current;

    // --- PHASE 1: CHARGING (0s to 2.5s) ---
    // Slight shake, very slow movement
    if (t < 2.5) {
      // Shake effect
      const shake = Math.sin(t * 50) * 0.05 * (t / 2); // Shake increases over time
      camera.position.x = startPos.current.x + shake;
      camera.position.y = startPos.current.y + shake;
      
      // Pull back slightly before launch (anticipation)
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 12, delta * 0.5);
      
      // FOV widens slightly
      camera.fov = THREE.MathUtils.lerp(camera.fov, 65, delta);
      camera.updateProjectionMatrix();
    } 
    
    // --- PHASE 2: LAUNCH (2.5s to 4.5s) ---
    // Exponential acceleration forward
    else if (t < 4.5) {
      // Normalized time for this phase (0 to 1)
      const phaseT = (t - 2.5) / 2; 
      
      // Exponential curve: t^3 gives a slow start then extremely fast finish
      const speed = Math.pow(phaseT, 3) * 100; 
      
      camera.position.z -= speed * delta * 5; // Move deep into negative Z
      
      // Warp FOV effect
      camera.fov = THREE.MathUtils.lerp(camera.fov, 120, delta * 5);
      camera.updateProjectionMatrix();
    }
    
    // --- PHASE 3: FINISH ---
    else {
      onWarpComplete();
    }
  });

  return null;
}

// --- MAIN COMPONENT ---

export default function LandingPageNew() {
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [flash, setFlash] = useState(false);
  const navigate = useNavigate();

  const initiateTransition = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
    }
  };

  // Scroll trigger
  useEffect(() => {
    const handleScroll = (e) => {
      if (e.deltaY > 0 && !isTransitioning && !loading) {
        initiateTransition();
      }
    };
    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [isTransitioning, loading]);

  // Called by WarpRig when animation is done (approx 4.5s)
  const handleWarpComplete = () => {
    if (!flash) {
      setFlash(true);
      setTimeout(() => navigate('/dashboard'), 500);
    }
  };

//   if (loading) return <EnvizioLoader onComplete={() => setLoading(false)} />;

  return (
    <div className="landing-new">
      <div className="canvas-wrapper">
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 60 }}
          gl={{ antialias: true, toneMapping: THREE.NoToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
        >
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <Suspense fallback={null}>
            <NeptunePlanet isWarping={isTransitioning} />
            <StarScene /> 
          </Suspense>
          
          {/* Dust fades out during warp */}
          <ParticleField opacity={isTransitioning ? 0 : 0.6} />
          
          {/* Tunnel Lines appear during warp */}
          <SpeedTunnel active={isTransitioning} />
          
          {/* Camera Controller */}
          <WarpRig active={isTransitioning} onWarpComplete={handleWarpComplete} />
          
          <EffectComposer>
            <Bloom 
              intensity={isTransitioning ? 5 : 1.5} // Bloom gets intense during warp
              luminanceThreshold={0.1} 
              mipmapBlur 
            />
          </EffectComposer>
          
          {/* Controls disabled during warp */}
          <OrbitControls 
            enableZoom={!isTransitioning} 
            enablePan={!isTransitioning} 
            autoRotate={!isTransitioning}
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <AnimatePresence>
        {!isTransitioning && (
          <motion.div 
            className="content-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 1.5 }} // Slower exit to match "Charging" phase
          >
            <header className="hero-section">
              <h1 className="hero-title">ENVIZIO</h1>
              <p className="hero-subtitle">Future of Development</p>
            </header>

            <div className="scroll-indicator" onClick={initiateTransition} style={{cursor: 'pointer'}}>
              <div className="mouse-icon">
                <div className="mouse-wheel"></div>
              </div>
              <span>SCROLL TO WARP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Whiteout Flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flash-overlay"
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              background: 'white', zIndex: 9999, pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}