import { useRef, useEffect } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";

import earthColor from "./assets/Earth/earth_color_10K.png";
import earthNight from "./assets/Earth/earth_nightlights_10K.png";
import earthHeight from "./assets/Earth/topography_5k.png";
import earthSpecular from "./assets/Earth/specular_map_8k.png";
import earthOcean from "./assets/Earth/earth_landocean_4K.png";

export default function Earth({
  radius = 0.5,
  bumpScale = 0.05,
  rotationSpeed = 0.01,
  axialTilt = 23.4, // degrees for Earth
}) {
  const earthRef = useRef();
  const earthMaterialRef = useRef();
  const { scene } = useThree();

  const [colorMap, nightMap, heightMap, specularMap, oceanMap] = useLoader(
    TextureLoader,
    [earthColor, earthNight, earthHeight, earthSpecular, earthOcean]
  );

  useFrame(({ clock }) => {
    if (earthRef.current) {
      // Use elapsed time for smooth rotation
      earthRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed;
    }

    // Update light direction
    if (earthMaterialRef.current) {
      const directionalLight = scene.children.find(
        (obj) => obj.type === "DirectionalLight"
      );
      const lightDir = directionalLight
        ? directionalLight.position.clone().normalize()
        : new THREE.Vector3(1, 0, 0);
      earthMaterialRef.current.uniforms.lightDirection.value = lightDir;
    }
  });

  // Apply axial tilt once on mount
  useEffect(() => {
    if (earthRef.current) {
      earthRef.current.rotation.z = THREE.MathUtils.degToRad(axialTilt); // Typically z for tilt in Three.js conventions, but x in the original
    }
  }, [axialTilt]);

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[radius, 128, 128]} />
      <shaderMaterial
        ref={earthMaterialRef}
        uniforms={{
          dayTexture: { value: colorMap },
          nightTexture: { value: nightMap },
          specularMap: { value: specularMap },
          bumpMap: { value: heightMap },
          bumpScale: { value: bumpScale },
          lightDirection: { value: new THREE.Vector3(1, 0, 0) },
        }}
        vertexShader={`
          varying vec3 vNormal;
          varying vec2 vUv;
          uniform float bumpScale;
          uniform sampler2D bumpMap;
          
          void main() {
            vUv = uv;
            vNormal = normalMatrix * normal;
            vec3 transformed = position;
            float height = texture2D(bumpMap, uv).r * bumpScale;
            transformed += normalize(position) * height;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D dayTexture;
          uniform sampler2D nightTexture;
          uniform sampler2D specularMap;
          uniform vec3 lightDirection;
          varying vec3 vNormal;
          varying vec2 vUv;
          
          void main() {
            vec3 normal = normalize(vNormal);
            float lightIntensity = max(dot(normal, normalize(lightDirection)), 0.0);
            vec3 dayColor = texture2D(dayTexture, vUv).rgb;
            vec3 nightColor = texture2D(nightTexture, vUv).rgb;
            vec3 color = mix(nightColor, dayColor, lightIntensity);
            vec3 spec = texture2D(specularMap, vUv).rgb * lightIntensity;
            color += spec * 0.2;
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}
