import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { useTexture } from "@react-three/drei";
import { useAtom } from "jotai";
import { pageAtom, pages } from "./UI";

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
  2
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

const Page = ({
  number,
  front,
  back,
  page,
  opened,
  bookClosed,
  ...props
}) => {
  const [, setPage] = useAtom(pageAtom);
  const [picture, picture2] = useTexture([front, back]);
  picture.anisotropy = 16;
  picture2.anisotropy = 16;

  const group = useRef();
  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
    const pageMats = [
      ...pageMaterials,
      new THREE.MeshStandardMaterial({
        map: picture,
      }),
      new THREE.MeshStandardMaterial({
        map: picture2,
      }),
    ];
    const mesh = new THREE.SkinnedMesh(pageGeometry, pageMats);
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }, [picture, picture2]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) return;

    const emptyArray = new Array(PAGE_SEGMENTS + 1).fill(0);
    const targetArray = [...emptyArray];

    let easingFactorCurrent = easingFactor;

    if (bookClosed) {
      easingFactorCurrent = easingFactorFold;
    }

    if (opened) {
      for (let i = 0; i < PAGE_SEGMENTS + 1; i++) {
        const distance = i / PAGE_SEGMENTS;
        const insideCurve = Math.sin(distance * Math.PI) * insideCurveStrength;
        targetArray[i] = insideCurve;
      }
    } else {
      for (let i = 0; i < PAGE_SEGMENTS + 1; i++) {
        const distance = i / PAGE_SEGMENTS;
        const outsideCurve = Math.sin(distance * Math.PI) * -outsideCurveStrength;
        targetArray[i] = outsideCurve;
      }
    }

    const skeleton = skinnedMeshRef.current.skeleton;

    for (let i = 0; i < skeleton.bones.length; i++) {
      const bone = skeleton.bones[i];

      easing.damp(
        bone.rotation,
        "y",
        degToRad(targetArray[i]),
        easingFactorCurrent,
        delta
      );
    }

    let turningPageRotation = 0;

    if (opened) {
      turningPageRotation = Math.PI;
    }

    easing.damp(
      group.current.rotation,
      "y",
      turningPageRotation,
      0.18,
      delta
    );
  });

  return (
    <group
      {...props}
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setPage(page);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setPage(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setPage(opened ? page : page + 1);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};

export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom);
  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {[...pages].map((pageData, index) =>
        index === 0 ? (
          <Page
            key={index}
            page={index}
            number={index}
            opened={page > index}
            bookClosed={page === 0 || page === pages.length}
            front={`textures/${pageData.front}.jpg`}
            back={`textures/${pageData.back}.jpg`}
          />
        ) : (
          <Page
            key={index}
            page={index}
            number={index}
            opened={page > index}
            bookClosed={page === 0 || page === pages.length}
            front={`textures/${pageData.front}.jpg`}
            back={`textures/${pageData.back}.jpg`}
          />
        )
      )}
    </group>
  );
};
