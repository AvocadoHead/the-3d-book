import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import * as THREE from "three";

export const Experience = () => {
  return (
    <>
      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={1}
        speed={2}
        rotationIntensity={2}
      >
        <Book />
      </Float>
      <OrbitControls />
      <Environment preset="studio" />
      <primitive
        object={new THREE.DirectionalLight(0xffffff, 2.5)}
        position={[2, 5, 2]}
        castShadow
      />
    </>
  );
};
