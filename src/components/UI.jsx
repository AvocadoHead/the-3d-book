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
        <div className="pointer-events-auto mt-10 ml-10"><video className="w-40 h-40 rounded-full object-cover" src="/videos/Optopia Eye.mp4" autoPlay loop muted playsInline /></div>
        <div className="w-full overflow-auto pointer-events-auto flex justify-center">
          <div className="overflow-auto flex items-center gap-4 max-w-full p-10">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300  ${
                  index === page
                    ? "border-white"
                    : "border-transparent"
                }`}
                onClick={() => setPage(index)}
              >
                <div className="w-20 h-28">
                  {index === 0 ? (
                    <img
                      className="w-full h-full object-cover"
                      src={`/images/${pages[index].front}.jpg`}
                    />
                  ) : (
                    <img
                      className="w-full h-full object-cover"
                      src={`/images/${pages[index].front}.jpg`}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};
