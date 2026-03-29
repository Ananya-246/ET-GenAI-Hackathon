import { useEffect, useMemo, useState } from "react";
import {
  getVernacularArticles,
  translateVernacularArticle,
  translateVernacularText,
} from "../services/api";
import useAISettings from "../hooks/useAISettings";
import "./VernacularPage.css";

const LANGUAGES = [
  { code: "hi", label: "Hindi", native: "हिंदी", name: "Hindi" },
  { code: "ta", label: "Tamil", native: "தமிழ்", name: "Tamil" },
  { code: "te", label: "Telugu", native: "తెలుగు", name: "Telugu" },
  { code: "bn", label: "Bengali", native: "বাংলা", name: "Bengali" },
];

const SAMPLE_TEXT = "India's startup ecosystem raised $2.1 billion in Q1 2026, with fintech and deeptech leading the charge. Bengaluru retained its position as the top startup hub.";

export default function VernacularPage() {
  const { settings, setSetting } = useAISettings();
  const [mode, setMode] = useState("article");
  const [inputText, setInputText] = useState("");
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [audienceHint, setAudienceHint] = useState(settings.vernacularAudienceHint || "working professionals and retail investors");
  const [articles, setArticles] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadArticles = async () => {
      setArticlesLoading(true);
      try {
        const { data } = await getVernacularArticles(settings.vernacularArticleLimit || 12);
        const items = data?.articles || [];
        setArticles(items);
        if (items.length) {
          setSelectedArticleId(String(items[0].id));
        }
      } catch (err) {
        setError(err?.response?.data?.error || "Could not load ET articles.");
      } finally {
        setArticlesLoading(false);
      }
    };

    loadArticles();
  }, [settings.vernacularArticleLimit]);

  useEffect(() => {
    setAudienceHint(settings.vernacularAudienceHint || "working professionals and retail investors");
  }, [settings.vernacularAudienceHint]);

  const selectedArticle = useMemo(
    () => articles.find(a => String(a.id) === String(selectedArticleId)) || null,
    [articles, selectedArticleId]
  );

  const translate = async () => {
    setError("");

    if (mode === "text" && !inputText.trim()) {
      setError("Please enter source English text.");
      return;
    }

    if (mode === "article" && !selectedArticleId) {
      setError("Please select an article.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      if (mode === "article") {
        const { data } = await translateVernacularArticle(
          Number(selectedArticleId),
          selectedLang.code,
          audienceHint
        );
        setResult({ ...(data?.translation || {}), article: data?.article || null });
      } else {
        const { data } = await translateVernacularText(
          inputText,
          selectedLang.code,
          audienceHint
        );
        setResult({ ...data, article: null });
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Translation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!result?.translated_text) return;
    try {
      await navigator.clipboard.writeText(result.translated_text);
    } catch (e) {
      setError("Could not copy text in this browser session.");
    }
  };

  const onListen = () => {
    if (!result?.translated_text || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(result.translated_text);
    const map = { hi: "hi-IN", ta: "ta-IN", te: "te-IN", bn: "bn-IN" };
    utterance.lang = map[selectedLang.code] || "hi-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const onShare = async () => {
    if (!result?.translated_text) return;
    if (navigator.share) {
      await navigator.share({
        title: result.headline_local || "ET Vernacular Brief",
        text: result.translated_text,
      });
      return;
    }
    await onCopy();
    setError("Copied to clipboard. Share manually from your app.");
  };

  return (
    <div className="vernacular-page">
      <div className="page-header">
        <div className="container">
          <span className="ai-badge" style={{ marginBottom: 10 }}>Vernacular Engine</span>
          <h1>Business news in your language</h1>
          <p>Context-aware translation — culturally adapted, not literally translated.</p>
        </div>
      </div>

      <div className="container vernacular-body">
        <div className="lang-selector">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`lang-btn ${selectedLang.code === lang.code ? "active" : ""}`}
              onClick={() => { setSelectedLang(lang); setResult(null); }}
            >
              <div>
                <div className="lang-native">{lang.native}</div>
                <div className="lang-name">{lang.label}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mode-selector">
          <button className={`mode-btn ${mode === "article" ? "active" : ""}`} onClick={() => { setMode("article"); setResult(null); }}>
            Translate ET article
          </button>
          <button className={`mode-btn ${mode === "text" ? "active" : ""}`} onClick={() => { setMode("text"); setResult(null); }}>
            Translate custom text
          </button>
        </div>

        <div className="vernacular-layout">
          <div className="vernacular-input-panel">
            <h3 className="vern-label">English source</h3>

            {mode === "article" && (
              <>
                <div className="input-meta">Pick from ET article feed</div>
                <select
                  className="article-select"
                  value={selectedArticleId}
                  onChange={e => { setSelectedArticleId(e.target.value); setResult(null); }}
                  disabled={articlesLoading}
                >
                  {(articles || []).map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
                {selectedArticle && (
                  <div className="article-preview">
                    <div className="preview-title">{selectedArticle.title}</div>
                    <div className="preview-meta">{selectedArticle.category} · {selectedArticle.source || "ET Bureau"}</div>
                    <p>{selectedArticle.summary}</p>
                  </div>
                )}
              </>
            )}

            {mode === "text" && (
              <>
                <div className="sample-texts">
                  <button className="sample-text-btn" onClick={() => setInputText(SAMPLE_TEXT)}>Use sample text</button>
                </div>
                <textarea
                  rows={8}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Paste ET English business text here..."
                  style={{ resize: "vertical", marginBottom: 16 }}
                />
              </>
            )}

            <label className="vern-input-label">Audience lens</label>
            <input
              className="vern-input"
              value={audienceHint}
              onChange={e => setAudienceHint(e.target.value)}
              placeholder="Example: first-time investors in Tier-2 cities"
            />
            <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
              <button
                className="btn-outline"
                style={{ fontSize: 12 }}
                onClick={() => setSetting("vernacularAudienceHint", audienceHint)}
              >
                Save as default audience
              </button>
            </div>

            <button className="btn-primary" style={{ width: "100%" }} onClick={translate} disabled={loading}>
              {loading ? <><span className="spinner" /> Translating with context...</> : `Translate to ${selectedLang.name} →`}
            </button>
            {error && <p className="vern-error">{error}</p>}
          </div>

          <div className="vernacular-output-panel">
            <h3 className="vern-label">
              {selectedLang.native} output
              {result?.translated_text && <span className="adapted-badge">Culturally adapted</span>}
            </h3>

            {!result && !loading && (
              <div className="output-placeholder">
                <span style={{ fontSize: 32 }}>{selectedLang.native.slice(0, 1)}</span>
                <p>Translation will appear here</p>
                <span>Not just translated — culturally adapted for {selectedLang.name}-speaking readers</span>
              </div>
            )}

            {loading && (
              <div className="output-placeholder">
                <div className="gen-spinner" style={{ borderTopColor: "var(--et-red)", width: 28, height: 28 }} />
                <p>Translating with local context...</p>
              </div>
            )}

            {result && (
              <div className="output-content">
                <div className="local-headline">{result.headline_local}</div>
                <div className="translated-text" lang={selectedLang.code}>
                  {result.translated_text}
                </div>

                {!!result.simple_explainer && (
                  <div className="adaptation-note">
                    <span className="ai-badge" style={{ fontSize: 9 }}>Simple explainer</span>
                    <p>{result.simple_explainer}</p>
                  </div>
                )}

                {!!(result.local_context || []).length && (
                  <div className="adaptation-note">
                    <span className="ai-badge" style={{ fontSize: 9 }}>Local context</span>
                    <ul className="local-context-list">
                      {(result.local_context || []).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!!(result.business_glossary || []).length && (
                  <div className="glossary-block">
                    <div className="glossary-title">Business Glossary</div>
                    <div className="glossary-grid">
                      {(result.business_glossary || []).map((g, idx) => (
                        <div className="glossary-item" key={idx}>
                          <div className="glossary-term">{g.term_en} → {g.term_local}</div>
                          <div className="glossary-meaning">{g.meaning}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!!(result.adaptation_notes || []).length && (
                  <div className="adaptation-note">
                    <span className="ai-badge" style={{ fontSize: 9 }}>Adaptation note</span>
                    <ul className="local-context-list">
                      {(result.adaptation_notes || []).map((n, idx) => <li key={idx}>{n}</li>)}
                    </ul>
                  </div>
                )}

                <div className="output-actions">
                  <button className="btn-outline" style={{ fontSize: 12 }} onClick={onCopy}>Copy</button>
                  <button className="btn-outline" style={{ fontSize: 12 }} onClick={onListen}>Listen</button>
                  <button className="btn-outline" style={{ fontSize: 12 }} onClick={onShare}>Share</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}