import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";

// Original working photos
const pictures = [
  "DSC00680",
  "DSC00933",
  "DSC00966",
  "DSC00983",
  "DSC01011",
  "DSC01040",
  "DSC01064",
  "DSC01071",
  "DSC01103",
  "DSC01145",
  "DSC01420",
  "DSC01461",
  "DSC01489",
  "DSC02031",
  "DSC02064",
  "DSC02069",
];

export const pageAtom = atom(0);
export const editModeAtom = atom(false);

// Build pages array - this structure works with ANY number of pages
export const pages = [
  {
    front: "שאלות לי אליך cover",
    back: pictures[0],
  },
];

for (let i = 1; i < pictures.length - 1; i += 2) {
  pages.push({
    front: pictures[i],
    back: pictures[i + 1],
  });
}

pages.push({
  front: pictures[pictures.length - 1],
  back: "back",
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
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none">
        <div className="overflow-auto pointer-events-auto py-10 w-full max-w-4xl h-full flex items-center justify-center">
          <div className="flex w-full gap-4 items-center justify-center">
            <button
              className="border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border bg-black/30 text-white"
              onClick={() => setPage((page - 1 + pages.length + 1) % (pages.length + 1))}
            >
              &lt;
            </button>
            <button
              className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
                page === 0 ? "bg-white/90 text-black" : "bg-black/30 text-white"
              }`}
              onClick={() => setPage(0)}
            >
              Front Cover
            </button>
            {[...Array(pages.length - 1)].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border ${
                  page === index + 1
                    ? "bg-white/90 text-black"
                    : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
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
            <button
              className="border-transparent hover:border-white transition-all duration-300 px-4 py-3 rounded-full text-lg uppercase shrink-0 border bg-black/30 text-white"
              onClick={() => setPage((page + 1) % (pages.length + 1))}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setEditorOpen(!editorOpen)}
        className="pointer-events-auto fixed bottom-10 right-10 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110 flex items-center justify-center text-2xl z-50"
        title="ערוך עמוד חדש"
      >
        ✏️
      </button>
      <div className="fixed bottom-10 left-0 right-0 flex items-center -rotate-2 select-none pointer-events-none">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@100;300;400;500;700;900&display=swap');
        `}</style>
        <div className="relative w-full overflow-hidden">
          <div className="flex items-center gap-8 animate-horizontal-scroll">
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '900'}}>ספר שאלות</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '300'}}>Questions</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '700'}}>לי אליך</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '400'}}>Love</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '500'}}>זיכרונות</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '300'}}>Stories</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '900'}}>משפחה</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '700'}}>Heart</h2>
          </div>
          <div className="absolute top-0 left-0 flex items-center gap-8 animate-horizontal-scroll-2">
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '900'}}>ספר שאלות</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '300'}}>Questions</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '700'}}>לי אליך</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '400'}}>Love</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '500'}}>זיכרונות</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '300'}}>Stories</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '900'}}>משפחה</h2>
            <h2 className="shrink-0 text-white/20 text-8xl" style={{fontFamily: 'Heebo, sans-serif', fontWeight: '700'}}>Heart</h2>
          </div>
        </div>
      </div>
    </>
  );
};
