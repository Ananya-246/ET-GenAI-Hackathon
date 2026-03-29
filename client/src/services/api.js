import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

api.interceptors.response.use(
  res => res,
  err => {
    console.error('[API Error]', err?.response?.status, err?.config?.url, err?.message);
    return Promise.reject(err);
  }
);

export const getFeed = (userId = 'guest', limit = 10) =>
  api.get(`/api/my-et/feed?user_id=${encodeURIComponent(userId)}&limit=${limit}`);

export const trackVisit = (userId = 'guest', articleId) =>
  api.post('/api/my-et/visit', { user_id: userId, article_id: articleId });

export const getProfile = (userId = 'guest') =>
  api.get(`/api/my-et/profile/${encodeURIComponent(userId)}`);

export const setPersona = (userId = 'guest', persona, tags = []) =>
  api.post('/api/my-et/persona', { user_id: userId, persona, tags });

export const generateVideoScript = (articleText, style, voice) =>
  api.post('/api/video/generate', { article_text: articleText, style, voice });

export const generateTTS = (scriptText, voice) =>
  api.post('/api/video/tts', { script_text: scriptText, voice });

export default api;