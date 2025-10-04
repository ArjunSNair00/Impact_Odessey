import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Starfield from "./Starfield";
import Earth from "./Earth_test";
import Sun from "./Sun";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      <Canvas
        camera={{
          position: [0, 0, 300],
          fov: 60,
          near: 1,
          far: 10000,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true,
        }}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight
          position={[-200, 50, -400]}
          intensity={2.0}
          color="#ffffff"
          castShadow
        />
        <Sun />
        <Earth />
        <Starfield />
        <OrbitControls
          enablePan
          enableZoom
          minDistance={0}
          maxDistance={1500}
          enableDamping={false}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}

export default App;
