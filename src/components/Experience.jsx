import { useAtom } from 'jotai';
import { editModeAtom } from './UI';
import { Environment, Float, OrbitControls } from "@react-three/drei";
import { EffectComposer, DepthOfField } from '@react-three/postprocessing';
import { Book } from "./Book";
import { FloatingEditorPage } from './FloatingEditorPage';

export const Experience = () => {
  const [isEditing, setIsEditing] = useAtom(editModeAtom);

  return (
    <>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        minDistance={2}
        maxDistance={10}
        target={[0.64, 0, 0]}
      />
      <Float
        position={[0.64, 0, 0]}
        rotation-x={-Math.PI / 4}
        floatIntensity={1}
        speed={2}
        rotationIntensity={2}
      >
        <Book />
      </Float>
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
      {isEditing && (
        <FloatingEditorPage
          onClose={() => setIsEditing(false)}
          onSave={() => setIsEditing(false)}
        />
      )}
      {isEditing && (
        <EffectComposer>
          <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
        </EffectComposer>
      )}
    </>
  );
};
