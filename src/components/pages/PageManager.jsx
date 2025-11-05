import { useAtom } from 'jotai';
import { useState } from 'react';
import { bookPagesAtom, addPageAtom, removePageAtom, currentPageAtom } from '@/store/atoms';
import { EditorCanvas } from '@/components/editor/EditorCanvas';

export const PageManager = () => {
  const [pages] = useAtom(bookPagesAtom);
  const [, addPage] = useAtom(addPageAtom);
  const [, removePage] = useAtom(removePageAtom);
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPage, setEditingPage] = useState(null);

  const handleAddPage = () => {
    setShowAddDialog(true);
  };

  const confirmAddPage = () => {
    const newPage = addPage('end');
    setShowAddDialog(false);
    // Open editor for the new page
    setEditingPage({ page: newPage, side: 'front' });
    setShowEditor(true);
    // Navigate to the new page
    setCurrentPage(pages.length);
  };

  const handleRemovePage = (pageId) => {
    if (pages.length <= 1) {
      alert('לא ניתן למחוק את העמוד היחיד בספר');
      return;
    }
    
    if (confirm('האם אתה בטוח שברצונך למחוק עמוד זה?')) {
      removePage(pageId);
      // Adjust current page if needed
      if (currentPage >= pages.length - 1) {
        setCurrentPage(Math.max(0, pages.length - 2));
      }
    }
  };

  return (
    <>
      {/* Add Page Button */}
      <button
        onClick={handleAddPage}
        className="fixed bottom-24 right-10 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center gap-2 font-bold"
      >
        <span className="text-2xl">+</span>
        <span>הוסף עמוד</span>
      </button>

      {/* Add Page Confirmation Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
            <h3 className="text-2xl font-bold mb-4 text-right">הוסף עמוד חדש</h3>
            <p className="text-gray-600 mb-6 text-right">
              עמוד חדש יתוסף לסוף הספר. האם להמשיך?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAddDialog(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                ביטול
              </button>
              <button
                onClick={confirmAddPage}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700"
              >
                הוסף עמוד
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && editingPage && (
        <EditorCanvas
          initialData={editingPage.page[editingPage.side]}
          onSave={(data) => {
            // Save will be handled by parent component through atoms
            console.log('Saved page data:', data);
            setShowEditor(false);
            setEditingPage(null);
          }}
          onClose={() => {
            setShowEditor(false);
            setEditingPage(null);
          }}
        />
      )}
    </>
  );
};
