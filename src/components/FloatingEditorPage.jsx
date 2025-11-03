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

    // Add a white background rectangle to show page boundaries
    const bgRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: 600,
      height: 900,
      fill: '#ffffff',
      selectable: false,
      evented: false,
    });
    fabricCanvas.add(bgRect);
    fabricCanvas.sendToBack(bgRect);

    fabricCanvasRef.current = fabricCanvas;

    // Update texture when canvas changes
    const updateTexture = () => {
      const dataURL = fabricCanvas.toDataURL();
      const loader = new THREE.TextureLoader();
      loader.load(dataURL, (tex) => {
        setTexture(tex);
      });
    };

    fabricCanvas.on('object:modified', updateTexture);
    fabricCanvas.on('object:added', updateTexture);
    fabricCanvas.on('object:removed', updateTexture);

    updateTexture();

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  const addText = () => {
    if (!fabricCanvasRef.current) return;
    const text = new fabric.Textbox('הוסף טקסט כאן', {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
  };

  const addImage = () => {
    if (!fabricCanvasRef.current) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        fabric.FabricImage.fromURL(event.target.result).then((img) => {
          img.scaleToWidth(200);
          img.set({ left: 100, top: 100 });
          fabricCanvasRef.current.add(img);
          fabricCanvasRef.current.setActiveObject(img);
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSave = () => {
    if (fabricCanvasRef.current && onSave) {
      const dataURL = fabricCanvasRef.current.toDataURL();
      onSave(dataURL);
    }
    handleClose();
  };

  const handleClear = () => {
    if (fabricCanvasRef.current) {
      const objects = fabricCanvasRef.current.getObjects();
      objects.forEach((obj) => {
        if (obj.selectable !== false) {
          fabricCanvasRef.current.remove(obj);
        }
      });
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <group position={position}>
      {/* Editor Plane with visible canvas */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[3, 4.5]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Canvas positioned on the 3D plane - now visible and interactive */}
      <Html
        position={[0, 0, 0.01]}
        transform
        occlude={false}
        style={{
          pointerEvents: 'auto',
          width: '600px',
          height: '900px',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            border: '2px solid #ddd',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            background: 'white',
          }}
        />
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
