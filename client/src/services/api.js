import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const getPersonalizedFeed = (persona, interests) =>
  api.post('/api/my-et/feed', { persona, interests });

export const saveProfile = (userId, persona, interests) =>
  api.post('/api/my-et/profile', { user_id: userId, persona, interests });

export const getProfile = (userId) =>
  api.get(`/api/my-et/profile/${userId}`);

export const generateVideoScript = (articleText, style, voice) =>
  api.post('/api/video/generate', { article_text: articleText, style, voice });

export const generateTTS = (scriptText, voice) =>
  api.post('/api/video/tts', { script_text: scriptText, voice });

export default api;