import { useRef, useState, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';
import { createVideoMetadata, loadVideoThumbnail } from '@/utils/videoHelpers';

const PAGE_DIMENSIONS = {
  width: 1325,
  height: 1771,
};

export const EditorCanvas = ({ initialData, onSave, onClose }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: PAGE_DIMENSIONS.width,
      height: PAGE_DIMENSIONS.height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Load initial data if provided
    if (initialData?.fabricJSON) {
      canvas.loadFromJSON(initialData.fabricJSON, () => {
        canvas.renderAll();
      });
    }

    // Selection events
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // History tracking
    canvas.on('object:added', saveHistory);
    canvas.on('object:modified', saveHistory);
    canvas.on('object:removed', saveHistory);

    return () => {
      canvas.dispose();
    };
  }, []);

  const saveHistory = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const json = fabricCanvasRef.current.toJSON(['videoMetadata', 'isVideo']);
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      return [...newHistory, json];
    });
    setHistoryStep(prev => prev + 1);
  }, [historyStep]);

  const undo = useCallback(() => {
    if (historyStep > 0 && fabricCanvasRef.current) {
      const prevState = history[historyStep - 1];
      fabricCanvasRef.current.loadFromJSON(prevState, () => {
        fabricCanvasRef.current.renderAll();
        setHistoryStep(prev => prev - 1);
      });
    }
  }, [history, historyStep]);

  const redo = useCallback(() => {
    if (historyStep < history.length - 1 && fabricCanvasRef.current) {
      const nextState = history[historyStep + 1];
      fabricCanvasRef.current.loadFromJSON(nextState, () => {
        fabricCanvasRef.current.renderAll();
        setHistoryStep(prev => prev + 1);
      });
    }
  }, [history, historyStep]);

  // Add text
  const addText = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    const text = new fabric.IText('הקלד טקסט כאן', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 60,
      fill: '#000000',
      textAlign: 'right',
      direction: 'rtl',
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
    setStatus('טקסט נוסף');
    setTimeout(() => setStatus(''), 2000);
  }, []);

  // Add image from file
  const addImageFromFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsLoading(true);
      setStatus('טוען תמונה...');

      const reader = new FileReader();
      reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, (img) => {
          // Scale to fit if too large
          const maxWidth = PAGE_DIMENSIONS.width * 0.8;
          const maxHeight = PAGE_DIMENSIONS.height * 0.8;
          
          if (img.width > maxWidth) {
            img.scaleToWidth(maxWidth);
          }
          if (img.height > maxHeight) {
            img.scaleToHeight(maxHeight);
          }

          img.set({
            left: PAGE_DIMENSIONS.width / 2 - (img.width * img.scaleX) / 2,
            top: PAGE_DIMENSIONS.height / 2 - (img.height * img.scaleY) / 2,
          });

          fabricCanvasRef.current.add(img);
          fabricCanvasRef.current.setActiveObject(img);
          fabricCanvasRef.current.renderAll();
          
          setIsLoading(false);
          setStatus('תמונה נוספה!');
          setTimeout(() => setStatus(''), 2000);
        });
      };

      reader.readAsDataURL(file);
    };

    input.click();
  }, []);

  // Add image from URL
  const addImageFromUrl = useCallback(() => {
    const url = prompt('הדבק קישור לתמונה:');
    if (!url) return;

    setIsLoading(true);
    setStatus('טוען תמונה...');

    // Handle Google Drive links
    let imageUrl = url;
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([^\/]+)/);
      if (fileId) {
        imageUrl = `https://drive.google.com/uc?export=view&id=${fileId[1]}`;
      }
    }

    const imgElement = new Image();
    imgElement.crossOrigin = 'anonymous';

    imgElement.onload = () => {
      fabric.Image.fromURL(imgElement.src, (img) => {
        const maxWidth = PAGE_DIMENSIONS.width * 0.8;
        const maxHeight = PAGE_DIMENSIONS.height * 0.8;
        
        if (img.width > maxWidth) {
          img.scaleToWidth(maxWidth);
        }
        if (img.height > maxHeight) {
          img.scaleToHeight(maxHeight);
        }

        img.set({
          left: PAGE_DIMENSIONS.width / 2 - (img.width * img.scaleX) / 2,
          top: PAGE_DIMENSIONS.height / 2 - (img.height * img.scaleY) / 2,
        });

        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.renderAll();
        
        setIsLoading(false);
        setStatus('תמונה נוספה!');
        setTimeout(() => setStatus(''), 2000);
      });
    };

    imgElement.onerror = () => {
      setIsLoading(false);
      setStatus('❌ שגיאה בטעינת התמונה');
      setTimeout(() => setStatus(''), 3000);
    };

    imgElement.src = imageUrl;
  }, []);

  // Add video (thumbnail with metadata)
  const addVideo = useCallback(async () => {
    const url = prompt('הדבק קישור לוידאו (Google Drive, YouTube או קישור ישיר):');
    if (!url) return;

    setIsLoading(true);
    setStatus('מכין וידאו...');

    try {
      const videoMetadata = createVideoMetadata(url);
      const thumbnailImg = await loadVideoThumbnail(videoMetadata);

      fabric.Image.fromURL(thumbnailImg.src, (img) => {
        const maxWidth = PAGE_DIMENSIONS.width * 0.7;
        const maxHeight = PAGE_DIMENSIONS.height * 0.7;
        
        if (img.width > maxWidth) {
          img.scaleToWidth(maxWidth);
        }
        if (img.height > maxHeight) {
          img.scaleToHeight(maxHeight);
        }

        img.set({
          left: PAGE_DIMENSIONS.width / 2 - (img.width * img.scaleX) / 2,
          top: PAGE_DIMENSIONS.height / 2 - (img.height * img.scaleY) / 2,
          videoMetadata: videoMetadata,
          isVideo: true,
          selectable: true,
          hasControls: true,
        });

        // Add play icon overlay indicator
        const playIcon = new fabric.Text('▶️', {
          fontSize: 80,
          left: img.left + (img.width * img.scaleX) / 2 - 40,
          top: img.top + (img.height * img.scaleY) / 2 - 40,
          fill: 'white',
          stroke: 'black',
          strokeWidth: 2,
          selectable: false,
          evented: false,
        });

        const group = new fabric.Group([img, playIcon], {
          videoMetadata: videoMetadata,
          isVideo: true,
        });

        fabricCanvasRef.current.add(group);
        fabricCanvasRef.current.renderAll();
        
        setIsLoading(false);
        setStatus('✅ וידאו נוסף!');
        setTimeout(() => setStatus(''), 2000);
      });
    } catch (error) {
      console.error('Video error:', error);
      setIsLoading(false);
      setStatus('❌ שגיאה בהוספת וידאו');
      setTimeout(() => setStatus(''), 3000);
    }
  }, []);

  // Delete selected object
  const deleteSelected = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.remove(activeObject);
      fabricCanvasRef.current.renderAll();
      setStatus('נמחק');
      setTimeout(() => setStatus(''), 1500);
    }
  }, []);

  // Bring to front
  const bringToFront = useCallback(() => {
    if (!fabricCanvasRef.current || !selectedObject) return;
    fabricCanvasRef.current.bringToFront(selectedObject);
    fabricCanvasRef.current.renderAll();
  }, [selectedObject]);

  // Send to back
  const sendToBack = useCallback(() => {
    if (!fabricCanvasRef.current || !selectedObject) return;
    fabricCanvasRef.current.sendToBack(selectedObject);
    fabricCanvasRef.current.renderAll();
  }, [selectedObject]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    if (!confirm('האם למחוק את כל התוכן?')) return;

    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = '#ffffff';
    fabricCanvasRef.current.renderAll();
    setStatus('נמחק הכל');
    setTimeout(() => setStatus(''), 2000);
  }, []);

  // Save and export
  const handleSave = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    setIsLoading(true);
    setStatus('שומר...');

    // Get Fabric.js JSON
    const fabricJSON = fabricCanvasRef.current.toJSON(['videoMetadata', 'isVideo']);

    // Export as image
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });

    onSave({
      texture: dataURL,
      fabricJSON: fabricJSON,
    });

    setIsLoading(false);
    setStatus('✅ נשמר!');
    setTimeout(() => {
      setStatus('');
      onClose();
    }, 1000);
  }, [onSave, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT' && 
            document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          deleteSelected();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteSelected]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <h2 className="text-2xl font-bold">עורך עמודים</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Status Bar */}
        {status && (
          <div className="px-6 py-2 bg-blue-50 border-b border-blue-200 text-center text-sm font-medium text-blue-800">
            {status}
          </div>
        )}

        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap gap-2 bg-gray-50">
          <button
            onClick={addText}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-300 disabled:opacity-50"
          >
            <span className="text-xl">📝</span>
            <span className="hidden sm:inline">טקסט</span>
          </button>

          <button
            onClick={addImageFromFile}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-300 disabled:opacity-50"
          >
            <span className="text-xl">🖼️</span>
            <span className="hidden sm:inline">העלה תמונה</span>
          </button>

          <button
            onClick={addImageFromUrl}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-300 disabled:opacity-50"
          >
            <span className="text-xl">🔗</span>
            <span className="hidden sm:inline">תמונה מקישור</span>
          </button>

          <button
            onClick={addVideo}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-300 disabled:opacity-50"
          >
            <span className="text-xl">🎬</span>
            <span className="hidden sm:inline">וידאו</span>
          </button>

          <div className="w-px h-8 bg-gray-300" />

          <button
            onClick={undo}
            disabled={isLoading || historyStep <= 0}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-300 disabled:opacity-50"
            title="Undo (Ctrl+Z)"
          >
            <span className="text-xl">↶</span>
          </button>

          <button
            onClick={redo}
            disabled={isLoading || historyStep >= history.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-300 disabled:opacity-50"
            title="Redo (Ctrl+Y)"
          >
            <span className="text-xl">↷</span>
          </button>

          <div className="w-px h-8 bg-gray-300" />

          {selectedObject && (
            <>
              <button
                onClick={bringToFront}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
                title="Bring to Front"
              >
                <span className="text-xl">⬆️</span>
              </button>

              <button
                onClick={sendToBack}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
                title="Send to Back"
              >
                <span className="text-xl">⬇️</span>
              </button>

              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-300"
                title="Delete (Del)"
              >
                <span className="text-xl">🗑️</span>
                <span className="hidden sm:inline">מחק</span>
              </button>
            </>
          )}

          <div className="flex-1" />

          <button
            onClick={clearCanvas}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-300 disabled:opacity-50"
          >
            <span className="text-xl">🗑️</span>
            <span className="hidden sm:inline">נקה הכל</span>
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <div className="flex justify-center items-start min-h-full">
            <div className="bg-white shadow-2xl" style={{ display: 'inline-block' }}>
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>💡 טיפ: גרור אובייקטים להזזה, משיכת פינות לשינוי גודל</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              ביטול
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'שומר...' : 'שמור וסגור'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
