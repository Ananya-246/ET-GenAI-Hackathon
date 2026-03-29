import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useAISettings from './useAISettings';
import { getFeed, trackVisit, setPersona, getMyETArticle } from '../services/api';

export default function usePersona() {
  const { isAuthenticated } = useAuth();
  const { settings } = useAISettings();
  const [persona,   setPersonaState] = useState(null);
  const [feed,      setFeed]         = useState([]);
  const [topTags,   setTopTags]      = useState([]);
  const [loading,   setLoading]      = useState(false);
  const [error,     setError]        = useState(null);
  const [hasVisits, setHasVisits]    = useState(false);
  const [profileSummary, setProfileSummary] = useState({
    profile_level: 'Starter',
    total_reads: 0,
    top_categories: [],
    top_tags: [],
  });

  const loadFeed = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please log in to see your personalized feed');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res      = await getFeed(settings.myEtFeedLimit || 10);
      const articles = Array.isArray(res?.data?.articles) ? res.data.articles : [];
      const tags     = Array.isArray(res?.data?.top_tags) ? res.data.top_tags : [];
      const summary  = res?.data?.profile_summary || null;

      setFeed(articles);
      setTopTags(tags);
      if (summary) {
        setProfileSummary({
          profile_level: summary.profile_level || 'Starter',
          total_reads: Number(summary.total_reads || 0),
          top_categories: Array.isArray(summary.top_categories) ? summary.top_categories : [],
          top_tags: Array.isArray(summary.top_tags) ? summary.top_tags : [],
        });
      }

      if (tags.length > 0) {
        setHasVisits(true);
      }
    } catch (err) {
      console.error('[loadFeed]', err?.response?.data || err.message);
      setError('Could not load feed. ' + (err?.response?.data?.error || 'Is the backend running on port 5000?'));
      setFeed([]);
      setTopTags([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, settings.myEtFeedLimit]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const selectPersona = useCallback(async (p) => {
    if (!p || !p.id) return;
    if (!isAuthenticated) {
      setError('Please log in to update your persona');
      return;
    }

    setPersonaState(p);
    setError(null);
    try {
      await setPersona(p.id, Array.isArray(p.tags) ? p.tags : []);
      await loadFeed();
    } catch (err) {
      console.error('[selectPersona]', err?.response?.data || err.message);
      setError('Could not save persona. Check backend.');
    }
  }, [isAuthenticated, loadFeed]);

  const onArticleClick = useCallback(async (article) => {
    if (!article || !article.id) return;
    if (!isAuthenticated) {
      setError('Please log in to track your reads');
      return;
    }

    try {
      const res  = await trackVisit(article.id);
      const tags = Array.isArray(res?.data?.top_tags) ? res.data.top_tags : [];
      setTopTags(tags);
      if (tags.length > 0) setHasVisits(true);
      await loadFeed();
    } catch (err) {
      console.error('[onArticleClick]', err?.response?.data || err.message);
    }
  }, [isAuthenticated, loadFeed]);

  const loadArticleDetail = useCallback(async (articleId) => {
    if (!articleId) return null;
    if (!isAuthenticated) return null;

    try {
      const res = await getMyETArticle(articleId);
      return res?.data?.article || null;
    } catch (err) {
      console.error('[loadArticleDetail]', err?.response?.data || err.message);
      return null;
    }
  }, [isAuthenticated]);

  return {
    persona, feed, topTags, profileSummary, loading, error, hasVisits,
    selectPersona, onArticleClick, loadFeed, loadArticleDetail,
  };
}