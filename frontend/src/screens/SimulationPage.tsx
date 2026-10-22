// src/screens/SimulationPage.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ArmSimulation from '../components/sim/ArmSimulation';

export default function SimulationPage() {
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Robotic Arm Simulation</Text>
        <Text style={styles.subtitle}>
          Industrial crane manipulator (L15.8–L15.10). Place the crate and the crane picks and places it by
          itself — slewing the base (θ₀) and solving shoulder and elbow angles (θ₁, θ₂) by inverse kinematics,
          with the worked math and the running pick-and-place state machine beside the scene.
        </Text>
      </View>
      <ArmSimulation />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#101b35' },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4, gap: 6 },
  title: { fontSize: 26, fontWeight: '800', color: '#f8f4fa', letterSpacing: 0.3 },
  subtitle: { fontSize: 13, lineHeight: 19, color: '#c4c9d8', maxWidth: 720 }
});
