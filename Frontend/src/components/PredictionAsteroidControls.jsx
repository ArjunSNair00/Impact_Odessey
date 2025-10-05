import React, { useState } from "react";
import { motion } from "framer-motion";

const PredictionAsteroidControls = ({ onUpdate }) => {
  const [parameters, setParameters] = useState({
    velocity: 20, // km/s
    angle: 45, // degrees
    mass: 1000000, // kg
    diameter: 100, // meters
    composition: "iron", // iron, rock, ice
  });

  const handleChange = (name, value) => {
    setParameters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(parameters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Velocity (km/s)
        </label>
        <input
          type="number"
          value={parameters.velocity}
          onChange={(e) => handleChange("velocity", parseFloat(e.target.value))}
          className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white"
          min="1"
          max="100"
          step="0.1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Entry Angle (degrees)
        </label>
        <input
          type="number"
          value={parameters.angle}
          onChange={(e) => handleChange("angle", parseFloat(e.target.value))}
          className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white"
          min="0"
          max="90"
          step="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Mass (kg)</label>
        <input
          type="number"
          value={parameters.mass}
          onChange={(e) => handleChange("mass", parseInt(e.target.value))}
          className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white"
          min="1000"
          max="1000000000"
          step="1000"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Diameter (meters)
        </label>
        <input
          type="number"
          value={parameters.diameter}
          onChange={(e) => handleChange("diameter", parseInt(e.target.value))}
          className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white"
          min="1"
          max="1000"
          step="1"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Composition</label>
        <select
          value={parameters.composition}
          onChange={(e) => handleChange("composition", e.target.value)}
          className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-white"
          required
        >
          <option value="iron">Iron</option>
          <option value="rock">Rock</option>
          <option value="ice">Ice</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
      >
        Calculate Impact
      </button>
    </form>
  );
};

export default PredictionAsteroidControls;
