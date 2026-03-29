import { useState, useCallback, useEffect } from 'react';
import { getFeed, trackVisit, setPersona, getMyETArticle } from '../services/api';

const USER_ID = 'guest';

export default function usePersona() {
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
    setLoading(true);
    setError(null);
    try {
      const res      = await getFeed(USER_ID, 10);
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
      console.error('[loadFeed]', err);
      setError('Could not load feed. Is the backend running on port 5000?');
      setFeed([]);
      setTopTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const selectPersona = useCallback(async (p) => {
    if (!p || !p.id) return;
    setPersonaState(p);
    setError(null);
    try {
      await setPersona(USER_ID, p.id, Array.isArray(p.tags) ? p.tags : []);
      await loadFeed();
    } catch (err) {
      console.error('[selectPersona]', err);
      setError('Could not save persona. Check backend.');
    }
  }, [loadFeed]);

  const onArticleClick = useCallback(async (article) => {
    if (!article || !article.id) return;
    try {
      const res  = await trackVisit(USER_ID, article.id);
      const tags = Array.isArray(res?.data?.top_tags) ? res.data.top_tags : [];
      setTopTags(tags);
      if (tags.length > 0) setHasVisits(true);
      await loadFeed();
    } catch (err) {
      console.error('[onArticleClick]', err);
    }
  }, [loadFeed]);

  const loadArticleDetail = useCallback(async (articleId) => {
    if (!articleId) return null;
    try {
      const res = await getMyETArticle(articleId);
      return res?.data?.article || null;
    } catch (err) {
      console.error('[loadArticleDetail]', err);
      return null;
    }
  }, []);

  return {
    persona, feed, topTags, profileSummary, loading, error, hasVisits,
    selectPersona, onArticleClick, loadFeed, loadArticleDetail,
  };
}