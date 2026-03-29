import { useState, useCallback, useEffect } from 'react';
import { getFeed, trackVisit, setPersona } from '../services/api';

const USER_ID = 'guest';

export default function usePersona() {
  const [persona,   setPersonaState] = useState(null);
  const [feed,      setFeed]         = useState([]);
  const [topTags,   setTopTags]      = useState([]);
  const [loading,   setLoading]      = useState(false);
  const [error,     setError]        = useState(null);
  const [hasVisits, setHasVisits]    = useState(false);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res      = await getFeed(USER_ID, 10);
      const articles = Array.isArray(res?.data?.articles) ? res.data.articles : [];
      const tags     = Array.isArray(res?.data?.top_tags) ? res.data.top_tags : [];

      setFeed(articles);
      setTopTags(tags);

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

  return {
    persona, feed, topTags, loading, error, hasVisits,
    selectPersona, onArticleClick, loadFeed,
  };
}