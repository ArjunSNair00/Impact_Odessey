import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Kepler's Orbital Elements Class
class KeplerOrbit {
  constructor(a, e, i, Ω, ω, M0, epoch = 0) {
    this.a = a; // semi-major axis (distance units)
    this.e = e; // eccentricity (dimensionless)
    this.i = i; // inclination (radians)
    this.Ω = Ω; // longitude of ascending node (radians)
    this.ω = ω; // argument of periapsis (radians)
    this.M0 = M0; // mean anomaly at epoch (radians)
    this.epoch = epoch; // reference time
  }

  // Calculate position at a given time
  getPosition(t) {
    // Calculate mean anomaly at time t
    const n = Math.sqrt(1 / (this.a * this.a * this.a)); // mean motion
    const M = this.M0 + n * (t - this.epoch);

    // Solve Kepler's equation using Newton's method
    let E = M; // initial guess
    for (let i = 0; i < 10; i++) {
      E = E - (E - this.e * Math.sin(E) - M) / (1 - this.e * Math.cos(E));
    }

    // Calculate position in orbital plane
    const x = this.a * (Math.cos(E) - this.e);
    const y = this.a * Math.sqrt(1 - this.e * this.e) * Math.sin(E);

    // Rotate to correct orientation
    const cosΩ = Math.cos(this.Ω);
    const sinΩ = Math.sin(this.Ω);
    const cosω = Math.cos(this.ω);
    const sinω = Math.sin(this.ω);
    const cosi = Math.cos(this.i);
    const sini = Math.sin(this.i);

    // Apply orbital plane rotations
    const xh =
      x * (cosω * cosΩ - sinω * sinΩ * cosi) -
      y * (sinω * cosΩ + cosω * sinΩ * cosi);
    const yh =
      x * (cosω * sinΩ + sinω * cosΩ * cosi) +
      y * (cosω * cosΩ * cosi - sinω * sinΩ);
    const zh = x * (sinω * sini) + y * (cosω * sini);

    return new THREE.Vector3(xh, yh, zh);
  }
}

// Asteroid Component
const Asteroid = ({
  semiMajorAxis = 20, // Distance from central body
  eccentricity = 0.2, // Orbit shape (0 = circle, 1 = parabola)
  inclination = 0.3, // Tilt of orbit in radians
  ascendingNode = 0, // Swivel of orbit in radians
  argOfPeriapsis = 0, // Orientation of orbit in its plane
  meanAnomaly = 0, // Initial position in orbit
  size = 0.5, // Size of asteroid
  color = "#8B7355", // Color of asteroid
  textureUrl = null, // Optional texture for asteroid
  speed = 1, // Orbital speed multiplier
}) => {
  const meshRef = useRef();
  const epoch = useRef(Date.now());

  // Create orbital parameters
  const orbit = useMemo(
    () =>
      new KeplerOrbit(
        semiMajorAxis,
        eccentricity,
        inclination,
        ascendingNode,
        argOfPeriapsis,
        meanAnomaly,
        epoch.current
      ),
    [
      semiMajorAxis,
      eccentricity,
      inclination,
      ascendingNode,
      argOfPeriapsis,
      meanAnomaly,
    ]
  );

  // Create asteroid geometry with some irregularity
  const geometry = useMemo(() => {
    const baseGeometry = new THREE.IcosahedronGeometry(size, 1);
    const positions = baseGeometry.attributes.position;

    // Add random variations to vertices
    for (let i = 0; i < positions.count; i++) {
      const vertex = new THREE.Vector3();
      vertex.fromBufferAttribute(positions, i);

      const variation = 0.2; // Randomness factor
      vertex.multiplyScalar(1 + (Math.random() - 0.5) * variation);

      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    baseGeometry.computeVertexNormals();
    return baseGeometry;
  }, [size]);

  // Material setup
  const material = useMemo(() => {
    if (textureUrl) {
      const texture = new THREE.TextureLoader().load(textureUrl);
      return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.2,
      });
    }
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.2,
    });
  }, [color, textureUrl]);

  // Animation loop
  useFrame((state) => {
    if (meshRef.current) {
      const time = (Date.now() - epoch.current) * speed * 0.001;
      const position = orbit.getPosition(time);

      meshRef.current.position.copy(position);

      // Add rotation to the asteroid
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.005;
    }
  });

  // Draw orbit path
  const orbitLine = useMemo(() => {
    const points = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const pos = orbit.getPosition(t);
      points.push(pos);
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    return (
      <line>
        <bufferGeometry attach="geometry" {...lineGeometry} />
        <lineBasicMaterial
          attach="material"
          color="#666666"
          opacity={0.5}
          transparent
        />
      </line>
    );
  }, [orbit]);

  return (
    <group>
      {orbitLine}
      <mesh ref={meshRef} geometry={geometry} material={material}>
        <meshStandardMaterial
          attach="material"
          color={color}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
};

export default Asteroid;
