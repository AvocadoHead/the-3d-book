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
    color: "#111",
  }),
  new THREE.MeshStandardMaterial({ color: whiteColor }),
];
const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const [picture, picture2] = useTexture([`textures/${front}.jpg`, `textures/${back}.jpg`]);
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);
  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);
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
      new THREE.MeshStandardMaterial({ color: whiteColor, map: picture }),
      new THREE.MeshStandardMaterial({ color: whiteColor, map: picture2 }),
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
    const emissiveIntensity = highlighted ? 0.22 : 0;
    skinnedMeshRef.current.material[0].emissive = emissiveColor;
    skinnedMeshRef.current.material[1].emissive = emissiveColor;
    skinnedMeshRef.current.material[2].emissive = emissiveColor;
    skinnedMeshRef.current.material[3].emissive = emissiveColor;
    easing.damp(
      skinnedMeshRef.current.material[0],
      "emissiveIntensity",
      emissiveIntensity,
      0.25,
      delta
    );
    easing.damp(
      skinnedMeshRef.current.material[1],
      "emissiveIntensity",
      emissiveIntensity,
      0.25,
      delta
    );
    easing.damp(
      skinnedMeshRef.current.material[2],
      "emissiveIntensity",
      emissiveIntensity,
      0.25,
      delta
    );
    easing.damp(
      skinnedMeshRef.current.material[3],
      "emissiveIntensity",
      emissiveIntensity,
      0.25,
      delta
    );
    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }
    let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);
    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }
    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];
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
      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );
      const foldIntensity =
        i === 0
          ? Math.sin(turningTime * Math.PI) * 0.3
          : Math.sin(turningTime * Math.PI) *
            Math.pow(1 - i / bones.length, 3);
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });
  return (
    <group
      {...props}
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlighted(false);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
      <mesh
        position={[0, 0, -number * PAGE_DEPTH + page * PAGE_DEPTH]}
      >
        <boxGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH]} />
        <meshBasicMaterial map={picture} />
      </mesh>
      <mesh
        position={[0, 0, -number * PAGE_DEPTH + page * PAGE_DEPTH + PAGE_DEPTH]}
      >
        <boxGeometry args={[PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH]} />
        <meshBasicMaterial map={picture2} />
      </mesh>
    </group>
  );
};
const Cover = ({ bookClosed, texture, opened, ...props }) => {
  const OFFSET = 0.01;
  const PAGE_COVER_WIDTH = 1.28 + 2 * OFFSET;
  const [hovered, setHovered] = useState(false);
  const [coverTexture] = useTexture([texture]);
  useCursor(hovered);
  const coverGroupRef = useRef();
  useFrame((_, delta) => {
    const targetRotation = opened ? -Math.PI / 2 : 0;
    easing.dampAngle(
      coverGroupRef.current.rotation,
      "y",
      targetRotation,
      easingFactor,
      delta
    );
    const foldRotationAngle = bookClosed ? 0 : degToRad(2);
    easing.dampAngle(
      coverGroupRef.current.rotation,
      "x",
      foldRotationAngle,
      easingFactorFold,
      delta
    );
  });
  return (
    <group
      {...props}
      ref={coverGroupRef}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <mesh receiveShadow>
        <boxGeometry args={[PAGE_COVER_WIDTH, PAGE_HEIGHT, PAGE_DEPTH]} />
        <meshStandardMaterial
          map={coverTexture}
          emissive={emissiveColor}
          emissiveIntensity={hovered ? 0.22 : 0}
        />
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
