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

const easingFactor = 0.5; // Controls the speed of the easing
const easingFactorFold = 0.3; // Controls the speed of the easing
const insideCurveStrength = 0.18; // Controls the strength of the curve
const outsideCurveStrength = 0.05; // Controls the strength of the curve
const turningCurveStrength = 0.09; // Controls the strength of the curve

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71; // 4:3 aspect ratio
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
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

export const Book = ({ ...otherProps }) => {
  const [page] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);

  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new Bone();
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

    const skeleton = new Skeleton(bones);

    const materials = [
      new MeshStandardMaterial({
        color: new Color("white"),
      }),
      new MeshStandardMaterial({
        color: new Color("#111"),
      }),
      new MeshStandardMaterial({
        color: new Color("white"),
      }),
    ];
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, []);

  useFrame((_, delta) => {
    if (!manualSkinnedMesh) {
      return;
    }

    let targetRotation = delayedPage === page ? 0 : -Math.PI / 2;
    const bones = manualSkinnedMesh.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * targetRotation;
      const rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation +
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity;
      let foldRotationAngle = degToRad(40);
      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
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
        easingFactorFold,
        delta
      );
    }
  });

  const { ...props } = otherProps;
  const [, setPage] = useAtom(pageAtom);
  const group = useRef();

  const goToPage = (pageNumber) => {
    setPage(pageNumber);
    setHighlightedPage(pageNumber);
  };

  const { front, back, page: number } = props;

  useEffect(() => {
    if (page === number) {
      setDelayedPage(page);
    }
  }, [page, number]);

  const turnTime = 0.4;
  const [isRTL, setIsRTL] = useState(false);
  const [turningTime, setTurningTime] = useState(0);
  const [highlightedPage, setHighlightedPage] = useState(0);

  useFrame((_, delta) => {
    if (!manualSkinnedMesh) {
      return;
    }
    if (page === number) {
      setTurningTime((current) => {
        if (current === 0) {
          setDelayedPage(page);
          return 0;
        }
        const newValue = MathUtils.clamp(current - delta / turnTime, 0, 1);
        return newValue;
      });
    } else if (page === number + 1) {
      setTurningTime((current) => {
        if (current === 1) {
          return 1;
        }
        const newValue = MathUtils.clamp(current + delta / turnTime, 0, 1);
        return newValue;
      });
    }
    if (!manualSkinnedMesh) {
      return;
    }

    let targetRotation = turningTime * Math.PI * 0.5;

    const bones = manualSkinnedMesh.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * targetRotation;
      const rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation +
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity;
      let foldRotationAngle = degToRad(40);
      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
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
        easingFactorFold,
        delta
      );
    }
  });

  useTexture.preload(`textures/${front}.jpg`);
  useTexture.preload(`textures/${back}.jpg`);
  useTexture.preload(`textures/book-cover-roughness.jpg`);

  const [frontTexture, backTexture, roughness] = useTexture([
    `textures/${front}.jpg`,
    `textures/${back}.jpg`,
    `textures/book-cover-roughness.jpg`,
  ]);
  frontTexture.colorSpace = backTexture.colorSpace = SRGBColorSpace;

  useEffect(() => {
    if (!skinnedMeshRef.current) {
      return;
    }
    skinnedMeshRef.current.material[0].map = frontTexture;
    skinnedMeshRef.current.material[0].roughness = 0.1;

    skinnedMeshRef.current.material[2].map = backTexture;
    skinnedMeshRef.current.material[2].roughness = 0.1;

    skinnedMeshRef.current.material[1].roughnessMap = roughness;
  }, [frontTexture, backTexture, roughness]);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group
      {...otherProps}
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <primitive
        ref={skinnedMeshRef}
        object={manualSkinnedMesh}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};
