import React, { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Earth from "./Earth";
// Keplerian elements for each planet (simplified, units: AU, degrees)
// Colors and atmospheres are chosen for visual distinction
const planetData = [
  {
    name: "Mercury",
    color: 0xb1b1b1,
    atmosphere: 0xcccccc,
    radius: 0.8,
    a: 8,
    e: 0.205,
    i: 7.0,
    omega: 48.3,
    w: 29.1,
    M0: 174.8,
    period: 88,
  },
  {
    name: "Venus",
    color: 0xeedc82,
    atmosphere: 0xffe5b4,
    radius: 0.95,
    a: 0.72,
    e: 0.007,
    i: 3.4,
    omega: 76.7,
    w: 54.9,
    M0: 50.1,
    period: 225,
  },
  {
    name: "Earth",
    color: 0x1b76ff,
    atmosphere: 0x66ccff,
    radius: 2.5,
    a: 10,
    e: 0.017,
    i: 0.0,
    omega: 174.9,
    w: 288.1,
    M0: 357.5,
    period: 365,
  },
  {
    name: "Mars",
    color: 0xc1440e,
    atmosphere: 0xffa07a,
    radius: 0.53,
    a: 1.52,
    e: 0.093,
    i: 1.85,
    omega: 49.6,
    w: 286.5,
    M0: 19.4,
    period: 687,
  },
  {
    name: "Jupiter",
    color: 0xf4e2d8,
    atmosphere: 0xffe4b5,
    radius: 11.2,
    a: 5.2,
    e: 0.049,
    i: 1.3,
    omega: 100.5,
    w: 273.9,
    M0: 20.0,
    period: 4331,
  },
  {
    name: "Saturn",
    color: 0xf7e7b4,
    atmosphere: 0xf5deb3,
    radius: 9.45,
    a: 9.58,
    e: 0.056,
    i: 2.5,
    omega: 113.7,
    w: 339.4,
    M0: 317.0,
    period: 10747,
  },
  {
    name: "Uranus",
    color: 0x7fffd4,
    atmosphere: 0xadd8e6,
    radius: 4.0,
    a: 19.18,
    e: 0.046,
    i: 0.77,
    omega: 74.0,
    w: 96.9,
    M0: 142.2,
    period: 30589,
  },
  {
    name: "Neptune",
    color: 0x4169e1,
    atmosphere: 0x4682b4,
    radius: 3.88,
    a: 30.07,
    e: 0.01,
    i: 1.77,
    omega: 131.8,
    w: 265.6,
    M0: 256.2,
    period: 59800,
  },
];
export function PlanetWithAtmosphere({
  name,
  color,
  atmosphere,
  radius,
  kepler,
  showOrbit,
  simSpeed = 1,
}) {
  const meshRef = useRef();
  const atmosphereRef = useRef();
  const timeRef = useRef(0);
  // Animate planet position using Keplerian elements
  useFrame(({ delta }) => {
    // Advance a per-planet time accumulator by delta scaled with simSpeed.
    // This ensures changing simSpeed alters the future rate without teleporting the planet.
    timeRef.current += delta * simSpeed;
    const t = timeRef.current;
    // Orbital period in seconds (scale for demo)
    const period = kepler.period * 0.05;
    const M = ((kepler.M0 + (360 * t) / period) % 360) * (Math.PI / 180);
    // Solve Kepler's equation for E (eccentric anomaly)
    let E = M;
    for (let j = 0; j < 5; j++) E = M + kepler.e * Math.sin(E);
    // True anomaly
    const v =
      2 *
      Math.atan2(
        Math.sqrt(1 + kepler.e) * Math.sin(E / 2),
        Math.sqrt(1 - kepler.e) * Math.cos(E / 2)
      );
    // Distance from focus
    const r = kepler.a * (1 - kepler.e * Math.cos(E));
    // Orbital plane coordinates
    let x = r * Math.cos(v);
    let y = r * Math.sin(v);
    // Rotate by argument of periapsis
    const w = kepler.w * (Math.PI / 180);
    const xp = x * Math.cos(w) - y * Math.sin(w);
    const yp = x * Math.sin(w) + y * Math.cos(w);
    // Inclination
    const i = kepler.i * (Math.PI / 180);
    const zp = yp * Math.sin(i);
    // Longitude of ascending node
    const omega = kepler.omega * (Math.PI / 180);
    const xpp = xp * Math.cos(omega) - yp * Math.sin(omega);
    const ypp = xp * Math.sin(omega) + yp * Math.cos(omega);
    // Set position, scale for better visualization
    const scale = 4;
    if (meshRef.current)
      meshRef.current.position.set(xpp * scale, zp * scale, ypp * scale);
    if (atmosphereRef.current)
      atmosphereRef.current.position.set(xpp * scale, zp * scale, ypp * scale);
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += 0.0005;
  });
  return (
    <>
      {showOrbit && <OrbitEllipse kepler={kepler} scale={4} />}
      {name === "Earth" ? (
        <group ref={meshRef}>
          <Earth radius={radius} rotationSpeed={0.003} axialTilt={23.4} />
        </group>
      ) : (
        <group>
          <mesh ref={meshRef}>
            <sphereGeometry args={[radius, 64, 64]} />
            <meshStandardMaterial
              color={color}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          <mesh
            ref={atmosphereRef}
            scale={[1.04, 1.04, 1.04]}
            frustumCulled={false}
            renderOrder={1}
          >
            <sphereGeometry args={[radius, 64, 64]} />
            <shaderMaterial
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
              uniforms={{
                glowColor: { value: new THREE.Color(atmosphere) },
                coef: { value: 0.5 },
                power: { value: 3.0 },
                opacity: { value: 0.18 },
              }}
              vertexShader={`
                uniform float coef;
                uniform float power;
                varying float intensity;
                void main() {
                  vec3 vNormal = normalize(normalMatrix * normal);
                  vec3 viewDir = normalize((modelViewMatrix * vec4(position,1.0)).xyz);
                  intensity = pow(coef - dot(vNormal, viewDir), power);
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                }
              `}
              fragmentShader={`
                uniform vec3 glowColor;
                uniform float opacity;
                varying float intensity;
                void main() {
                  gl_FragColor = vec4(glowColor, opacity * intensity);
                }
              `}
            />
          </mesh>
        </group>
      )}
    </>
  );
}

// Draw orbit ellipse using Keplerian elements
function OrbitEllipse({ kepler, scale }) {
  const points = [];
  for (let a = 0; a <= 360; a += 2) {
    const M = a * (Math.PI / 180);
    let E = M;
    for (let j = 0; j < 5; j++) E = M + kepler.e * Math.sin(E);
    const v =
      2 *
      Math.atan2(
        Math.sqrt(1 + kepler.e) * Math.sin(E / 2),
        Math.sqrt(1 - kepler.e) * Math.cos(E / 2)
      );
    const r = kepler.a * (1 - kepler.e * Math.cos(E));
    let x = r * Math.cos(v);
    let y = r * Math.sin(v);
    const w = kepler.w * (Math.PI / 180);
    const xp = x * Math.cos(w) - y * Math.sin(w);
    const yp = x * Math.sin(w) + y * Math.cos(w);
    const i = kepler.i * (Math.PI / 180);
    const zp = yp * Math.sin(i);
    const omega = kepler.omega * (Math.PI / 180);
    const xpp = xp * Math.cos(omega) - yp * Math.sin(omega);
    const ypp = xp * Math.sin(omega) + yp * Math.cos(omega);
    points.push(new THREE.Vector3(xpp * scale, zp * scale, ypp * scale));
  }
  return (
    <line>
      <bufferGeometry attach="geometry" setFromPoints={points} />
      <lineBasicMaterial color={0xffffff} linewidth={1} />
    </line>
  );
}
export function Sun() {
  return (
    <group>
      {/* Physical sun sphere */}
      <mesh>
        <sphereGeometry args={[3, 128, 128]} />
        <meshStandardMaterial
          emissive={0xfff700}
          emissiveIntensity={2.5}
          color={0xfff700}
        />
      </mesh>

      {/* Point light at Sun to illuminate planets realistically */}
      <pointLight
        position={[0, 0, 0]}
        intensity={4}
        distance={1000}
        decay={2}
      />

      {/* Soft additive glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial
          color={0xfff700}
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export function SolarSystem({ showOrbits = true, simSpeed = 1 }) {
  return (
    <>
      {/* Add lights for visibility */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[200, 200, 200]} intensity={3} />
      <Sun />
      {planetData.map((p) => (
        <PlanetWithAtmosphere
          key={p.name}
          name={p.name}
          color={p.color}
          atmosphere={p.atmosphere}
          radius={p.radius}
          kepler={p}
          showOrbit={showOrbits}
          simSpeed={simSpeed}
        />
      ))}
    </>
  );
}

// Overlay for button (using drei's Html if available)
function HtmlOverlay({ children }) {
  // If @react-three/drei's Html is available, use it; else fallback
  try {
    const { Html } = require("@react-three/drei");
    return <Html>{children}</Html>;
  } catch {
    return (
      <div style={{ position: "absolute", top: 0, left: 0 }}>{children}</div>
    );
  }
}
