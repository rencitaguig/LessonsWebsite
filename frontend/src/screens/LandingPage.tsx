// src/screens/LandingPage.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteName } from '../components/Navbar';

interface LandingPageProps {
  onNavigate: (route: RouteName) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>WELCOME TO EDUSPHERE</Text>
        <Text style={styles.title}>EduSphere</Text>
        <Text style={styles.tagline}>Interactive Learning for the Modern Mind.</Text>
        <Text style={styles.subtitle}>
          Explore topics, read in-depth lessons, and test your knowledge with interactive quizzes.
        </Text>
        <TouchableOpacity style={styles.ctaButton} onPress={() => onNavigate('lessons')}>
          <Text style={styles.ctaText}>Browse Lessons</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, paddingTop: 92, backgroundColor: 'transparent' },
  heroCard: { width: '100%', maxWidth: 980, alignItems: 'center', paddingVertical: 72, paddingHorizontal: 36, backgroundColor: '#F8F7FC', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.75)', borderTopWidth: 3, borderTopColor: '#a84bab', shadowColor: '#0f0a1e', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 5 },
  eyebrow: { color: '#e0563f', fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 18 },
  title: { fontSize: 48, fontWeight: '800', color: '#412653', textAlign: 'center', marginBottom: 16, letterSpacing: -1.5 },
  tagline: { fontSize: 22, fontWeight: '600', color: '#3f567f', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 18, color: '#686775', textAlign: 'center', maxWidth: 650, marginBottom: 32, lineHeight: 29 },
  ctaButton: { backgroundColor: '#e0563f', paddingVertical: 15, paddingHorizontal: 34, borderRadius: 12, shadowColor: '#e0563f', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 12, elevation: 4 },
  ctaText: { color: '#ffffff', fontSize: 17, fontWeight: '700' }
});