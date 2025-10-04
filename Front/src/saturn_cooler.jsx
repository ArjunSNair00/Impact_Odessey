import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { MeshWobbleMaterial, OrbitControls, Stars } from "@react-three/drei";

const speed = 0.3;

const Sphere = ({ position, size, color }) => {
  const ref = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useFrame((state, delta) => {
    const s = isHovered ? 2 : speed;
    ref.current.rotation.y += delta * s;
  });
  return (
    //stopropogation to only affect this sphere
    <mesh
      position={position}
      ref={ref}
      onPointerEnter={(event) => (event.stopPropagation(), setIsHovered(true))}
      onPointerLeave={() => setIsHovered(false)}
      onClick={() => setIsClicked(!isClicked)}
      scale={isClicked ? 1.5 : 1}
    >
      <sphereGeometry args={size} />
      <meshStandardMaterial color={isHovered ? "white" : color} wireframe />
    </mesh>
  );
};

const Torus = ({ position, size, color }) => {
  const ref = useRef();
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * speed;
    ref.current.rotation.z += delta * speed;
    ref.current.rotation.x += delta * speed;
  });

  return (
    <mesh position={position} ref={ref}>
      <torusGeometry args={size} />
      <MeshWobbleMaterial factor={5} color={color} wireframe />
    </mesh>
  );
};

function SaturnCooler() {
  return (
    <>
      <Torus position={[0, 0, 0]} size={[2.3, 0.2, 10, 50]} color={"cyan"} />

      <Sphere position={[0, 0, 0]} size={[1, 30, 20]} color={"red"} />
    </>
  );
}

export default SaturnCooler;
