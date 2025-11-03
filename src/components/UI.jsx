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
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play();
  }, [page]);

  return (
    <>
      <main className=" pointer-events-none select-none z-10 fixed  inset-0  flex justify-between flex-col">
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
            <button
              className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                page === 0
                  ? "border-white cursor-not-allowed opacity-50"
                  : "border-white cursor-pointer opacity-100 pointer-events-auto"
              }`}
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <button
              className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                page === pages.length - 1
                  ? "border-white cursor-not-allowed opacity-50"
                  : "border-white cursor-pointer opacity-100 pointer-events-auto"
              }`}
              disabled={page === pages.length - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </main>
      <div className="fixed left-0 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-20">
        <div className="-rotate-90 origin-left whitespace-nowrap text-6xl font-black">
          <div className="animate-horizontal-scroll flex gap-8">
            <span>ספר תלת מימדי • </span>
            <span>React Three Fiber • </span>
            <span>Three.js • </span>
            <span>ספר תלת מימדי • </span>
            <span>React Three Fiber • </span>
            <span>Three.js • </span>
          </div>
        </div>
      </div>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-20">
        <div className="rotate-90 origin-right whitespace-nowrap text-6xl font-black">
          <div className="animate-horizontal-scroll flex gap-8">
            <span>ספר תלת מימדי • </span>
            <span>React Three Fiber • </span>
            <span>Three.js • </span>
            <span>ספר תלת מימדי • </span>
            <span>React Three Fiber • </span>
            <span>Three.js • </span>
          </div>
        </div>
      </div>
    </>
  );
};
