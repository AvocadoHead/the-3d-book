import React, { useEffect, useRef, useState } from "react";
import { useFrame, useGraph } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { animate, useMotionValue } from "framer-motion";
import { MeshStandardMaterial } from "three";
import { degToRad } from "three/src/math/MathUtils";
import * as SkeletonUtils from "three-stdlib/utils/SkeletonUtils";

const easingFunction = (x) => {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

const pagesMaterials = [
  new MeshStandardMaterial({ color: "white" }),
  new MeshStandardMaterial({ color: "#FEFEFE" }),
  new MeshStandardMaterial({ color: "#FAFAFA" }),
  new MeshStandardMaterial({ color: "#F2F2F2" }),
  new MeshStandardMaterial({ color: "#FEFEFE" }),
  new MeshStandardMaterial({ color: "white" }),
];

const Picture = ({ picture, groupRef, ...props }) => {
  const texture = useTexture(picture);
  const group = useRef();
  useEffect(() => {
    if (groupRef) {
      groupRef.current = group.current;
    }
  }, [groupRef, group]);
  return (
    <group {...props} ref={group}>
      <mesh>
        <planeGeometry args={[1, 1.5]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
};

const Page = ({ number, bookClosed, picture, groupRef, ...props }) => {
  const pageTexture = useTexture(picture);
  const group = useRef();
  const [_, setLastOpened] = useState(0);
  const turnedAt = useRef(0);

  useEffect(() => {
    if (groupRef) {
      groupRef.current = group.current;
    }
  }, [groupRef, group]);

  const isEven = number % 2 === 0;

  useFrame((_, delta) => {
    if (!bookClosed && number === 0) {
      group.current.rotation.y = degToRad(-Math.min(90, Date.now() - turnedAt.current));
    } else if (!bookClosed && isEven) {
      if (group.current.rotation.y < degToRad(-180)) {
        group.current.rotation.y = degToRad(-180);
        return;
      }
      group.current.rotation.y -= delta * degToRad(180);
    } else {
      if (group.current.rotation.y === 0) {
        if (number === 0) {
          setLastOpened(Date.now());
        }
        return;
      }
      group.current.rotation.y += delta * degToRad(180);
      if (group.current.rotation.y >= 0) {
        group.current.rotation.y = 0;
      }
    }
  });

  return (
    <group {...props} ref={group}>
      <mesh
        position-x={isEven ? 0.5 : -0.5}
        rotation-y={isEven ? 0 : degToRad(180)}
      >
        <planeGeometry args={[1, 1.5]} />
        <meshStandardMaterial map={pageTexture} />
      </mesh>
      <mesh
        position-x={isEven ? -0.5 : 0.5}
        rotation-y={isEven ? degToRad(180) : 0}
      >
        <planeGeometry args={[1, 1.5]} />
        <meshStandardMaterial material={pagesMaterials[number]} />
      </mesh>
    </group>
  );
};

const Book = ({ ...props }) => {
  const { scene } = useGLTF("/models/book.glb");
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  const [picture, setPicture] = useState(0);
  const [lastPicture, setLastPicture] = useState(-1);
  const pictures = [
    "/pictures/page1.jpg",
    "/pictures/page2.jpg",
    "/pictures/page3.jpg",
    "/pictures/page4.jpg",
    "/pictures/page5.jpg",
    "/pictures/page6.jpg",
  ];

  const bookClosed = useMotionValue(true);
  const bookOpacity = useMotionValue(0);

  useEffect(() => {
    if (picture !== lastPicture) {
      animate(bookOpacity, [0, 1, 0], {
        duration: 0.5,
        times: [0, 0.5, 1],
      });
      setLastPicture(picture);
    }
  }, [picture, lastPicture]);

  useEffect(() => {
    let timeout;
    const goToNextPicture = () => {
      if (picture === pictures.length - 1) {
        bookClosed.set(true);
        timeout = setTimeout(
          () => {
            setPicture(0);
            timeout = setTimeout(() => {
              bookClosed.set(false);
            }, 500);
          },
          200 + pictures.length * 500
        );
      } else {
        bookClosed.set(false);
        timeout = setTimeout(() => {
          setPicture(picture + 1);
        }, 500);
      }
    };

    goToNextPicture();
    return () => {
      clearTimeout(timeout);
    };
  }, [picture, pictures.length]);

  const group = useRef();

  useFrame((state) => {
    group.current.children[0].material.opacity = bookOpacity.get();
  });

  return (
    <group {...props} rotation-y={degToRad(-30)}>
      <group ref={group} position-y={0.88}>
        <Picture picture={pictures[picture]} />
      </group>
      <mesh
        position-y={-0.001}
        rotation-x={degToRad(90)}
        receiveShadow
        geometry={nodes.Plane.geometry}
      >
        <meshStandardMaterial color="white" />
      </mesh>
      <Page
        number={0}
        bookClosed={bookClosed.get()}
        picture={pictures[0]}
        position-y={0.001}
        rotation-x={degToRad(90)}
      />
      <Page
        number={1}
        bookClosed={bookClosed.get()}
        picture={pictures[1]}
        position-y={0.003}
        rotation-x={degToRad(90)}
      />
      <Page
        number={2}
        bookClosed={bookClosed.get()}
        picture={pictures[2]}
        position-y={0.005}
        rotation-x={degToRad(90)}
      />
      <Page
        number={3}
        bookClosed={bookClosed.get()}
        picture={pictures[3]}
        position-y={0.007}
        rotation-x={degToRad(90)}
      />
      <Page
        number={4}
        bookClosed={bookClosed.get()}
        picture={pictures[4]}
        position-y={0.009}
        rotation-x={degToRad(90)}
      />
      <Page
        number={5}
        bookClosed={bookClosed.get()}
        picture={pictures[5]}
        position-y={0.011}
        rotation-x={degToRad(90)}
      />
    </group>
  );
};

export default Book;

useGLTF.preload("/models/book.glb");
