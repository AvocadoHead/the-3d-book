import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { bookPagesAtom, currentPageAtom, editModeAtom } from "../store/atoms";
import { EditorCanvas } from "./editor/EditorCanvas";
import { updatePageAtom } from "../store/atoms";

export const UI = () => {
  const [page, setPage] = useAtom(currentPageAtom);
  const [pages] = useAtom(bookPagesAtom);
  const [editorOpen, setEditorOpen] = useAtom(editModeAtom);
  const [editingPage, setEditingPage] = useState(null);
  const [, updatePage] = useAtom(updatePageAtom);

  const handleEditCurrentPage = () => {
    if (page >= 0 && page < pages.length) {
      const currentPageData = pages[page];
      setEditingPage({
        pageId: currentPageData.id,
        side: 'front',
        data: currentPageData.front
      });
      setEditorOpen(true);
    }
  };

  const handleSaveEdit = (savedData) => {
    if (editingPage) {
      updatePage({
        pageId: editingPage.pageId,
        side: editingPage.side,
        texture: savedData.texture,
        fabricJSON: savedData.fabricJSON,
      });
      setEditorOpen(false);
      setEditingPage(null);
    }
  };

  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play();
  }, [page]);

  return (
    <>
      <a
        className="fixed top-10 left-10 pointer-events-auto z-10"
        href="https://wa.me/972545498727"
      >
        <img className="w-10" src="/images/whatsapp.png" />
      </a>
      <button
        className="fixed top-10 right-10 pointer-events-auto z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
        onClick={handleEditCurrentPage}
      >
        ✏️ ערוך עמוד
      </button>
      {editorOpen && editingPage && (
        <EditorCanvas
          initialData={editingPage.data}
          onSave={handleSaveEdit}
          onClose={() => {
            setEditorOpen(false);
            setEditingPage(null);
          }}
        />
      )}
      
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
            {pages.map((pageData, index) => (
              <button
                key={pageData.id}
                className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
                  index === page
                    ? "bg-white/90 text-black"
                    : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "כריכה" : `עמוד ${index}`}
              </button>
            ))}
            <button
              className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
                page === pages.length
                  ? "bg-white/90 text-black"
                  : "bg-black/30 text-white"
              }`}
              onClick={() => setPage(pages.length)}
            >
              כריכה אחורית
            </button>
          </div>
        </div>
        <div className="w-full overflow-hidden pointer-events-auto">
          <div className="bulletin-container">
            <div className="bulletin-text">
מגזין שיש בו הכל, ספר אישי בהתאמה, אלבום תמונות אינסופי, ניוזלטר משולב קטעי וידאו, בספר האינטראקטיבי הזה תוכלו ליצוק את התוכן שלכם. לתמיכה בפרויקט צרו קשר ב-eyalizenman@gmail.com            </div>
          </div>
          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap');
              
              .bulletin-container {
                background-color: rgba(0, 0, 0, 0.8);
                padding: 1rem 0;
                overflow: hidden;
                position: relative;
                white-space: nowrap;
              }
              
              .bulletin-text {
                display: inline-block;
                animation: scroll-right 60s linear infinite;
                font-family: 'Heebo', sans-serif;
                font-size: 1.5rem;
                color: white;
                padding: 0 100vw;
              }
              
              @keyframes scroll-left {
                from {
                  transform: translateX(0);
                }
                to {
                  transform: translateX(-50%);
                }
              }
            `}
          </style>
        </div>
      </main>
    </>
  );
};
