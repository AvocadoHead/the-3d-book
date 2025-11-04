import { useAtom } from 'jotai';
import { editModeAtom } from './UI';
import { Environment, Float, PresentationControls } from "@react-three/drei";
import { EffectComposer, DepthOfField } from '@react-three/postprocessing';
import { Book } from "./Book";
import { FloatingEditorPage } from './FloatingEditorPage';

export const Experience = () => {
  const [isEditing, setIsEditing] = useAtom(editModeAtom);

  return (
    <>
      <PresentationControls
        snap
        config={{ mass: 1, tension: 280, friction: 30 }}
        rotation={[-0.2, 0, 0]}          // base “grounded” tilt
        polar={[-0.25, 0.35]}            // clamp up/down
        azimuth={[-0.6, 0.6]}            // clamp left/right
        cursor
      >
        <Float
          position={[0.64, 0, 0]}
          floatIntensity={0.6}
          speed={1.2}
          rotationIntensity={0}          // don't fight snap-back
        >
          <group castShadow receiveShadow>
            <Book />
          </group>
        </Float>
      </PresentationControls>

      <Environment preset="studio" />

      <directionalLight
        position={[2, 5, 2]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={0.35} />

      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>

      {isEditing && (
        <>
          <FloatingEditorPage
            onClose={() => setIsEditing(false)}
            onSave={() => setIsEditing(false)}
          />
          <EffectComposer>
            <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
          </EffectComposer>
        </>
      )}
    </>
  );
};
