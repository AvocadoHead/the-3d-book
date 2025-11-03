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

const manualSkinnedMesh = new SkinnedMesh(pageGeometry, new MeshStandardMaterial());
const skeleton = new Skeleton();
manualSkinnedMesh.add(skeleton.bones[0]);
manualSkinnedMesh.bind(skeleton);

const whiteColor = new Color("white");
const emissiveColor = new Color("orange");

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const [picture, picture2, pictureRoughness] = useTexture([
    `textures/${front}.jpg`,
    `textures/${back}.jpg`,
    `textures/book-cover-roughness.jpg`,
  ]);
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  const skinnedMeshRef = useRef();

  const materials = useMemo(() => {
    if (!picture || !picture2 || !pictureRoughness) {
      return [];
    }

    picture.colorSpace = picture2.colorSpace = SRGBColorSpace;

    const frontMaterial = new MeshStandardMaterial({
      map: picture,
      roughnessMap: pictureRoughness,
      ...(number === 0
        ? {
            roughness: 0.1,
          }
        : {}),
    });

    const backMaterial = new MeshStandardMaterial({
      map: picture2,
      roughnessMap: pictureRoughness,
      ...(number === pages.length - 1
        ? {
            roughness: 0.1,
          }
        : {}),
    });

    return [frontMaterial, backMaterial];
  }, [picture, picture2, pictureRoughness, number]);

  useEffect(() => {
    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }
  }, [opened]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const emissiveIntensity = highlighted ? (bookClosed ? 0.22 : 0.15) : 0;

    materials.forEach((material) => {
      easing.dampC(
        material.color,
        emissiveIntensity ? emissiveColor : whiteColor,
        emissiveIntensity ? 0.5 : 0.1,
        delta
      );

      if (material.emissive) {
        material.emissive.set(emissiveColor);
        material.emissiveIntensity = emissiveIntensity;
      }
    });

    const bones = skinnedMeshRef.current.skeleton.bones;
    const targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    const insideCurveIntensity = opened ? -insideCurveStrength : insideCurveStrength;
    const outsideCurveIntensity = opened ? outsideCurveStrength : -outsideCurveStrength;
    const turningIntensity =
      Math.sin(((+new Date() - turnedAt.current) / 1000) * Math.PI * 2) *
      turningCurveStrength;

    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];

      const insideCurveIntensityFinal = insideCurveIntensity / bones.length;
      const outsideCurveIntensityFinal = outsideCurveIntensity / bones.length;
      const turningIntensityFinal = turningIntensity / bones.length;
      const rotationAngle =
        insideCurveIntensityFinal +
        outsideCurveIntensityFinal +
        turningIntensityFinal;

      let foldRotationAngle = degToRad(
        i === 0 ? targetRotation : targetRotation - degToRad(i * rotationAngle)
      );

      easing.damp(
        target.rotation,
        "y",
        foldRotationAngle,
        i === 0 ? easingFactor : easingFactorFold,
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
      onClick={(e) => {
        e.stopPropagation();
        page.current = number;
      }}
    >
      <skinnedMesh
        ref={skinnedMeshRef}
        frustumCulled={false}
        geometry={manualSkinnedMesh.geometry}
        skeleton={manualSkinnedMesh.skeleton}
      >
        <meshStandardMaterial
          attach="material-0"
          {...materials[0]}
        />
        <meshStandardMaterial
          attach="material-1"
          {...materials[1]}
        />
        <meshStandardMaterial attach="material-2" color="#111" />
        <meshStandardMaterial attach="material-3" color="#111" />
      </skinnedMesh>
    </group>
  );
};

export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {pages.map((pageData, index) =>
        index === 0 ? (
          <Page
            page={page}
            number={index}
            key={index}
            {...pageData}
            position-x={index * 0.15}
            opened={page.current > index}
            bookClosed={page.current === 0 || page.current === pages.length}
          />
        ) : (
          <Page
            page={page}
            number={index}
            key={index}
            {...pageData}
            position-x={index * 0.15}
            opened={page.current > index}
            bookClosed={page.current === 0 || page.current === pages.length}
          />
        )
      )}
    </group>
  );
};
