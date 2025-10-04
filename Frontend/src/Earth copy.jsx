import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader, CanvasTexture } from "three";
import earthColor from "./assets/Earth/earth_color_10K.png";

export default function Earth({ radius = 0.5, rotationSpeed = 0.2 }) {
  const earthRef = useRef();

  // Load the original high-res texture
  const colorMapOriginal = useLoader(TextureLoader, earthColor);

  // Downscale texture using a canvas
  const colorMap = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const TARGET_WIDTH = 1920; // Reduce from 10K to 4K
    const TARGET_HEIGHT = 1080;
    // const TARGET_WIDTH = 4096; // Reduce from 10K to 4K
    // const TARGET_HEIGHT = 2048;
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;

    ctx.drawImage(colorMapOriginal.image, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    return new CanvasTexture(canvas);
  }, [colorMapOriginal]);

  // Rotate the Earth
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed;
    }
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={colorMap} />
    </mesh>
  );
}
