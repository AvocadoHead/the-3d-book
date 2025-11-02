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
    const audio = new Audio("audios/page-flip-01a.mp3");
    audio.play();
  }, [page]);

  return (
    <>
      <main className=" pointer-events-none select-none z-10 fixed  inset-0  flex justify-between flex-col">
        <a
          className="pointer-events-auto mt-8 ml-8"
          href="https://www.wawasensei.dev/"
        >
          <video className="w-20" autoPlay loop muted playsInline>
            <source src="/assets/optopia-eye.mp4" type="video/mp4" />
          </video>
        </a>
        <div className="w-full overflow-auto pointer-events-none">
          <div className="flex items-center gap-4 justify-center md:justify-end p-8">
            <button
              className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                page === 0
                  ? "opacity-25 pointer-events-none"
                  : "pointer-events-auto cursor-pointer"
              }`}
              onClick={() => setPage(page - 1)}
            >
              Previous page
            </button>
            <button
              className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
                page === pages.length
                  ? "opacity-25 pointer-events-none"
                  : "pointer-events-auto cursor-pointer"
              }`}
              onClick={() => setPage(page + 1)}
            >
              Next page
            </button>
          </div>
        </div>
      </main>
      <div className="fixed inset-0 flex items-center -rotate-2 select-none">
        <div className="relative">
          <div className="bg-white/0 animate-horizontal-scroll absolute top-0 left-0 flex items-center gap-8 w-max px-8">
            <h1 className="shrink-0 text-white text-10xl font-black ">
              שאלה לי אליך
            </h1>
            <h2 className="shrink-0 text-white text-8xl italic font-light">
              
            </h2>
            <h2 className="shrink-0 text-white text-12xl font-bold">
              
            </h2>
            <h2 className="shrink-0 text-transparent text-12xl font-bold italic outline-text">
              
            </h2>
            <h2 className="shrink-0 text-white text-9xl font-medium">
              
            </h2>
            <h2 className="shrink-0 text-white text-9xl font-extralight italic">
              
            </h2>
            <h2 className="shrink-0 text-white text-13xl font-bold">
              
            </h2>
            <h2 className="shrink-0 text-transparent text-13xl font-bold outline-text italic">
              
            </h2>
          </div>
          <div className="absolute top-0 left-0 bg-white/0 animate-horizontal-scroll-2 flex items-center gap-8 px-8 w-max">
            <h1 className="shrink-0 text-white text-10xl font-black ">
              שאלה לי אליך
            </h1>
            <h2 className="shrink-0 text-white text-8xl italic font-light">
              
            </h2>
            <h2 className="shrink-0 text-white text-12xl font-bold">
              
            </h2>
            <h2 className="shrink-0 text-transparent text-12xl font-bold italic outline-text">
              
            </h2>
            <h2 className="shrink-0 text-white text-9xl font-medium">
              
            </h2>
            <h2 className="shrink-0 text-white text-9xl font-extralight italic">
              
            </h2>
            <h2 className="shrink-0 text-white text-13xl font-bold">
              
            </h2>
            <h2 className="shrink-0 text-transparent text-13xl font-bold outline-text italic">
              
            </h2>
          </div>
        </div>
      </div>
    </>
  );
};
