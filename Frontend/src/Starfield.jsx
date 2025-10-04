import React, { useMemo } from "react";
import { Points, PointMaterial } from "@react-three/drei";
import Earth from "./Earth";

const Starfield = ({
  count = 3000, // Significantly reduced for performance
  spread = 1500,
  minSize = 0.1,
  maxSize = 0.3,
  color = "#aaaaaa",
}) => {
  // Generate star positions
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * spread;
    }
    return pos;
  }, [count, spread]);

  return (
    <group>
      <Points positions={positions}>
        <PointMaterial
          transparent
          color={color}
          size={Math.random() * (maxSize - minSize) + minSize}
          sizeAttenuation
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

export default Starfield;
