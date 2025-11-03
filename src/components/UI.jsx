import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const pictures = [
  "ספרי לי איך אבא ואת הכרתם ",
  "ספרי לי על בית הילדים שהיית בו איך זה הרגיש להיות בלינה משותפת ",
  "ספרי לי על בית ילדותך איך הוא הרגיש",
  "ספרי לי על החלומות שלך ",
  "ספרי לי על חיית המחמד הראשונה שלך ",
  "ספרי לי על מישהו אהוב שנפטר ולא זכיתי להכיר ",
];

export const pageAtom = atom(0);
export const editModeAtom = atom(false);

export const pages = [
  {
    front: "שאלות לי אליך cover",
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
  back: "שאלה לי אליך back cover",
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
      <div className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col">
        <div className="pointer-events-auto mt-10 ml-10">
          <video
            className="w-40 h-40 rounded-full object-cover"
            src="/videos/Optopia Eye.mp4"
            loop
            muted
            autoPlay
          />
        </div>
      </div>
      <div className="pointer-events-auto fixed bottom-0 left-0 right-0 flex justify-center items-center mb-10">
        <button
          onClick={() => setPage((page) => Math.max(0, page - 1))}
          disabled={page === 0}
          className="border border-white p-4 rounded-full bg-white/90 hover:bg-white disabled:opacity-25"
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
              d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
            />
          </svg>
        </button>
        <span className="mx-4 text-white font-bold">
          {page + 1} / {pages.length}
        </span>
        <button
          onClick={() => setPage((page) => Math.min(pages.length - 1, page + 1))}
          disabled={page === pages.length - 1}
          className="border border-white p-4 rounded-full bg-white/90 hover:bg-white disabled:opacity-25"
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
              d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
            />
          </svg>
        </button>
      </div>
    </>
  );
};
