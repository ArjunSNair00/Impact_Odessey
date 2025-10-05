import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import Starfield from "./Starfield";
import Earth from "./Earth";
import Nav from "./components/Nav";
import Hamburger from "./Hamburger";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
            alt="logo"
          />
          <h1 className="absolute top-10 left-30 text-4xl font-bold">
            IMPACT ODYSSEY
          </h1>
        </div>
        <Nav />
      </div>
      <AnimatePresence mode="wait">
        {!isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute flex w-70 left-30 rounded-[6px] top-50 p-4 bg-zinc-900"
          >
            Meteor Madness is a NASA Space Apps Challenge project that features
            an interactive simulation and visualization platform. We transform
            complex NASA/USGS data into accessible 2D/3D models to assess the
            risk of the hypothetical near-Earth asteroid, Impactor-2025. The
            tool allows users to run "what-if" scenarios, calculate damage like
            fireball radius and tsunami size, and evaluate mitigation strategies
            such as trajectory deflection, empowering informed decision-making
            for planetary defense.
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="absolute bottom-5 left-5 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.img
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="h-16 w-16 cursor-pointer"
          src="/icons/hamburger.png"
          alt="menu"
          animate={{ rotate: isMenuOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </motion.div>
      <AnimatePresence mode="wait">
        {isMenuOpen && <Hamburger onClose={() => setIsMenuOpen(!isMenuOpen)} />}
      </AnimatePresence>

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
