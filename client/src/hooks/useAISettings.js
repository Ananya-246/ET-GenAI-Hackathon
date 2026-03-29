import { useCallback, useMemo, useState } from 'react';

const STORAGE_KEY = 'et_ai_settings_v1';

const DEFAULT_SETTINGS = {
  myEtFeedLimit: 10,
  navigatorMaxSources: 8,
  storyArcMaxSources: 10,
  vernacularArticleLimit: 12,
  vernacularAudienceHint: 'working professionals and retail investors',
};

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function normalizeSettings(raw) {
  const base = raw || {};
  return {
    myEtFeedLimit: clampNumber(base.myEtFeedLimit, 5, 30, DEFAULT_SETTINGS.myEtFeedLimit),
    navigatorMaxSources: clampNumber(base.navigatorMaxSources, 3, 12, DEFAULT_SETTINGS.navigatorMaxSources),
    storyArcMaxSources: clampNumber(base.storyArcMaxSources, 5, 15, DEFAULT_SETTINGS.storyArcMaxSources),
    vernacularArticleLimit: clampNumber(base.vernacularArticleLimit, 4, 30, DEFAULT_SETTINGS.vernacularArticleLimit),
    vernacularAudienceHint:
      typeof base.vernacularAudienceHint === 'string' && base.vernacularAudienceHint.trim()
        ? base.vernacularAudienceHint.trim()
        : DEFAULT_SETTINGS.vernacularAudienceHint,
  };
}

function loadFromStorage() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(value);
    return normalizeSettings(parsed);
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export default function useAISettings() {
  const [settings, setSettings] = useState(loadFromStorage);

  const save = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = normalizeSettings({ ...prev, [key]: value });
      save(next);
      return next;
    });
  }, [save]);

  const replaceSettings = useCallback((incoming) => {
    const next = normalizeSettings(incoming);
    setSettings(next);
    save(next);
  }, [save]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    save(DEFAULT_SETTINGS);
  }, [save]);

  return useMemo(() => ({
    settings,
    setSetting,
    replaceSettings,
    resetSettings,
    defaults: DEFAULT_SETTINGS,
  }), [settings, setSetting, replaceSettings, resetSettings]);
}
