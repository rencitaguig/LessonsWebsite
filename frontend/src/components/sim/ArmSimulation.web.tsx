/* eslint-disable react/no-unknown-property -- react-three-fiber JSX intrinsics */
// Web-only interactive 2-DOF robotic arm — react-three-fiber.
// The math plane (x, y) maps to the ground plane (x, z) in the scene.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';

import ExplanationPanel from './ExplanationPanel';
import { solveIk, type IkResult } from './ik';

const L1 = 1.4;
const L2 = 1.2;
const ARM_Y = 0.32;

function dampAngle(current: number, goal: number, lambda: number, dt: number) {
  let delta = goal - current;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return current + delta * (1 - Math.exp(-lambda * dt));
}

function ArmRig({ goal }: { goal: React.MutableRefObject<{ t1: number; t2: number }> }) {
  const joints = useRef({ ...goal.current });
  const joint1 = useRef<Group>(null);
  const joint2 = useRef<Group>(null);

  useFrame((_, delta) => {
    joints.current.t1 = dampAngle(joints.current.t1, goal.current.t1, 6, delta);
    joints.current.t2 = dampAngle(joints.current.t2, goal.current.t2, 6, delta);
    if (joint1.current) joint1.current.rotation.y = -joints.current.t1;
    if (joint2.current) joint2.current.rotation.y = -joints.current.t2;
  });

  return (
    <group>
      {/* pedestal */}
      <mesh position={[0, ARM_Y / 2, 0]}>
        <cylinderGeometry args={[0.22, 0.3, ARM_Y, 32]} />
        <meshStandardMaterial color="#3f567f" />
      </mesh>

      <group position={[0, ARM_Y, 0]}>
        <group ref={joint1}>
          {/* joint 1 (shoulder) */}
          <mesh>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshStandardMaterial color="#d174d2" />
          </mesh>
          {/* link 1 */}
          <mesh position={[L1 / 2, 0, 0]}>
            <boxGeometry args={[L1, 0.1, 0.16]} />
            <meshStandardMaterial color="#8fa8cf" />
          </mesh>

          <group position={[L1, 0, 0]}>
            <group ref={joint2}>
              {/* joint 2 (elbow) */}
              <mesh>
                <sphereGeometry args={[0.11, 24, 24]} />
                <meshStandardMaterial color="#d174d2" />
              </mesh>
              {/* link 2 */}
              <mesh position={[L2 / 2, 0, 0]}>
                <boxGeometry args={[L2, 0.08, 0.12]} />
                <meshStandardMaterial color="#b8c6e2" />
              </mesh>
              {/* end-effector / gripper */}
              <mesh position={[L2, 0, 0]}>
                <boxGeometry args={[0.12, 0.2, 0.12]} />
                <meshStandardMaterial color="#e0563f" />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

export default function ArmSimulation() {
  const [target, setTarget] = useState({ x: 1.5, z: 0.6 });
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<IkResult | null>(null);
  const goal = useRef({ t1: 0.4, t2: -0.8 });

  const place = (x: number, z: number) => {
    const solved = solveIk(x, z, L1, L2, undefined, { theta1: goal.current.t1, theta2: goal.current.t2 });
    setResult(solved);
    setTarget({ x, z });
    if (solved.reachable && solved.chosen) {
      goal.current = { t1: solved.chosen.theta1, t2: solved.chosen.theta2 };
    }
  };

  const onPlaneDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setDragging(true);
    place(event.point.x, event.point.z);
  };
  const onPlaneMove = (event: ThreeEvent<PointerEvent>) => {
    if (dragging) place(event.point.x, event.point.z);
  };
  const stopDrag = () => setDragging(false);

  useEffect(() => {
    place(target.x, target.z);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.layout}>
      <View style={styles.canvasWrap}>
        <Canvas camera={{ position: [3.4, 3.8, 3.4], fov: 42 }}>
          <color attach="background" args={['#101b35']} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 6, 3]} intensity={1.1} />

          <Grid
            position={[0, 0.001, 0]}
            args={[10, 10]}
            cellSize={0.5}
            cellColor="#24365c"
            sectionSize={1}
            sectionColor="#3f567f"
            fadeDistance={18}
            infiniteGrid
          />

          {/* workspace boundary: max reach ring + inner dead-zone ring */}
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
            <ringGeometry args={[L1 + L2 - 0.015, L1 + L2, 96]} />
            <meshBasicMaterial color="#e0563f" transparent opacity={0.8} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
            <ringGeometry args={[Math.abs(L1 - L2), Math.abs(L1 - L2) + 0.015, 64]} />
            <meshBasicMaterial color="#e0563f" transparent opacity={0.45} />
          </mesh>

          {/* pointer input surface (whole ground is click/drag area) */}
          <mesh
            rotation-x={-Math.PI / 2}
            position={[0, 0, 0]}
            onPointerDown={onPlaneDown}
            onPointerMove={onPlaneMove}
            onPointerUp={stopDrag}
            onPointerLeave={stopDrag}
          >
            <planeGeometry args={[60, 60]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* draggable target object */}
          <group position={[target.x, 0, target.z]}>
            <mesh position={[0, 0.14, 0]}>
              <boxGeometry args={[0.26, 0.26, 0.26]} />
              <meshStandardMaterial
                color={result && !result.reachable ? '#c2371f' : '#e0563f'}
                emissive={result && !result.reachable ? '#c2371f' : '#e0563f'}
                emissiveIntensity={0.35}
              />
            </mesh>
          </group>

          <ArmRig goal={goal} />
          <OrbitControls makeDefault enabled={!dragging} maxPolarAngle={Math.PI / 2.05} minDistance={2.5} maxDistance={12} />
        </Canvas>
      </View>

      <View style={styles.side}>
        <ExplanationPanel result={result} l1={L1} l2={L2} />
        <Text style={styles.hint}>
          Click or drag on the ground to move the orange target. Drag the background to orbit the camera.
          The coral rings mark the outer reach limit (L₁ + L₂) and the inner dead zone (|L₁ − L₂|).
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { flex: 1, flexDirection: 'row', gap: 16, padding: 20 },
  canvasWrap: {
    flex: 1,
    minHeight: 420,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a3d5f'
  },
  side: { width: 320, gap: 12 },
  hint: { fontSize: 12, lineHeight: 18, color: '#c4c9d8' }
});
