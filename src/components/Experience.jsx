import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export const Experience = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
  }, [camera]);

  return (
    <>
      <Float
        rotation-x={-Math.PI / 8}
        floatIntensity={0.5}
        speed={1.5}
        rotationIntensity={0.5}
      >
        <Book />
      </Float>
      <OrbitControls 
        enableDamping={true}
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 4}
        target={[0, 0, 0]}
      />
      <Environment preset="studio"></Environment>
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
