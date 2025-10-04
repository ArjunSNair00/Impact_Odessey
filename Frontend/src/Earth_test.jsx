import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Earth({
  radius = 50,
  rotationSpeed = 0.001,
  axialTilt = 23.5, // degrees
}) {
  const earthRef = useRef();

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <mesh ref={earthRef} position={[0, 0, 0]}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color="#4444ff" metalness={0.5} roughness={0.5} />
    </mesh>
  );
}
