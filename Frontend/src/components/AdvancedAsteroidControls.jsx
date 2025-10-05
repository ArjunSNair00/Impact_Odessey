import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiPlay, HiPause, HiRewind, HiFastForward } from "react-icons/hi";

const AdvancedAsteroidControls = ({
  showLabels,
  onToggleLabels,
  scale,
  onScaleChange,
  simulationSpeed,
  onSpeedChange,
  isPaused,
  onPlayPause,
  onReset,
  currentDate,
  onDateChange,
  showOrbits,
  onToggleOrbits,
  selectedAsteroid,
  riskAssessment,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRiskPanel, setShowRiskPanel] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRiskColor = (torinoScale) => {
    const colors = {
      0: "text-green-500",
      1: "text-yellow-500",
      2: "text-yellow-600",
      3: "text-orange-500",
      4: "text-orange-600",
      5: "text-red-500",
      6: "text-red-600",
      7: "text-red-700",
      8: "text-red-800",
      9: "text-red-900",
      10: "text-purple-600",
    };
    return colors[torinoScale] || "text-white";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute right-5 top-24 bg-zinc-900/90 p-4 rounded-lg text-white max-w-md"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Asteroid Controls</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {isExpanded ? "Simple View" : "Advanced View"}
        </button>
      </div>

      <div className="space-y-4">
        {/* Basic Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="mr-4">Show Labels</label>
            <button
              onClick={onToggleLabels}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                showLabels ? "bg-blue-600" : "bg-gray-600"
              } relative`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-200 ${
                  showLabels ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="mr-4">Show Orbits</label>
            <button
              onClick={onToggleOrbits}
              className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                showOrbits ? "bg-blue-600" : "bg-gray-600"
              } relative`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-200 ${
                  showOrbits ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block mb-2">Scale</label>
            <input
              type="range"
              min="-7"
              max="-3"
              step="0.5"
              value={Math.log10(scale)}
              onChange={(e) => onScaleChange(Math.pow(10, e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-300 mt-1">
              Scale: {scale.toExponential(2)}
            </div>
          </div>
        </div>

        {/* Advanced Controls */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 pt-4 border-t border-gray-700"
          >
            {/* Time Controls */}
            <div className="space-y-2">
              <label className="block">Simulation Time</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onSpeedChange(simulationSpeed / 2)}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  <HiRewind />
                </button>
                <button
                  onClick={onPlayPause}
                  className="p-2 bg-blue-600 rounded hover:bg-blue-500"
                >
                  {isPaused ? <HiPlay /> : <HiPause />}
                </button>
                <button
                  onClick={() => onSpeedChange(simulationSpeed * 2)}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  <HiFastForward />
                </button>
                <button
                  onClick={onReset}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
                >
                  Reset
                </button>
              </div>
              <input
                type="datetime-local"
                value={currentDate.toISOString().slice(0, 16)}
                onChange={(e) => onDateChange(new Date(e.target.value))}
                className="w-full bg-gray-800 text-white p-2 rounded"
              />
              <div className="text-sm text-gray-300">
                Simulation Speed: {simulationSpeed}x
              </div>
            </div>

            {/* Risk Assessment Panel */}
            {selectedAsteroid && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-gray-800 rounded"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">{selectedAsteroid.name}</h4>
                  <button
                    onClick={() => setShowRiskPanel(!showRiskPanel)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    {showRiskPanel ? "Hide Details" : "Show Details"}
                  </button>
                </div>

                {showRiskPanel && riskAssessment && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    className="mt-2 space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Torino Scale:</div>
                      <div
                        className={getRiskColor(riskAssessment.torino_scale)}
                      >
                        {riskAssessment.torino_scale}
                      </div>
                      <div>Impact Probability:</div>
                      <div>
                        {(riskAssessment.impact_probability * 100).toFixed(6)}%
                      </div>
                      {riskAssessment.impact_effects && (
                        <>
                          <div>Impact Energy:</div>
                          <div>
                            {riskAssessment.impact_effects.energy_megatons.toFixed(
                              1
                            )}{" "}
                            MT
                          </div>
                          <div>Crater Diameter:</div>
                          <div>
                            {riskAssessment.impact_effects.crater_diameter_km.toFixed(
                              1
                            )}{" "}
                            km
                          </div>
                          <div>Destruction Radius:</div>
                          <div>
                            {riskAssessment.impact_effects.destruction_radius_km.toFixed(
                              1
                            )}{" "}
                            km
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AdvancedAsteroidControls;
