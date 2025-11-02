import { atom, useAtom } from "jotai";
import { useEffect } from "react";

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
export const pages = [
  {
    front: "book-cover",
    back: pictures[0],
  },
];

for (let i = 1; i < pictures.length - 1; i += 2) {
  pages.push({
    front: pictures[i % pictures.length],
    back: pictures[(i + 1) % pictures.length],
  });
}

pages.push({
  front: pictures[pictures.length - 1],
  back: "book-back",
});

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);

  useEffect(() => {
    // const audio = new Audio("audios/page-flip-01a.mp3");
    // audio.play();
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setPage((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setPage((prev) => Math.min(pages.length, prev + 1));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page]);

  return (
    <>
      <main className=" pointer-events-none select-none z-10 fixed  inset-0  flex justify-between flex-col">
        <a
          className="pointer-events-auto mt-8 ml-8"
          href="https://www.wawasensei.dev/"
        >
          <video
            src="videos/Optopia Eye.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline 
            style={{width: '120px', height: '120px', objectFit: 'cover', position: 'fixed', bottom: '20px', right: '20px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'}} 
          />
        </a>
      </main>
      <div className="fixed inset-0 flex items-center justify-between pointer-events-none" style={{padding: '40px'}}>
        <button className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white rounded-full w-16 h-16 flex items-center justify-center backdrop-blur-sm transition-all" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={{opacity: page === 0 ? 0.3 : 1, cursor: page === 0 ? 'default' : 'pointer'}}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '32px', height: '32px'}}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white rounded-full w-16 h-16 flex items-center justify-center backdrop-blur-sm transition-all" onClick={() => setPage(Math.min(pages.length, page + 1))} disabled={page === pages.length} style={{opacity: page === pages.length ? 0.3 : 1, cursor: page === pages.length ? 'default' : 'pointer'}}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '32px', height: '32px'}}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </>
  );
};
