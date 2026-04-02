import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import { useRef, Suspense } from "react";

function OrbMesh({ isActive }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      const scale = isActive ? 1.15 + Math.sin(state.clock.elapsedTime * 4) * 0.05 : 1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color={isActive ? "#06d6a0" : "#00d4ff"}
        emissive={isActive ? "#06d6a0" : "#7c3aed"}
        emissiveIntensity={0.4}
        roughness={0.2}
        metalness={0.8}
        distort={isActive ? 0.6 : 0.3}
        speed={isActive ? 5 : 2}
      />
    </Sphere>
  );
}

export default function FloatingOrb({ isActive = false, size = "w-48 h-48" }) {
  return (
    <div className={size}>
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
          <OrbMesh isActive={isActive} />
        </Canvas>
      </Suspense>
    </div>
  );
}
