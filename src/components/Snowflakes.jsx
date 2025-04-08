import { Instance, Instances, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color } from "three";
import { lerp, randFloat, randFloatSpread } from "three/src/math/MathUtils.js";

export const Snowflakes = ({ nbParticles = 1000 }) => {
  const texture = useTexture("textures/magic_04.png");
  const particles = useMemo(
    () =>
      Array.from({ length: nbParticles }, (_, idx) => ({
        position: [randFloatSpread(5), randFloat(0, 10), randFloatSpread(5)],
        rotation: [0, randFloat(0, Math.PI * 2), 0],
        size: randFloat(0.01, 0.1),
        lifetime: randFloat(1, 6),
        speed: randFloat(0.1, 1),
      })),
    []
  );

  return (
    <Instances range={nbParticles} limit={nbParticles} instanceColor>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        alphaMap={texture}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
      {particles.map((props, i) => (
        <Particle key={i} {...props} />
      ))}
    </Instances>
  );
};

const colorStart = new Color("skyblue").multiplyScalar(30);
const colorEnd = new Color("white").multiplyScalar(30);

const Particle = ({ position, size, lifetime, speed }) => {
  const ref = useRef();
  const age = useRef(0);

  useFrame(({ camera }, delta) => {
    age.current += delta;
    if (!ref.current) {
      return;
    }
    const lifetimeProgression = age.current / lifetime;
    ref.current.scale.x =
      ref.current.scale.y =
      ref.current.scale.z =
        lifetimeProgression < 0.5
          ? lerp(0, size, lifetimeProgression) // scale in
          : lerp(size, 0, lifetimeProgression); // scale out

    ref.current.color.r = lerp(colorStart.r, colorEnd.r, lifetimeProgression);
    ref.current.color.g = lerp(colorStart.g, colorEnd.g, lifetimeProgression);
    ref.current.color.b = lerp(colorStart.b, colorEnd.b, lifetimeProgression);
    ref.current.position.y -= speed * delta;
    ref.current.position.x += Math.sin(age.current * speed) * delta;
    ref.current.position.z += Math.cos(age.current * speed) * delta;

    if (age.current > lifetime) {
      ref.current.position.set(position[0], position[1], position[2]);
      age.current = 0;
    }
    ref.current.lookAt(camera.position);
  });

  return <Instance ref={ref} position={position} scale={size} />;
};

useTexture.preload("textures/magic_04.png");
