import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import * as fabric from 'fabric';

export const FloatingEditorPage = ({ onClose, onSave, position = [0, 0, 3] }) => {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  const { camera, controls } = useThree();
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    // Disable orbit controls when editing
    if (controls) {
      controls.enabled = false;
    }

    return () => {
      if (controls) {
        controls.enabled = true;
      }
    };
  }, [controls]);

  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    // Initialize Fabric canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 900,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = fabricCanvas;

    // Create Three.js texture from canvas
    const tex = new THREE.CanvasTexture(canvasRef.current);
    tex.needsUpdate = true;
    setTexture(tex);

    // Update texture on canvas change
    fabricCanvas.on('after:render', () => {
      if (tex) {
        tex.needsUpdate = true;
      }
    });

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    const text = new fabric.IText('הקלד טקסט כאן', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 40,
      fill: '#000000',
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
  };

  const addImage = () => {
    const url = prompt('הדבק קישור לתמונה (Google Drive או URL):');
    if (!url) return;

    let imageUrl = url;
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([^\/]+)/);
      if (fileId) {
        imageUrl = `https://drive.google.com/uc?export=view&id=${fileId[1]}`;
      }
    }

    fabric.Image.fromURL(imageUrl, (img) => {
      img.scaleToWidth(300);
      img.set({ left: 100, top: 100 });
      fabricCanvasRef.current.add(img);
    }, { crossOrigin: 'anonymous' });
  };

  const handleClear = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = '#ffffff';
    fabricCanvasRef.current.renderAll();
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL('image/png');
    onSave(dataURL);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <group position={position}>
      {/* Frosted glass page */}
      <mesh ref={meshRef}>
        <planeGeometry args={[2, 3]} />
        <meshPhysicalMaterial
          map={texture}
          transparent
          opacity={1}
          roughness={0.1}
          metalness={0}
          clearcoat={0.5}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Hidden canvas for Fabric.js */}
      <Html position={[0, 0, -0.01]} center style={{ pointerEvents: 'none', opacity: 0 }}>
        <canvas ref={canvasRef} />
      </Html>

      {/* Toolbar */}
      <Html position={[0, 1.7, 0.01]} center>
        <div className="flex gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
          <button
            onClick={addText}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition text-sm font-medium"
          >
            📝 טקסט
          </button>
          <button
            onClick={addImage}
            className="px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition text-sm font-medium"
          >
            🖼️ תמונה
          </button>
        </div>
      </Html>

      {/* Action Buttons */}
      <Html position={[0, -1.7, 0.01]} center>
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="w-12 h-12 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-all hover:scale-110 flex items-center justify-center text-xl"
            title="נקה הכל"
          >
            🗑️
          </button>
          <button
            onClick={handleCancel}
            className="w-12 h-12 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all hover:scale-110 flex items-center justify-center text-xl"
            title="ביטול"
          >
            ❌
          </button>
          <button
            onClick={handleSave}
            className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center justify-center text-xl"
            title="שמור"
          >
            ✅
          </button>
        </div>
      </Html>
    </group>
  );
};
