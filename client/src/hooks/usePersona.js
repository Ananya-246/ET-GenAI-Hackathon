import { useState, useCallback } from 'react';
import { getPersonalizedFeed, saveProfile } from '../services/api';

export default function usePersona() {
  const [persona, setPersona] = useState(null);
  const [interests, setInterests] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectPersona = useCallback((p) => {
    setPersona(p);
    setInterests(p.tags);
    setFeed([]);
    setError(null);
  }, []);

  const addInterest = useCallback((tag) => {
    setInterests(prev =>
      prev.includes(tag) ? prev : [...prev, tag]
    );
  }, []);

  const removeInterest = useCallback((tag) => {
    setInterests(prev => prev.filter(t => t !== tag));
  }, []);

  const generateFeed = useCallback(async () => {
    if (!persona) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getPersonalizedFeed(persona.id, interests);
      setFeed(res.data.articles);
      await saveProfile('guest', persona.id, interests);
    } catch (err) {
      setError('Could not generate feed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [persona, interests]);

  return {
    persona, interests, feed, loading, error,
    selectPersona, addInterest, removeInterest, generateFeed,
  };
}