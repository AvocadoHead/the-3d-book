import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import { useFrame, useThree } from "@react-three/fiber";
import { useState, useEffect } from "react";
import { Html } from "@react-three/drei";

export const Experience = () => {
  const { camera, controls } = useThree();
  const [isFullView, setIsFullView] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: -5, z: 5 });
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    camera.up.set(0, 0, 1);
    camera.updateProjectionMatrix();
  }, [camera]);

  // Smooth camera animation
  useFrame(() => {
    if (camera.position) {
      camera.position.x += (targetPosition.x - camera.position.x) * 0.05;
      camera.position.y += (targetPosition.y - camera.position.y) * 0.05;
      camera.position.z += (targetPosition.z - camera.position.z) * 0.05;
    }
  });

  const toggleFullView = () => {
    if (!isFullView) {
      // Full view: zoom in, upright position
      setTargetPosition({ x: 0, y: -2, z: 3 });
      setIsFullView(true);
    } else {
      // Normal view
      setTargetPosition({ x: 0, y: -5, z: 5 });
      setIsFullView(false);
    }
  };

  return (
    <>
      {/* Full View Button */}
      <Html position={[0, 2.5, 0]} center>
        <button
          onClick={toggleFullView}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: isFullView ? '#ff6b6b' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}          
        >
          {isFullView ? '← Exit Full View' : '🔍 Full View'}
        </button>
      </Html>

      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={1}
        speed={2}
        rotationIntensity={2}
      >
        <Book />
      </Float>
      <OrbitControls />
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
