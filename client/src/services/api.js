import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const getFeed         = (userId, limit = 10) =>
  api.get(`/api/my-et/feed?user_id=${userId}&limit=${limit}`);

export const trackVisit      = (userId, articleId) =>
  api.post('/api/my-et/visit', { user_id: userId, article_id: articleId });

export const getProfile      = (userId) =>
  api.get(`/api/my-et/profile/${userId}`);

export const setPersona      = (userId, persona, tags) =>
  api.post('/api/my-et/persona', { user_id: userId, persona, tags });

export const generateVideoScript = (articleText, style, voice) =>
  api.post('/api/video/generate', { article_text: articleText, style, voice });

export const generateTTS = (scriptText, voice) =>
  api.post('/api/video/tts', { script_text: scriptText, voice });

export default api;