// src/screens/AuthPage.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../constants/api';

export interface UserSession {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthPageProps {
  onLoginSuccess: (user: UserSession) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role] = useState<'admin' | 'user'>('user'); // Fixed to 'user' by default
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    const endpoint = isLogin ? `${API_URL}/auth/login` : `${API_URL}/auth/signup`;
    const payload = isLogin 
      ? { email, password } 
      : { username, email, password, role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError('Cannot connect to server.');
    }
  };

  return (
    <LinearGradient
      colors={['#101b35', '#1c3158', '#412653', '#e0563f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View nativeID="auth-waves" style={StyleSheet.absoluteFill} />
      <View style={styles.card}>
        <Text style={styles.title}>{isLogin ? 'Login to EduSphere' : 'Create an Account'}</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#94a3b8"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94a3b8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggleContainer}>
          <Text style={styles.toggleText}>
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  card: {
    width: '100%', 
    maxWidth: 400, 
    backgroundColor: '#F8F7FC',
    padding: 30,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    borderTopWidth: 3,
    borderTopColor: '#e0563f',
    shadowColor: '#0f0a1e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 15, 
    elevation: 8 
  },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 22, textAlign: 'center', color: '#412653' },
  input: { borderWidth: 1, borderColor: '#e2dce8', backgroundColor: '#ffffff', padding: 13, borderRadius: 9, marginBottom: 14, fontSize: 16, color: '#242432' },
  submitBtn: { backgroundColor: '#e0563f', padding: 14, borderRadius: 9, alignItems: 'center', marginTop: 8 },
  submitText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  toggleContainer: { marginTop: 16, alignItems: 'center' },
  toggleText: { color: '#a84bab', fontSize: 14, fontWeight: '600' },
  errorText: { color: '#c43f36', marginBottom: 12, textAlign: 'center' }
});