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
      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        <img
          className="pointer-events-auto mt-8 ml-8 w-20"
          src="/images/Optopia Eye.jpg"
        />
        <div className="w-full overflow-auto pointer-events-auto flex justify-center fixed bottom-0 pb-10">
          <div className="overflow-auto flex items-center gap-4 max-w-full">
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
                {index === 0 ? "Cover" : `${index}`}
              </button>
            ))}
            <button
              className={`border-transparent hover:border-white transition-all duration-300  px-4 py-3 rounded-full  text-lg uppercase shrink-0 border ${
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
        <div className="overflow-hidden bg-black pointer-events-none print:hidden fixed bottom-20 w-full">
          <div className="flex items-center gap-8 w-full justify-center">
            <h1 style={{transform: 'translateX(-100%)'}} className="text-white text-4xl font-black">שאלה לי אליך</h1>
          </div>
        </div>
        <div className="overflow-hidden bg-black pointer-events-none print:hidden fixed bottom-32 w-full">
          <div className="flex items-center gap-8 w-full justify-center">
            <h1 style={{transform: 'translateX(100%)'}} className="text-white text-4xl font-black">שאלה לי אליך</h1>
          </div>
        </div>
      </main>
    </>
  );
};
