import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";

// Original working photos
const pictures = [
  "IzenBook/IzenBook001",
  "IzenBook/IzenBook002",
  "IzenBook/IzenBook003",
  "IzenBook/IzenBook004",
  "IzenBook/IzenBook005",
  "IzenBook/IzenBook006",
  "IzenBook/IzenBook007",
  "IzenBook/IzenBook008",
  "IzenBook/IzenBook009",
  "IzenBook/IzenBook10",
  "IzenBook/IzenBook011",
  "שאלות לי אליך cover",
  "back",
];

export const pageAtom = atom(0);
export const editModeAtom = atom(false);

// Build pages array - this structure works with ANY number of pages
export const pages = [
  {
    front: pictures[11],
    back: pictures[0],
  },
];

for (let i = 1; i < pictures.length - 2; i += 2) {
  pages.push({
    front: pictures[i],
    back: pictures[i + 1],
  });
}

pages.push({
  front: pictures[pictures.length - 2],
  back: pictures[pictures.length - 1],
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
      <a
        className="fixed top-10 left-10 pointer-events-auto z-10"
        href="https://wa.me/972545498727"
      >
        <img className="w-10" src="/images/whatsapp.png" />
      </a>
      <button
        className="fixed top-10 right-10 pointer-events-auto z-10 bg-black text-white py-2 px-4 rounded-md"
        onClick={() => setEditorOpen(!editorOpen)}
      >
        Editor
      </button>
    </>
  );
};
