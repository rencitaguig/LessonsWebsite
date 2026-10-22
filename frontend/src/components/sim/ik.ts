// Crane-style arm — analytic inverse kinematics.
// Base yaw (θ₀) slews the arm's vertical plane toward the target, then the
// shoulder (θ₁) and elbow (θ₂) solve the classic two-link planar problem in
// that plane via the law of cosines.

export interface JointLimits {
  theta1: { min: number; max: number };
  theta2: { min: number; max: number };
}

export interface IkSolution {
  yaw: number;
  theta1: number;
  theta2: number;
  elbow: 'elbow-up' | 'elbow-down';
}

export interface IkResult {
  target: { x: number; z: number };
  yaw: number;
  radius: number; // horizontal distance r = √(x²+z²)
  drop: number; // vertical distance from shoulder pivot to grip point
  reach: number; // |P| = √(r² + drop²) — distance the 2-link chain must span
  cosTheta2: number;
  reachable: boolean;
  reason: string | null;
  solutions: IkSolution[];
  chosen: IkSolution | null;
}

const DEG = 180 / Math.PI;
export const toDegrees = (radians: number) => radians * DEG;

export const DEFAULT_LIMITS: JointLimits = {
  theta1: { min: (-165 * Math.PI) / 180, max: (165 * Math.PI) / 180 },
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
 * Ground-projected workspace: the annulus of radii the grip point can reach
 * when the grip height is fixed. The 2-link chain must span |P| ∈ [|L1−L2|, L1+L2]
 * through the vertical drop (shoulderH − gripY); r is the remaining horizontal part.
 */
export function groundReachBounds(gripY: number, shoulderH: number, l1: number, l2: number) {
  const drop = Math.abs(gripY - shoulderH);
  const rOut = l1 + l2;
  const rIn = Math.abs(l1 - l2);
  const hi = drop >= rOut ? 0 : Math.sqrt(rOut * rOut - drop * drop);
  const lo = drop >= rIn ? 0 : Math.sqrt(rIn * rIn - drop * drop);
  return { lo, hi };
}

/**
 * Solve yaw + planar IK for a ground target (x, z).
 * `current` biases elbow-up/down toward the arm's present pose.
 */
export function solveIk(
  x: number,
  z: number,
  l1: number,
  l2: number,
  shoulderH: number,
  gripY: number,
  limits: JointLimits = DEFAULT_LIMITS,
  current?: { yaw: number; theta1: number; theta2: number }
): IkResult {
  const radius = Math.hypot(x, z);
  const yaw = Math.atan2(z, x);
  const drop = gripY - shoulderH; // negative: target below the shoulder pivot
  const reach = Math.hypot(radius, drop);
  const cosTheta2 = clamp((reach * reach - l1 * l1 - l2 * l2) / (2 * l1 * l2), -1, 1);

  const base: IkResult = {
    target: { x, z },
    yaw,
    radius,
    drop,
    reach,
    cosTheta2,
    reachable: false,
    reason: null,
    solutions: [],
    chosen: null
  };

  if (radius < 1e-6) {
    return { ...base, reason: 'Target is on the mast axis — no unique yaw solution.' };
  }
  if (reach > l1 + l2) {
    return { ...base, reason: `|P| = ${reach.toFixed(2)} > L₁ + L₂ = ${(l1 + l2).toFixed(2)} — outside the workspace.` };
  }
  if (reach < Math.abs(l1 - l2)) {
    return { ...base, reason: `|P| = ${reach.toFixed(2)} < |L₁ − L₂| = ${Math.abs(l1 - l2).toFixed(2)} — inside the dead zone.` };
  }

  const theta2Abs = Math.acos(cosTheta2);
  const phi = Math.atan2(drop, radius);

  const candidates = [theta2Abs, -theta2Abs].map((theta2) => {
    const k1 = l1 + l2 * Math.cos(theta2);
    const k2 = l2 * Math.sin(theta2);
    return {
      yaw,
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
    current
      ? Math.abs(normalizeAngle(s.yaw - current.yaw)) +
        Math.abs(normalizeAngle(s.theta1 - current.theta1)) +
        Math.abs(normalizeAngle(s.theta2 - current.theta2))
      : s.elbow === 'elbow-down'
        ? 0
        : 1;
  const chosen = solutions.reduce((best, s) => (cost(s) < cost(best) ? s : best));

  return { ...base, reachable: true, solutions, chosen };
}
