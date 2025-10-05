import { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Asteroid from "./asteroids";

import earthColor from "./assets/Earth/earth_color_10K.png";
import earthOcean from "./assets/Earth/earth_landocean_4K.png";
import earthSpecular from "./assets/Earth/specular_map_8k.png";
import earthHeight from "./assets/Earth/topography_5k.png";
import earthNight from "./assets/Earth/earth_nightlights_10K.png";

export default function Earth({
  radius = 0.5,
  rotationSpeed = 0.2,
  bumpScale = 0.01,
  asteroids = [],
  selectedAsteroid,
}) {
  const earthRef = useRef();
  const { camera } = useThree();
  const segmentsRef = useRef(64);

  // Load all textures
  const [
    colorMapOriginal,
    oceanMapOriginal,
    specularMapOriginal,
    bumpMapOriginal,
    nightMapOriginal,
  ] = useLoader(THREE.TextureLoader, [
    earthColor,
    earthOcean,
    earthSpecular,
    earthHeight,
    earthNight,
  ]);

  // Optimize texture with canvas downscaling
  const optimizeTexture = (originalTexture, maxSize) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = originalTexture.image;
    const aspect = img.width / img.height;

    let width = Math.min(img.width, maxSize);
    let height = Math.floor(width / aspect);

    if (height > maxSize) {
      height = maxSize;
      width = Math.floor(height * aspect);
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 8;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;

    return texture;
  };

  // Downscale textures aggressively for performance
  const [colorMap, oceanMap, specularMap, bumpMap, nightMap] = useMemo(() => {
    return [
      optimizeTexture(colorMapOriginal, 2048),
      optimizeTexture(oceanMapOriginal, 1024),
      optimizeTexture(specularMapOriginal, 1024),
      optimizeTexture(bumpMapOriginal, 500),
      optimizeTexture(nightMapOriginal, 2048), // Night lights need good resolution
    ];
  }, [
    colorMapOriginal,
    oceanMapOriginal,
    specularMapOriginal,
    bumpMapOriginal,
    nightMapOriginal,
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      [colorMap, oceanMap, specularMap, bumpMap].forEach((tex) =>
        tex?.dispose()
      );
    };
  }, [colorMap, oceanMap, specularMap, bumpMap]);

  // Adaptive LOD based on camera distance
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += rotationSpeed * delta;

      // Calculate distance from camera to Earth
      const distance = camera.position.distanceTo(earthRef.current.position);

      // Adjust geometry detail based on distance
      let newSegments;
      if (distance < 2) {
        newSegments = 96; // Close up - high detail
      } else if (distance < 5) {
        newSegments = 64; // Medium distance
      } else {
        newSegments = 32; // Far away - low detail
      }

      // Update geometry only if segments changed
      if (newSegments !== segmentsRef.current) {
        segmentsRef.current = newSegments;
        const newGeometry = new THREE.SphereGeometry(
          radius,
          newSegments,
          newSegments
        );
        earthRef.current.geometry.dispose();
        earthRef.current.geometry = newGeometry;
      }
    }
  });

  const customShaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: colorMap },
        nightTexture: { value: nightMap },
        bumpMap: { value: bumpMap },
        specularMap: { value: specularMap },
        oceanMap: { value: oceanMap },
        bumpScale: { value: bumpScale },
        lightDirection: { value: new THREE.Vector3(5, 0, 2).normalize() },
      },
      vertexShader: `
        uniform sampler2D bumpMap;
        uniform float bumpScale;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vTangent;
        varying vec3 vBitangent;
        varying vec3 vWorldPosition;
        
        void main() {
          vUv = uv;
          
          // Calculate tangent space for normal mapping
          vec3 normal = normalize(normalMatrix * normal);
          vec3 tangent = normalize(normalMatrix * normalize(cross(normal, vec3(0.0, 1.0, 0.0))));
          vec3 bitangent = normalize(cross(normal, tangent));
          
          vNormal = normal;
          vTangent = tangent;
          vBitangent = bitangent;

          // Apply bump mapping displacement
          float height = texture2D(bumpMap, vUv).r;
          vec3 transformed = position + normalize(position) * height * bumpScale;
          
          vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D specularMap;
        uniform sampler2D oceanMap;
        uniform sampler2D bumpMap;
        uniform vec3 lightDirection;
        uniform float bumpScale;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vTangent;
        varying vec3 vBitangent;
        varying vec3 vWorldPosition;

        void main() {
          // Create TBN matrix for normal mapping
          mat3 TBN = mat3(normalize(vTangent), normalize(vBitangent), normalize(vNormal));

          // Sample bump map and create normal offset
          vec2 dHdxy = vec2(
            texture2D(bumpMap, vUv + vec2(0.001, 0.0)).r - texture2D(bumpMap, vUv - vec2(0.001, 0.0)).r,
            texture2D(bumpMap, vUv + vec2(0.0, 0.001)).r - texture2D(bumpMap, vUv - vec2(0.0, 0.001)).r
          ) * bumpScale;
          
          vec3 normal = normalize(vNormal + TBN * vec3(dHdxy.x, dHdxy.y, 0.0));
          float lightIntensity = max(dot(normal, normalize(lightDirection)), 0.0);
          
          // Sample textures
          vec3 dayColor = texture2D(dayTexture, vUv).rgb;
          vec3 nightColor = texture2D(nightTexture, vUv).rgb;
          vec3 oceanMask = texture2D(oceanMap, vUv).rgb;
          float specular = texture2D(specularMap, vUv).r;
          
          // Create darker night base with bright city lights
          vec3 darkNight = vec3(0.02, 0.02, 0.05); // Very dark blue-black base color
          vec3 cityLights = nightColor * vec3(3.0, 2.5, 2.0); // Brighter, slightly warm city lights
          vec3 nightFinal = darkNight + cityLights;

          // Smooth transition between day and night
          float transition = smoothstep(-0.1, 0.3, lightIntensity);
          vec3 color = mix(nightFinal, dayColor, transition);
          
          // Add specular highlights on water
          float oceanSpecular = specular * pow(max(dot(normal, normalize(lightDirection)), 0.0), 8.0);
          color += vec3(0.3, 0.4, 0.5) * oceanSpecular * oceanMask.b;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, [colorMap, nightMap, bumpMap, specularMap, oceanMap, bumpScale]);

  // Update light direction based on scene lighting
  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += rotationSpeed * delta;

      // Calculate distance from camera to Earth
      const distance = camera.position.distanceTo(earthRef.current.position);

      // Adjust geometry detail based on distance
      let newSegments;
      if (distance < 2) {
        newSegments = 96; // Close up - high detail
      } else if (distance < 5) {
        newSegments = 64; // Medium distance
      } else {
        newSegments = 32; // Far away - low detail
      }

      // Update geometry only if segments changed
      if (newSegments !== segmentsRef.current) {
        segmentsRef.current = newSegments;
        const newGeometry = new THREE.SphereGeometry(
          radius,
          newSegments,
          newSegments
        );
        earthRef.current.geometry.dispose();
        earthRef.current.geometry = newGeometry;
      }

      // Update light direction
      const directionalLight = state.scene.children.find(
        (child) => child.type === "DirectionalLight"
      );

      if (directionalLight) {
        const lightDir = directionalLight.position.clone().normalize();
        customShaderMaterial.uniforms.lightDirection.value.copy(lightDir);
      }
    }
  });

  // Example NEO (Near-Earth Object) asteroids with realistic orbital elements
  // Use asteroids from context (fetched from backend) when available
  const exampleAsteroids = useMemo(() => {
    // Dummy data for when no real asteroids are available
    const dummyAsteroids = [
      {
        name: "Example-1",
        orbit: {
          semi_major_axis: 1.5,
          eccentricity: 0.2,
          inclination: 10,
          ascending_node: 50,
          perihelion_argument: 286,
          mean_anomaly: 120
        },
        diameter: 20
      },
      {
        name: "Example-2",
        orbit: {
          semi_major_axis: 2.2,
          eccentricity: 0.15,
          inclination: 15,
          ascending_node: 120,
          perihelion_argument: 180,
          mean_anomaly: 90
        },
        diameter: 15
      },
      {
        name: "Example-3",
        orbit: {
          semi_major_axis: 1.8,
          eccentricity: 0.25,
          inclination: 5,
          ascending_node: 200,
          perihelion_argument: 90,
          mean_anomaly: 180
        },
        diameter: 25
      }
    ];


    if (asteroids && asteroids.length > 0) {
      // Map backend asteroid objects to the 3D Asteroid props
      return asteroids.map((a, idx) => {
        const o = a.orbit || {};
        const degToRad = (d) =>
          d === undefined || d === null ? 0 : (Number(d) * Math.PI) / 180;

        // Scale down the semi-major axis to make orbits more visible
        const a_scale = o.semi_major_axis
          ? Number(o.semi_major_axis) * 0.3 // Reduced scale for better visibility
          : 1.0;

        // Visual size scale based on diameter
        const visualSize = a.diameter
          ? Math.max(0.02, Number(a.diameter) / 300)
          : 0.04;

        // Calculate orbital speed based on semi-major axis (Kepler's laws)
        const orbitalSpeed = o.semi_major_axis
          ? 1 / Math.sqrt(Number(o.semi_major_axis))
          : 0.5;

        return {
          name: a.name || `NEO-${idx}`,
          semiMajorAxis: a_scale,
          eccentricity: o.eccentricity || 0.1,
          inclination: degToRad(o.inclination || 0),
          ascendingNode: degToRad(o.ascending_node || o.node_longitude || 0),
          argOfPeriapsis: degToRad(
            o.perihelion_argument || o.perihelion_argument || 0
          ),
          meanAnomaly: o.mean_anomaly ? Number(o.mean_anomaly) : 0,
          size: visualSize,
          speed: orbitalSpeed,
          color: `#${Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")}`,
        };
      });
    }

    // Fallback: return a small static set if no data available
    return [
      {
        name: "NEO-Example",
        semiMajorAxis: 1.5,
        eccentricity: 0.2,
        inclination: 0.12,
        ascendingNode: 0.5,
        argOfPeriapsis: 1.2,
        meanAnomaly: 0,
        size: 0.03,
        speed: 0.5,
        color: `#${Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")}`,
      },
    ];
  }, [asteroids]);

  return (
    <group>
      <mesh ref={earthRef} frustumCulled={true}>
        <sphereGeometry
          args={[radius, segmentsRef.current, segmentsRef.current]}
        />
        <primitive object={customShaderMaterial} attach="material" />
      </mesh>

      {/* Render asteroids */}
      {exampleAsteroids.map((asteroid, index) => (
        <Asteroid
          key={index}
          name={asteroid.name}
          semiMajorAxis={asteroid.semiMajorAxis}
          eccentricity={asteroid.eccentricity}
          inclination={asteroid.inclination}
          ascendingNode={asteroid.ascendingNode}
          argOfPeriapsis={asteroid.argOfPeriapsis}
          meanAnomaly={asteroid.meanAnomaly}
          size={asteroid.size}
          speed={asteroid.speed}
          isSelected={selectedAsteroid?.name === asteroid.name}
          color={asteroid.color}
        />
      ))}
    </group>
  );
}
