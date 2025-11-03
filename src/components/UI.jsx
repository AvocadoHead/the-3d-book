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
export const editModeAtom = atom(false);
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
  const [editorOpen, setEditorOpen] = useAtom(editModeAtom);
  useEffect(() => {
    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.play();
  }, [page]);
  return (
    <>
      <div className=" pointer-events-none select-none z-10 fixed  inset-0  flex justify-between flex-col">
        <a
          className="pointer-events-auto mt-10 ml-10"
          href="https://bruno-simon.com/"
        >
          <img className="w-20" src="/images/logo.png" />
        </a>
        <button
  onClick={() => setEditorOpen(!editorOpen)}
  className="pointer-events-auto fixed bottom-10 right-10 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110 flex items-center justify-center text-2xl z-50"
  title="ערוך עמוד חדש"
>
  ✏️
</button>
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
      </div>
      <div className="fixed inset-0 flex items-center -rotate-2 select-none pointer-events-none">
        <div className="relative">
          <div className="bg-white/0 animate-horizontal-scroll flex items-center gap-8 px-8 w-max">
            <h2 className="shrink-0 text-white text-10xl font-black ">Enjoy</h2>
            <h2 className="shrink-0 text-white text-12xl font-bold italic">
              Reading
            </h2>
            <h2 className="shrink-0 text-white text-9xl font-medium">Books</h2>
            <h2 className="shrink-0 text-white text-9xl font-extralight italic">
              Love
            </h2>
            <h2 className="shrink-0 text-white text-13xl font-bold">אליך</h2>
            <h2 className="shrink-0 text-transparent text-13xl font-bold outline-text italic">
              Creative
            </h2>
          </div>
          <div className="absolute top-0 left-0 bg-white/0 animate-horizontal-scroll-2 flex items-center gap-8 px-8 w-max">
            <h2 className="shrink-0 text-white text-10xl font-black ">Essential</h2>
            <h2 className="shrink-0 text-white text-8xl italic font-light">מהות</h2>
            <h2 className="shrink-0 text-white text-12xl font-bold">Value</h2>
            <h2 className="shrink-0 text-transparent text-12xl font-bold italic outline-text">ערך</h2>
            <h2 className="shrink-0 text-white text-9xl font-medium">Thank You</h2>
            <h2 className="shrink-0 text-white text-9xl font-extralight italic">תודה</h2>
            <h2 className="shrink-0 text-13xl font-bold">Explain</h2>
            <h2 className="shrink-0 text-transparent text-13xl font-bold outline-text italic">
              Creative
            </h2>
          </div>
        </div>
      </div>
      <button
        onClick={() => setEditorOpen(!editorOpen)}
        className="pointer-events-auto fixed bottom-8 right-8 p-4 rounded-full bg-white/90 hover:bg-white transition-colors duration-300 shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
      </button>
    </>
  );
};
