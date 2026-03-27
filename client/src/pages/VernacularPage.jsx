import { useState } from "react";
import "./VernacularPage.css";

const LANGUAGES = [
  { code: "hi", label: "हिंदी", name: "Hindi", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", name: "Tamil", flag: "🟠" },
  { code: "te", label: "తెలుగు", name: "Telugu", flag: "🟡" },
  { code: "bn", label: "বাংলা", name: "Bengali", flag: "🟢" },
];

const SAMPLE_TEXTS = [
  "The Reserve Bank of India has held the repo rate steady at 6.5%, marking the sixth consecutive pause. Governor Das cited resilient GDP growth of 8.4% while flagging global uncertainty from US tariff escalations.",
  "Sebi has tightened F&O rules — weekly expiry contracts will be limited to one per exchange, and lot sizes will be hiked to curb speculative retail trading.",
  "India's startup ecosystem raised $2.1 billion in Q1 2026, with fintech and deeptech leading the charge. Bengaluru retained its position as the top startup hub.",
];

const MOCK_TRANSLATIONS = {
  hi: {
    text: "भारतीय रिज़र्व बैंक ने रेपो दर को 6.5% पर स्थिर रखा है, जो लगातार छठी बार है। गवर्नर दास ने भारत की मजबूत जीडीपी वृद्धि 8.4% का हवाला देते हुए अमेरिकी टैरिफ वृद्धि से वैश्विक अनिश्चितता की ओर ध्यान आकर्षित किया।\n\n📌 सरल भाषा में: इसका मतलब है कि आपके होम लोन की EMI फिलहाल नहीं बदलेगी। RBI ने यह फैसला इसलिए लिया क्योंकि भारत की अर्थव्यवस्था अच्छी चल रही है, लेकिन दुनिया में अनिश्चितता बनी हुई है।",
    adapted: true,
    note: "Includes EMI context for Hindi-speaking audience (most are home loan holders)",
  },
  ta: {
    text: "இந்திய ரிசர்வ் வங்கி ரெப்போ வட்டி விகிதத்தை 6.5% ஆக தொடர்ந்து ஆறாவது முறையாக மாற்றாமல் வைத்துள்ளது. ஆளுநர் தாஸ் 8.4% GDP வளர்ச்சியை மேற்கோள் காட்டி, அமெரிக்க வரி விகித உயர்வால் உலக நிச்சயமற்ற தன்மை குறித்து எச்சரித்தார்.\n\n📌 எளிய விளக்கம்: உங்கள் வீட்டு கடன் EMI மாறாது. இந்திய பொருளாதாரம் நல்ல நிலையில் இருப்பதால் RBI இந்த முடிவை எடுத்தது.",
    adapted: true,
    note: "Adapted with local EMI relevance for Tamil-speaking middle-class readers",
  },
  te: {
    text: "భారతీయ రిజర్వ్ బ్యాంక్ రెపో రేటును 6.5% వద్ద స్థిరంగా ఉంచింది — వరుసగా ఆరవ సారి. గవర్నర్ దాస్ 8.4% GDP వృద్ధిని ప్రస్తావిస్తూ, అమెరికా టారిఫ్ పెరుగుదల వల్ల ప్రపంచ అనిశ్చితత గురించి హెచ్చరించారు.\n\n📌 సులభ వివరణ: మీ హోమ్ లోన్ EMI ఇప్పటికి మారదు. భారత ఆర్థిక వ్యవస్థ బలంగా ఉన్నందున RBI ఈ నిర్ణయం తీసుకుంది.",
    adapted: true,
    note: "Localized with Andhra/Telangana farmer credit context removed (urban audience focus)",
  },
  bn: {
    text: "ভারতীয় রিজার্ভ ব্যাংক রেপো রেট ৬.৫% এ অপরিবর্তিত রেখেছে — পরপর ষষ্ঠবার। গভর্নর দাস ৮.৪% জিডিপি প্রবৃদ্ধির কথা উল্লেখ করে মার্কিন শুল্ক বৃদ্ধির কারণে বৈশ্বিক অনিশ্চয়তার কথা তুলে ধরেছেন।\n\n📌 সহজ ব্যাখ্যা: আপনার হোম লোনের EMI আপাতত পরিবর্তন হবে না। ভারতের অর্থনীতি শক্তিশালী থাকায় RBI এই সিদ্ধান্ত নিয়েছে।",
    adapted: true,
    note: "Simplified for Bengali readers — includes jute/garment industry micro-context",
  },
};

export default function VernacularPage() {
  const [inputText, setInputText] = useState("");
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const translate = () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(MOCK_TRANSLATIONS[selectedLang.code]);
      setLoading(false);
    }, 1800);
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
              <span className="lang-flag">{lang.flag}</span>
              <div>
                <div className="lang-native">{lang.label}</div>
                <div className="lang-name">{lang.name}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="vernacular-layout">
          <div className="vernacular-input-panel">
            <h3 className="vern-label">English article / text</h3>
            <div className="sample-texts">
              {SAMPLE_TEXTS.map((t, i) => (
                <button key={i} className="sample-text-btn" onClick={() => setInputText(t)}>
                  Sample {i + 1} →
                </button>
              ))}
            </div>
            <textarea
              rows={8}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste ET article text here to translate..."
              style={{ resize: "vertical", marginBottom: 16 }}
            />
            <button className="btn-primary" style={{ width: "100%" }} onClick={translate} disabled={loading}>
              {loading ? <><span className="spinner" /> Translating with context...</> : `Translate to ${selectedLang.name} →`}
            </button>
          </div>

          <div className="vernacular-output-panel">
            <h3 className="vern-label">
              {selectedLang.label} output
              {result?.adapted && <span className="adapted-badge">Culturally adapted</span>}
            </h3>

            {!result && !loading && (
              <div className="output-placeholder">
                <span style={{ fontSize: 32 }}>{selectedLang.flag}</span>
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
                <div className="translated-text" lang={selectedLang.code}>
                  {result.text}
                </div>
                {result.note && (
                  <div className="adaptation-note">
                    <span className="ai-badge" style={{ fontSize: 9 }}>Adaptation note</span>
                    <p>{result.note}</p>
                  </div>
                )}
                <div className="output-actions">
                  <button className="btn-outline" style={{ fontSize: 12 }}>📋 Copy</button>
                  <button className="btn-outline" style={{ fontSize: 12 }}>🔊 Listen</button>
                  <button className="btn-outline" style={{ fontSize: 12 }}>📤 Share</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}