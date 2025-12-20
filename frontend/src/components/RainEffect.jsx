import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// Seeded random number generator for stable results
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function RainDrops({ count = 5000, intensity = 1 }) {
  const mesh = useRef();
  const light = useRef();
  
  // Use useMemo with seeded random for stable initial positions
  const [positions, velocities] = useMemo(() => {
    const posArray = new Float32Array(count * 3);
    const velArray = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      posArray[i * 3] = (seededRandom(i * 3) - 0.5) * 40;
      posArray[i * 3 + 1] = seededRandom(i * 3 + 1) * 30;
      posArray[i * 3 + 2] = (seededRandom(i * 3 + 2) - 0.5) * 40;
      velArray[i] = (seededRandom(i + 1000) * 0.3 + 0.2) * intensity;
    }
    
    return [posArray, velArray];
  }, [count, intensity]);

  useFrame(() => {
    if (!mesh.current) return;
    
    const posArray = mesh.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] -= velocities[i] * intensity;
      
      if (posArray[i * 3 + 1] < -5) {
        posArray[i * 3 + 1] = 25;
        posArray[i * 3] = (Math.random() - 0.5) * 40;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 40;
      }
    }
    
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight ref={light} position={[0, 10, 0]} intensity={0.5} color="#88ccff" />
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#a8d4ff"
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </>
  );
}

function Lightning({ active }) {
  const lightRef = useRef();
  
  // Generate stable position once using useMemo
  const lightPosition = useMemo(() => {
    return [seededRandom(999) * 20 - 10, 15, seededRandom(1001) * 20 - 10];
  }, []);
  
  useFrame(() => {
    if (!lightRef.current || !active) {
      if (lightRef.current) lightRef.current.intensity = 0;
      return;
    }
    
    // Random lightning flashes during animation (this is OK in useFrame)
    if (Math.random() > 0.995) {
      lightRef.current.intensity = 3;
    } else {
      lightRef.current.intensity *= 0.9;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={lightPosition}
      intensity={0}
      color="#ffffff"
      distance={50}
    />
  );
}

function Clouds({ count = 8 }) {
  const cloudsRef = useRef();
  
  // Use seeded random for stable cloud positions
  const cloudPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < count; i++) {
      positions.push({
        x: (seededRandom(i * 4 + 2000) - 0.5) * 30,
        y: 12 + seededRandom(i * 4 + 2001) * 5,
        z: (seededRandom(i * 4 + 2002) - 0.5) * 30,
        scale: seededRandom(i * 4 + 2003) * 2 + 1,
      });
    }
    return positions;
  }, [count]);

  useFrame(({ clock }) => {
    if (!cloudsRef.current) return;
    cloudsRef.current.children.forEach((cloud, i) => {
      cloud.position.x += Math.sin(clock.getElapsedTime() * 0.1 + i) * 0.002;
    });
  });

  return (
    <group ref={cloudsRef}>
      {cloudPositions.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          <sphereGeometry args={[pos.scale, 8, 8]} />
          <meshStandardMaterial
            color="#334455"
            transparent
            opacity={0.4}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function RainEffect({ intensity = 1, showLightning = false, className = '' }) {
  const dropCount = Math.floor(3000 * intensity);
  
  return (
    <div className={`rain-effect-container ${className}`}>
      <Canvas
        camera={{ position: [0, 5, 15], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#0a1525', 10, 50]} />
        <Clouds count={10} />
        <RainDrops count={dropCount} intensity={intensity} />
        <Lightning active={showLightning} />
      </Canvas>
    </div>
  );
}
