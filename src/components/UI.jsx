import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

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
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                  index === page
                    ? "bg-white/90 text-black"
                    : "bg-black/30 text-white"
                }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Cover" : `Page ${index}`}
              </button>
            ))}
          </div>
        </div>
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
        <div className="pointer-events-auto">
          <Logo />
        </div>
      </main>
    </>
  );
};

const Logo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    if (isHovered) {
      videoRef.current.play();
    }
  }, [isHovered]);

  return (
    <div
      className="fixed bottom-10 right-10 lg:bottom-10 lg:right-10"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <a href="https://www.youtube.com/channel/UCbv9sJdQLds0jKoyNyI7Y0Q">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          className="w-24 h-24 lg:w-32 lg:h-32 rounded-full pointer-events-auto drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_50px_rgba(255,255,255,1)] transition-all duration-500"
          src="https://uploads-ssl.webflow.com/63ec206c5542613e2e5aa784/643a7e7b1f9e6f42e3615d0b_wawatut%20(1)-transcode.mp4"
        ></video>
      </a>
      <p className="font-bold text-white text-center mt-2 italic">
        שאלה לי אליך
      </p>
      <p className="text-white text-xs text-center opacity-65">Click to visit</p>
    </div>
  );
};
