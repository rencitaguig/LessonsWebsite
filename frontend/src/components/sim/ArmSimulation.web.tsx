/* eslint-disable react/no-unknown-property -- react-three-fiber JSX intrinsics */
// Web-only interactive robotic crane arm — react-three-fiber.
// Turntable yaw (θ₀) slews a vertical arm plane toward the target; shoulder
// and elbow pitch joints (θ₁, θ₂) solve planar IK inside it. Styled after a
// cyberpunk crane: dark metal, gold emissive strips, red glowing hub rings.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, Edges, Grid, OrbitControls } from '@react-three/drei';
import type { Group, Mesh } from 'three';

import ExplanationPanel from './ExplanationPanel';
import { solveIk, groundReachBounds, type IkResult } from './ik';

const L1 = 1.4;
const L2 = 1.2;
const SHOULDER_H = 1.9;
const GRIP_Y = 0.34;
const MAST_CLEAR = 0.55;
const BOUNDS = groundReachBounds(GRIP_Y, SHOULDER_H, L1, L2);
const R_MIN = Math.max(BOUNDS.lo, MAST_CLEAR);
const R_MAX = BOUNDS.hi;

const CUBE_HALF = 0.13;
const FINGER_OPEN = CUBE_HALF + 0.085;
const FINGER_CLOSED = CUBE_HALF + 0.022;

const BODY_MAT = { color: '#171a22', metalness: 0.72, roughness: 0.34 };
const DARK_MAT = { color: '#10131a', metalness: 0.65, roughness: 0.4 };
const GOLD_GLOW = { color: '#2a2300', emissive: '#ffd23f', emissiveIntensity: 1.15 };
const RED_GLOW = { color: '#3a0d12', emissive: '#ff2a33', emissiveIntensity: 1.6 };
const STEEL_MAT = { color: '#8b93a7', metalness: 0.85, roughness: 0.25 };

function dampAngle(current: number, goal: number, lambda: number, dt: number) {
  let delta = goal - current;
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  return current + delta * (1 - Math.exp(-lambda * dt));
}

interface ArmRigProps {
  goal: React.MutableRefObject<{ yaw: number; t1: number; t2: number }>;
  dragging: boolean;
  reachable: boolean;
}

