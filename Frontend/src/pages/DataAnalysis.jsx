import React, { useContext } from "react";
import { motion } from "framer-motion";
import AsteroidSelector from "../components/AsteroidSelector";
import ImpactRiskVisualization from "../components/ImpactRiskVisualization";
import { AsteroidContext } from "../App";

function DataAnalysis() {
  const { selectedAsteroid, loading, error } = useContext(AsteroidContext);

  if (loading) {
    return (
      <div className="text-white pt-24 px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-8 h-8 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
          <p className="text-xl">Loading asteroid data...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white pt-24 px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-900/90 p-6 rounded-lg"
        >
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  if (!selectedAsteroid) {
    return (
      <div className="text-white pt-24 px-8 max-w-7xl mx-auto">
        <AsteroidSelector />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-6">Asteroid Analysis</h1>
          <div className="bg-zinc-900/90 p-6 rounded-lg">
            <p className="text-xl">
              No asteroid selected. Click on an asteroid in the simulation to
              view its data.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="text-white pt-24 px-8 max-w-7xl mx-auto">
      <AsteroidSelector />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-6">
          Asteroid Analysis: {selectedAsteroid.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900/90 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Orbital Parameters</h2>
            <div className="space-y-4">
              {/* Basic Orbital Elements */}
              <div className="group relative cursor-help">
                <p className="text-gray-400">Semi-Major Axis</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.semi_major_axis?.toFixed(2) || "N/A"}{" "}
                  AU
                </p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-sm rounded-md absolute z-50 p-2 pointer-events-none bottom-full left-0 w-64">
                  The average distance between the asteroid and the Sun, half of
                  the major axis of its elliptical orbit.
                </div>
              </div>
              <div>
                <p className="text-gray-400">Eccentricity</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.eccentricity?.toFixed(3) || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Inclination</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.inclination?.toFixed(2) || "N/A"}°
                </p>
              </div>
              <div>
                <p className="text-gray-400">Ascending Node</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.ascending_node?.toFixed(2) || "N/A"}°
                </p>
              </div>
              <div>
                <p className="text-gray-400">Perihelion Argument</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.perihelion_argument?.toFixed(2) ||
                    "N/A"}
                  °
                </p>
              </div>
              <div>
                <p className="text-gray-400">Mean Anomaly</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.mean_anomaly?.toFixed(2) || "N/A"}°
                </p>
              </div>

              {/* Additional Orbital Elements */}
              <div>
                <p className="text-gray-400">Perihelion Distance</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.perihelion_distance?.toFixed(3) ||
                    "N/A"}{" "}
                  AU
                </p>
              </div>
              <div>
                <p className="text-gray-400">Aphelion Distance</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.aphelion_distance?.toFixed(3) ||
                    "N/A"}{" "}
                  AU
                </p>
              </div>
              <div>
                <p className="text-gray-400">Orbital Period</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.orbital_period?.toFixed(2) || "N/A"}{" "}
                  years
                </p>
              </div>
              <div>
                <p className="text-gray-400">Mean Motion</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.mean_motion?.toFixed(4) || "N/A"}{" "}
                  deg/day
                </p>
              </div>

              {/* Physical Parameters */}
              <div>
                <p className="text-gray-400">Diameter</p>
                <p className="text-xl">
                  {selectedAsteroid.diameter?.toFixed(2) || "N/A"} km
                </p>
              </div>
              <div>
                <p className="text-gray-400">Velocity</p>
                <p className="text-xl">
                  {selectedAsteroid.velocity?.toFixed(2) || "N/A"} km/s
                </p>
              </div>

              {/* Orbit Details */}
              <div>
                <p className="text-gray-400">Orbit Class</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.orbit_class?.type || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedAsteroid.orbit?.orbit_class?.description || ""}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Orbit Determination Date</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.orbit_determination_date || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Observations Used</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.observations_used || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Data Arc Length</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.data_arc_in_days
                    ? `${selectedAsteroid.orbit.data_arc_in_days.toFixed(
                        0
                      )} days`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Miss Distance</p>
                <p className="text-xl">
                  {selectedAsteroid.miss_distance?.toFixed(0) || "N/A"} km
                </p>
              </div>

              {/* Additional Orbital Elements */}
              <div>
                <p className="text-gray-400">Perihelion Distance</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.perihelion_distance?.toFixed(3) ||
                    "N/A"}{" "}
                  AU
                </p>
              </div>
              <div>
                <p className="text-gray-400">Aphelion Distance</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.aphelion_distance?.toFixed(3) ||
                    "N/A"}{" "}
                  AU
                </p>
              </div>
              <div>
                <p className="text-gray-400">Orbital Period</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.orbital_period
                    ? `${selectedAsteroid.orbit.orbital_period.toFixed(
                        1
                      )} days (${(
                        selectedAsteroid.orbit.orbital_period / 365.25
                      ).toFixed(2)} years)`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Mean Motion</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.mean_motion?.toFixed(3) || "N/A"}{" "}
                  deg/day
                </p>
              </div>

              {/* Orbit Analysis */}
              <div>
                <p className="text-gray-400">Minimum Orbit Intersection</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.minimum_orbit_intersection?.toFixed(
                    6
                  ) || "N/A"}{" "}
                  AU
                </p>
              </div>
              <div>
                <p className="text-gray-400">Jupiter Tisserand Invariant</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.jupiter_tisserand_invariant?.toFixed(
                    3
                  ) || "N/A"}
                </p>
              </div>

              {/* Classification & Quality */}
              <div>
                <p className="text-gray-400">Orbit Class</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.orbit_class?.type || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Orbit Uncertainty</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.orbit_uncertainty || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Observations Used</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.observations_used || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Data Arc</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.data_arc_in_days
                    ? `${selectedAsteroid.orbit.data_arc_in_days} days`
                    : "N/A"}
                </p>
              </div>

              {/* Status Info */}
              <div>
                <p className="text-gray-400">Potentially Hazardous</p>
                <p className="text-xl">
                  {selectedAsteroid.is_potentially_hazardous ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Close Approach Date</p>
                <p className="text-xl">
                  {selectedAsteroid.close_approach_date || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/90 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              Impact Risk Analysis
            </h2>
            <ImpactRiskVisualization asteroidData={selectedAsteroid} />
          </div>

          <div className="bg-zinc-900/90 p-6 rounded-lg md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">
              Orbital Characteristics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-gray-400">Ascending Node</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.ascending_node
                    ? (
                        (selectedAsteroid.orbit.ascending_node * 180) /
                        Math.PI
                      ).toFixed(2)
                    : "N/A"}
                  °
                </p>
              </div>
              <div>
                <p className="text-gray-400">Argument of Periapsis</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.perihelion_argument
                    ? (
                        (selectedAsteroid.orbit.perihelion_argument * 180) /
                        Math.PI
                      ).toFixed(2)
                    : "N/A"}
                  °
                </p>
              </div>
              <div>
                <p className="text-gray-400">Orbital Speed</p>
                <p className="text-xl">
                  {selectedAsteroid.velocity?.toFixed(2) || "N/A"} km/s
                </p>
              </div>
              <div>
                <p className="text-gray-400">Orbital Period</p>
                <p className="text-xl">
                  {selectedAsteroid.orbit?.semi_major_axis
                    ? (
                        2 *
                        Math.PI *
                        Math.sqrt(
                          Math.pow(selectedAsteroid.orbit.semi_major_axis, 3)
                        )
                      ).toFixed(2)
                    : "N/A"}{" "}
                  years
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DataAnalysis;
