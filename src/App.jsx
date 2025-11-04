import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './components/Experience';

export default function App() {
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.2, 3.2], fov: 45 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#f4f5f7', 1);
          gl.setPixelRatio(Math.min(2, window.devicePixelRatio));
        }}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      {/* Optional: nice loading bar for suspense assets */}
      <Loader />
    </>
  );
}
