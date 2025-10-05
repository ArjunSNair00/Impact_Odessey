import React, { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AsteroidContext } from "../App";

function AsteroidSelector() {
  const { selectedAsteroid, setSelectedAsteroid, asteroids } =
    useContext(AsteroidContext);

  // Set initial asteroid if none selected
  useEffect(() => {
    if (!selectedAsteroid && asteroids?.length > 0) {
      setSelectedAsteroid(asteroids[0]);
    }
  }, [asteroids, selectedAsteroid, setSelectedAsteroid]);

  const handlePrevAsteroid = () => {
    if (!asteroids?.length) return;
    const currentIndex = selectedAsteroid
      ? asteroids.findIndex((ast) => ast.name === selectedAsteroid.name)
      : 0;
    const prevIndex =
      currentIndex > 0 ? currentIndex - 1 : asteroids.length - 1;
    setSelectedAsteroid(asteroids[prevIndex]);
  };

  const handleNextAsteroid = () => {
    if (!asteroids?.length) return;
    const currentIndex = selectedAsteroid
      ? asteroids.findIndex((ast) => ast.name === selectedAsteroid.name)
      : 0;
    const nextIndex =
      currentIndex < asteroids.length - 1 ? currentIndex + 1 : 0;
    setSelectedAsteroid(asteroids[nextIndex]);
  };

  const location = useLocation();

  if (location.pathname !== "/data") return null;

  return (
    <div className="fixed top-5 right-48 z-10 bg-zinc-900/90 p-2 rounded-lg text-white flex items-center shadow-lg">
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrevAsteroid}
          className="bg-blue-500 hover:bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-lg cursor-pointer"
        >
          ←
        </motion.button>

        <select
          value={selectedAsteroid?.name || ""}
          onChange={(e) => {
            const selected = asteroids.find(
              (ast) => ast.name === e.target.value
            );
            setSelectedAsteroid(selected);
          }}
          className="bg-zinc-800 p-1 rounded-lg text-sm w-32"
        >
          <option value="">Select an asteroid</option>
          {asteroids?.map((asteroid) => (
            <option key={asteroid.name} value={asteroid.name}>
              {asteroid.name}
            </option>
          ))}
        </select>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNextAsteroid}
          className="bg-blue-500 hover:bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-lg cursor-pointer"
        >
          →
        </motion.button>
      </div>
    </div>
  );
}

export default AsteroidSelector;
