import React, { useState } from "react";
import { motion } from "framer-motion";
import AdvancedAsteroidControls from "../components/AdvancedAsteroidControls";
import AsteroidControls from "../components/AsteroidControls";

function Predictions() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [predictionData, setPredictionData] = useState(null);

  const handlePredictionUpdate = async (parameters) => {
    try {
      const response = await fetch("http://localhost:5000/api/predict-impact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters),
      });
      const data = await response.json();
      setPredictionData(data);
    } catch (error) {
      console.error("Error updating predictions:", error);
    }
  };

  return (
    <div className="text-white p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Impact Predictions</h1>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            {showAdvanced ? "Simple Controls" : "Advanced Controls"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-zinc-900 p-6 rounded-lg">
            {showAdvanced ? (
              <AdvancedAsteroidControls onUpdate={handlePredictionUpdate} />
            ) : (
              <AsteroidControls onUpdate={handlePredictionUpdate} />
            )}
          </div>

          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Prediction Results</h2>
            {predictionData ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Impact Probability
                  </h3>
                  <div className="relative pt-1">
                    <div className="h-2 bg-gray-700 rounded-full">
                      <div
                        className="h-2 bg-red-500 rounded-full"
                        style={{
                          width: `${predictionData.impactProbability * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="mt-2">
                      {(predictionData.impactProbability * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Potential Impact Effects
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Crater Diameter</p>
                      <p className="text-xl">
                        {predictionData.craterDiameter} km
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Energy Release</p>
                      <p className="text-xl">
                        {predictionData.energyRelease} MT
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Fireball Radius</p>
                      <p className="text-xl">
                        {predictionData.fireballRadius} km
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Tsunami Height</p>
                      <p className="text-xl">
                        {predictionData.tsunamiHeight} m
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Timeline</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p>First Observation:</p>
                      <p>{predictionData.firstObservation}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Predicted Impact:</p>
                      <p>{predictionData.predictedImpact}</p>
                    </div>
                    <div className="flex justify-between">
                      <p>Time Until Impact:</p>
                      <p>{predictionData.timeUntilImpact}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">
                Adjust the parameters to see impact predictions
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Predictions;
