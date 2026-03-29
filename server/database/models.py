import sqlite3
import os
import json

DATABASE_PATH = os.getenv("DATABASE_PATH", "database/db.sqlite3")


def get_db():
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS user_profile (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    TEXT UNIQUE NOT NULL,
            persona    TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS user_tag_weights (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    TEXT NOT NULL,
            tag        TEXT NOT NULL,
            weight     REAL DEFAULT 1.0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, tag)
        );

        CREATE TABLE IF NOT EXISTS articles (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            title        TEXT NOT NULL,
            category     TEXT DEFAULT 'General',
            summary      TEXT DEFAULT '',
            source       TEXT DEFAULT 'ET Bureau',
            tags         TEXT DEFAULT '[]',
            published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS user_article_history (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    TEXT NOT NULL,
            article_id INTEGER NOT NULL,
            visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS video_scripts (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            article_text TEXT,
            style        TEXT,
            voice        TEXT,
            script       TEXT,
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    _seed_articles(conn)
    conn.close()


def _seed_articles(conn):
    count = conn.execute("SELECT COUNT(*) FROM articles").fetchone()[0]
    if count > 0:
        return

    articles = [
        ("RBI holds repo rate at 6.5% for sixth straight meeting", "Economy",
         "MPC voted 4-2 to keep rates unchanged amid global uncertainty.",
         '["RBI","repo rate","monetary policy","interest rate","MPC","economy","banking"]'),
        ("Sensex rallies 600 points on strong Q4 earnings season", "Markets",
         "BSE Sensex surged driven by IT and banking stocks.",
         '["Sensex","Nifty","markets","equity","BSE","stocks","Q4 results","rally"]'),
        ("Sebi tightens F&O rules: weekly expiry contracts limited", "Markets",
         "New regulations aim to curb retail speculation in derivatives.",
         '["Sebi","F&O","derivatives","options","futures","regulation","trading","NSE"]'),
        ("Top 5 large-cap mutual funds to watch in FY2027", "Mutual Funds",
         "Expert picks for investors seeking stable long-term returns.",
         '["mutual funds","large cap","SIP","investment","equity","wealth","ELSS","NAV"]'),
        ("Reliance Industries posts record Q4 profit of Rs 19488 crore", "Industry",
         "Retail and Jio segments drove growth for the conglomerate.",
         '["Reliance","RIL","profit","Q4 results","Jio","retail","conglomerate"]'),
        ("VC funding in India startups hits 2.1B in Q1 2026", "Startups",
         "Fintech and deeptech lead the charge as investor confidence returns.",
         '["startups","VC","funding","fintech","deeptech","venture capital","Series B","unicorn"]'),
        ("Sequoia backs Bengaluru B2B SaaS startup with 30M Series B", "Startups",
         "The startup serves enterprise clients across Southeast Asia.",
         '["Sequoia","SaaS","B2B","startup","funding","Bengaluru","Series B","enterprise"]'),
        ("IT sector TCS Infosys brace for sluggish Q1 as BFSI clients defer", "Tech",
         "Banking clients are holding back on discretionary tech spends.",
         '["TCS","Infosys","IT sector","BFSI","tech","outsourcing","Q1","revenue"]'),
        ("India GDP growth revised upward to 7.2 percent for FY27", "Economy",
         "IMF and RBI both upgraded forecasts citing strong domestic demand.",
         '["GDP","India economy","growth","FY27","IMF","domestic demand","macro","forecast"]'),
        ("EV startups face funding winter as global VCs tighten norms", "Startups",
         "Electric vehicle companies struggle to raise follow-on rounds.",
         '["EV","electric vehicle","startup","funding","VC","green energy","battery","charging"]'),
        ("Union Budget 2026 Infra capex to touch Rs 11.1 lakh crore", "Economy",
         "Government doubles down on roads railways and ports spending.",
         '["budget","infrastructure","capex","government","railways","roads","fiscal policy"]'),
        ("Nifty Bank options chain shows put writing at 47000 strike", "Markets",
         "Options data suggests strong support at current levels.",
         '["Nifty Bank","options","F&O","put writing","technical analysis","derivatives"]'),
        ("ELSS vs PPF Which tax-saving instrument wins in 2026", "Wealth",
         "A detailed comparison for salaried investors under new tax regime.",
         '["ELSS","PPF","tax saving","80C","investment","wealth","mutual funds","SIP"]'),
        ("Adani Group secures Rs 1.2 lakh crore order book in renewables", "Industry",
         "Green energy projects dominate the conglomerate pipeline.",
         '["Adani","renewables","green energy","solar","infrastructure","order book","capex"]'),
        ("Angel tax abolished what it means for early stage founders", "Startups",
         "Budget 2026 removes controversial tax on startup investments.",
         '["angel tax","startups","founders","budget","investment","early stage","DPIIT"]'),
        ("SBI Card Q4 results Net profit rises 11 percent to Rs 662 crore", "Finance",
         "Credit card spends surged 18 percent YoY driven by travel and retail.",
         '["SBI Card","credit card","Q4 results","NBFC","finance","banking","profit"]'),
        ("How Zepto quick commerce model is reshaping retail logistics", "Tech",
         "10-minute delivery startups are forcing traditional retailers to adapt.",
         '["Zepto","quick commerce","retail","logistics","delivery","startup","D2C"]'),
        ("Nifty 50 PE ratio at 22x Is the market overvalued", "Markets",
         "Analysts are divided on valuation comfort at current levels.",
         '["Nifty","PE ratio","valuation","markets","equity","technical","bull market"]'),
        ("India VIX falls to 13.2 signaling calm before policy decision", "Markets",
         "Low volatility index reading precedes the RBI policy announcement.",
         '["VIX","volatility","markets","RBI","options","sentiment","technical analysis"]'),
        ("C-suite salaries rise 18 percent in FY26 CFOs CTOs in highest demand", "Industry",
         "Finance and technology leaders command premium pay packages.",
         '["salary","CXO","CFO","CTO","leadership","executive","compensation","hiring"]'),
    ]

    conn.executemany(
        "INSERT INTO articles (title, category, summary, tags) VALUES (?,?,?,?)",
        articles
    )
    conn.commit()