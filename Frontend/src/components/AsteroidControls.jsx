import React from "react";
import { motion } from "framer-motion";

const AsteroidControls = ({
  showLabels = false,
  onToggleLabels = () => {},
  scale = 1e-5,
  onScaleChange = () => {},
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute right-5 top-24 bg-zinc-900/80 p-4 rounded-lg text-white"
    >
      <h3 className="text-lg font-semibold mb-4">Asteroid Controls</h3>

      <div className="space-y-4">
        {/* Labels Toggle */}
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

        {/* Scale Slider */}
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
    </motion.div>
  );
};

export default AsteroidControls;
