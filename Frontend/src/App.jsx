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
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Normalize asteroid objects into a consistent shape expected by DataAnalysis
  // Effect to fetch asteroids when component mounts
  useEffect(() => {
    fetchAsteroids();
  }, []); // Empty dependency array means this runs once on mount

  const fetchAsteroids = async (retryCount = 0) => {
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      // Try to get from cache first
      const cachedData = localStorage.getItem("asteroidCache");
      const cacheTimestamp = localStorage.getItem("asteroidCacheTimestamp");

      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age < 5 * 60 * 1000) {
          // Cache valid for 5 minutes
          setAsteroids(JSON.parse(cachedData));
          setLoading(false);
          // Fetch in background to update cache
          fetchAsteroids(retryCount).catch(console.error);
          return;
        }
      }

      const response = await fetch(
        "http://localhost:5000/api/asteroids?details=true",
        {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "Cache-Control": "max-age=300", // Cache for 5 minutes
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 503 && retryCount < 3) {
          // Exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchAsteroids(retryCount + 1);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success) {
        const normalized = data.asteroids.map(normalizeAsteroid);
        setAsteroids(normalized);
        // Update cache
        localStorage.setItem("asteroidCache", JSON.stringify(normalized));
        localStorage.setItem("asteroidCacheTimestamp", Date.now().toString());
        if (!selectedAsteroid && normalized.length > 0) {
          setSelectedAsteroid(normalized[0]);
        }
      } else {
        throw new Error(data.error || "Failed to fetch asteroid data");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setError(
          "Request is taking longer than expected. The server might be busy. Please try again in a moment."
        );
      } else {
        setError(
          "Unable to fetch asteroid data. Please check your internet connection and try again."
        );
        console.error("Error fetching asteroid data:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const normalizeAsteroid = (ast) => {
    // ast may come from backend (has orbit, diameter, velocity...) or from local example (semiMajorAxis...)
    const orbit = ast.orbit || {};

    // Basic orbital elements (with backward compatibility and null/undefined handling)
    const semi_major_axis =
      orbit.semi_major_axis !== null && orbit.semi_major_axis !== undefined
        ? Number(orbit.semi_major_axis)
        : ast.semiMajorAxis !== null && ast.semiMajorAxis !== undefined
        ? Number(ast.semiMajorAxis)
        : undefined;

    const eccentricity =
      orbit.eccentricity !== null && orbit.eccentricity !== undefined
        ? Number(orbit.eccentricity)
        : ast.eccentricity !== null && ast.eccentricity !== undefined
        ? Number(ast.eccentricity)
        : undefined;

    const inclination = orbit.inclination
      ? Number(orbit.inclination)
      : ast.inclination
      ? Number(ast.inclination)
      : undefined;

    const ascending_node = orbit.ascending_node
      ? Number(orbit.ascending_node)
      : ast.ascendingNode
      ? Number(ast.ascendingNode)
      : undefined;

    const perihelion_argument = orbit.perihelion_argument
      ? Number(orbit.perihelion_argument)
      : ast.argOfPeriapsis
      ? Number(ast.argOfPeriapsis)
      : undefined;

    const mean_anomaly = orbit.mean_anomaly
      ? Number(orbit.mean_anomaly)
      : ast.meanAnomaly
      ? Number(ast.meanAnomaly)
      : undefined;

    // Additional orbital elements from NASA API
    const epoch_osculation = orbit.epoch_osculation || ast.epoch || null;
    const perihelion_distance = orbit.perihelion_distance
      ? Number(orbit.perihelion_distance)
      : undefined;
    const aphelion_distance = orbit.aphelion_distance
      ? Number(orbit.aphelion_distance)
      : undefined;
    // Calculate orbital period using Kepler's Third Law if we have semi-major axis
    const orbital_period = semi_major_axis
      ? Math.sqrt(Math.pow(semi_major_axis, 3)) * 365.25 // Convert to days
      : orbit.orbital_period
      ? Number(orbit.orbital_period)
      : undefined;
    const perihelion_time = orbit.perihelion_time
      ? Number(orbit.perihelion_time)
      : undefined;
    const mean_motion = orbit.mean_motion
      ? Number(orbit.mean_motion)
      : undefined;
    const orbit_uncertainty = orbit.orbit_uncertainty || null;
    const minimum_orbit_intersection = orbit.minimum_orbit_intersection
      ? Number(orbit.minimum_orbit_intersection)
      : undefined;
    const jupiter_tisserand_invariant = orbit.jupiter_tisserand_invariant
      ? Number(orbit.jupiter_tisserand_invariant)
      : undefined;
    const epoch_close_approach = orbit.epoch_close_approach || null;
    const orbit_determination_date = orbit.orbit_determination_date || null;
    const observations_used = orbit.observations_used
      ? Number(orbit.observations_used)
      : undefined;
    const data_arc_in_days = orbit.data_arc_in_days
      ? Number(orbit.data_arc_in_days)
      : undefined;
    const orbit_class = {
      type: orbit.orbit_class_type || null,
      description: orbit.orbit_class_description || null,
      range: orbit.orbit_class_range || null,
    };

    const diameter = ast.diameter
      ? Number(ast.diameter)
      : ast.size
      ? Number(ast.size)
      : undefined;
    const velocity = ast.velocity
      ? Number(ast.velocity)
      : ast.speed
      ? Number(ast.speed)
      : undefined;
    const miss_distance = ast.miss_distance
      ? Number(ast.miss_distance)
      : undefined;

    return {
      id: ast.id || ast.name || Math.random().toString(36).slice(2, 9),
      name: ast.name || ast.id || "Unknown",
      diameter,
      velocity,
      miss_distance,
      is_potentially_hazardous:
        ast.is_potentially_hazardous ?? ast.isPotentiallyHazardous ?? false,
      close_approach_date:
        ast.close_approach_date || ast.closeApproachDate || null,
      orbit: {
        // Basic orbital elements
        semi_major_axis,
        eccentricity,
        inclination,
        ascending_node,
        perihelion_argument,
        mean_anomaly,
        epoch_osculation,
        perihelion_distance,
        aphelion_distance,
        orbital_period,
        // Additional orbital elements
        perihelion_time,
        mean_motion,
        orbit_uncertainty,
        minimum_orbit_intersection,
        jupiter_tisserand_invariant,
        epoch_close_approach,
        orbit_determination_date,
        observations_used,
        data_arc_in_days,
        orbit_class,
      },
      // keep original raw fields for debugging
      __raw: ast,
    };
  };

  useEffect(() => {
    const fetchAsteroids = async () => {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(
          "http://localhost:5000/api/asteroids?details=true",
          {
            signal: controller.signal,
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error("Failed to fetch asteroid data");
        }
        const data = await response.json();
        if (data.success) {
          const normalized = data.asteroids.map(normalizeAsteroid);
          setAsteroids(normalized);
          if (!selectedAsteroid && normalized.length > 0) {
            setSelectedAsteroid(normalized[0]);
          }
        } else {
          throw new Error(data.error || "Failed to fetch asteroid data");
        }
      } catch (err) {
        if (err.name === "AbortError") {
          setError("Request timed out. Please try again.");
        } else {
          setError(err.message || "Failed to fetch asteroid data");
          console.error("Error fetching asteroid data:", err);
          // Log additional details to help debug data issues
          console.debug("Response details:", {
            status: err.status,
            statusText: err.statusText,
            message: err.message,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAsteroids();
  }, []);

  const location = useLocation();
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
        loading,
        error,
        onAsteroidClick: (asteroid) => {
          const normalized = normalizeAsteroid(asteroid);
          setSelectedAsteroid(normalized);
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
                      Impact Odyssey is a NASA Space Apps Challenge project that
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
                  position: [0, 0, 7],
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
                <Earth
                  asteroids={asteroids}
                  selectedAsteroid={selectedAsteroid}
                />
                {/* pass fetched asteroids and selection into Earth for 3D simulation */}
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
