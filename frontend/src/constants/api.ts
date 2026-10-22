const host =
  typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : 'localhost';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || `http://${host}:5001/api`;
