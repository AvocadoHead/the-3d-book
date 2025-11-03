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
    front: "כריכה שאלות לי אליך",
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
          <div className="flex gap-4 max-w-full p-10">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300  ${
                  index === page
                    ? "border-white"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
                onClick={() => setPage(index)}
              >
                <div className="w-4 h-4 rounded-full bg-white" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
