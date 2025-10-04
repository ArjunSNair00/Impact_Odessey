import React, { useMemo } from "react";
import { Points, PointMaterial } from "@react-three/drei";

const Starfield = ({
  count = 50, // number of stars
  spread = 1000, // cube size (distance stars can spread into)
  minSize = 0.5, // minimum star size
  maxSize = 2.5, // maximum star size
  color = "#888888", // star color
}) => {
  // Generate star positions and sizes
  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;

      size[i] = Math.random() * (maxSize - minSize) + minSize;
    }

    return [pos, size];
  }, [count, spread, minSize, maxSize]);

  return (
    <group>
      <Points positions={positions} sizes={sizes}>
        <PointMaterial
          transparent
          color={color}
          size={1}
          sizeAttenuation={false} // keep stable sizes (no flicker)
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

export default Starfield;
