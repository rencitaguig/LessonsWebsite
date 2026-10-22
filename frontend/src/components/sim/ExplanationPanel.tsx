import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IkResult, toDegrees } from './ik';

interface ExplanationPanelProps {
  result: IkResult | null;
  l1: number;
  l2: number;
  shoulderH: number;
  gripY: number;
  fsmSteps: string[];
  activeStep: string | null;
}

const deg = (radians: number) => `${toDegrees(radians).toFixed(1)}°`;

export default function ExplanationPanel({ result, l1, l2, shoulderH, gripY, fsmSteps, activeStep }: ExplanationPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Inverse Kinematics — worked solution</Text>

      {fsmSteps.length > 0 && (
        <View style={styles.fsmRow}>
          {fsmSteps.map((label) => (
            <View key={label} style={[styles.fsmChip, label === activeStep && styles.fsmChipActive]}>
              <Text style={[styles.fsmChipText, label === activeStep && styles.fsmChipTextActive]}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {!result && (
        <Text style={styles.body}>
          Place the orange crate on the ground and let go — the crane grasps it automatically. The base slews
          to face it (θ₀), then shoulder and elbow solve a two-link planar IK — the math from L15.2 and L15.9.
        </Text>
      )}

      {result && (
        <>
          <Text style={styles.step}>
            0. Slew: θ₀ = atan2(z, x) = {deg(result.yaw)} — the turntable faces the target.
          </Text>
          <Text style={styles.step}>
            1. Arm plane: r = √(x² + z²) = {result.radius.toFixed(2)}, drop = {result.drop.toFixed(2)},
            {'  '}|P| = √(r² + drop²) = {result.reach.toFixed(2)}
          </Text>
          <Text style={styles.step}>
            2. cos θ₂ = (|P|² − L₁² − L₂²) / (2·L₁·L₂) = {result.cosTheta2.toFixed(3)}
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
                4. θ₁ = atan2(drop, r) − atan2(L₂·sin θ₂, L₁ + L₂·cos θ₂)
              </Text>
              <Text style={[styles.step, styles.chosen]}>
                ✓ Chosen: {result.chosen.elbow} → θ₀ = {deg(result.chosen.yaw)}, θ₁ = {deg(result.chosen.theta1)},
                θ₂ = {deg(result.chosen.theta2)}
              </Text>
            </>
          )}
        </>
      )}

      <Text style={styles.footer}>
        L₁ = {l1.toFixed(2)}, L₂ = {l2.toFixed(2)} · shoulder at h = {shoulderH.toFixed(2)}, grip at {gripY.toFixed(2)}
      </Text>
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
  fsmRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  fsmChip: {
    backgroundColor: '#e6e1eb',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  fsmChipActive: { backgroundColor: '#1d7a46' },
  fsmChipText: { fontSize: 10, fontWeight: '700', color: '#686775', letterSpacing: 0.4 },
  fsmChipTextActive: { color: '#ffffff' },
  step: { fontSize: 13, lineHeight: 19, color: '#3f567f', fontFamily: 'monospace' as never },
  chosen: { color: '#1d7a46', fontWeight: '700' },
  error: { color: '#c2371f', fontWeight: '700' },
  footer: { fontSize: 11, color: '#686775', marginTop: 4 }
});
