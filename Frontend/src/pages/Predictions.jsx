import React, { useState } from "react";
import { motion } from "framer-motion";
import AdvancedAsteroidControls from "../components/AdvancedAsteroidControls";
import PredictionAsteroidControls from "../components/PredictionAsteroidControls";

function Predictions() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [predictionData, setPredictionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredictionUpdate = async (parameters) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/predict-impact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      setPredictionData(data);
    } catch (error) {
      console.error("Error updating predictions:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
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
            <PredictionAsteroidControls onUpdate={handlePredictionUpdate} />
          </div>

          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Prediction Results</h2>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Calculating predictions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-2">⚠️</div>
                <p className="text-red-500">{error}</p>
              </div>
            ) : predictionData ? (
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
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">
                        Crater Diameter
                      </p>
                      <p className="text-xl font-medium">
                        {predictionData.crater_diameter
                          ? `${predictionData.crater_diameter.toFixed(2)} km`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">
                        Energy Release
                      </p>
                      <p className="text-xl font-medium">
                        {predictionData.energy_release
                          ? `${predictionData.energy_release.toFixed(2)} MT`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">
                        Fireball Radius
                      </p>
                      <p className="text-xl font-medium">
                        {predictionData.fireball_radius
                          ? `${predictionData.fireball_radius.toFixed(2)} km`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm mb-1">
                        Tsunami Height
                      </p>
                      <p className="text-xl font-medium">
                        {predictionData.tsunami_height
                          ? `${predictionData.tsunami_height.toFixed(2)} m`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Timeline</h3>
                  <div className="space-y-2 bg-zinc-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center py-2 border-b border-zinc-700">
                      <p className="text-gray-400">First Observation:</p>
                      <p className="font-medium">
                        {predictionData.first_observation || "N/A"}
                      </p>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-zinc-700">
                      <p className="text-gray-400">Predicted Impact:</p>
                      <p className="font-medium">
                        {predictionData.predicted_impact || "N/A"}
                      </p>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <p className="text-gray-400">Time Until Impact:</p>
                      <p className="font-medium">
                        {predictionData.time_until_impact || "N/A"}
                      </p>
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
