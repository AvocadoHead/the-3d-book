import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";

const BASE_URL = import.meta.env.BASE_URL || '/';

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
  const containerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "d") {
        setPage((prev) => Math.min(prev + 1, pages.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "a") {
        setPage((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setPage]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 flex flex-col justify-between px-8 py-8 z-10"
    >
      {/* Optopia Eye Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-4 right-4 w-32 h-32 object-cover rounded-lg pointer-events-auto"
      >
        <source src={`${BASE_URL}optopia eye.mp4`} type="video/mp4" />
      </video>

      {/* Navigation at bottom */}
      <div className="flex justify-center items-center gap-4 pointer-events-auto">
        <button
          className="border-2 border-black bg-white/80 hover:bg-white transition-all duration-300 px-4 py-2 rounded-lg font-semibold text-black cursor-pointer shadow-lg"
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
        >
          ← Previous
        </button>
        
        <span className="text-black font-bold bg-white/80 px-4 py-2 rounded-lg">
          {page} / {pages.length - 1}
        </span>
        
        <button
          className="border-2 border-black bg-white/80 hover:bg-white transition-all duration-300 px-4 py-2 rounded-lg font-semibold text-black cursor-pointer shadow-lg"
          onClick={() => setPage((prev) => Math.min(prev + 1, pages.length - 1))}
        >
          Next →
        </button>
      </div>
    </div>
  );
};
