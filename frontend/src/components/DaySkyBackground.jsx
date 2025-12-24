import { useMemo } from 'react';
import './DaySkyBackground.css';

// Generate floating light particles (dust motes in sunlight)
const generateLightParticles = () => {
  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 25,
      delay: Math.random() * -30,
      opacity: Math.random() * 0.4 + 0.2,
      driftX: (Math.random() - 0.5) * 100,
      driftY: (Math.random() - 0.5) * 60,
    });
  }
  return particles;
};

// Generate soft ambient clouds
const generateClouds = () => {
  const clouds = [];
  for (let i = 0; i < 8; i++) {
    clouds.push({
      id: i,
      top: Math.random() * 60 + 5,
      left: Math.random() * 100,
      scale: Math.random() * 0.6 + 0.5,
      opacity: Math.random() * 0.25 + 0.15,
      blur: Math.random() * 30 + 40,
      width: Math.random() * 300 + 200,
      height: Math.random() * 100 + 80,
      duration: Math.random() * 120 + 80,
      delay: Math.random() * -60,
    });
  }
  return clouds;
};

// Generate lens flare spots
const generateFlareSpots = () => {
  const spots = [];
  const flareColors = [
    'rgba(255, 200, 150, 0.15)',
    'rgba(150, 200, 255, 0.1)',
    'rgba(255, 180, 120, 0.12)',
    'rgba(200, 220, 255, 0.08)',
  ];

  for (let i = 0; i < 5; i++) {
    spots.push({
      id: i,
      left: 65 + (i * 7),
      top: 20 + (i * 12),
      size: 10 + (Math.random() * 40),
      color: flareColors[i % flareColors.length],
      blur: 15 + (i * 8),
    });
  }
  return spots;
};

export default function DaySkyBackground({ isDark }) {
  const lightParticles = useMemo(() => generateLightParticles(), []);
  const clouds = useMemo(() => generateClouds(), []);
  const flareSpots = useMemo(() => generateFlareSpots(), []);

  if (isDark) return null;

  return (
    <div className="day-sky-background">
      {/* Deep atmospheric gradient layers */}
      <div className="sky-atmosphere-base"></div>
      <div className="sky-atmosphere-gradient"></div>
      <div className="sky-atmosphere-zenith"></div>

      {/* Sun with realistic glow */}
      <div className="sun-container">
        <div className="sun-outer-corona"></div>
        <div className="sun-corona"></div>
        <div className="sun-core"></div>
        <div className="sun-bloom"></div>
      </div>

      {/* Lens flare effect */}
      <div className="lens-flare-container">
        {flareSpots.map((spot) => (
          <div
            key={spot.id}
            className="lens-flare-spot"
            style={{
              left: `${spot.left}%`,
              top: `${spot.top}%`,
              width: `${spot.size}px`,
              height: `${spot.size}px`,
              background: spot.color,
              filter: `blur(${spot.blur}px)`,
            }}
          />
        ))}
        <div className="lens-flare-line"></div>
      </div>

      {/* Floating dust particles in sunlight */}
      <div className="light-particles-container">
        {lightParticles.map((particle) => (
          <div
            key={particle.id}
            className="light-particle"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              '--opacity': particle.opacity,
              '--drift-x': `${particle.driftX}px`,
              '--drift-y': `${particle.driftY}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Soft volumetric clouds */}
      <div className="clouds-container">
        {clouds.map((cloud) => (
          <div
            key={cloud.id}
            className="soft-cloud"
            style={{
              top: `${cloud.top}%`,
              '--start-x': `${cloud.left}%`,
              transform: `scale(${cloud.scale})`,
              opacity: cloud.opacity,
              width: `${cloud.width}px`,
              height: `${cloud.height}px`,
              filter: `blur(${cloud.blur}px)`,
              animationDuration: `${cloud.duration}s`,
              animationDelay: `${cloud.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Atmospheric haze layers */}
      <div className="atmospheric-haze"></div>
      <div className="horizon-haze"></div>

      {/* Golden hour glow */}
      <div className="ambient-glow"></div>
      <div className="sun-rays-subtle"></div>
    </div>
  );
}
