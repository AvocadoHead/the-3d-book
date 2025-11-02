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

const whiteColor = new Color("white");
const emissiveColor = new Color("orange");

const pageMaterials = [
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: "#111" }),
  new MeshStandardMaterial({ color: whiteColor }),
  new MeshStandardMaterial({ color: whiteColor }),
];

// Helper function to add extension if needed
const getTexturePath = (textureName) => {
  const hasExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(textureName);
  return `textures/${textureName}${hasExtension ? '' : '.jpg'}`;
};

pages.forEach((page) => {
  useTexture.preload(getTexturePath(page.front));
  useTexture.preload(getTexturePath(page.back));
});

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const [picture, picture2, pictureRoughness] = useTexture([
    getTexturePath(front),
    getTexturePath(back),
    "./textures/book-roughness.jpg",
  ]);
  picture.colorSpace = picture2.colorSpace = SRGBColorSpace;
  const group = useRef();
  const skinnedMeshRef = useRef();

  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  const manualSkinnedMesh = useMemo(() => {
    const geometry = pageGeometry.clone();
    const materials = pageMaterials;

    const skinIndexData = [];
    const skinWeightData = [];

    const indices = geometry.getIndex().array;
    const vertices = geometry.attributes.position.array;

    for (let i = 0; i < vertices.length / 3; i++) {
      const x = vertices[i * 3];

      // The bones are organized in a line along the x axis
      const segmentIndex = Math.floor(x / SEGMENT_WIDTH);

      const segmentStart = segmentIndex * SEGMENT_WIDTH;
      const segmentEnd = segmentStart + SEGMENT_WIDTH;

      const weight1 = 1 - (x - segmentStart) / SEGMENT_WIDTH;
      const weight2 = 1 - weight1;

      skinIndexData.push(segmentIndex, segmentIndex + 1, 0, 0);
      skinWeightData.push(weight1, weight2, 0, 0);
    }

    geometry.setAttribute(
      "skinIndex",
      new Uint16BufferAttribute(skinIndexData, 4)
    );
    geometry.setAttribute(
      "skinWeight",
      new Float32BufferAttribute(skinWeightData, 4)
    );

    const mesh = new SkinnedMesh(geometry, materials);
    return mesh;
  }, []);

  const bones = useMemo(() => {
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
    return bones;
  }, []);

  const skeleton = useMemo(() => {
    return new Skeleton(bones);
  }, [bones]);

  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const emissiveColor = highlighted ? "orange" : "white";

    skinnedMeshRef.current.material[0].emissive.lerp(
      whiteColor,
      highlighted ? 0.22 : 0
    );
    skinnedMeshRef.current.material[1].emissive.lerp(
      whiteColor,
      highlighted ? 0.22 : 0
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

    const bones = skeleton.bones;
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

  useEffect(() => {
    if (!skinnedMeshRef.current) {
      return;
    }
    skinnedMeshRef.current.skeleton = skeleton;
  }, [skeleton]);

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
      <primitive object={bones[0]} />
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
      <meshStandardMaterial
        attach="material-0"
        map={picture}
        roughnessMap={pictureRoughness}
      />
      <meshStandardMaterial
        attach="material-2"
        map={picture2}
        roughnessMap={pictureRoughness}
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
      {[...pages].map((pageData, index) => (
        <Page
          key={index}
          {...pageData}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          page={delayedPage}
        />
      ))}
    </group>
  );
};
