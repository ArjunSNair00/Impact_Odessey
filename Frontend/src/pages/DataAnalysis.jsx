import React, { useContext } from "react";
import { motion } from "framer-motion";
import ImpactRiskVisualization from "../components/ImpactRiskVisualization";
import { AsteroidContext } from "../App";

function DataAnalysis() {
  const { selectedAsteroid } = useContext(AsteroidContext);

  if (!selectedAsteroid) {
    return (
      <div className="text-white p-8 max-w-7xl mx-auto">
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
    <div className="text-white p-8 max-w-7xl mx-auto">
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
              <div>
                <p className="text-gray-400">Semi-Major Axis</p>
                <p className="text-xl">
                  {selectedAsteroid.semiMajorAxis.toFixed(2)} AU
                </p>
              </div>
              <div>
                <p className="text-gray-400">Eccentricity</p>
                <p className="text-xl">
                  {selectedAsteroid.eccentricity.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Inclination</p>
                <p className="text-xl">
                  {((selectedAsteroid.inclination * 180) / Math.PI).toFixed(2)}°
                </p>
              </div>
              <div>
                <p className="text-gray-400">Size</p>
                <p className="text-xl">
                  {(selectedAsteroid.size * 1000).toFixed(0)} meters
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
                  {((selectedAsteroid.ascendingNode * 180) / Math.PI).toFixed(
                    2
                  )}
                  °
                </p>
              </div>
              <div>
                <p className="text-gray-400">Argument of Periapsis</p>
                <p className="text-xl">
                  {((selectedAsteroid.argOfPeriapsis * 180) / Math.PI).toFixed(
                    2
                  )}
                  °
                </p>
              </div>
              <div>
                <p className="text-gray-400">Orbital Speed</p>
                <p className="text-xl">
                  {selectedAsteroid.speed.toFixed(2)} km/s
                </p>
              </div>
              <div>
                <p className="text-gray-400">Orbital Period</p>
                <p className="text-xl">
                  {(
                    2 *
                    Math.PI *
                    Math.sqrt(Math.pow(selectedAsteroid.semiMajorAxis, 3))
                  ).toFixed(2)}{" "}
                  years
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  fetchOrbitData();
  return (
    <div className="text-white p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-6">Real-Time Analysis</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-900 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">
                Orbital Parameters
              </h2>
              {orbitData && (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400">Semi-Major Axis</p>
                    <p className="text-xl">{orbitData.semiMajorAxis} AU</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Eccentricity</p>
                    <p className="text-xl">{orbitData.eccentricity}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Inclination</p>
                    <p className="text-xl">{orbitData.inclination}°</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Closest Approach</p>
                    <p className="text-xl">{orbitData.closestApproach} km</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">
                Impact Risk Analysis
              </h2>
              <ImpactRiskVisualization />
            </div>

            <div className="bg-zinc-900 p-6 rounded-lg md:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">
                Physical Characteristics
              </h2>
              {orbitData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-gray-400">Estimated Diameter</p>
                    <p className="text-xl">{orbitData.diameter} meters</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Mass</p>
                    <p className="text-xl">{orbitData.mass} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Velocity</p>
                    <p className="text-xl">{orbitData.velocity} km/s</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Composition</p>
                    <p className="text-xl">{orbitData.composition}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default DataAnalysis;
