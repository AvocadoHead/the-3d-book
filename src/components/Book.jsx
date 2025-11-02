import { MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { useCursor, useTexture } from "@react-three/drei";
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

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const [picture, picture2] = useTexture([front, back]);
  picture.colorSpace = THREE.SRGBColorSpace;
  picture2.colorSpace = THREE.SRGBColorSpace;

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
  }, [picture, picture2]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    const insideCurveIntensity = opened ? -insideCurveStrength : 0;
    const outsideCurveIntensity = opened ? 0 : outsideCurveStrength;
    const turningIntensity =
      Math.sin(skinnedMeshRef.current.rotation.y) * turningCurveStrength;

    easing.dampAngle(
      skinnedMeshRef.current.rotation,
      "y",
      targetRotation,
      easingFactor,
      delta
    );

    for (let i = 0; i < PAGE_SEGMENTS; i++) {
      const scaledIndex = i / PAGE_SEGMENTS;
      const boneRotation = scaledIndex * insideCurveIntensity;
      const bone = manualSkinnedMesh.skeleton.bones[i];
      easing.dampAngle(
        bone.rotation,
        "y",
        boneRotation +
          turningIntensity * Math.sin(scaledIndex * Math.PI) +
          outsideCurveIntensity * Math.sin(scaledIndex * Math.PI),
        bookClosed ? easingFactorFold / 2 : easingFactorFold,
        delta
      );
    }
  });

  return (
    <group ref={group} {...props}>
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};

const Cover = ({ texture, opened, bookClosed, ...props }) => {
  const [picture] = useTexture([texture]);
  picture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group {...props}>
      <mesh position-z={-0.01}>
        <boxGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, 0.002]} />
        <meshBasicMaterial map={picture} />
      </mesh>
    </group>
  );
};

export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);

  // Update delayed page for UI effects
  useState(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) {
          return delayedPage;
        } else {
          timeout = setTimeout(
            () => {
              goToPage();
            },
            Math.abs(page - delayedPage) > 2 ? 50 : 150
          );
          if (page > delayedPage) {
            return delayedPage + 1;
          }
          if (page < delayedPage) {
            return delayedPage - 1;
          }
        }
      });
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [page]);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      <Cover
        opened={delayedPage > 0}
        bookClosed={delayedPage === 0 || delayedPage === pages.length}
        texture="textures/book-cover.jpg"
        position-x={-PAGE_WIDTH / 2 - 0.01}
      />
      <Cover
        opened={delayedPage === pages.length}
        bookClosed={delayedPage === 0 || delayedPage === pages.length}
        texture="textures/book-back.jpg"
        position-x={PAGE_WIDTH / 2 + 0.01}
        rotation-y={Math.PI}
      />
      {[...pages].map((pageData, index) => (
        <Page
          key={index}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          front={pageData.front}
          back={pageData.back}
          {...props}
        />
      ))}
    </group>
  );
};
