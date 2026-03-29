import { useState, useCallback, useEffect } from 'react';
import { getFeed, trackVisit, setPersona } from '../services/api';

const USER_ID = 'guest';

export default function usePersona() {
  const [persona, setPersonaState] = useState(null);
  const [feed, setFeed] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasVisits, setHasVisits] = useState(false);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFeed(USER_ID, 10);
      setFeed(res.data.articles || []);
      setTopTags(res.data.top_tags || []);
      if (res.data.top_tags && res.data.top_tags.length > 0) {
        setHasVisits(true);
      }
    } catch {
      setError('Could not load feed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const selectPersona = useCallback(async (p) => {
    setPersonaState(p);
    try {
      await setPersona(USER_ID, p.id, p.tags);
      await loadFeed();
    } catch {
      setError('Could not save persona.');
    }
  }, [loadFeed]);

  const onArticleClick = useCallback(async (article) => {
    try {
      const res = await trackVisit(USER_ID, article.id);
      setTopTags(res.data.top_tags || []);
      setHasVisits(true);
      await loadFeed();
    } catch {
      console.error('Visit tracking failed');
    }
  }, [loadFeed]);

  return {
    persona, feed, topTags, loading, error, hasVisits,
    selectPersona, onArticleClick, loadFeed,
  };
}