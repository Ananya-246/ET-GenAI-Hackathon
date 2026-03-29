import { useEffect, useMemo, useState } from "react";
import { generateStoryArc, getStoryArcCandidates } from "../services/api";
import "./StoryArcPage.css";

const DEFAULT_TOPICS = [
  "RBI Monetary Policy 2026",
  "Sebi F&O Rules Tightening",
  "India Startup Funding Cycle",
  "Union Budget Infra Capex",
  "EV Funding Winter India",
];

function pct(v) {
  const n = Number(v || 0);
  return Math.max(0, Math.min(Math.round(n * 100), 100));
}

function sentimentClass(sentiment) {
  const s = (sentiment || "").toLowerCase();
  if (s.includes("positive")) return "positive";
  if (s.includes("negative")) return "negative";
  return "neutral";
}

export default function StoryArcPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [arc, setArc] = useState(null);
  const [activeTimelineIdx, setActiveTimelineIdx] = useState(0);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const { data } = await getStoryArcCandidates(10);
        setCandidates(Array.isArray(data?.candidates) ? data.candidates : []);
      } catch (e) {
        setCandidates([]);
      }
    };
    loadCandidates();
  }, []);

  const timeline = useMemo(() => (arc?.timeline || []), [arc]);
  const activeTimeline = timeline[activeTimelineIdx] || null;

  const buildArc = async (forcedTopic) => {
    const chosen = (forcedTopic || topic || "").trim();
    if (!chosen) return;

    setTopic(chosen);
    setLoading(true);
    setError("");
    setArc(null);
    setActiveTimelineIdx(0);

    try {
      const { data } = await generateStoryArc(chosen, 10);
      setArc(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Could not generate story arc.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="story-arc-page">
      <div className="page-header">
        <div className="container">
          <span className="ai-badge" style={{ marginBottom: 10 }}>Story Arc Tracker</span>
          <h1>Track any business story as a complete narrative arc</h1>
          <p>Timeline, key players, sentiment shifts, contrarian takes, and predictions in one interactive view.</p>
        </div>
      </div>

      <div className="container story-arc-body">
        <div className="story-arc-input">
          <h3 className="story-arc-label">Pick an ongoing story</h3>
          <div className="story-topic-row">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buildArc()}
              placeholder="Example: RBI policy pause and market reaction"
            />
            <button className="btn-primary" onClick={() => buildArc()} disabled={loading}>
              {loading ? <><span className="spinner" /> Building Arc...</> : "Build Story Arc"}
            </button>
          </div>

          <div className="story-chip-row">
            {DEFAULT_TOPICS.map((t) => (
              <button key={t} className="story-chip" onClick={() => buildArc(t)}>{t}</button>
            ))}
            {(candidates || []).slice(0, 6).map((c) => (
              <button key={`${c.article_id}-${c.topic_hint}`} className="story-chip muted" onClick={() => buildArc(c.topic_hint)}>
                {c.topic_hint}
              </button>
            ))}
          </div>

          {error && <p className="story-error">{error}</p>}
        </div>

        {arc && (
          <>
            <div className="story-overview-card">
              <div className="story-overview-top">
                <span className="ai-badge">AI Narrative Synthesis</span>
                <span className="story-source-count">{(arc.source_articles || []).length} ET sources</span>
              </div>
              <h2>{arc.story_title}</h2>
              <p>{arc.narrative_overview}</p>
            </div>

            <div className="story-grid-two">
              <div className="story-card">
                <h3 className="story-arc-label">Interactive Timeline</h3>
                <div className="timeline-steps">
                  {timeline.map((step, idx) => (
                    <button
                      key={`${step.phase}-${idx}`}
                      className={`timeline-step ${idx === activeTimelineIdx ? "active" : ""}`}
                      onClick={() => setActiveTimelineIdx(idx)}
                    >
                      <span className="timeline-phase">{step.phase}</span>
                      <span className="timeline-headline">{step.headline}</span>
                      <span className={`timeline-sentiment ${sentimentClass(step.sentiment)}`}>{step.sentiment || "neutral"}</span>
                    </button>
                  ))}
                </div>

                {activeTimeline && (
                  <div className="timeline-detail">
                    <div className="timeline-date">{activeTimeline.date_hint || "Current"}</div>
                    <p>{activeTimeline.description}</p>
                    {!!(activeTimeline.source_ids || []).length && (
                      <div className="source-id-row">
                        {(activeTimeline.source_ids || []).map((id) => (
                          <span key={id} className="source-id-pill">Source #{id}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="story-card">
                <h3 className="story-arc-label">Key Players Map</h3>
                <div className="player-list">
                  {(arc.key_players || []).map((p, idx) => (
                    <div key={`${p.name}-${idx}`} className="player-card">
                      <div className="player-row">
                        <div>
                          <div className="player-name">{p.name}</div>
                          <div className="player-role">{p.role}</div>
                        </div>
                        <div className="player-score">{p.influence_score}</div>
                      </div>
                      <div className="player-bar-wrap">
                        <span className="player-bar" style={{ width: `${Math.max(1, Math.min(Number(p.influence_score || 0), 100))}%` }} />
                      </div>
                      <p className="player-stance">{p.stance}</p>
                    </div>
                  ))}
                </div>

                {!!(arc.player_relationships || []).length && (
                  <div className="relation-list">
                    {(arc.player_relationships || []).slice(0, 8).map((r, idx) => (
                      <div key={idx} className="relation-item">{`${r.from} -> ${r.relation} -> ${r.to}`}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="story-grid-three">
              <div className="story-card">
                <h3 className="story-arc-label">Sentiment Shift Tracker</h3>
                <div className="sentiment-list">
                  {(arc.sentiment_shifts || []).map((s, idx) => (
                    <div key={`${s.stage}-${idx}`} className="sentiment-item">
                      <div className="sentiment-head">
                        <span>{s.stage}</span>
                        <span className={`timeline-sentiment ${sentimentClass(s.sentiment)}`}>{s.sentiment}</span>
                      </div>
                      <div className="confidence-wrap">
                        <span className="confidence-bar" style={{ width: `${pct(s.confidence)}%` }} />
                      </div>
                      <p>{s.driver}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="story-card">
                <h3 className="story-arc-label">Contrarian Perspectives</h3>
                <div className="contrarian-list">
                  {(arc.contrarian_views || []).map((c, idx) => (
                    <div key={idx} className="contrarian-item">
                      <p className="contrarian-view">{c.viewpoint}</p>
                      <p><strong>Who benefits:</strong> {c.who_benefits}</p>
                      <p><strong>Risk if wrong:</strong> {c.risk_if_wrong}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="story-card">
                <h3 className="story-arc-label">What To Watch Next</h3>
                <div className="watch-list">
                  {(arc.watch_next || []).map((w, idx) => (
                    <div key={idx} className="watch-item">
                      <div className="watch-row">
                        <span className="watch-signal">{w.signal}</span>
                        <span className="watch-prob">{pct(w.probability)}%</span>
                      </div>
                      <div className="confidence-wrap">
                        <span className="confidence-bar red" style={{ width: `${pct(w.probability)}%` }} />
                      </div>
                      <p>{w.why_it_matters}</p>
                      <span className="watch-time">{w.timeframe}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="story-card">
              <h3 className="story-arc-label">Source Coverage</h3>
              <div className="source-grid">
                {(arc.source_articles || []).map((a) => (
                  <div key={a.id} className="source-card">
                    <span className="source-ref">#{a.id} · {a.category}</span>
                    <p className="source-title">{a.title}</p>
                    <p className="source-summary">{a.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
