import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Sun({
  radius = 150,
  lightIntensity = 2.5,
  glowColor = "#ff7b00",
  surfaceColor = "#fff4d6",
}) {
  const sunRef = useRef();
  const glowRef = useRef();

  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.05;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y -= delta * 0.03;
    }
  });

  return (
    <group position={[-200, 50, -400]}>
      {/* Sun's light */}
      <pointLight
        intensity={lightIntensity}
        distance={2000}
        decay={1}
        color={surfaceColor}
      />

      {/* Sun's surface */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial color={surfaceColor} toneMapped={false} />
      </mesh>

      {/* Sun's glow */}
      <mesh ref={glowRef} scale={1.2}>
        <sphereGeometry args={[radius, 32, 32]} />
        <shaderMaterial
          transparent
          uniforms={{
            color: { value: new THREE.Color(glowColor) },
          }}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 color;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
              gl_FragColor = vec4(color, intensity);
            }
          `}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
