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

pages.forEach((page) => {
  useTexture.preload(`textures/${page.front}.jpg`);
  useTexture.preload(`textures/${page.back}.jpg`);
  useTexture.preload(`textures/book-cover-roughness.jpg`);
});

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
    <group rotation-y={-Math.PI} {...props}>
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

const Page = ({ number, ...props }) => {
  const { emissive, picture, ...rest } = props;
  const [, picture2] = picture;
  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(props.opened);

  const skinnedMeshRef = useRef();

  const pageTexture = useTexture(`textures/${picture}.jpg`);
  pageTexture.colorSpace = SRGBColorSpace;
  const pageRoughnessTexture = useTexture(`textures/book-cover-roughness.jpg`);

  const pageMaterialsWithTexture = useMemo(() => {
    return [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: pageTexture,
        ...(emissive && { emissive: emissiveColor, emissiveIntensity: 0.22 }),
        roughness: 0.1,
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: pageTexture,
        roughnessMap: pageRoughnessTexture,
      }),
    ];
  }, [pageTexture, picture2, emissive]);

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

    const materials = pageMaterialsWithTexture;

    const geometry = pageGeometry.clone();
    for (let i = 0; i < geometry.attributes.position.count; i++) {
      const x = geometry.attributes.position.getX(i);

      const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
      const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

      geometry.attributes.skinIndex.setXYZW(
        i,
        skinIndex,
        Math.min(skinIndex + 1, PAGE_SEGMENTS),
        0,
        0
      );
      geometry.attributes.skinWeight.setXYZW(
        i,
        1 - skinWeight,
        skinWeight,
        0,
        0
      );
    }

    const mesh = new SkinnedMesh(geometry, materials);
    mesh.frustumCulled = false;
    mesh.add(bones[0]);
    mesh.bind(skeleton);

    return mesh;
  }, [pageMaterialsWithTexture]);

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const mesh = skinnedMeshRef.current;

    if (lastOpened.current !== props.opened) {
      turnedAt.current = +new Date();
      lastOpened.current = props.opened;
    }
    let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
    turningTime = easing.easeInOutCirc(turningTime);

    let targetRotation = props.opened ? -Math.PI / 2 : Math.PI / 2;

    if (!props.bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    const bones = mesh.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;

      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;

      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);

      if (props.bookClosed) {
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

  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);
  const [_, setPage] = useAtom(pageAtom);

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
        setPage(props.opened ? number : number + 1);
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + props.page * PAGE_DEPTH}
      />
    </group>
  );
};
