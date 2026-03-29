import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    console.error('[API Error]', err?.response?.status, err?.config?.url, err?.message);
    return Promise.reject(err);
  }
);

// Auth APIs
export const loginUser = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const registerUser = (email, password, name) =>
  api.post('/api/auth/register', { email, password, name });

export const verifyToken = () =>
  api.post('/api/auth/verify');

export const logoutUser = () =>
  api.post('/api/auth/logout');

export const getUserProfile = () =>
  api.get('/api/auth/profile');

export const updateUserProfile = (displayName, persona) =>
  api.put('/api/auth/profile', { display_name: displayName, persona });

// MyET APIs - Updated to use token
export const getFeed = (limit = 10) =>
  api.get(`/api/my-et/feed?limit=${limit}`);

export const trackVisit = (articleId) =>
  api.post('/api/my-et/visit', { article_id: articleId });

export const getProfile = () =>
  api.get('/api/my-et/profile');

export const setPersona = (persona, tags = []) =>
  api.post('/api/my-et/persona', { persona, tags });

export const getMyETArticle = (articleId) =>
  api.get(`/api/my-et/article/${encodeURIComponent(articleId)}`);

export const generateVideoScript = (articleText, style, voice) =>
  api.post('/api/video/generate', { article_text: articleText, style, voice });

export const generateTTS = (scriptText, voice) =>
  api.post('/api/video/tts', { script_text: scriptText, voice });

export const generateNavigatorBriefing = (topic, userId = 'guest', maxSources = 8) =>
  api.post('/api/navigator/briefing', {
    topic,
    user_id: userId,
    max_sources: maxSources,
  });

export const askNavigatorQuestion = (briefingId, question) =>
  api.post('/api/navigator/ask', {
    briefing_id: briefingId,
    question,
  });

export const getVernacularArticles = (limit = 12) =>
  api.get(`/api/vernacular/articles?limit=${limit}`);

export const translateVernacularText = (sourceText, languageCode, audienceHint = 'business readers') =>
  api.post('/api/vernacular/translate', {
    source_text: sourceText,
    language_code: languageCode,
    audience_hint: audienceHint,
  });

export const translateVernacularArticle = (articleId, languageCode, audienceHint = 'business readers') =>
  api.post('/api/vernacular/translate-article', {
    article_id: articleId,
    language_code: languageCode,
    audience_hint: audienceHint,
  });

export const getStoryArcCandidates = (limit = 12) =>
  api.get(`/api/story-arc/candidates?limit=${limit}`);

export const generateStoryArc = (topic, maxSources = 10) =>
  api.post('/api/story-arc/generate', {
    topic,
    max_sources: maxSources,
  });

export default api;