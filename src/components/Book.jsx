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
  useTexture.preload(`textures/${page.front}.jpg`);
  useTexture.preload(`textures/${page.back}.jpg`);
  useTexture.preload(`textures/book-cover-roughness.jpg`);
});

const Page = ({ number, front, back, page, opened, bookClosed, ...props }) => {
  const [picture, picture2, pictureRoughness] = useTexture([
    `textures/${front}.jpg`,
    `textures/${back}.jpg`,
    `textures/book-cover-roughness.jpg`,
  ]);
  picture.colorSpace = picture2.colorSpace = SRGBColorSpace;
  const group = useRef();
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
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        ...(number === 0
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        ...(number === pages.length - 1
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
      }),
    ];

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [picture, picture2, pictureRoughness, number]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current.rotation.y : targetRotation;
      const bone = bones[i];
      bone.rotation.y = MathUtils.lerp(
        bone.rotation.y,
        target,
        delta * (i === 0 ? easingFactorFold : easingFactor)
      );
    }
  });

  useEffect(() => {
    if (!skinnedMeshRef.current) {
      return;
    }
    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i];
      if (i === 0) {
        bone.rotation.y = opened ? -Math.PI / 2 : Math.PI / 2;
        continue;
      }
      const distance = i / bones.length;

      const insideCurveIntensity = opened ? distance : 1 - distance;

      const outsideCurveIntensity = opened ? 1 - distance : distance;

      const turningIntensity =
        Math.sin(insideCurveIntensity * Math.PI) * turningCurveStrength;

      let rotationAngle =
        insideCurveIntensity * insideCurveStrength * Math.PI -
        outsideCurveIntensity * outsideCurveStrength * Math.PI +
        turningIntensity;

      let foldRotationAngle = opened ? -Math.PI : Math.PI;
      if (!bookClosed) {
        foldRotationAngle += degToRad(number * 0.8);
      }

      if (i === 0) {
        bone.rotation.y = foldRotationAngle;
      } else {
        bone.rotation.y = rotationAngle;
      }

      if (i === bones.length - 1) {
        bone.rotation.y = -Math.PI / 2;
      }
    }
  }, [bookClosed, number, opened]);

  return (
    <group {...props} ref={group}>
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
  const [delayedPage, setDelayedPage] = useState(page);

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (page === delayedPage) {
          return delayedPage;
        } else {
          if (page > delayedPage) {
            return delayedPage + 1;
          }
          if (page < delayedPage) {
            return delayedPage - 1;
          }
        }
      });
      timeout = setTimeout(() => {
        goToPage();
      }, 150);
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [page]);

  return (
    <group {...props} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
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
