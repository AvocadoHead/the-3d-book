import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
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

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  1
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
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
  new Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);

  useEffect(() => {
    let timeout;
    const isDelayedPageTurning = page === delayedPage + 1 || page === delayedPage - 1;
    if (isDelayedPageTurning) {
      timeout = setTimeout(() => {
        setDelayedPage(page);
      }, 350);
    } else {
      setDelayedPage(page);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [page, delayedPage]);

  return (
    <group {...props}>
      {[...pages].map((pageData, index) =>
        index === 0 ? (
          <CoverPage
            key={index}
            number={index}
            page={delayedPage}
            pages={pages}
            {...pageData}
          />
        ) : (
          <Page
            key={index}
            number={index}
            page={delayedPage}
            {...pageData}
          />
        )
      )}
    </group>
  );
};

const Page = ({ number, front, back, ...props }) => {
  const group = useRef();
  const [picture, picture2, pictureRoughness] = useTexture([
    `textures/${front}.jpg`,
    `textures/${back}.jpg`,
    `textures/book-cover-roughness.jpg`,
  ]);

  const skinnedMeshRef = useRef();
  const [, setHovered] = useState(false);
  useCursor(false);

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    let parentBone = new Bone();
    parentBone.position.z = 0.02;
    bones.push(parentBone);
    for (let i = 0; i < PAGE_SEGMENTS; i++) {
      let bone = new Bone();
      bone.position.x = SEGMENT_WIDTH;
      bones.push(bone);
    }
    const skeleton = new Skeleton(bones);
    const materials = [
      new MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.3,
        side: 2,
      }),
      new MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.3,
        side: 2,
      }),
      new MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.3,
        side: 2,
      }),
      new MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.3,
        side: 2,
      }),
      new MeshStandardMaterial({ map: picture, color: 0xffffff }),
      new MeshStandardMaterial({ map: picture2, color: 0xffffff }),
    ];
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    let prev;
    skeleton.bones.forEach((bone, i) => {
      if (prev) prev.add(bone);
      prev = bone;
    });
    return mesh;
  }, [picture, picture2]);

  const [highlighted, setHighlighted] = useState(false);
  const [, setPage] = useAtom(pageAtom);
  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }
    const t = props.page;
    const pageNumber = number;
    let targetRotation = pageNumber === t ? 0 : pageNumber > t ? -Math.PI : Math.PI;
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
        bookClosed ? easingFactorFold : easingFactor,
        delta
      );

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        bookClosed ? easingFactorFold : easingFactor,
        delta
      );
    }
    emptyPagesMaterial.forEach((mat) => {
      easing.damp(mat, "opacity", bookClosed ? 0 : 1, 0.1, delta);
    });
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
    </group>
  );
};

const CoverPage = ({ ...props }) => {
  const [picture, pictureRoughness] = useTexture([
    "textures/book-cover.jpg",
    "textures/book-cover-roughness.jpg",
  ]);

  picture.colorSpace = SRGBColorSpace;
  pictureRoughness.flipY = false;
  picture.flipY = false;

  return (
    <Page
      picture={picture}
      pictureRoughness={pictureRoughness}
      {...props}
    />
  );
};

const emptyPagesMaterial = [];
const turningTime = 0;
const bookClosed = false;
