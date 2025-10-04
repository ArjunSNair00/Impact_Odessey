import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Starfield from "./Starfield";
import Earth from "./Earth";
import Nav from "./components/Nav";

function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        position: "relative",
      }}
    >
      <div className="flex">
        <div className="flex justify-center items-center">
          <img
            src="/icons/logo.png"
            className="h-20 absolute top-5 left-5"
          ></img>
          <h1 className="absolute top-10 left-30 text-4xl font-bold">
            IMPACT ODYSSEY
          </h1>
        </div>
        <Nav />
      </div>
      <div className="flex top-10 left-30 items-center h-screen z-50 absolute">
        <button className="bg-blue-950 p-5 text-3xl rounded-xl mb-30 hover:bg-blue-800 transition-all select-none">
          START MISSION
        </button>
      </div>
      <div className="flex absolute h-screen bottom-20 items-end justify-evenly w-screen">
        <div className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center pb-5 rounded-xl z-10 pop hover:cursor-pointer select-none hover:bg-zinc-700 hover:scale-110 transition-all duration-200">
          <img src="/icons/analysis.png" className="h-20 w-20 mb-4"></img>
          REAL TIME DATA
        </div>
        <div className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center pb-5 rounded-xl z-10 pop hover:cursor-pointer select-none">
          <img src="/icons/comet1.png" className="h-20 w-20 mb-4"></img>
          IMPACT PREDICTIONS
        </div>
        <div className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center pb-5 rounded-xl z-10 pop hover:cursor-pointer select-none">
          <img src="/icons/simulation.png" className="h-20 w-20 mb-4"></img>
          INTERACTIVE SIMULATIONS
        </div>
        <div className="flex flex-col text-center items-center bg-zinc-600 font-bold h-40 w-36 justify-center pb-5 rounded-xl z-10 pop hover:cursor-pointer select-none">
          <img src="/icons/coding.png" className="h-20 w-20 mb-4"></img>
          LEARN MORE
        </div>
      </div>

      <Canvas
        camera={{
          position: [0, 0, 2],
          fov: 45,
          near: 0.01,
          far: 10000,
        }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight
          position={[-200, 50, 0]}
          intensity={2.0}
          color="#ffffff"
          castShadow
        />
        <Earth />
        <Starfield />
        <OrbitControls
          enablePan
          enableZoom
          minDistance={0}
          maxDistance={800}
          enableDamping={false}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}

export default App;
