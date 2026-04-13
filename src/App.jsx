import "./storage.js";
import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════
   CONSTANTS & THEMES
   ══════════════════════════════════════════ */
const GRID_COLS = 12;
const CELL_H = 56;
const GRID_ROWS = 18;
const GRID_GAP = 8;
const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const THEMES = {
  noir: {
    name: "Noir",
    bg: "#0e0e12",
    surface: "#18181f",
    card: "rgba(26,26,35,0.85)",
    border: "rgba(255,255,255,0.06)",
    text: "#e4e4ec",
    sub: "#6e6e82",
    accent: "#a78bfa",
    accentGlow: "rgba(167,139,250,0.25)",
    gridLine: "rgba(255,255,255,0.04)",
    gridLineFocus: "rgba(167,139,250,0.12)",
  },
  rose: {
    name: "Rosé",
    bg: "#f8f0f0",
    surface: "#fff5f5",
    card: "rgba(255,255,255,0.8)",
    border: "rgba(180,60,100,0.08)",
    text: "#3a1a2a",
    sub: "#9a7080",
    accent: "#d4487a",
    accentGlow: "rgba(212,72,122,0.18)",
    gridLine: "rgba(0,0,0,0.04)",
    gridLineFocus: "rgba(212,72,122,0.12)",
  },
  deep: {
    name: "Deep Ocean",
    bg: "#080c18",
    surface: "#0d1228",
    card: "rgba(14,20,48,0.85)",
    border: "rgba(56,189,248,0.08)",
    text: "#cce0f0",
    sub: "#5a7a98",
    accent: "#38bdf8",
    accentGlow: "rgba(56,189,248,0.2)",
    gridLine: "rgba(255,255,255,0.03)",
    gridLineFocus: "rgba(56,189,248,0.1)",
  },
  sage: {
    name: "Sage",
    bg: "#0c120c",
    surface: "#121e14",
    card: "rgba(18,30,20,0.85)",
    border: "rgba(74,222,128,0.08)",
    text: "#d0e8d4",
    sub: "#6a9870",
    accent: "#4ade80",
    accentGlow: "rgba(74,222,128,0.2)",
    gridLine: "rgba(255,255,255,0.03)",
    gridLineFocus: "rgba(74,222,128,0.1)",
  },
  cream: {
    name: "Cream",
    bg: "#f5f0e8",
    surface: "#faf6f0",
    card: "rgba(255,252,248,0.85)",
    border: "rgba(120,80,20,0.06)",
    text: "#2a2018",
    sub: "#8a7a60",
    accent: "#c08030",
    accentGlow: "rgba(192,128,48,0.18)",
    gridLine: "rgba(0,0,0,0.04)",
    gridLineFocus: "rgba(192,128,48,0.12)",
  },
};

const DEFAULT_BLOCKS = [
  { id: "b1", type: "profile", col: 4, row: 1, w: 5, h: 3, data: { name: "Your Name", bio: "한 줄 소개를 입력하세요 ✦", emoji: "✨", status: "Online" } },
  { id: "b2", type: "about", col: 1, row: 1, w: 3, h: 3, data: { title: "ABOUT", items: ["🎨 Designer", "💻 Developer", "🌙 Night Owl"] } },
  { id: "b3", type: "links", col: 9, row: 1, w: 4, h: 5, data: { title: "LINKS", links: [{ icon: "🐦", label: "Twitter", url: "#" }, { icon: "📸", label: "Instagram", url: "#" }, { icon: "💻", label: "GitHub", url: "#" }, { icon: "📝", label: "Blog", url: "#" }] } },
  { id: "b4", type: "music", col: 1, row: 4, w: 5, h: 2, data: { track: "Favorite Song", artist: "Artist Name" } },
  { id: "b5", type: "gallery", col: 6, row: 4, w: 3, h: 2, data: { title: "FAVORITES", items: [{ emoji: "🎮", label: "Games" }, { emoji: "📚", label: "Books" }, { emoji: "🎬", label: "Movies" }, { emoji: "🍜", label: "Food" }] } },
  { id: "b6", type: "text", col: 1, row: 6, w: 8, h: 2, data: { content: "자유롭게 블록을 배치하고 크기를 조절해보세요.\n그리드 위에서 드래그하여 이동, 모서리를 잡아 크기를 변경할 수 있어요." } },
  { id: "b7", type: "social", col: 9, row: 6, w: 4, h: 2, data: { title: "SOCIAL", handles: [{ platform: "X", handle: "@username" }, { platform: "IG", handle: "@username" }, { platform: "DC", handle: "user#0000" }] } },
];

