// Two-link planar arm — analytic inverse kinematics (law of cosines).
// Math plane: (x, y). The 3D view maps it to (x, z) on the ground.

export interface JointLimits {
  theta1: { min: number; max: number };
  theta2: { min: number; max: number };
}

export interface IkSolution {
  theta1: number;
  theta2: number;
  elbow: 'elbow-up' | 'elbow-down';
}

export interface IkResult {
  target: { x: number; y: number };
  distance: number;
  cosTheta2: number;
  reachable: boolean;
  reason: string | null;
  solutions: IkSolution[];
  chosen: IkSolution | null;
}

const DEG = 180 / Math.PI;
export const toDegrees = (radians: number) => radians * DEG;

export const DEFAULT_LIMITS: JointLimits = {
  theta1: { min: (-150 * Math.PI) / 180, max: (150 * Math.PI) / 180 },
  theta2: { min: (-160 * Math.PI) / 180, max: (160 * Math.PI) / 180 }
};

function normalizeAngle(angle: number) {
  let a = angle;
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Solve IK for target (x, y) given link lengths and joint limits.
 * `current` biases the elbow-up/down choice toward the arm's present pose.
 */
export function solveIk(
  x: number,
  y: number,
  l1: number,
  l2: number,
  limits: JointLimits = DEFAULT_LIMITS,
  current?: { theta1: number; theta2: number }
): IkResult {
  const distance = Math.hypot(x, y);
  const cosTheta2 = clamp((distance * distance - l1 * l1 - l2 * l2) / (2 * l1 * l2), -1, 1);
  const base: IkResult = {
    target: { x, y },
    distance,
    cosTheta2,
    reachable: false,
    reason: null,
    solutions: [],
    chosen: null
  };

  if (distance < 1e-6) {
    return { ...base, reason: 'Target is at the base — no unique solution.' };
  }
  if (distance > l1 + l2) {
    return { ...base, reason: `d = ${distance.toFixed(2)} > L₁ + L₂ = ${(l1 + l2).toFixed(2)} — outside the workspace.` };
  }
  if (distance < Math.abs(l1 - l2)) {
    return { ...base, reason: `d = ${distance.toFixed(2)} < |L₁ − L₂| = ${Math.abs(l1 - l2).toFixed(2)} — inside the dead zone.` };
  }

  const theta2Abs = Math.acos(cosTheta2);
  const phi = Math.atan2(y, x);

  const candidates: IkSolution[] = [theta2Abs, -theta2Abs].map((theta2) => {
    const k1 = l1 + l2 * Math.cos(theta2);
    const k2 = l2 * Math.sin(theta2);
    return {
      theta1: normalizeAngle(phi - Math.atan2(k2, k1)),
      theta2,
      elbow: theta2 >= 0 ? 'elbow-up' as const : 'elbow-down' as const
    };
  });

  const solutions = candidates.filter(
    (s) =>
      s.theta1 >= limits.theta1.min && s.theta1 <= limits.theta1.max &&
      s.theta2 >= limits.theta2.min && s.theta2 <= limits.theta2.max
  );

  if (solutions.length === 0) {
    return { ...base, reason: 'Both elbow configurations violate the joint limits.' };
  }

  const cost = (s: IkSolution) =>
    current ? Math.abs(normalizeAngle(s.theta1 - current.theta1)) + Math.abs(normalizeAngle(s.theta2 - current.theta2)) : s.elbow === 'elbow-down' ? 0 : 1;
  const chosen = solutions.reduce((best, s) => (cost(s) < cost(best) ? s : best));

  return { ...base, reachable: true, solutions, chosen };
}
