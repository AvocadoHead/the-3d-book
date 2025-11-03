import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const FloatingEditorPage = ({ onClose, onSave, position = [0, 0, 2] }) => {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  const { camera, controls } = useThree();

  // Create a canvas texture for the page
  const canvasRef = useRef(document.createElement('canvas'));
  
  useState(() => {
    const canvas = canvasRef.current;
    canvas.width = 1325;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    
    // Initial white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    setTexture(tex);
  });

  // Disable camera controls when editing
  useFrame(() => {
    if (controls) {
      controls.enabled = false;
    }
  });

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (texture) {
      texture.needsUpdate = true;
    }
  };

  const handleSave = () => {
    const dataURL = canvasRef.current.toDataURL('image/png');
    onSave(dataURL);
    if (controls) controls.enabled = true;
  };

  const handleCancel = () => {
    onClose();
    if (controls) controls.enabled = true;
  };

  return (
    <group position={position}>
      {/* Frosted glass page */}
      <mesh ref={meshRef}>
        <planeGeometry args={[1.28, 1.71]} />
        <meshPhysicalMaterial
          map={texture}
          transparent
          opacity={0.95}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Editor UI Overlay */}
      <Html
        position={[0, 0, 0.01]}
        transform
        occlude
        style={{
          width: '800px',
          height: '1200px',
          pointerEvents: 'auto',
        }}
      >
        <div className="w-full h-full bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-8">
          <div className="text-center text-white text-2xl font-bold mb-4">
            עריכת עמוד
          </div>
          <div className="text-center text-white/70 text-sm">
            לחץ כאן כדי להוסיף תוכן
          </div>
        </div>
      </Html>

      {/* Action Buttons */}
      <Html position={[-0.8, -1, 0.01]}>
        <div className="flex gap-4">
          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="w-14 h-14 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-all hover:scale-110 flex items-center justify-center text-xl"
            title="נקה הכל"
          >
            🗑️
          </button>
          
          {/* Cancel Button */}
          <button
            onClick={handleCancel}
            className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110 flex items-center justify-center text-xl"
            title="ביטול"
          >
            ❌
          </button>
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center justify-center text-xl"
            title="שמור"
          >
            ✅
          </button>
        </div>
      </Html>
    </group>
  );
};
