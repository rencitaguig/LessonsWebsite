// src/screens/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { API_URL } from '../constants/api';

interface Attempt {
  id: number;
  score: number;
  total_points: number;
  passed: boolean | number;
  completed_at: string;
  quiz_title: string;
}

interface ProfilePageProps {
  userId?: number;
  username?: string;
  email?: string;
}

export default function ProfilePage({ userId = 1, username = 'User', email = '' }: ProfilePageProps) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  const avatarInitials = username
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  useEffect(() => {
    fetch(`${API_URL}/users/${userId}/attempts`)
      .then((res) => res.json())
      .then((data: Attempt[]) => setAttempts(data))
      .catch((err) => console.error(err));
  }, [userId]);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitials || 'U'}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}>{username}</Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
        </View>
      </View>
      <Text style={styles.header}>Your Quiz Scores & Progress</Text>
      <FlatList
        data={attempts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.quizName}>{item.quiz_title}</Text>
            <Text>Score: {item.score} / {item.total_points}</Text>
            <Text style={{ color: item.passed ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
              {item.passed ? 'PASSED' : 'FAILED'}
            </Text>
            <Text style={styles.dateText}>{new Date(item.completed_at).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 28, paddingTop: 92, flex: 1, maxWidth: 1000, width: '100%', alignSelf: 'center' },
  header: { fontSize: 23, fontWeight: '800', color: '#e0563f', marginBottom: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, padding: 24, backgroundColor: '#F8F7FC', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.75)', borderTopWidth: 3, borderTopColor: '#e0563f', shadowColor: '#0f0a1e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#e0563f', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  userDetails: { flex: 1 },
  username: { fontSize: 24, fontWeight: 'bold', color: '#412653' },
  email: { fontSize: 14, color: '#686775', marginTop: 4 },
  card: { padding: 18, backgroundColor: '#F8F7FC', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.75)', shadowColor: '#0f0a1e', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 16 },
  quizName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  dateText: { color: '#64748b', fontSize: 12, marginTop: 4 }
});