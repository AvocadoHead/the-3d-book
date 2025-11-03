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

const whiteColor = new Color("white");
const emissiveColor = new Color("orange");

const pageMaterials = [
  new MeshStandardMaterial({
    color: whiteColor,
    emissive: emissiveColor,
    emissiveIntensity: 0,
    roughness: 0.4,
    metalness: 0,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
    emissive: emissiveColor,
    emissiveIntensity: 0,
    roughness: 0.4,
    metalness: 0,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
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
  picture.colorSpace = SRGBColorSpace;
  picture2.colorSpace = SRGBColorSpace;

  const group = useRef();
  const skinnedMeshRef = useRef();

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

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
    ];
    if (number === 0) {
      materials[0] = new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        roughnessMap: pictureRoughness,
        roughness: 0.4,
        metalness: 0,
      });
      materials[1] = new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        roughnessMap: pictureRoughness,
        roughness: 0.4,
        metalness: 0,
      });
    } else if (number === pages.length) {
      materials[0] = new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        roughnessMap: pictureRoughness,
        roughness: 0.4,
        metalness: 0,
      });
      materials[1] = new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        roughnessMap: pictureRoughness,
        roughness: 0.4,
        metalness: 0,
      });
    } else {
      materials[0] = new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        roughness: 0.4,
        metalness: 0,
      });
      materials[1] = new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        roughness: 0.4,
        metalness: 0,
      });
    }

    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [picture, picture2, pictureRoughness]);

  useEffect(() => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const mesh = manualSkinnedMesh;
    skinnedMeshRef.current.add(mesh);

    return () => {
      skinnedMeshRef.current.remove(mesh);
    };
  }, [manualSkinnedMesh]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const emissiveIntensity = hovered ? 0.22 : 0;
    manualSkinnedMesh.material[0].emissiveIntensity = MathUtils.lerp(
      manualSkinnedMesh.material[0].emissiveIntensity,
      emissiveIntensity,
      0.1
    );

    manualSkinnedMesh.material[1].emissiveIntensity = MathUtils.lerp(
      manualSkinnedMesh.material[1].emissiveIntensity,
      emissiveIntensity,
      0.1
    );

    const targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      easing.dampAngle(
        group.current.rotation,
        "y",
        targetRotation,
        easingFactor,
        delta
      );
    }

    const bones = manualSkinnedMesh.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current.rotation.y : bones[i - 1].rotation.y;
      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * 0.09) * (i < bones.length / 2 ? -1 : 1);

      let rotationAngle = degToRad(Math.abs(group.current.rotation.y));
      let foldRotationAngle = degToRad(Math.abs(target));
      if (bookClosed) {
        if (opened) {
          rotationAngle = degToRad(90);
        } else {
          rotationAngle = 0;
        }
      }

      const insideCurve =
        insideCurveStrength * insideCurveIntensity * rotationAngle;
      const outsideCurve =
        outsideCurveStrength * outsideCurveIntensity * rotationAngle;
      const turningCurve =
        turningCurveStrength * turningIntensity * foldRotationAngle;

      easing.dampAngle(
        bones[i].rotation,
        "y",
        target,
        easingFactorFold,
        delta
      );

      easing.dampAngle(
        bones[i].rotation,
        "z",
        insideCurve + outsideCurve + turningCurve,
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
        setHovered(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <group ref={skinnedMeshRef} />
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
          } else if (page < prev) {
            return prev - 1;
          }
        }
        return prev;
      });
    };
    timeout = setTimeout(goToPage, 50);
    return () => {
      clearTimeout(timeout);
    };
  }, [page]);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {pages.map((pageData, index) => (
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
