import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const pictures = [
  "textures/DSC00680.jpg",
  "textures/DSC00933.jpg",
  "textures/DSC00966.jpg",
  "textures/DSC00983.jpg",
  "textures/DSC01011.jpg",
  "textures/DSC01040.jpg",
  "textures/DSC01064.jpg",
  "textures/DSC01071.jpg",
  "textures/DSC01103.jpg",
  "textures/DSC01145.jpg",
  "textures/DSC01420.jpg",
  "textures/DSC01461.jpg",
  "textures/DSC01489.jpg",
  "textures/DSC02031.jpg",
  "textures/DSC02064.jpg",
  "textures/DSC02069.jpg",
];

export const pageAtom = atom(0);

export const pages = [
  {
    front: "textures/book-cover.jpg",
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
  back: "textures/book-back.jpg",
});

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);

  useEffect(() => {
    // const audio = new Audio("audios/page-flip-01a.mp3");
    // audio.play();
  }, [page]);

  return (
    <>
      <main className=" pointer-events-none select-none z-10 fixed  inset-0  flex justify-between flex-col">
        <a
          className="pointer-events-auto mt-8 ml-8"
          href="https://www.wawasensei.dev/"
        >
          <video src='videos/Optopia Eye.mp4' autoPlay loop muted playsInline style={{width: '120px', height: '120px', objectFit: 'cover', position: 'fixed', bottom: '20px', right: '20px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'}} />
        </a>
      </main>
    </>
  );
};
