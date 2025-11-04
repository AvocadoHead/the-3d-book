import { OrbitControls, Environment } from "@react-three/drei";
import { Book } from "./Book";

export const Experience = () => {
  return (
    <>
      <OrbitControls
        target={[0.64, 0, 0]}
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={0}
        enablePan={false}
      />
      <Environment preset="studio" />
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
      <Book />
    </>
  );
};
