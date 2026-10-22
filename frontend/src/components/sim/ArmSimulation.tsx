import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ArmSimulation() {
  return (
    <View style={styles.fallback}>
      <Text style={styles.title}>Robotic arm simulation</Text>
      <Text style={styles.body}>
        The interactive 3D simulation runs in the web app. Open EduSphere in a browser, sign in, and choose
        Simulation to place a target and watch the arm solve inverse kinematics live.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12
  },
  title: { fontSize: 18, fontWeight: '700', color: '#f8f4fa' },
  body: { fontSize: 14, lineHeight: 21, color: '#c4c9d8', textAlign: 'center', maxWidth: 420 }
});
