import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";

// Original working photos
const pictures = [
  "IzenBook/IzenBook001",
  "IzenBook/IzenBook002",
  "IzenBook/IzenBook003",
  "IzenBook/IzenBook004",
  "IzenBook/IzenBook005",
  "IzenBook/IzenBook006",
  "IzenBook/IzenBook007",
  "IzenBook/IzenBook008",
  "IzenBook/IzenBook009",
  "IzenBook/IzenBook10",
  "IzenBook/IzenBook011",
  "שאלות לי אליך cover",
  "שאלה לי אליך back cover",
];

export const pageAtom = atom(0);
export const editModeAtom = atom(false);

// Build pages array - this structure works with ANY number of pages
export const pages = [
  {
    front: pictures[11],
    back: pictures[0],
  },
];

for (let i = 1; i < pictures.length - 2; i += 2) {
  pages.push({
    front: pictures[i],
    back: pictures[i + 1],
  });
}

pages.push({
  front: pictures[pictures.length - 2],
  back: pictures[pictures.length - 1],
});

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);
  const [editorOpen, setEditorOpen] = useAtom(editModeAtom);

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
        className="fixed top-10 right-10 pointer-events-auto z-10 bg-black text-white py-2 px-4 rounded-md"
        onClick={() => setEditorOpen(!editorOpen)}
      >
        {editorOpen ? "Close" : "Edit"}
      </button>
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
                  index === page
                    ? "bg-white/90 text-black"
                    : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Cover" : `Page ${index}`}
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
              Back Cover
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
