import React, {
  useState,
  useEffect,
  Suspense,
  createContext,
  useContext,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import Starfield from "./Starfield";
import Earth from "./Earth";
import Nav from "./components/Nav";
import Hamburger from "./Hamburger";

// Page Components
import DataAnalysis from "./pages/DataAnalysis";
import Predictions from "./pages/Predictions";
import About from "./pages/About";
import AsteroidSelector from "./components/AsteroidSelector";

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="error-container">
        <h2>Something went wrong with the 3D view.</h2>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  return children;
}

export const AsteroidContext = createContext({});

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedAsteroid, setSelectedAsteroid] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Define asteroid list
  const asteroids = [
    {
      name: "NEO-1",
      semiMajorAxis: 1.5,
      eccentricity: 0.19,
      inclination: 0.12,
      ascendingNode: 0.5,
      argOfPeriapsis: 1.2,
      meanAnomaly: 0,
      size: 0.03,
      speed: 0.5,
    },
    {
      name: "NEO-2",
      semiMajorAxis: 2.0,
      eccentricity: 0.4,
      inclination: 0.35,
      ascendingNode: 2.1,
      argOfPeriapsis: 0.8,
      meanAnomaly: Math.PI,
      size: 0.02,
      speed: 0.3,
    },
    {
      name: "NEO-3",
      semiMajorAxis: 1.8,
      eccentricity: 0.25,
      inclination: 0.785,
      ascendingNode: 1.57,
      argOfPeriapsis: 2.1,
      meanAnomaly: Math.PI / 2,
      size: 0.025,
      speed: 0.4,
    },
    {
      name: "NEO-4",
      semiMajorAxis: 1.8,
      eccentricity: 0.25,
      inclination: 0.785,
      ascendingNode: 1.57,
      argOfPeriapsis: 2.1,
      meanAnomaly: Math.PI / 2,
      size: 0.06,
      speed: 0.4,
    },
  ];
  const [hasWebGL] = useState(() => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  });
  return (
    <AsteroidContext.Provider
      value={{
        selectedAsteroid,
        setSelectedAsteroid,
        asteroids,
        onAsteroidClick: (asteroid) => {
          setSelectedAsteroid(asteroid);
          navigate("/data");
        },
      }}
    >
      <div
        style={{
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          position: "relative",
        }}
      >
        <div className="flex w-full">
          <div className="flex justify-start items-center relative w-full">
            <img
              src="/icons/logo.png"
              className={`h-20 absolute top-5 left-5 z-10 transition-opacity duration-300 ${
                location.pathname === "/" ? "opacity-100" : "opacity-0"
              }`}
              alt="logo"
            />
            <h1
              className={`absolute top-8 left-32 text-4xl font-bold text-white z-10 transition-opacity duration-300 ${
                location.pathname === "/" ? "opacity-100" : "opacity-0"
              }`}
            >
              IMPACT ODYSSEY
            </h1>
          </div>
          <Nav />
        </div>
        <Routes>
          <Route
            path="/"
            element={
              <AnimatePresence mode="wait">
                {!isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute flex w-[500px] left-10 rounded-lg top-32 p-6 bg-zinc-900/90 text-white z-10"
                  >
                    <p className="text-lg leading-relaxed">
                      Meteor Madness is a NASA Space Apps Challenge project that
                      features an interactive simulation and visualization
                      platform. We transform complex NASA/USGS data into
                      accessible 2D/3D models to assess the risk of the
                      hypothetical near-Earth asteroid, Impactor-2025. The tool
                      allows users to run "what-if" scenarios, calculate damage
                      like fireball radius and tsunami size, and evaluate
                      mitigation strategies such as trajectory deflection,
                      empowering informed decision-making for planetary defense.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            }
          />
          <Route path="/data" element={<DataAnalysis />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/simulation"
            element={
              <div className="absolute inset-0 flex items-center justify-center text-white">
                {/* The 3D canvas is already rendered in the parent component */}
                <div className="absolute top-20 left-0 right-0 text-center">
                  <h2 className="text-3xl font-bold mb-4">
                    Interactive Simulation
                  </h2>
                  <p className="text-lg">
                    Use your mouse to rotate and zoom the visualization
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
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
          {isMenuOpen && (
            <Hamburger onClose={() => setIsMenuOpen(!isMenuOpen)} />
          )}
        </AnimatePresence>

        {!hasWebGL ? (
          <div className="webgl-error">
            <h2>WebGL is not available on your browser</h2>
            <p>Please try using a modern browser with WebGL support</p>
          </div>
        ) : (
          <ErrorBoundary>
            <Suspense
              fallback={<div className="loading">Loading 3D view...</div>}
            >
              <Canvas
                camera={{
                  position: [0, 0, 2],
                  fov: 45,
                  near: 0.01,
                  far: 10000,
                }}
                gl={{
                  antialias: false,
                  powerPreference: "high-performance",
                  alpha: false,
                  stencil: false,
                  depth: true,
                  preserveDrawingBuffer: true,
                }}
                onCreated={({ gl }) => {
                  gl.setClearColor("#000000");
                  gl.physicallyCorrectLights = true;
                }}
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
            </Suspense>
          </ErrorBoundary>
        )}
      </div>
    </AsteroidContext.Provider>
  );
}

export default App;
