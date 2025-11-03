import { useAtom } from 'jotai';
import { editModeAtom } from './UI';
import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";
import { FloatingEditorPage } from './FloatingEditorPage';

export const Experience = () => {
  const [isEditing, setIsEditing] = useAtom(editModeAtom);

  return (
    <>
      <group opacity={isEditing ? 0.3 : 1}>
        <Float
          rotation-x={-Math.PI / 4}
          floatIntensity={1}
          speed={2}
          rotationIntensity={2}
        >
          <Book />
        </Float>
      </group>
      <OrbitControls />
      <Environment preset="studio"></Environment>
      <DirectionalLight
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
      {isEditing && (
        <FloatingEditorPage
          onClose={() => setIsEditing(false)}
          onSave={() => setIsEditing(false)}
        />
      )}
    </>
  );
};
