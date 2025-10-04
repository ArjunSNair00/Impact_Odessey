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
  radius = 50,
  bumpScale = 0.5,
  rotationSpeed = 0.001,
  axialTilt = 23.5, // degrees
}) {
  const rotationRef = useRef({ x: axialTilt * (Math.PI / 180), y: 0 });
  const earthRef = useRef();
  const atmosphereRef = useRef();
  const { scene } = useThree();

  const [colorMap, nightMap, heightMap, specularMap, oceanMap] = useLoader(
    TextureLoader,
    [earthColor, earthNight, earthHeight, earthSpecular, earthOcean],
    (loader) => {
      loader.generateMipmaps = true;
      loader.minFilter = THREE.LinearMipmapLinearFilter;
      loader.magFilter = THREE.LinearFilter;
      loader.anisotropy = 4; // Reduced for performance
    }
  );

  // Configure textures and handle cleanup
  useEffect(() => {
    const textures = [colorMap, nightMap, heightMap, specularMap, oceanMap];
    textures.forEach((texture) => {
      if (texture) {
        texture.encoding = THREE.sRGBEncoding;
        texture.needsUpdate = true;
      }
    });
    return () => textures.forEach((texture) => texture?.dispose());
  }, [colorMap, nightMap, heightMap, specularMap, oceanMap]);

  useFrame((state, delta) => {
    if (earthRef.current && atmosphereRef.current) {
      rotationRef.current.y += rotationSpeed * delta * 60;

      earthRef.current.rotation.x = rotationRef.current.x;
      earthRef.current.rotation.y = rotationRef.current.y;

      atmosphereRef.current.rotation.x = rotationRef.current.x;
      atmosphereRef.current.rotation.y = rotationRef.current.y;
    }
  });

  // Calculate sun direction in world space
  const sunPosition = new THREE.Vector3(-200, 50, -400);
  const earthPosition = new THREE.Vector3(0, 0, 0);
  const lightDir = sunPosition.clone().sub(earthPosition).normalize();

  // Update light direction when sun position changes
  useEffect(() => {
    if (earthRef.current) {
      const material = earthRef.current.material;
      if (material && material.uniforms) {
        material.uniforms.lightDirection.value = lightDir;
        material.uniformsNeedUpdate = true;
      }
    }
  }, [lightDir]);

  return (
    <>
      <mesh ref={earthRef} frustumCulled={false} position={[0, 0, 0]}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          transparent={false}
          side={THREE.FrontSide}
          uniforms={{
            dayTexture: { value: colorMap },
            nightTexture: { value: nightMap },
            specularMap: { value: specularMap },
            oceanMap: { value: oceanMap },
            bumpMap: { value: heightMap },
            bumpScale: { value: bumpScale },
            lightDirection: { value: lightDir },
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              vNormal = normal;
              vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D dayTexture;
            uniform sampler2D nightTexture;
            uniform sampler2D specularMap;
            uniform vec3 lightDirection;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              // Convert normal to world space for consistent lighting
              vec3 worldNormal = normalize(mat3(modelMatrix) * normalize(vNormal));
              float lightIntensity = max(dot(worldNormal, normalize(lightDirection)), 0.1);
              float u = 1.0 - (atan(vPosition.z, vPosition.x) / (2.0 * 3.14159265) + 0.5);
              float v = 0.5 - asin(vPosition.y / ${radius.toFixed(
                1
              )}) / 3.14159265;
              vec2 uv = vec2(u, v);
              vec3 dayColor = texture2D(dayTexture, uv).rgb;
              vec3 nightColor = texture2D(nightTexture, uv).rgb;
              vec3 color = mix(nightColor, dayColor, lightIntensity);
              vec3 spec = texture2D(specularMap, uv).rgb * lightIntensity;
              color += spec * 0.2;
              gl_FragColor = vec4(color, 1.0);
            }
          `}
        />
      </mesh>

      <mesh
        ref={atmosphereRef}
        scale={[1.04, 1.04, 1.04]}
        frustumCulled={false}
        renderOrder={1}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          uniforms={{
            glowColor: { value: new THREE.Color(0x66ccff) },
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
    </>
  );
}