/* ══════════════════════════════════════════
   BLOCK RENDERERS
   ══════════════════════════════════════════ */
function ProfileBlock({ data, t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${t.accent}55, ${t.accent}22)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `2px solid ${t.accent}33`, flexShrink: 0 }}>
        {data.name?.charAt(0)?.toUpperCase() || "?"}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: t.text, letterSpacing: 0.5 }}>{data.name}</div>
      <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}>{data.bio}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 12, background: t.border, fontSize: 10, color: t.sub }}>
        <span>{data.emoji}</span>{data.status}
      </div>
    </div>
  );
}

function AboutBlock({ data, t }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: t.accent, marginBottom: 10 }}>{data.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, justifyContent: "center" }}>
        {(data.items || []).map((item, i) => (
          <span key={i} style={{ fontSize: 13, color: t.text, lineHeight: 1.5 }}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function LinksBlock({ data, t }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: t.accent, marginBottom: 10 }}>{data.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, justifyContent: "center" }}>
        {(data.links || []).map((lnk, i) => (
          <a key={i} href={lnk.url} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: t.border, color: t.text, textDecoration: "none", fontSize: 13, transition: "all .25s", border: "1px solid transparent" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.transform = "translateX(3px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "none"; }}>
            <span style={{ fontSize: 16 }}>{lnk.icon}</span>
            <span style={{ flex: 1 }}>{lnk.label}</span>
            <span style={{ opacity: .3, fontSize: 11 }}>→</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function MusicBlock({ data, t }) {
  const [p, setP] = useState(35);
  useEffect(() => { const iv = setInterval(() => setP(v => v >= 100 ? 0 : v + .12), 80); return () => clearInterval(iv); }, []);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 15% 50%, ${t.accentGlow}, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: t.accent, marginBottom: 10 }}>♪ NOW PLAYING</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: `linear-gradient(135deg,${t.accent}44,${t.accent}18)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: `1px solid ${t.border}`, flexShrink: 0 }}>🎵</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{data.track}</div>
            <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>{data.artist}</div>
          </div>
        </div>
        <div style={{ marginTop: 12, height: 3, borderRadius: 2, background: t.border, overflow: "hidden" }}>
          <div style={{ width: `${p}%`, height: "100%", borderRadius: 2, background: t.accent, transition: "width .08s linear" }} />
        </div>
      </div>
    </div>
  );
}

function GalleryBlock({ data, t }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: t.accent, marginBottom: 10 }}>{data.title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(56px,1fr))", gap: 6, flex: 1, alignContent: "center" }}>
        {(data.items || []).map((it, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 8, background: t.border, transition: "all .25s", cursor: "default" }}
            onMouseEnter={e => { e.currentTarget.style.background = t.accentGlow; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.border; e.currentTarget.style.transform = "none"; }}>
            <span style={{ fontSize: 20 }}>{it.emoji}</span>
            <span style={{ fontSize: 9, color: t.sub }}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextBlock({ data, t }) {
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center" }}>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: t.sub, whiteSpace: "pre-wrap" }}>{data.content}</p>
    </div>
  );
}

function SocialBlock({ data, t }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: t.accent, marginBottom: 10 }}>{data.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, justifyContent: "center" }}>
        {(data.handles || []).map((h, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: t.accent, width: 24 }}>{h.platform}</span>
            <span style={{ color: t.text }}>{h.handle}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const BLOCK_RENDERERS = { profile: ProfileBlock, about: AboutBlock, links: LinksBlock, music: MusicBlock, gallery: GalleryBlock, text: TextBlock, social: SocialBlock };

const BLOCK_CATALOG = [
  { type: "profile", label: "프로필", icon: "👤", defaultW: 4, defaultH: 3, defaultData: { name: "Name", bio: "Bio", emoji: "✨", status: "Online" } },
  { type: "about", label: "소개", icon: "📋", defaultW: 3, defaultH: 3, defaultData: { title: "ABOUT", items: ["Item 1", "Item 2"] } },
  { type: "links", label: "링크", icon: "🔗", defaultW: 4, defaultH: 4, defaultData: { title: "LINKS", links: [{ icon: "🔗", label: "Link", url: "#" }] } },
  { type: "music", label: "음악", icon: "🎵", defaultW: 5, defaultH: 2, defaultData: { track: "Track", artist: "Artist" } },
  { type: "gallery", label: "갤러리", icon: "🖼️", defaultW: 3, defaultH: 2, defaultData: { title: "GALLERY", items: [{ emoji: "⭐", label: "Item" }] } },
  { type: "text", label: "텍스트", icon: "📝", defaultW: 6, defaultH: 2, defaultData: { content: "텍스트를 입력하세요" } },
  { type: "social", label: "소셜", icon: "💬", defaultW: 3, defaultH: 2, defaultData: { title: "SOCIAL", handles: [{ platform: "X", handle: "@user" }] } },
];

/* ══════════════════════════════════════════
   AUTH SCREEN
   ══════════════════════════════════════════ */
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) { setError("모든 필드를 입력해주세요"); return; }
    if (username.includes(" ") || username.includes("/") || username.includes("\\") || username.includes("'") || username.includes('"')) { setError("사용자명에 공백이나 특수문자를 사용할 수 없어요"); return; }
    setLoading(true);
    setError("");
    try {
      if (mode === "register") {
        if (!displayName.trim()) { setError("표시 이름을 입력해주세요"); setLoading(false); return; }
        let existing = null;
        try { existing = await window.storage.get(`user-auth:${username}`, true); } catch {}
        if (existing) { setError("이미 존재하는 사용자명이에요"); setLoading(false); return; }
        const userData = { password, displayName: displayName.trim(), theme: "noir", createdAt: Date.now() };
        await window.storage.set(`user-auth:${username}`, JSON.stringify(userData), true);
        const pageData = { blocks: DEFAULT_BLOCKS.map(b => ({ ...b, id: uid() })), settings: { theme: "noir" } };
        await window.storage.set(`user-page:${username}`, JSON.stringify(pageData), true);
        await window.storage.set("current-session", JSON.stringify({ username }));
        onLogin(username, displayName.trim());
      } else {
        let stored = null;
        try { stored = await window.storage.get(`user-auth:${username}`, true); } catch {}
        if (!stored) { setError("존재하지 않는 계정이에요"); setLoading(false); return; }
        const userData = JSON.parse(stored.value);
        if (userData.password !== password) { setError("비밀번호가 일치하지 않아요"); setLoading(false); return; }
        await window.storage.set("current-session", JSON.stringify({ username }));
        onLogin(username, userData.displayName);
      }
    } catch (err) {
      setError("오류가 발생했어요: " + err.message);
    }
    setLoading(false);
  };

  const t = THEMES.noir;
  const inputSt = { width: "100%", padding: "12px 16px", fontSize: 14, color: t.text, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border .2s" };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', 'Pretendard', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: ${t.accent} !important; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div style={{ width: 380, padding: "48px 36px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 20, backdropFilter: "blur(20px)", animation: "fadeIn .6s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: -0.5 }}>MY<span style={{ color: t.accent }}>PAGE</span></div>
          <div style={{ fontSize: 12, color: t.sub, marginTop: 6, letterSpacing: 2 }}>나만의 페이지를 만들어보세요</div>
        </div>

        <div style={{ display: "flex", marginBottom: 24, borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}` }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "10px", fontSize: 12, fontWeight: mode === m ? 700 : 400, color: mode === m ? t.accent : t.sub, background: mode === m ? t.accentGlow : "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", letterSpacing: 1, transition: "all .2s" }}>
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input style={inputSt} placeholder="사용자명 (영문)" value={username} onChange={e => setUsername(e.target.value.toLowerCase())} />
          {mode === "register" && <input style={inputSt} placeholder="표시 이름" value={displayName} onChange={e => setDisplayName(e.target.value)} />}
          <input style={inputSt} type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          {error && <div style={{ fontSize: 12, color: "#f06060", padding: "6px 0" }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading}
            style={{ marginTop: 8, padding: "14px", fontSize: 14, fontWeight: 700, color: "#fff", background: t.accent, border: "none", borderRadius: 10, cursor: loading ? "wait" : "pointer", fontFamily: "inherit", letterSpacing: 1, opacity: loading ? .6 : 1, transition: "all .2s" }}>
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   BLOCK EDITOR PANEL (content editing)
   ══════════════════════════════════════════ */
function BlockEditorPanel({ block, t, onUpdate, onClose }) {
  if (!block) return null;
  const d = block.data;
  const set = (field, value) => onUpdate({ ...block, data: { ...d, [field]: value } });
  const inSt = { width: "100%", padding: "8px 12px", fontSize: 13, color: t.text, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
  const lblSt = { fontSize: 10, color: t.sub, marginBottom: 4, display: "block", letterSpacing: 1, textTransform: "uppercase" };

  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 320, height: "100vh", background: t.bg, borderLeft: `1px solid ${t.border}`, zIndex: 2000, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${t.border}` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: t.text, letterSpacing: 1 }}>블록 편집</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: t.sub, fontSize: 18, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {block.type === "profile" && <>
          <div><label style={lblSt}>이름</label><input style={inSt} value={d.name || ""} onChange={e => set("name", e.target.value)} /></div>
          <div><label style={lblSt}>소개</label><textarea style={{ ...inSt, minHeight: 50, resize: "vertical" }} value={d.bio || ""} onChange={e => set("bio", e.target.value)} /></div>
          <div><label style={lblSt}>이모지</label><input style={{ ...inSt, width: 60 }} value={d.emoji || ""} onChange={e => set("emoji", e.target.value)} /></div>
          <div><label style={lblSt}>상태</label><input style={inSt} value={d.status || ""} onChange={e => set("status", e.target.value)} /></div>
        </>}
        {block.type === "about" && <>
          <div><label style={lblSt}>제목</label><input style={inSt} value={d.title || ""} onChange={e => set("title", e.target.value)} /></div>
          <div><label style={lblSt}>항목 (줄바꿈 구분)</label><textarea style={{ ...inSt, minHeight: 80, resize: "vertical" }} value={(d.items || []).join("\n")} onChange={e => set("items", e.target.value.split("\n"))} /></div>
        </>}
        {block.type === "links" && <>
          <div><label style={lblSt}>제목</label><input style={inSt} value={d.title || ""} onChange={e => set("title", e.target.value)} /></div>
          {(d.links || []).map((lnk, i) => (
            <div key={i} style={{ display: "flex", gap: 4 }}>
              <input style={{ ...inSt, width: 36, textAlign: "center", padding: "6px 2px" }} value={lnk.icon} onChange={e => { const nl = [...d.links]; nl[i] = { ...nl[i], icon: e.target.value }; set("links", nl); }} />
              <input style={{ ...inSt, flex: 1 }} placeholder="라벨" value={lnk.label} onChange={e => { const nl = [...d.links]; nl[i] = { ...nl[i], label: e.target.value }; set("links", nl); }} />
              <input style={{ ...inSt, flex: 1 }} placeholder="URL" value={lnk.url} onChange={e => { const nl = [...d.links]; nl[i] = { ...nl[i], url: e.target.value }; set("links", nl); }} />
              <button onClick={() => set("links", d.links.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#e55", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          ))}
          <button onClick={() => set("links", [...(d.links || []), { icon: "🔗", label: "New", url: "#" }])} style={{ padding: "6px 12px", fontSize: 11, borderRadius: 6, background: t.accent, color: "#fff", border: "none", cursor: "pointer" }}>+ 링크 추가</button>
        </>}
        {block.type === "music" && <>
          <div><label style={lblSt}>곡 제목</label><input style={inSt} value={d.track || ""} onChange={e => set("track", e.target.value)} /></div>
          <div><label style={lblSt}>아티스트</label><input style={inSt} value={d.artist || ""} onChange={e => set("artist", e.target.value)} /></div>
        </>}
        {block.type === "gallery" && <>
          <div><label style={lblSt}>제목</label><input style={inSt} value={d.title || ""} onChange={e => set("title", e.target.value)} /></div>
          {(d.items || []).map((it, i) => (
            <div key={i} style={{ display: "flex", gap: 4 }}>
              <input style={{ ...inSt, width: 42, textAlign: "center" }} value={it.emoji} onChange={e => { const ni = [...d.items]; ni[i] = { ...ni[i], emoji: e.target.value }; set("items", ni); }} />
              <input style={{ ...inSt, flex: 1 }} value={it.label} onChange={e => { const ni = [...d.items]; ni[i] = { ...ni[i], label: e.target.value }; set("items", ni); }} />
              <button onClick={() => set("items", d.items.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#e55", cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <button onClick={() => set("items", [...(d.items || []), { emoji: "⭐", label: "New" }])} style={{ padding: "6px 12px", fontSize: 11, borderRadius: 6, background: t.accent, color: "#fff", border: "none", cursor: "pointer" }}>+ 항목 추가</button>
        </>}
        {block.type === "text" && <div><label style={lblSt}>내용</label><textarea style={{ ...inSt, minHeight: 100, resize: "vertical" }} value={d.content || ""} onChange={e => set("content", e.target.value)} /></div>}
        {block.type === "social" && <>
          <div><label style={lblSt}>제목</label><input style={inSt} value={d.title || ""} onChange={e => set("title", e.target.value)} /></div>
          {(d.handles || []).map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 4 }}>
              <input style={{ ...inSt, width: 48 }} value={h.platform} onChange={e => { const nh = [...d.handles]; nh[i] = { ...nh[i], platform: e.target.value }; set("handles", nh); }} />
              <input style={{ ...inSt, flex: 1 }} value={h.handle} onChange={e => { const nh = [...d.handles]; nh[i] = { ...nh[i], handle: e.target.value }; set("handles", nh); }} />
              <button onClick={() => set("handles", d.handles.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#e55", cursor: "pointer" }}>✕</button>
            </div>
          ))}
          <button onClick={() => set("handles", [...(d.handles || []), { platform: "X", handle: "@user" }])} style={{ padding: "6px 12px", fontSize: 11, borderRadius: 6, background: t.accent, color: "#fff", border: "none", cursor: "pointer" }}>+ 핸들 추가</button>
        </>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   GRID CANVAS — THE MAIN EDITOR
   ══════════════════════════════════════════ */
function GridCanvas({ blocks, setBlocks, editing, theme, selectedId, setSelectedId, onEditBlock }) {
  const t = THEMES[theme] || THEMES.noir;
  const gridRef = useRef(null);
  const dragRef = useRef(null); // { blockId, mode:'move'|'resize', startX, startY, origCol, origRow, origW, origH }
  const [dragGhost, setDragGhost] = useState(null);

  const getGridPixel = useCallback(() => {
    if (!gridRef.current) return { cellW: 80, offsetX: 0, offsetY: 0 };
    const rect = gridRef.current.getBoundingClientRect();
    const totalGap = GRID_GAP * (GRID_COLS - 1);
    const cellW = (rect.width - totalGap) / GRID_COLS;
    return { cellW, offsetX: rect.left, offsetY: rect.top, gridW: rect.width };
  }, []);

  const pixelToGrid = useCallback((px, py) => {
    const { cellW, offsetX, offsetY } = getGridPixel();
    const col = Math.round((px - offsetX) / (cellW + GRID_GAP)) + 1;
    const row = Math.round((py - offsetY) / (CELL_H + GRID_GAP)) + 1;
    return { col: clamp(col, 1, GRID_COLS), row: clamp(row, 1, GRID_ROWS) };
  }, [getGridPixel]);

  const handleMouseDown = useCallback((e, blockId, mode) => {
    if (!editing) return;
    e.preventDefault();
    e.stopPropagation();
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    setSelectedId(blockId);
    dragRef.current = { blockId, mode, startX: e.clientX, startY: e.clientY, origCol: block.col, origRow: block.row, origW: block.w, origH: block.h };
    setDragGhost({ col: block.col, row: block.row, w: block.w, h: block.h });
  }, [editing, blocks, setSelectedId]);

  useEffect(() => {
    if (!editing) return;
    const handleMove = (e) => {
      const dr = dragRef.current;
      if (!dr) return;
      const { cellW } = getGridPixel();
      const stepX = cellW + GRID_GAP;
      const stepY = CELL_H + GRID_GAP;
      const dx = e.clientX - dr.startX;
      const dy = e.clientY - dr.startY;

      if (dr.mode === "move") {
        const dCol = Math.round(dx / stepX);
        const dRow = Math.round(dy / stepY);
        const newCol = clamp(dr.origCol + dCol, 1, GRID_COLS - dr.origW + 1);
        const newRow = clamp(dr.origRow + dRow, 1, GRID_ROWS - dr.origH + 1);
        setDragGhost({ col: newCol, row: newRow, w: dr.origW, h: dr.origH });
      } else {
        const dW = Math.round(dx / stepX);
        const dH = Math.round(dy / stepY);
        const newW = clamp(dr.origW + dW, 1, GRID_COLS - dr.origCol + 1);
        const newH = clamp(dr.origH + dH, 1, GRID_ROWS - dr.origRow + 1);
        setDragGhost({ col: dr.origCol, row: dr.origRow, w: newW, h: newH });
      }
    };
    const handleUp = () => {
      const dr = dragRef.current;
      if (dr && dragGhost) {
        setBlocks(prev => prev.map(b => b.id === dr.blockId ? { ...b, col: dragGhost.col, row: dragGhost.row, w: dragGhost.w, h: dragGhost.h } : b));
      }
      dragRef.current = null;
      setDragGhost(null);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [editing, dragGhost, getGridPixel, setBlocks]);

  const gridW = "100%";
  const { cellW: cw } = getGridPixel();

  return (
    <div ref={gridRef} style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridAutoRows: CELL_H, gap: GRID_GAP, width: "100%", minHeight: GRID_ROWS * (CELL_H + GRID_GAP) }}>

      {/* grid overlay in edit mode */}
      {editing && Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
        const c = (i % GRID_COLS) + 1;
        const r = Math.floor(i / GRID_COLS) + 1;
        return (
          <div key={`cell-${i}`} style={{
            gridColumn: c, gridRow: r,
            borderRadius: 4,
            border: `1px dashed ${t.gridLine}`,
            background: t.gridLineFocus.replace(/[\d.]+\)$/, "0.02)"),
            pointerEvents: "none",
          }} />
        );
      })}

      {/* ghost indicator */}
      {editing && dragGhost && (
        <div style={{
          gridColumn: `${dragGhost.col} / span ${dragGhost.w}`,
          gridRow: `${dragGhost.row} / span ${dragGhost.h}`,
          borderRadius: 12,
          border: `2px dashed ${t.accent}`,
          background: t.accentGlow,
          pointerEvents: "none",
          zIndex: 5,
          transition: "all .08s ease",
        }} />
      )}

      {/* blocks */}
      {blocks.map(block => {
        const Renderer = BLOCK_RENDERERS[block.type];
        const isSelected = selectedId === block.id;
        const isDragging = dragRef.current?.blockId === block.id;
        return (
          <div key={block.id}
            style={{
              gridColumn: `${block.col} / span ${block.w}`,
              gridRow: `${block.row} / span ${block.h}`,
              background: t.card,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: `1px solid ${isSelected && editing ? t.accent : t.border}`,
              borderRadius: 14,
              padding: "16px 18px",
              position: "relative",
              zIndex: isDragging ? 10 : 2,
              opacity: isDragging ? .6 : 1,
              cursor: editing ? "grab" : "default",
              transition: isDragging ? "none" : "box-shadow .2s, border .2s",
              boxShadow: isSelected && editing ? `0 0 0 1px ${t.accent}, 0 4px 20px ${t.accentGlow}` : `0 2px 12px rgba(0,0,0,0.15)`,
              overflow: "hidden",
              userSelect: editing ? "none" : "auto",
            }}
            onMouseDown={e => editing && handleMouseDown(e, block.id, "move")}
            onDoubleClick={() => editing && onEditBlock(block.id)}
          >
            {Renderer && <Renderer data={block.data} t={t} />}

            {/* resize handle */}
            {editing && isSelected && (
              <div
                onMouseDown={e => handleMouseDown(e, block.id, "resize")}
                style={{
                  position: "absolute", bottom: 0, right: 0, width: 20, height: 20,
                  cursor: "nwse-resize", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}

            {/* delete btn */}
            {editing && isSelected && (
              <button
                onClick={e => { e.stopPropagation(); setBlocks(prev => prev.filter(b => b.id !== block.id)); setSelectedId(null); }}
                style={{ position: "absolute", top: 6, right: 8, background: "rgba(220,50,50,0.9)", color: "#fff", border: "none", borderRadius: 6, width: 22, height: 22, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}
              >✕</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════
   TOOLBAR
   ══════════════════════════════════════════ */
function Toolbar({ editing, setEditing, theme, setTheme, blocks, setBlocks, onLogout, username }) {
  const t = THEMES[theme] || THEMES.noir;
  const [showAdd, setShowAdd] = useState(false);
  const [showTheme, setShowTheme] = useState(false);

  const addBlock = (cat) => {
    const maxRow = blocks.reduce((mx, b) => Math.max(mx, b.row + b.h), 0);
    const nb = { id: uid(), type: cat.type, col: 1, row: maxRow + 1 > GRID_ROWS ? 1 : maxRow, w: cat.defaultW, h: cat.defaultH, data: JSON.parse(JSON.stringify(cat.defaultData)) };
    setBlocks(prev => [...prev, nb]);
    setShowAdd(false);
  };

  const btnSt = (active) => ({
    padding: "8px 16px", fontSize: 12, fontWeight: 600, color: active ? "#fff" : t.text,
    background: active ? t.accent : t.surface, border: `1px solid ${active ? t.accent : t.border}`,
    borderRadius: 10, cursor: "pointer", fontFamily: "inherit", transition: "all .2s", letterSpacing: 0.5,
    display: "flex", alignItems: "center", gap: 6, position: "relative",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 24px", background: t.bg, borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)" }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: t.text, marginRight: 8, letterSpacing: -0.5 }}>MY<span style={{ color: t.accent }}>PAGE</span></div>
      <div style={{ fontSize: 11, color: t.sub, marginRight: "auto", letterSpacing: 1 }}>@{username}</div>

      <button onClick={() => setEditing(!editing)} style={btnSt(editing)}>
        {editing ? "✓ 완료" : "✏️ 편집"}
      </button>

      {editing && (
        <>
          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowAdd(!showAdd); setShowTheme(false); }} style={btnSt(false)}>+ 블록</button>
            {showAdd && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 8, zIndex: 200, minWidth: 180, boxShadow: `0 8px 32px rgba(0,0,0,.4)` }}>
                {BLOCK_CATALOG.map(cat => (
                  <button key={cat.type} onClick={() => addBlock(cat)}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", fontSize: 12, color: t.text, background: "transparent", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", transition: "background .15s", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = t.border}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ fontSize: 16 }}>{cat.icon}</span>{cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowTheme(!showTheme); setShowAdd(false); }} style={btnSt(false)}>🎨 테마</button>
            {showTheme && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: 8, zIndex: 200, minWidth: 160, boxShadow: `0 8px 32px rgba(0,0,0,.4)` }}>
                {Object.entries(THEMES).map(([k, th]) => (
                  <button key={k} onClick={() => { setTheme(k); setShowTheme(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", fontSize: 12, color: t.text, background: theme === k ? t.border : "transparent", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}
                    onMouseEnter={e => e.currentTarget.style.background = t.border}
                    onMouseLeave={e => { if (theme !== k) e.currentTarget.style.background = "transparent"; }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: th.accent, border: `2px solid ${th.border}`, flexShrink: 0 }} />
                    {th.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <button onClick={onLogout} style={{ ...btnSt(false), marginLeft: 8, padding: "8px 12px" }}>로그아웃</button>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null);       // { username, displayName }
  const [blocks, setBlocks] = useState([]);
  const [theme, setTheme] = useState("noir");
  const [editing, setEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [ready, setReady] = useState(false);

  // auto-login from session
  useEffect(() => {
    (async () => {
      try {
        const sess = await window.storage.get("current-session");
        if (sess?.value) {
          const { username } = JSON.parse(sess.value);
          const authRes = await window.storage.get(`user-auth:${username}`, true);
          if (authRes?.value) {
            const auth = JSON.parse(authRes.value);
            setUser({ username, displayName: auth.displayName });
            const pageRes = await window.storage.get(`user-page:${username}`, true);
            if (pageRes?.value) {
              const page = JSON.parse(pageRes.value);
              setBlocks(page.blocks || []);
              setTheme(page.settings?.theme || "noir");
            }
          }
        }
      } catch {}
      setReady(true);
    })();
  }, []);

  // save on change
  useEffect(() => {
    if (!user || !ready) return;
    const timer = setTimeout(async () => {
      try {
        await window.storage.set(`user-page:${user.username}`, JSON.stringify({ blocks, settings: { theme } }), true);
      } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [blocks, theme, user, ready]);

  const handleLogin = async (username, displayName) => {
    setUser({ username, displayName });
    try {
      const pageRes = await window.storage.get(`user-page:${username}`, true);
      if (pageRes?.value) {
        const page = JSON.parse(pageRes.value);
        setBlocks(page.blocks || []);
        setTheme(page.settings?.theme || "noir");
      } else {
        setBlocks(DEFAULT_BLOCKS.map(b => ({ ...b, id: uid() })));
      }
    } catch {
      setBlocks(DEFAULT_BLOCKS.map(b => ({ ...b, id: uid() })));
    }
  };

  const handleLogout = async () => {
    try { await window.storage.delete("current-session"); } catch {}
    setUser(null);
    setBlocks([]);
    setEditing(false);
    setSelectedId(null);
    setEditingBlockId(null);
  };

  if (!ready) return <div style={{ minHeight: "100vh", background: "#0e0e12", display: "flex", alignItems: "center", justifyContent: "center", color: "#6e6e82", fontFamily: "sans-serif" }}>Loading...</div>;
  if (!user) return <AuthScreen onLogin={handleLogin} />;

  const t = THEMES[theme] || THEMES.noir;
  const editingBlock = editingBlockId ? blocks.find(b => b.id === editingBlockId) : null;

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Outfit', 'Pretendard', sans-serif", color: t.text, transition: "background .5s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${t.accent}33; border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        input:focus, textarea:focus { border-color: ${t.accent} !important; outline: none; }
      `}</style>

      <Toolbar
        editing={editing} setEditing={setEditing}
        theme={theme} setTheme={setTheme}
        blocks={blocks} setBlocks={setBlocks}
        onLogout={handleLogout}
        username={user.username}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px 100px", animation: "fadeIn .5s ease" }}
        onClick={() => { if (editing) { setSelectedId(null); setEditingBlockId(null); } }}>

        {editing && (
          <div style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 10, background: t.accentGlow, border: `1px solid ${t.accent}33`, fontSize: 12, color: t.accent, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>💡</span>
            드래그로 블록을 이동하고, 우하단 핸들로 크기를 조절하세요. 더블클릭하면 내용을 편집할 수 있어요.
          </div>
        )}

        <GridCanvas
          blocks={blocks} setBlocks={setBlocks}
          editing={editing} theme={theme}
          selectedId={selectedId} setSelectedId={setSelectedId}
          onEditBlock={id => { setEditingBlockId(id); setSelectedId(id); }}
        />

        {!editing && (
          <div style={{ textAlign: "center", marginTop: 40, fontSize: 10, color: t.sub, letterSpacing: 3 }}>
            @{user.username} · MADE WITH ♡
          </div>
        )}
      </div>

      {editingBlock && (
        <BlockEditorPanel
          block={editingBlock}
          t={t}
          onUpdate={updated => setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b))}
          onClose={() => setEditingBlockId(null)}
        />
      )}
    </div>
  );
}