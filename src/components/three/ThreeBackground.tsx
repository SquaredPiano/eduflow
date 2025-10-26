"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * Animated 3D sphere with distortion effect
 * Follows Single Responsibility Principle - handles only 3D sphere rendering
 */
function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.5}>
      <MeshDistortMaterial
        color="#0b8e16"
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

/**
 * Three.js background component for hero sections
 * Provides visual depth and modern aesthetic
 */
export function ThreeBackground() {
  return (
    <div className="absolute inset-0 -z-10 opacity-20">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <AnimatedSphere />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}

/**
 * Particle system background
 * Creates floating particle effect
 */
function Particles({ count = 100 }) {
  const mesh = useRef<THREE.Points>(null);

  const particles = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    particles[i] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      mesh.current.rotation.y = state.clock.getElapsedTime() * 0.075;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#0b8e16" transparent opacity={0.6} />
    </points>
  );
}

/**
 * Particle background for dashboard
 */
export function ParticleBackground() {
  return (
    <div className="absolute inset-0 -z-10 opacity-10">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <Particles count={200} />
      </Canvas>
    </div>
  );
}
