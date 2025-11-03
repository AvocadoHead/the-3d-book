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
  back: "שאלה לי אליך back cover",
});

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);
  const [editorOpen, setEditorOpen] = useAtom(editModeAtom);
  const audioRef = useRef(null);

  useEffect(() => {
    if (page > 0 && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [page]);

  return (
    <>
      <audio ref={audioRef} src="/audios/page-flip-01a.mp3" />
      
      <div className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        <div className="pointer-events-auto mt-10 ml-10">
          <video 
            className="w-40 h-40 rounded-full object-cover"
            src="/videos/Optopia Eye.mp4"
            loop
            muted
            autoPlay
            playsInline
          />
        </div>
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
      </div>
      
      <button
        onClick={() => setEditorOpen(!editorOpen)}
        className="pointer-events-auto fixed bottom-10 right-10 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110 flex items-center justify-center text-2xl z-50"
        title="ערוך עמוד חדש"
      >
        ✏️
      </button>

      <div className="fixed inset-0 flex items-center -rotate-2 select-none pointer-events-none">
        <div className="relative w-full overflow-hidden">
          <div className="flex items-center gap-8 animate-horizontal-scroll">
            <h2 className="shrink-0 text-white/20 text-10xl font-black">ספר שאלות</h2>
            <h2 className="shrink-0 text-white/20 text-8xl italic font-light">Questions</h2>
            <h2 className="shrink-0 text-white/20 text-12xl font-bold">לי אליך</h2>
            <h2 className="shrink-0 text-white/20 text-12xl font-bold italic">Love</h2>
            <h2 className="shrink-0 text-white/20 text-9xl font-medium">זיכרונות</h2>
            <h2 className="shrink-0 text-white/20 text-9xl font-extralight italic">Stories</h2>
            <h2 className="shrink-0 text-white/20 text-13xl font-bold">משפחה</h2>
            <h2 className="shrink-0 text-white/20 text-13xl font-bold italic">Heart</h2>
          </div>
          <div className="absolute top-0 left-0 flex items-center gap-8 animate-horizontal-scroll-2">
            <h2 className="shrink-0 text-white/20 text-10xl font-black">ספר שאלות</h2>
            <h2 className="shrink-0 text-white/20 text-8xl italic font-light">Questions</h2>
            <h2 className="shrink-0 text-white/20 text-12xl font-bold">לי אליך</h2>
            <h2 className="shrink-0 text-white/20 text-12xl font-bold italic">Love</h2>
            <h2 className="shrink-0 text-white/20 text-9xl font-medium">זיכרונות</h2>
            <h2 className="shrink-0 text-white/20 text-9xl font-extralight italic">Stories</h2>
            <h2 className="shrink-0 text-white/20 text-13xl font-bold">משפחה</h2>
            <h2 className="shrink-0 text-white/20 text-13xl font-bold italic">Heart</h2>
          </div>
        </div>
      </div>
    </>
  );
};
