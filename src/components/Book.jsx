import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bone, BoxGeometry, Color, Float32BufferAttribute, MeshStandardMaterial, Quaternion, Skeleton, SRGBColorSpace, Uint16BufferAttribute, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { pageAtom, pages } from "./UI";
import { useAtom } from "jotai";

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
  2,
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

const whiteColor = new Color("white");
const emissiveColor = new Color("orange");

const pageMaterials = [
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: "#111",
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
];

pages.forEach((page) => {
  useTexture.preload(`/textures/${page.front}.jpg`);
  useTexture.preload(`/textures/${page.back}.jpg`);
  useTexture.preload(`/textures/book-cover-roughness.jpg`);
});

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const [picture, picture2, pictureRoughness] = useTexture([
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
    `/textures/book-cover-roughness.jpg`,
  ]);
  
  // Add color space for proper rendering
  picture.colorSpace = picture2.colorSpace = SRGBColorSpace;
  picture.anisotropy = 16;
  picture2.anisotropy = 16;

  const group = useRef();
  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();
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
    return bones;
  }, []);

  const [_, setPage] = useAtom(pageAtom);

  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

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

    const emissiveIntensity = highlighted ? 0.22 : 0;
    skinnedMeshRef.current.material[0].emissive.lerp(
      emissiveColor,
      emissiveIntensity
    );

    if (bookClosed) {
      easing.dampAngle(
        group.current.rotation,
        "y",
        0,
        easingFactor,
        delta
      );
      return;
    }

    const timeSinceTurned = +new Date() - turnedAt.current;
    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;

    if (!opened) {
      targetRotation += degToRad(number * 0.8);
    }

    const turningTime = Math.min(400, pageTurningTime) / 1000;
    const turningState = Math.min(timeSinceTurned / (turningTime * 1000), 1);

    let foldRotationTarget = degToRad(Math.sign(targetRotation) * 2);

    easing.dampAngle(
      group.current.rotation,
      "y",
      targetRotation,
      easingFactor,
      delta
    );

    const foldIntensityTarget =
      turningState > 0.05 && turningState < 0.95 ? 1 : 0;

    easing.damp(
      lastRotation,
      "current",
      group.current.rotation.y,
      easingFactorFold,
      delta
    );
    easing.damp(
      foldRotationAmount,
      "current",
      foldIntensityTarget,
      easingFactorFold,
      delta
    );

    let rotationAxis = new Vector3();

    for (let i = 0; i < manualSkinnedMesh.length; i++) {
      const bone = manualSkinnedMesh[i];
      const target = new Quaternion();

      if (i === 0) {
        bone.rotation.y = lastRotation.current;
      } else {
        let pageRotation =
          lastRotation.current > 0
            ? Math.max(0, lastRotation.current - degToRad(i * 0.8))
            : Math.min(0, lastRotation.current + degToRad(i * 0.8));

        let foldRotation =
          foldRotationAmount.current *
          foldRotationTarget *
          (i / manualSkinnedMesh.length);

        let offset = i < manualSkinnedMesh.length / 2 ? 1 : -1;

        rotationAxis.set(offset, 0, 0).normalize();
        target.setFromAxisAngle(rotationAxis, foldRotation);

        rotationAxis.set(0, 1, 0).normalize();
        const rot = new Quaternion().setFromAxisAngle(rotationAxis, pageRotation);

        target.multiply(rot);
        bone.quaternion.slerp(target, 0.85);
      }
    }

    easing.damp(
      skinnedMeshRef.current.position,
      "z",
      opened ? -PAGE_DEPTH : 0,
      easingFactor,
      delta
    );
  });

  useEffect(() => {
    skinnedMeshRef.current.skeleton = new Skeleton(manualSkinnedMesh);
  }, [manualSkinnedMesh]);

  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted); // Add cursor feedback

  const lastRotation = useRef(opened ? -Math.PI / 2 : Math.PI / 2);
  const foldRotationAmount = useRef(0);
  const pageTurningTime = 300;

  const materials = useMemo(() => {
    return [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor, // Add explicit white color
        map: picture,
        ...(number === 0
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
      new MeshStandardMaterial({
        color: whiteColor, // Add explicit white color
        map: picture2,
        roughness: 0.1,
        emissive: emissiveColor, // Add emissive to back material
        emissiveIntensity: 0, // Add emissiveIntensity to back material
      }),
    ];
  }, [picture, picture2, pictureRoughness, number]);

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
        setPage(opened ? number : number + 1);
        setHighlighted(false);
      }}
    >
      <skinnedMesh
        ref={skinnedMeshRef}
        geometry={pageGeometry}
        material={materials}
        castShadow
      />
    </group>
  );
};

export const Book = ({ ...props }) => {
  const [page] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((prev) => {
        if (page === prev) {
          return prev;
        } else {
          timeout = setTimeout(
            goToPage,
            Math.abs(page - prev) > 2 ? 50 : 150
          );
          if (page > prev) {
            return prev + 1;
          }
          if (page < prev) {
            return prev - 1;
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
    <group {...props}>
      {[...pages].map((pageData, index) => (
        <Page
          key={index}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          {...pageData}
        />
      ))}
    </group>
  );
};