function ArmRig({ goal, dragging, reachable }: ArmRigProps) {
  const joints = useRef({ ...goal.current });
  const grip = useRef(0); // 0 = fingers open, 1 = closed on the object
  const yawGroup = useRef<Group>(null);
  const joint1 = useRef<Group>(null);
  const joint2 = useRef<Group>(null);
  const tip = useRef<Group>(null);
  const fingerA = useRef<Mesh>(null);
  const fingerB = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const lambda = dragging ? 14 : 6;
    joints.current.yaw = dampAngle(joints.current.yaw, goal.current.yaw, lambda, delta);
    joints.current.t1 = dampAngle(joints.current.t1, goal.current.t1, lambda, delta);
    joints.current.t2 = dampAngle(joints.current.t2, goal.current.t2, lambda, delta);
    if (yawGroup.current) yawGroup.current.rotation.y = -joints.current.yaw;
    if (joint1.current) joint1.current.rotation.z = joints.current.t1;
    if (joint2.current) joint2.current.rotation.z = joints.current.t2;
    // the gripper hangs plumb like a crane hook — counter-rotate the tip
    if (tip.current) tip.current.rotation.z = -(joints.current.t1 + joints.current.t2);

    const err =
      Math.abs(goal.current.yaw - joints.current.yaw) +
      Math.abs(goal.current.t1 - joints.current.t1) +
      Math.abs(goal.current.t2 - joints.current.t2);
    const gripTarget = !dragging && reachable && err < 0.02 ? 1 : 0;
    grip.current += (gripTarget - grip.current) * (1 - Math.exp(-10 * delta));
    const offset = FINGER_OPEN - (FINGER_OPEN - FINGER_CLOSED) * grip.current;
    if (fingerA.current) fingerA.current.position.z = offset;
    if (fingerB.current) fingerB.current.position.z = -offset;
  });

  return (
    <group>
      {/* square base slab with red glowing edge trim */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.6, 0.1, 1.6]} />
        <meshStandardMaterial {...DARK_MAT} />
      </mesh>
      {[0.78, -0.78].map((edge) => (
        <React.Fragment key={edge}>
          <mesh position={[edge, 0.105, 0]}>
            <boxGeometry args={[0.02, 0.012, 1.56]} />
            <meshStandardMaterial {...RED_GLOW} />
          </mesh>
          <mesh position={[0, 0.105, edge]}>
            <boxGeometry args={[1.56, 0.012, 0.02]} />
            <meshStandardMaterial {...RED_GLOW} />
          </mesh>
        </React.Fragment>
      ))}

      {/* tall mast with gold accent strips */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.4, 1.7, 0.4]} />
        <meshStandardMaterial {...BODY_MAT} />
      </mesh>
      {[0.1, -0.1].map((x) => (
        <mesh key={x} position={[x, 0.95, 0.205]}>
          <boxGeometry args={[0.035, 1.5, 0.012]} />
          <meshStandardMaterial {...GOLD_GLOW} />
        </mesh>
      ))}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.5, 0.24, 0.5]} />
        <meshStandardMaterial {...DARK_MAT} />
      </mesh>

      {/* slewing assembly: yaw group on the mast top */}
      <group position={[0, SHOULDER_H, 0]} ref={yawGroup}>
        {/* turntable housing */}
        <mesh position={[0, -0.07, 0]}>
          <cylinderGeometry args={[0.22, 0.27, 0.14, 32]} />
          <meshStandardMaterial {...BODY_MAT} />
        </mesh>

        <group ref={joint1}>
          {/* shoulder hub — red glowing ring in the pitch plane */}
          <mesh>
            <torusGeometry args={[0.15, 0.038, 14, 40]} />
            <meshStandardMaterial {...RED_GLOW} />
          </mesh>
          <mesh rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.09, 0.09, 0.1, 24]} />
            <meshStandardMaterial {...DARK_MAT} />
          </mesh>
          {/* link 1 — crane boom with gold light strip */}
          <mesh position={[L1 / 2, 0, 0]}>
            <boxGeometry args={[L1, 0.15, 0.13]} />
            <meshStandardMaterial {...BODY_MAT} />
          </mesh>
          <mesh position={[L1 / 2, 0.085, 0]}>
            <boxGeometry args={[L1 * 0.82, 0.024, 0.135]} />
            <meshStandardMaterial {...GOLD_GLOW} />
          </mesh>

          <group position={[L1, 0, 0]}>
            <group ref={joint2}>
              {/* elbow hub — smaller red glowing ring */}
              <mesh>
                <torusGeometry args={[0.11, 0.03, 14, 36]} />
                <meshStandardMaterial {...RED_GLOW} />
              </mesh>
              <mesh rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[0.07, 0.07, 0.09, 24]} />
                <meshStandardMaterial {...DARK_MAT} />
              </mesh>
              {/* link 2 — forearm with gold light strip */}
              <mesh position={[L2 / 2, 0, 0]}>
                <boxGeometry args={[L2, 0.12, 0.1]} />
                <meshStandardMaterial {...BODY_MAT} />
              </mesh>
              <mesh position={[L2 / 2, 0.07, 0]}>
                <boxGeometry args={[L2 * 0.8, 0.02, 0.105]} />
                <meshStandardMaterial {...GOLD_GLOW} />
              </mesh>

              {/* wrist + hanging claw, kept vertical like a crane hook */}
              <group position={[L2, 0, 0]} ref={tip}>
                <mesh>
                  <cylinderGeometry args={[0.075, 0.09, 0.12, 24]} />
                  <meshStandardMaterial {...BODY_MAT} />
                </mesh>
                <mesh position={[0, -0.15, 0]}>
                  <cylinderGeometry args={[0.026, 0.026, 0.26, 16]} />
                  <meshStandardMaterial {...STEEL_MAT} />
                </mesh>
                <mesh position={[0, -0.16, 0]}>
                  <torusGeometry args={[0.055, 0.018, 12, 28]} />
                  <meshStandardMaterial {...RED_GLOW} />
                </mesh>
                <group position={[0, -0.28, 0]}>
                  <mesh ref={fingerA} position={[0, 0, FINGER_OPEN]}>
                    <boxGeometry args={[0.045, 0.13, 0.035]} />
                    <meshStandardMaterial {...STEEL_MAT} />
                  </mesh>
                  <mesh ref={fingerB} position={[0, 0, -FINGER_OPEN]}>
                    <boxGeometry args={[0.045, 0.13, 0.035]} />
                    <meshStandardMaterial {...STEEL_MAT} />
                  </mesh>
                </group>
              </group>
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
  const goal = useRef({ yaw: 0.4, t1: -0.5, t2: 0.9 });

  const place = (x: number, z: number) => {
    // Confine the object to the workspace — it slides along the rings rather than leaving them.
    const d = Math.hypot(x, z);
    let px = x;
    let pz = z;
    if (d > R_MAX) {
      px = (x * R_MAX) / d;
      pz = (z * R_MAX) / d;
    } else if (d < R_MIN) {
      const k = d > 1e-6 ? R_MIN / d : 1;
      px = d > 1e-6 ? x * k : R_MIN;
      pz = d > 1e-6 ? z * k : 0;
    }

    const solved = solveIk(px, pz, L1, L2, SHOULDER_H, GRIP_Y, undefined, {
      yaw: goal.current.yaw,
      theta1: goal.current.t1,
      theta2: goal.current.t2
    });
    setResult(solved);
    setTarget({ x: px, z: pz });
    if (solved.reachable && solved.chosen) {
      goal.current = { yaw: solved.chosen.yaw, t1: solved.chosen.theta1, t2: solved.chosen.theta2 };
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
        <Canvas camera={{ position: [3.6, 3.4, 3.6], fov: 44 }}>
          <color attach="background" args={['#101b35']} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 3]} intensity={1.15} />
          <directionalLight position={[-3, 4, -3]} intensity={0.25} color="#d174d2" />

          <Grid
            position={[0, 0.001, 0]}
            args={[10, 10]}
            cellSize={0.5}
            cellColor="#24365c"
            sectionSize={1}
            sectionColor="#3f567f"
            fadeDistance={20}
            infiniteGrid
          />
          <ContactShadows position={[0, 0.002, 0]} scale={10} blur={2.4} opacity={0.55} far={5} resolution={512} />

          {/* workspace boundary: outer reach ring + mast keep-out ring */}
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
            <ringGeometry args={[R_MAX - 0.015, R_MAX, 96]} />
            <meshBasicMaterial color="#e0563f" transparent opacity={0.8} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
            <ringGeometry args={[R_MIN, R_MIN + 0.015, 64]} />
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
            <mesh position={[0, CUBE_HALF + 0.01, 0]}>
              <boxGeometry args={[CUBE_HALF * 2, CUBE_HALF * 2, CUBE_HALF * 2]} />
              <meshStandardMaterial
                color={result && !result.reachable ? '#c2371f' : '#e0563f'}
                emissive={result && !result.reachable ? '#c2371f' : '#e0563f'}
                emissiveIntensity={0.35}
              />
              <Edges scale={1.01} color={result && !result.reachable ? '#7d2010' : '#8c3220'} />
            </mesh>
          </group>

          <ArmRig goal={goal} dragging={dragging} reachable={!!result?.reachable} />
          <OrbitControls makeDefault enabled={!dragging} maxPolarAngle={Math.PI / 2.05} minDistance={3} maxDistance={14} />
        </Canvas>
      </View>

      <View style={styles.side}>
        <ExplanationPanel result={result} l1={L1} l2={L2} shoulderH={SHOULDER_H} gripY={GRIP_Y} />
        <Text style={styles.hint}>
          Click or drag on the ground to move the crate — it cannot leave the workspace rings. The crane
          slews to face it, pitches down, and the claw closes once the arm settles. Drag the background to
          orbit the camera.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: { flex: 1, flexDirection: 'row', gap: 16, padding: 20 },
  canvasWrap: {
    flex: 1,
    minHeight: 440,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a3d5f'
  },
  side: { width: 320, gap: 12 },
  hint: { fontSize: 12, lineHeight: 18, color: '#c4c9d8' }
});
