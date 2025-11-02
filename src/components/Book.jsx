import { degToRad, MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useCursor, useTexture } from "@react-three/drei";

const easingFactor = 0.5;
const easingFactorFold = 0.3;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new THREE.BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  1,
  1
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new THREE.Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i);
  const x = vertex.x;

  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute(
  "skinIndex",
  new THREE.Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
  "skinWeight",
  new THREE.Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new THREE.Color("white");
const emissiveColor = new THREE.Color("orange");

const pageMaterials = [
  new THREE.MeshStandardMaterial({
    color: whiteColor,
  }),
  new THREE.MeshStandardMaterial({
    color: "#111",
  }),
  new THREE.MeshStandardMaterial({
    color: whiteColor,
  }),
  new THREE.MeshStandardMaterial({
    color: whiteColor,
  }),
];

pages.forEach((page) => {
  useTexture.preload(`textures/${page.front}.jpg`);
  useTexture.preload(`textures/${page.back}.jpg`);
});

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const [picture, picture2] = useTexture([
    `textures/${front}.jpg`,
    `textures/${back}.jpg`,
  ]);
  picture.anisotropy = 16;
  picture2.anisotropy = 16;
  const group = useRef();
  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new THREE.Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      if (i > 0) {
        bones[i - 1].add(bone);
      }
    }
    const skeleton = new THREE.Skeleton(bones);

    const materials = [
      ...pageMaterials,
      new THREE.MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        ...(number === 0
          ? {
              roughness: 0.1,
              metalness: 0.1,
            }
          : {}),
      }),
      new THREE.MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
      }),
    ];
    const mesh = new THREE.SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [picture, picture2, number]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const emissiveIntensity = opened ? 0 : highlighted ? 0.22 : 0;
    pageMaterials[4].emissive = emissiveColor;
    pageMaterials[4].emissiveIntensity = emissiveIntensity;

    if (lastOpened !== opened) {
      setLastOpened(opened);
      if (opened) {
        setTurningTime(1);
      }
    }
    if (turningTime > 0) {
      setTurningTime((prev) => Math.max(0, prev - delta));
    }

    let targetRotation = opened ? -Math.PI : Math.PI;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;
      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);
      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }
      easing.damp(
        target.rotation,
        "y",
        rotationAngle,
        easingFactorFold,
        delta
      );

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;
      easing.damp(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });

  const [highlighted, setHighlighted] = useState(false);
  const [lastOpened, setLastOpened] = useState(opened);
  const [turningTime, setTurningTime] = useState(0);

  const [_, setHovered] = useState(false);
  useCursor(_);
  return (
    <group
      {...props}
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
        setHighlighted(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHovered(false);
        setHighlighted(false);
      }}
      rotation-y={opened ? -Math.PI / 2 : Math.PI / 2}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};

const pages = [
  {
    front: "book-cover",
    back: "book-cover",
  },
  {
    front: "DSC00680",
    back: "DSC00933",
  },
  {
    front: "DSC00966",
    back: "DSC00983",
  },
  {
    front: "DSC01011",
    back: "DSC01064",
  },
  {
    front: "DSC01040",
    back: "DSC01420",
  },
  {
    front: "DSC01145",
    back: "DSC01071",
  },
  {
    front: "DSC01103",
    back: "DSC01461",
  },
  {
    front: "DSC02064",
    back: "book-back",
  },
  {
    front: "DSC02031",
    back: "DSC01489",
  },
  {
    front: "DSC02069",
    back: "DSC02069",
  },
];

export const Book = ({ ...props }) => {
  const [page, setPage] = useState(0);
  const [delayedPage, setDelayedPage] = useState(0);

  useFrame((_, delta) => {
    easing.damp(pagesRef, "current", page, easingFactor, delta);
    if (Math.abs(Math.round(pagesRef.current) - delayedPage) > 0) {
      setDelayedPage(Math.round(pagesRef.current));
    }
  });

  const pagesRef = useRef(0);

  const [highlighted, setHighlighted] = useState(-1);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {[...pages].map((pageData, index) =>
        index === 0 ? (
          <Page
            key={index}
            page={delayedPage}
            number={index}
            opened={delayedPage > index}
            bookClosed={delayedPage === 0 || delayedPage === pages.length}
            highlighted={highlighted === index}
            {...pageData}
          />
        ) : (
          <Page
            key={index}
            page={delayedPage}
            number={index}
            opened={delayedPage > index}
            bookClosed={delayedPage === 0 || delayedPage === pages.length}
            highlighted={highlighted === index}
            {...pageData}
            onClick={(e) => {
              if (e.delta.x + e.delta.y < 2) {
                setHighlighted(-1);
                if (delayedPage === index) {
                  setPage(index + 1);
                } else {
                  setPage(index);
                }
              }
            }}
          />
        )
      )}
    </group>
  );
};
