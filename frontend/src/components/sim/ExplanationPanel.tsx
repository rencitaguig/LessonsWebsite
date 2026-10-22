import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IkResult, toDegrees } from './ik';

interface ExplanationPanelProps {
  result: IkResult | null;
  l1: number;
  l2: number;
}

const deg = (radians: number) => `${toDegrees(radians).toFixed(1)}°`;

export default function ExplanationPanel({ result, l1, l2 }: ExplanationPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Inverse Kinematics — worked solution</Text>

      {!result && (
        <Text style={styles.body}>
          Drag the orange target on the ground plane. When you release it, the solver computes the joint angles
          θ₁ and θ₂ required for the gripper to reach it — the same math described in L15.2 and L15.9.
        </Text>
      )}

      {result && (
        <>
          <Text style={styles.step}>
            1. Target (x, y) = ({result.target.x.toFixed(2)}, {result.target.y.toFixed(2)})   d = √(x² + y²) = {result.distance.toFixed(2)}
          </Text>
          <Text style={styles.step}>
            2. cos θ₂ = (d² − L₁² − L₂²) / (2·L₁·L₂) = {result.cosTheta2.toFixed(3)}
          </Text>
          {!result.reachable && (
            <Text style={[styles.step, styles.error]}>✕ {result.reason}</Text>
          )}
          {result.reachable && result.chosen && (
            <>
              <Text style={styles.step}>
                3. θ₂ = ±acos(cos θ₂) → two configurations:{' '}
                {result.solutions.map((s) => `${s.elbow} (θ₂ = ${deg(s.theta2)})`).join(', ')}
              </Text>
              <Text style={styles.step}>
                4. θ₁ = atan2(y, x) − atan2(L₂·sin θ₂, L₁ + L₂·cos θ₂)
              </Text>
              <Text style={[styles.step, styles.chosen]}>
                ✓ Chosen: {result.chosen.elbow} → θ₁ = {deg(result.chosen.theta1)}, θ₂ = {deg(result.chosen.theta2)}
                {'  '}(nearest to the current arm pose)
              </Text>
            </>
          )}
        </>
      )}

      <Text style={styles.footer}>L₁ = {l1.toFixed(2)}, L₂ = {l2.toFixed(2)} · joint limits θ₁ ±150°, θ₂ ±160°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#F8F7FC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e1eb',
    padding: 18,
    gap: 10
  },
  heading: { fontSize: 15, fontWeight: '700', color: '#242432' },
  body: { fontSize: 13, lineHeight: 19, color: '#686775' },
  step: { fontSize: 13, lineHeight: 19, color: '#3f567f', fontFamily: 'monospace' as never },
  chosen: { color: '#1d7a46', fontWeight: '700' },
  error: { color: '#c2371f', fontWeight: '700' },
  footer: { fontSize: 11, color: '#686775', marginTop: 4 }
});
