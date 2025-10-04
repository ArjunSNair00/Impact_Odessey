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
  axialTilt = 23.5,
}) {
  const rotationRef = useRef({ x: axialTilt * (Math.PI / 180), y: 0 });
  const earthRef = useRef();
  const atmosphereRef = useRef();
  const { scene } = useThree();

  const [colorMap, nightMap, heightMap, specularMap, oceanMap] = useLoader(
    TextureLoader,
    [earthColor, earthNight, earthHeight, earthSpecular, earthOcean]
  );

  // Configure textures with optimizations
  useEffect(() => {
    const textures = [colorMap, nightMap, heightMap, specularMap, oceanMap];
    textures.forEach((texture) => {
      if (texture) {
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = 4;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
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

  // Find the Sun's position for lighting
  const sunPosition = new THREE.Vector3(-200, 50, -400);
  const earthPosition = new THREE.Vector3(0, 0, 0);
  const lightDir = sunPosition.clone().sub(earthPosition).normalize();

  return (
    <>
      <mesh
        ref={earthRef}
        frustumCulled={false}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          uniforms={{
            dayTexture: { value: colorMap },
            nightTexture: { value: nightMap },
            specularMap: { value: specularMap },
            oceanMap: { value: oceanMap },
            bumpMap: { value: heightMap },
            bumpScale: { value: bumpScale },
            lightDirection: { value: lightDir },
            radius: { value: radius },
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
              vNormal = normal;
              vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D dayTexture;
            uniform sampler2D nightTexture;
            uniform sampler2D specularMap;
            uniform vec3 lightDirection;
            uniform float radius;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
              vec3 worldNormal = normalize(mat3(modelMatrix) * normalize(vNormal));
              float lightIntensity = max(dot(worldNormal, normalize(lightDirection)), 0.0);
              
              float u = 1.0 - (atan(vPosition.z, vPosition.x) / (2.0 * 3.14159265) + 0.5);
              float v = 0.5 - asin(vPosition.y / radius) / 3.14159265;
              vec2 uv = vec2(u, v);
              
              vec3 dayColor = texture2D(dayTexture, uv).rgb;
              vec3 nightColor = texture2D(nightTexture, uv).rgb;
              
              float transition = smoothstep(0.0, 0.3, lightIntensity);
              vec3 color = mix(nightColor, dayColor, transition);
              
              vec3 spec = texture2D(specularMap, uv).rgb * pow(lightIntensity, 3.0);
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
              vec3 viewDir = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
              intensity = pow(coef - dot(vNormal, viewDir), power);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
