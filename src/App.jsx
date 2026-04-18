import React, { useState, useEffect, useRef, useCallback } from "react";

/*
 * ╔═══════════════════════════════════════════════════╗
 * ║  MYPAGE - 개인 소개 페이지 빌더 (배포용)          ║
 * ║  localStorage 기반 로그인 + 데이터 저장            ║
 * ╚═══════════════════════════════════════════════════╝
 *
 * 【변경 사항 — 프리뷰 버전과의 차이점】
 *
 * 1. 저장소: 인메모리 Map → localStorage
 *    → 새로고침해도 데이터가 유지됩니다
 *
 * 2. 로그인/회원가입 화면 추가
 *    → 사용자별 개별 페이지 데이터 저장
 *
 * 3. 로그아웃 버튼 추가
 */

/* ═══ STORAGE (localStorage) ═══ */
const S = {
  get: (k) => {
    try {
      const v = localStorage.getItem(k);
      return v ? { value: v } : null;
    } catch { return null; }
  },
  set: (k, v) => {
    try { localStorage.setItem(k, v); } catch {}
  },
  del: (k) => {
    try { localStorage.removeItem(k); } catch {}
  },
};

const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const COLS = 12, CELL = 48, ROWS = 24, GAP = 5;

/* ═══ THEME ═══ */
const PRESETS = [
  { n: "Midnight", bg: "#0e0e12", text: "#e4e4ec", sub: "#6e6e82", accent: "#a78bfa", card: "#1a1a23", border: "#ffffff10" },
  { n: "Rosé", bg: "#f8f0f0", text: "#3a1a2a", sub: "#9a7080", accent: "#d4487a", card: "#ffffffcc", border: "#b43c6414" },
  { n: "Ocean", bg: "#080c18", text: "#cce0f0", sub: "#5a7a98", accent: "#38bdf8", card: "#0e1430d9", border: "#38bdf814" },
  { n: "Forest", bg: "#0c120c", text: "#d0e8d4", sub: "#6a9870", accent: "#4ade80", card: "#121e14d9", border: "#4ade8014" },
  { n: "Cream", bg: "#f5f0e8", text: "#2a2018", sub: "#8a7a60", accent: "#c08030", card: "#fffcf8d9", border: "#78501410" },
  { n: "Neon", bg: "#0a0a0a", text: "#f0f0f0", sub: "#888", accent: "#39ff14", card: "#0f0f0ff2", border: "#39ff1418" },
  { n: "Pastel", bg: "#fce4ec", text: "#4a2040", sub: "#9a7090", accent: "#ce93d8", card: "#ffffffd9", border: "#ce93d826" },
  { n: "Vapor", bg: "#0d0221", text: "#ff71ce", sub: "#7b61ff", accent: "#01cdfe", card: "#280a64b3", border: "#ff71ce26" },
];

/* ═══ LAYOUTS ═══ */
const LAYOUTS = {
  clean: "Clean", macos: "macOS", windows: "Windows", terminal: "Terminal",
  diary: "다이어리", minihompi: "미니홈피", retro: "Retro", rpg: "RPG",
  kakao: "카카오톡", discord: "Discord", cyberpunk: "Cyberpunk",
  glass: "Glass", postit: "포스트잇", brutalist: "Brutalist",
  gameboy: "GameBoy", letter: "편지", photoshop: "Photoshop",
  magazine: "Magazine", notion: "Notion", film: "Film", pixel: "Pixel",
};

function LayoutWrap({ layout, children, t, title }) {
  const ac = t.accent, bd = t.border, sub = t.sub, bg = t.bg, card = t.card, tx = t.text;
  const bar = (content, bg2) => (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, ...bg2 }}>{content}</div>
      <div style={{ flex: 1, padding: "8px 10px", overflow: "hidden" }}>{children}</div>
    </div>
  );
  const simple = (pad, extra) => <div style={{ height: "100%", padding: pad, overflow: "hidden", ...extra }}>{children}</div>;

  switch (layout) {
    case "macos": return bar(
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px" }}>
        {["#ff5f56", "#ffbd2e", "#27c93f"].map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
        {title && <span style={{ fontSize: 8, color: sub, marginLeft: 4 }}>{title}</span>}
      </div>,
      { background: `${tx}06`, borderBottom: `1px solid ${bd}` }
    );
    case "windows": return bar(
      <div style={{ display: "flex", alignItems: "center", padding: "2px 6px" }}>
        <span style={{ fontSize: 8, color: sub, flex: 1 }}>{title || "Window"}</span>
        {["─", "□", "✕"].map((c, i) => <span key={i} style={{ width: 14, height: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: sub, background: i === 2 ? "#e8111122" : "transparent" }}>{c}</span>)}
      </div>,
      { background: `${ac}15`, borderBottom: `1px solid ${bd}` }
    );
    case "terminal": return bar(
      <div style={{ padding: "3px 10px", fontSize: 8, color: ac, fontFamily: "monospace" }}><span style={{ opacity: .5 }}>user@page</span>:~$</div>,
      { background: `${ac}08`, borderBottom: `1px solid ${ac}18` }
    );
    case "discord": return bar(
      <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 10px" }}><span style={{ color: sub, fontSize: 10 }}>#</span><span style={{ fontSize: 9, color: tx, fontWeight: 600 }}>{title || "general"}</span></div>,
      { background: `${tx}04`, borderBottom: `1px solid ${bd}` }
    );
    case "retro": return bar(
      <div style={{ padding: "2px 6px", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 8, color: bg, fontWeight: 700, fontFamily: "monospace" }}>{title || "BLOCK"}</span><span style={{ fontSize: 8, color: bg, fontFamily: "monospace" }}>[x]</span></div>,
      { background: ac }
    );
    case "photoshop": return bar(
      <div style={{ display: "flex", padding: "2px 8px" }}><span style={{ fontSize: 7, color: sub, flex: 1 }}>{title || "Layer"}</span><span style={{ fontSize: 7, color: sub }}>▾</span></div>,
      { background: `${tx}05`, borderBottom: `1px solid ${tx}0a` }
    );
    case "gameboy": return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 3 }}>
        <div style={{ flex: 1, borderRadius: 3, border: `1px solid ${sub}22`, padding: "8px 10px", overflow: "hidden" }}>{children}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 5, padding: "2px 0", flexShrink: 0 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: ac, opacity: .4 }} />
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: `${sub}33` }} />
        </div>
      </div>
    );
    case "diary": return (
      <div style={{ height: "100%", position: "relative" }}>
        <div style={{ position: "absolute", top: -3, left: 14, width: 32, height: 8, background: ac, opacity: .2, borderRadius: "0 0 3px 3px", transform: "rotate(-2deg)" }} />
        <div style={{ height: "100%", padding: "10px", background: `repeating-linear-gradient(transparent,transparent 20px,${bd} 20px,${bd} 21px)`, overflow: "hidden" }}>{children}</div>
      </div>
    );
    case "minihompi": return (
      <div style={{ height: "100%", position: "relative", padding: "10px 12px" }}>
        <div style={{ position: "absolute", top: -6, right: 8, padding: "1px 5px", borderRadius: 5, background: card, border: `1px solid ${bd}`, fontSize: 7, color: sub }}>♡ TODAY 1</div>
        {children}
      </div>
    );
    case "rpg": return (
      <div style={{ height: "100%", padding: "10px 12px", position: "relative" }}>
        {[{ top: -1, left: -1 }, { top: -1, right: -1 }, { bottom: -1, left: -1 }, { bottom: -1, right: -1 }].map((p, i) => (
          <div key={i} style={{ position: "absolute", ...p, width: 7, height: 7, border: `2px solid ${ac}`, borderRadius: 1 }} />
        ))}
        {children}
      </div>
    );
    case "kakao": return (
      <div style={{ height: "100%", padding: "10px 12px", position: "relative" }}>
        <div style={{ position: "absolute", bottom: -4, left: 14, width: 8, height: 8, background: card, transform: "rotate(45deg)", borderRight: `1px solid ${bd}`, borderBottom: `1px solid ${bd}` }} />
        {children}
      </div>
    );
    case "cyberpunk": return simple("10px 12px", { clipPath: "polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))" });
    case "glass": return simple("10px 12px", { backdropFilter: "blur(12px)" });
    case "postit": return (
      <div style={{ height: "100%", padding: "10px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, background: `linear-gradient(135deg,${bg} 50%,${tx}08 50%)` }} />
        {children}
      </div>
    );
    case "brutalist": return simple("10px 12px");
    case "pixel": return simple("8px 10px");
    case "film": return simple("8px 14px");
    case "letter": return (
      <div style={{ height: "100%", padding: "14px 12px 10px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: `repeating-linear-gradient(135deg,${ac}15 0,${ac}15 6px,transparent 6px,transparent 12px)`, pointerEvents: "none" }} />
        {children}
      </div>
    );
    case "magazine": return simple("10px 12px 10px 14px", { borderLeft: `3px solid ${ac}` });
    case "notion": return simple("10px 12px", { borderLeft: `2px solid ${bd}` });
    default: return simple("10px 12px");
  }
}

/* ═══ PARTICLES ═══ */
function Particles({ effect, count, color }) {
  const ref = useRef(null);
  const anim = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || !c.parentElement) return;
    const ctx = c.getContext("2d");
    c.width = c.parentElement.offsetWidth;
    c.height = c.parentElement.offsetHeight;
    const W = c.width, H = c.height;
    const pool = ({ stars: "✦✧★", hearts: "♡♥", snow: "❄❅", sparkle: "✨⚡" })[effect] || "✦✧★";
    const pts = Array.from({ length: count || 12 }, () => ({
      x: Math.random() * W, y: Math.random() * H, s: Math.random() * 7 + 5,
      dx: (Math.random() - .5) * .3, dy: (Math.random() - .5) * .3,
      o: Math.random() * .4 + .15, ch: pool[Math.floor(Math.random() * pool.length)], r: Math.random() * 360,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.dx; p.y += p.dy; p.r += .3;
        if (p.x < -8) p.x = W + 8; if (p.x > W + 8) p.x = -8;
        if (p.y < -8) p.y = H + 8; if (p.y > H + 8) p.y = -8;
        ctx.save(); ctx.globalAlpha = p.o; ctx.font = `${p.s}px serif`;
        ctx.fillStyle = color; ctx.textAlign = "center";
        ctx.translate(p.x, p.y); ctx.rotate(p.r * Math.PI / 180);
        ctx.fillText(p.ch, 0, 0); ctx.restore();
      }
      anim.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim.current);
  }, [effect, count, color]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} />;
}

/* ═══ MUSIC (separate for hooks) ═══ */
function MusicPlayer({ d, ac, t }) {
  const [p, setP] = useState(35);
  useEffect(() => { const iv = setInterval(() => setP(x => x >= 100 ? 0 : x + .1), 80); return () => clearInterval(iv); }, []);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ fontSize: 7, letterSpacing: 2, color: ac, marginBottom: 6 }}>♪ NOW PLAYING</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, background: `linear-gradient(135deg,${ac}44,${ac}18)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: `1px solid ${t.border}`, flexShrink: 0 }}>🎵</div>
        <div><div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{d.track}</div><div style={{ fontSize: 9, color: t.sub, marginTop: 1 }}>{d.artist}</div></div>
      </div>
      <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: t.border, overflow: "hidden" }}>
        <div style={{ width: `${p}%`, height: "100%", borderRadius: 2, background: ac, transition: "width .08s linear" }} />
      </div>
    </div>
  );
}

/* ═══ BLOCK CONTENT RENDERER ═══ */
function BlockContent({ type, v, d, t, st }) {
  const ac = st?.accent || t.accent;
  const av = (sz) => (
    <div style={{ width: sz, height: sz, borderRadius: "50%", background: `linear-gradient(135deg,${ac}44,${ac}11)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: sz * .35, border: `2px solid ${ac}22`, flexShrink: 0, color: t.text }}>
      {(d.name || "?")[0]?.toUpperCase()}
    </div>
  );

  if (type === "profile") {
    if (v === "center") return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 5, textAlign: "center" }}>{av(52)}<div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{d.name}</div><div style={{ fontSize: 10, color: t.sub, lineHeight: 1.4 }}>{d.bio}</div>{d.status && <div style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 8, background: t.border, fontSize: 8, color: t.sub }}><span>{d.emoji}</span>{d.status}</div>}</div>);
    if (v === "side") return (<div style={{ display: "flex", alignItems: "center", gap: 8, height: "100%" }}>{av(36)}<div><div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{d.name}</div><div style={{ fontSize: 9, color: t.sub }}>{d.bio}</div></div></div>);
    if (v === "card") return (<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 6, textAlign: "center" }}>{av(48)}<div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{d.name}</div><div style={{ fontSize: 9, color: t.sub }}>{d.bio}</div>{d.tags && <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>{d.tags.map((g, i) => <span key={i} style={{ padding: "2px 7px", borderRadius: 10, background: t.border, fontSize: 8, color: t.sub }}>{g}</span>)}</div>}</div>);
  }
  if (type === "char") {
    if (v === "oc") return (<div style={{ height: "100%", display: "flex", gap: 8, overflow: "auto" }}><div style={{ flexShrink: 0 }}>{av(64)}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{d.name}</div>{d.nameEn && <div style={{ fontSize: 9, color: t.sub }}>{d.nameEn}</div>}<div style={{ fontSize: 9, color: t.sub, marginTop: 3, lineHeight: 1.4 }}>{d.desc}</div><div style={{ marginTop: 5 }}>{(d.fields || []).map((f, i) => (<div key={i} style={{ display: "flex", gap: 5, fontSize: 9, marginBottom: 2 }}><span style={{ color: ac, fontWeight: 600, minWidth: 44 }}>{f.l}</span><span style={{ color: t.text }}>{f.v}</span></div>))}</div></div></div>);
    if (v === "couple") return (<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}><div style={{ textAlign: "center" }}>{av(44)}<div style={{ fontSize: 11, fontWeight: 600, color: t.text, marginTop: 3 }}>{d.c1?.name}</div></div><div style={{ fontSize: 22, color: ac }}>{d.rel || "♡"}</div><div style={{ textAlign: "center" }}>{av(44)}<div style={{ fontSize: 11, fontWeight: 600, color: t.text, marginTop: 3 }}>{d.c2?.name}</div></div></div>{d.relDesc && <div style={{ textAlign: "center", fontSize: 10, color: t.sub, fontStyle: "italic" }}>{d.relDesc}</div>}</div>);
    if (v === "stat") return (<div style={{ height: "100%", display: "flex", gap: 8, alignItems: "center" }}>{av(52)}<div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 5 }}>{d.name}</div>{(d.stats || []).map((s, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 3 }}><span style={{ fontSize: 8, color: ac, fontWeight: 600, width: 24, fontFamily: "monospace" }}>{s.l}</span><div style={{ flex: 1, height: 5, borderRadius: 3, background: t.border, overflow: "hidden" }}><div style={{ width: `${s.v}%`, height: "100%", borderRadius: 3, background: ac }} /></div><span style={{ fontSize: 7, color: t.sub, width: 18, textAlign: "right" }}>{s.v}</span></div>))}</div></div>);
    if (v === "dialogue") return (<div style={{ height: "100%", display: "flex", alignItems: "center" }}><div><div style={{ fontSize: 12, color: t.text, fontStyle: "italic", lineHeight: 1.5 }}>"{d.quote}"</div>{d.speaker && <div style={{ fontSize: 9, color: ac, marginTop: 3 }}>— {d.speaker}</div>}</div></div>);
    if (v === "relation") return (<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>{d.title && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: ac, marginBottom: 5 }}>{d.title}</div>}<div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>{(d.items || []).map((r, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10 }}><span style={{ color: t.text, fontWeight: 600 }}>{r.a}</span><span style={{ flex: 1, textAlign: "center", fontSize: 8, color: ac, borderBottom: `1px dashed ${ac}33` }}>{r.r}</span><span style={{ color: t.text, fontWeight: 600 }}>{r.b}</span></div>))}</div></div>);
    if (v === "world") return (<div style={{ height: "100%", overflow: "auto" }}>{d.title && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: ac, marginBottom: 5 }}>{d.title}</div>}<p style={{ margin: 0, fontSize: 10, lineHeight: 1.6, color: t.text, whiteSpace: "pre-wrap" }}>{d.content}</p></div>);
  }
  if (type === "story") {
    if (v === "msg") return (<div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 3, overflow: "auto" }}>{(d.msgs || []).map((m, i) => (<div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.me ? "flex-end" : "flex-start" }}>{!m.me && <span style={{ fontSize: 7, color: t.sub, marginBottom: 1, marginLeft: 2 }}>{m.s}</span>}<div style={{ maxWidth: "78%", padding: "5px 9px", borderRadius: m.me ? "10px 10px 3px 10px" : "10px 10px 10px 3px", background: m.me ? ac : `${t.text}10`, color: m.me ? "#fff" : t.text, fontSize: 10, lineHeight: 1.3 }}>{m.t}</div></div>))}</div>);
    if (v === "summary") return (<div style={{ height: "100%", overflow: "auto" }}>{d.title && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: ac, marginBottom: 6 }}>{d.title}</div>}{(d.ch || []).map((c, i) => (<div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: i === 0 ? ac : t.border }} />{i < (d.ch || []).length - 1 && <div style={{ width: 1, flex: 1, background: t.border }} />}</div><div><div style={{ fontSize: 10, fontWeight: 600, color: t.text }}>{c.t}</div><div style={{ fontSize: 9, color: t.sub }}>{c.d}</div></div></div>))}</div>);
    if (v === "letter") return (<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", fontStyle: "italic" }}><p style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: t.text, whiteSpace: "pre-wrap" }}>{d.content}</p>{d.from && <p style={{ margin: "6px 0 0", fontSize: 10, color: ac }}>{d.from}</p>}</div>);
    if (v === "timeline") return (<div style={{ height: "100%", overflow: "auto" }}>{d.title && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: ac, marginBottom: 6 }}>{d.title}</div>}{(d.ev || []).map((e, i) => (<div key={i} style={{ display: "flex", gap: 6, paddingLeft: 5, position: "relative", marginBottom: 5 }}><div style={{ position: "absolute", left: 0, top: 4, width: 5, height: 5, borderRadius: "50%", background: i === 0 ? ac : t.border }} /><div style={{ paddingLeft: 6, borderLeft: i < (d.ev || []).length - 1 ? `1px solid ${t.border}` : "none" }}><div style={{ fontSize: 8, fontWeight: 700, color: ac }}>{e.y}</div><div style={{ fontSize: 10, color: t.text, marginTop: 1 }}>{e.t}</div></div></div>))}</div>);
  }
  if (type === "text") {
    if (v === "quote") return (<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 10, position: "relative" }}><div style={{ position: "absolute", left: 0, top: "10%", bottom: "10%", width: 3, borderRadius: 2, background: ac }} /><p style={{ margin: 0, fontSize: 11, lineHeight: 1.6, color: t.text, fontStyle: "italic", whiteSpace: "pre-wrap" }}>{d.content}</p>{d.author && <p style={{ margin: "4px 0 0", fontSize: 9, color: t.sub }}>{d.author}</p>}</div>);
    if (v === "heading") return (<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{d.content}</div>{d.sub && <div style={{ fontSize: 10, color: t.sub, marginTop: 3 }}>{d.sub}</div>}</div>);
    if (v === "callout") return (<div style={{ height: "100%", display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18, flexShrink: 0 }}>{d.emoji || "💡"}</span><p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: t.text, whiteSpace: "pre-wrap" }}>{d.content}</p></div>);
    return (<div style={{ height: "100%", display: "flex", alignItems: "center" }}><p style={{ margin: 0, fontSize: 11, lineHeight: 1.6, color: t.sub, whiteSpace: "pre-wrap" }}>{d.content}</p></div>);
  }
  if (type === "links") {
    const lnks = d.links || [];
    if (v === "pills") return (<div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, flexWrap: "wrap" }}>{lnks.map((l, i) => <span key={i} style={{ padding: "5px 12px", borderRadius: 14, background: t.border, color: t.text, fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}><span>{l.i}</span>{l.l}</span>)}</div>);
    return (<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>{d.title && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: ac, marginBottom: 5 }}>{d.title}</div>}<div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, justifyContent: "center" }}>{lnks.map((l, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", borderRadius: 5, background: t.border, fontSize: 10 }}><span style={{ fontSize: 13 }}>{l.i}</span><span style={{ flex: 1, color: t.text }}>{l.l}</span><span style={{ opacity: .3, fontSize: 9 }}>→</span></div>)}</div></div>);
  }
  if (type === "image") {
    if (v === "gallery") return (<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, height: "100%" }}>{(d.imgs || []).map((img, i) => <div key={i} style={{ borderRadius: 4, background: t.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: t.sub }}>{i + 1}</div>)}</div>);
    return (<div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: t.border, borderRadius: 5, color: t.sub, fontSize: 9 }}>{d.caption || d.text || "이미지"}</div>);
  }
  if (type === "music") return <MusicPlayer d={d} ac={ac} t={t} />;
  if (type === "person") {
    if (v === "mbti") return (<div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}><span style={{ fontSize: 22 }}>{d.emoji}</span><div style={{ fontSize: 18, fontWeight: 800, color: ac, letterSpacing: 3 }}>{d.type}</div><div style={{ fontSize: 9, color: t.sub }}>{d.desc}</div></div>);
    if (v === "tags") return (<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>{d.title && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: ac, marginBottom: 6 }}>{d.title}</div>}<div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{(d.tags || []).map((g, i) => <span key={i} style={{ padding: "3px 9px", borderRadius: 10, background: t.border, fontSize: 9, color: t.text }}>{g}</span>)}</div></div>);
    if (v === "skills") return (<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>{d.title && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: ac, marginBottom: 6 }}>{d.title}</div>}{(d.skills || []).map((s, i) => (<div key={i} style={{ marginBottom: 4 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 2 }}><span style={{ color: t.text }}>{s.n}</span><span style={{ color: t.sub }}>{s.v}%</span></div><div style={{ height: 5, borderRadius: 3, background: t.border, overflow: "hidden" }}><div style={{ width: `${s.v}%`, height: "100%", borderRadius: 3, background: ac }} /></div></div>))}</div>);
    if (v === "fav") return (<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>{d.title && <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: ac, marginBottom: 5 }}>{d.title}</div>}<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(44px,1fr))", gap: 4, alignContent: "center", flex: 1 }}>{(d.items || []).map((it, i) => <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "5px 2px", borderRadius: 5, background: t.border }}><span style={{ fontSize: 14 }}>{it.e}</span><span style={{ fontSize: 7, color: t.sub }}>{it.l}</span></div>)}</div></div>);
    if (v === "now") return (<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 5 }}>{(d.items || []).map((it, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}><span style={{ fontSize: 13 }}>{it.e}</span><span style={{ color: t.sub, width: 44, fontSize: 8 }}>{it.l}</span><span style={{ color: t.text, fontWeight: 500 }}>{it.v}</span></div>)}</div>);
    if (v === "tmi") return (<div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>{(d.items || []).map((it, i) => <span key={i} style={{ padding: "3px 9px", borderRadius: 10, background: t.border, fontSize: 9, color: t.text }}>{it}</span>)}</div></div>);
    if (v === "qna") return (<div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>{(d.items || []).map((it, i) => <div key={i}><div style={{ fontSize: 9, color: ac, fontWeight: 600 }}>Q. {it.q}</div><div style={{ fontSize: 10, color: t.text, marginTop: 1, paddingLeft: 5 }}>A. {it.a}</div></div>)}</div>);
  }
  if (type === "deco") {
    if (v === "spacer") return <div />;
    const m = { stars: "✦ ✦ ✦ ✦ ✦", dots: "· · · · · · ·", hearts: "♡ ♡ ♡ ♡ ♡" };
    if (m[d.style]) return <div style={{ textAlign: "center", color: d.style === "hearts" ? ac : t.sub, letterSpacing: 5, fontSize: 8, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>{m[d.style]}</div>;
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}><div style={{ width: "80%", height: 1, background: t.border }} /></div>;
  }
  return null;
}

/* ═══ BLOCK CATALOG ═══ */
const CAT = [
  { key: "profile", label: "👤 프로필", items: [
    { type: "profile", v: "center", label: "중앙형", w: 5, h: 4, d: { name: "Name", bio: "소개 ✦", img: "", emoji: "✨", status: "Online" } },
    { type: "profile", v: "side", label: "좌측형", w: 5, h: 2, d: { name: "Name", bio: "소개", img: "" } },
    { type: "profile", v: "card", label: "카드형", w: 4, h: 4, d: { name: "Name", bio: "소개", img: "", tags: ["Tag1", "Tag2"] } },
  ] },
  { key: "char", label: "🎭 캐릭터", items: [
    { type: "char", v: "oc", label: "자캐", w: 6, h: 5, d: { name: "캐릭터", nameEn: "OC", desc: "설명", img: "", fields: [{ l: "키", v: "170cm" }, { l: "생일", v: "1/1" }] } },
    { type: "char", v: "couple", label: "자컾", w: 8, h: 4, d: { c1: { name: "A", img: "" }, c2: { name: "B", img: "" }, rel: "♡", relDesc: "서로를 지키는 사이" } },
    { type: "char", v: "stat", label: "스탯", w: 5, h: 4, d: { name: "OC", img: "", stats: [{ l: "STR", v: 70 }, { l: "INT", v: 85 }, { l: "DEX", v: 60 }, { l: "CHA", v: 90 }] } },
    { type: "char", v: "dialogue", label: "대사", w: 6, h: 2, d: { quote: "가장 중요한 건 네가 웃는 거야.", speaker: "OC" } },
    { type: "char", v: "relation", label: "관계도", w: 6, h: 3, d: { title: "관계도", items: [{ a: "A", b: "B", r: "연인 ♡" }] } },
    { type: "char", v: "world", label: "세계관", w: 6, h: 3, d: { title: "세계관", content: "이야기의 배경..." } },
  ] },
  { key: "story", label: "📖 서사", items: [
    { type: "story", v: "msg", label: "메신저", w: 5, h: 4, d: { msgs: [{ s: "A", t: "오늘 만나!", me: false }, { s: "나", t: "좋아 ☕", me: true }] } },
    { type: "story", v: "summary", label: "서사 요약", w: 6, h: 4, d: { title: "STORY", ch: [{ t: "프롤로그", d: "시작" }, { t: "Ch.1", d: "만남" }] } },
    { type: "story", v: "letter", label: "편지", w: 5, h: 3, d: { content: "너에게 전하고 싶은 이야기...", from: "— 보내는 이" } },
    { type: "story", v: "timeline", label: "타임라인", w: 5, h: 4, d: { title: "TIMELINE", ev: [{ y: "Year 1", t: "시작" }, { y: "Year 3", t: "전환" }] } },
  ] },
  { key: "text", label: "📝 텍스트", items: [
    { type: "text", v: "plain", label: "기본", w: 6, h: 2, d: { content: "자유 텍스트" } },
    { type: "text", v: "quote", label: "인용문", w: 6, h: 2, d: { content: "명언", author: "— 출처" } },
    { type: "text", v: "heading", label: "큰 제목", w: 6, h: 2, d: { content: "TITLE", sub: "부제목" } },
    { type: "text", v: "callout", label: "강조", w: 6, h: 2, d: { emoji: "💡", content: "강조 내용" } },
  ] },
  { key: "links", label: "🔗 링크", items: [
    { type: "links", v: "list", label: "리스트", w: 4, h: 4, d: { title: "LINKS", links: [{ i: "🐦", l: "Twitter", u: "#" }, { i: "📸", l: "IG", u: "#" }] } },
    { type: "links", v: "pills", label: "버튼", w: 6, h: 2, d: { links: [{ i: "🐦", l: "TW", u: "#" }, { i: "📸", l: "IG", u: "#" }] } },
  ] },
  { key: "image", label: "🖼️ 이미지", items: [
    { type: "image", v: "single", label: "단일", w: 4, h: 4, d: { url: "", caption: "" } },
    { type: "image", v: "gallery", label: "갤러리", w: 6, h: 4, d: { imgs: [{ u: "" }, { u: "" }, { u: "" }, { u: "" }] } },
  ] },
  { key: "music", label: "🎵 음악", items: [
    { type: "music", v: "player", label: "플레이어", w: 5, h: 2, d: { track: "Song", artist: "Artist" } },
  ] },
  { key: "person", label: "🌟 개성", items: [
    { type: "person", v: "mbti", label: "MBTI", w: 3, h: 2, d: { type: "INFP", desc: "중재자", emoji: "🌸" } },
    { type: "person", v: "tags", label: "관심사", w: 6, h: 2, d: { title: "INTERESTS", tags: ["디자인", "코딩", "음악"] } },
    { type: "person", v: "skills", label: "스킬", w: 5, h: 3, d: { title: "SKILLS", skills: [{ n: "Design", v: 85 }, { n: "Code", v: 70 }] } },
    { type: "person", v: "fav", label: "최애", w: 4, h: 3, d: { title: "FAVORITES", items: [{ e: "🎮", l: "젤다" }, { e: "📚", l: "데미안" }] } },
    { type: "person", v: "now", label: "지금", w: 4, h: 2, d: { items: [{ e: "📖", l: "읽는 중", v: "어린 왕자" }] } },
    { type: "person", v: "tmi", label: "TMI", w: 5, h: 2, d: { items: ["고양이 집사 🐱", "밤형 인간 🌙"] } },
    { type: "person", v: "qna", label: "Q&A", w: 5, h: 3, d: { items: [{ q: "좋아하는 색?", a: "보라색 💜" }] } },
  ] },
  { key: "deco", label: "✨ 장식", items: [
    { type: "deco", v: "divider", label: "구분선", w: 6, h: 1, d: { style: "stars" } },
    { type: "deco", v: "spacer", label: "여백", w: 12, h: 1, d: {} },
  ] },
];

const DEFAULT_BLOCKS = [
  { id: "1", type: "profile", v: "center", col: 4, row: 1, w: 5, h: 4, d: { name: "Your Name", bio: "소개를 입력하세요 ✦", img: "", emoji: "✨", status: "Online" }, st: {} },
  { id: "2", type: "char", v: "oc", col: 1, row: 1, w: 3, h: 5, d: { name: "OC", nameEn: "Character", desc: "캐릭터 설명", img: "", fields: [{ l: "키", v: "170cm" }, { l: "생일", v: "1/1" }] }, st: {} },
  { id: "3", type: "links", v: "list", col: 9, row: 1, w: 4, h: 4, d: { title: "LINKS", links: [{ i: "🐦", l: "Twitter", u: "#" }, { i: "📸", l: "Instagram", u: "#" }, { i: "💻", l: "GitHub", u: "#" }] }, st: {} },
  { id: "4", type: "story", v: "msg", col: 4, row: 5, w: 5, h: 3, d: { msgs: [{ s: "A", t: "오늘 만나!", me: false }, { s: "나", t: "좋아 ☕", me: true }, { s: "A", t: "기대돼 :)", me: false }] }, st: {} },
  { id: "5", type: "person", v: "mbti", col: 9, row: 5, w: 4, h: 2, d: { type: "INFP", desc: "중재자", emoji: "🌸" }, st: {} },
  { id: "6", type: "music", v: "player", col: 1, row: 6, w: 3, h: 2, d: { track: "Favorite Song", artist: "Artist Name" }, st: {} },
  { id: "7", type: "person", v: "fav", col: 9, row: 7, w: 4, h: 2, d: { title: "FAVORITES", items: [{ e: "🎮", l: "젤다" }, { e: "📚", l: "데미안" }, { e: "🎬", l: "인터스텔라" }] }, st: {} },
];

/* ═══ LOGIN SCREEN ═══ */
function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [dn, setDn] = useState("");
  const [err, setErr] = useState("");

  const go = () => {
    if (!u.trim() || !p.trim()) { setErr("모든 필드를 입력해주세요"); return; }
    if (mode === "register") {
      if (!dn.trim()) { setErr("표시 이름을 입력해주세요"); return; }
      if (S.get(`u:${u}`)) { setErr("이미 존재하는 사용자명"); return; }
      S.set(`u:${u}`, JSON.stringify({ pw: p, dn: dn.trim() }));
      S.set(`p:${u}`, JSON.stringify({ blocks: DEFAULT_BLOCKS.map(b => ({ ...b, id: uid() })), settings: { layout: "macos", colors: PRESETS[0] } }));
      S.set("sess", u);
      onLogin(u, dn.trim());
    } else {
      const raw = S.get(`u:${u}`);
      if (!raw) { setErr("존재하지 않는 계정"); return; }
      const ud = JSON.parse(raw.value);
      if (ud.pw !== p) { setErr("비밀번호 불일치"); return; }
      S.set("sess", u);
      onLogin(u, ud.dn);
    }
  };

  const t = { bg: "#0e0e12", text: "#e4e4ec", sub: "#6e6e82", accent: "#a78bfa", card: "#1a1a23", border: "#ffffff10" };
  const I = { width: "100%", padding: "10px 12px", fontSize: 12, color: t.text, background: t.card, border: `1px solid ${t.border}`, borderRadius: 6, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit','Pretendard',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');*{box-sizing:border-box;margin:0;padding:0}input:focus{border-color:${t.accent}!important;outline:none}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ width: 340, padding: "40px 28px", background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, animation: "fadeIn .5s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: t.text }}>MY<span style={{ color: t.accent }}>PAGE</span></div>
          <div style={{ fontSize: 10, color: t.sub, marginTop: 4 }}>나만의 페이지를 만들어보세요</div>
        </div>
        <div style={{ display: "flex", marginBottom: 16, borderRadius: 6, overflow: "hidden", border: `1px solid ${t.border}` }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{ flex: 1, padding: "8px", fontSize: 10, fontWeight: mode === m ? 700 : 400, color: mode === m ? t.accent : t.sub, background: mode === m ? `${t.accent}22` : "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input style={I} placeholder="사용자명 (영문)" value={u} onChange={e => setU(e.target.value.toLowerCase())} />
          {mode === "register" && <input style={I} placeholder="표시 이름" value={dn} onChange={e => setDn(e.target.value)} />}
          <input style={I} type="password" placeholder="비밀번호" value={p} onChange={e => setP(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} />
          {err && <div style={{ fontSize: 10, color: "#f06060" }}>{err}</div>}
          <button onClick={go} style={{ marginTop: 4, padding: "10px", fontSize: 12, fontWeight: 700, color: "#fff", background: t.accent, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>
            {mode === "login" ? "로그인" : "가입하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══ MAIN APP ═══ */
export default function App() {
  const [user, setUser] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [layout, setLayout] = useState("macos");
  const [colors, setColors] = useState(PRESETS[0]);
  const [editing, setEditing] = useState(false);
  const [selId, setSelId] = useState(null);
  const [ready, setReady] = useState(false);

  // menus
  const [showAdd, setShowAdd] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [openG, setOpenG] = useState(null);
  const [tab, setTab] = useState("layout");

  // drag
  const gridRef = useRef(null);
  const drag = useRef(null);
  const [ghost, setGhost] = useState(null);

  // Auto-login
  useEffect(() => {
    const sess = S.get("sess");
    if (sess) {
      const raw = S.get(`u:${sess.value}`);
      if (raw) {
        const ud = JSON.parse(raw.value);
        setUser({ username: sess.value, displayName: ud.dn });
        const page = S.get(`p:${sess.value}`);
        if (page) {
          const pg = JSON.parse(page.value);
          setBlocks(pg.blocks || []);
          setLayout(pg.settings?.layout || "macos");
          if (pg.settings?.colors) setColors(pg.settings.colors);
        }
      }
    }
    setReady(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!user || !ready) return;
    const timer = setTimeout(() => {
      S.set(`p:${user.username}`, JSON.stringify({ blocks, settings: { layout, colors } }));
    }, 500);
    return () => clearTimeout(timer);
  }, [blocks, layout, colors, user, ready]);

  const handleLogin = (username, displayName) => {
    setUser({ username, displayName });
    const page = S.get(`p:${username}`);
    if (page) {
      const pg = JSON.parse(page.value);
      setBlocks(pg.blocks || []);
      setLayout(pg.settings?.layout || "macos");
      if (pg.settings?.colors) setColors(pg.settings.colors);
    }
  };

  const handleLogout = () => {
    S.del("sess");
    setUser(null); setBlocks([]); setEditing(false); setSelId(null);
  };

  if (!ready) return null;
  if (!user) return <Auth onLogin={handleLogin} />;

  const t = { ...colors, glow: `${colors.accent}40`, grid: `${colors.text}08`, surface: colors.card, bgSolid: colors.bg };

  // Grid drag logic
  const getCell = () => {
    if (!gridRef.current) return { cw: 80 };
    const r = gridRef.current.getBoundingClientRect();
    return { cw: (r.width - GAP * (COLS - 1)) / COLS };
  };

  const onDown = (e, id, mode) => {
    if (!editing) return; e.preventDefault(); e.stopPropagation();
    const b = blocks.find(x => x.id === id); if (!b) return;
    setSelId(id);
    drag.current = { id, mode, sx: e.clientX, sy: e.clientY, oc: b.col, or: b.row, ow: b.w, oh: b.h };
    setGhost({ col: b.col, row: b.row, w: b.w, h: b.h });

    const move = (ev) => {
      const d = drag.current; if (!d) return;
      const { cw } = getCell(); const sx = cw + GAP, sy = CELL + GAP;
      if (d.mode === "move") setGhost({ col: clamp(d.oc + Math.round((ev.clientX - d.sx) / sx), 1, COLS - d.ow + 1), row: clamp(d.or + Math.round((ev.clientY - d.sy) / sy), 1, ROWS - d.oh + 1), w: d.ow, h: d.oh });
      else setGhost({ col: d.oc, row: d.or, w: clamp(d.ow + Math.round((ev.clientX - d.sx) / sx), 1, COLS - d.oc + 1), h: clamp(d.oh + Math.round((ev.clientY - d.sy) / sy), 1, ROWS - d.or + 1) });
    };
    const up = () => {
      if (drag.current && ghost) setBlocks(p => p.map(b => b.id === drag.current.id ? { ...b, col: ghost.col, row: ghost.row, w: ghost.w, h: ghost.h } : b));
      drag.current = null; setGhost(null);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const addBlock = (cat) => {
    const mr = blocks.reduce((mx, b) => Math.max(mx, b.row + b.h), 1);
    setBlocks(p => [...p, { id: uid(), type: cat.type, v: cat.v, col: 1, row: clamp(mr, 1, ROWS), w: cat.w, h: cat.h, d: JSON.parse(JSON.stringify(cat.d)), st: {} }]);
    setShowAdd(false); setOpenG(null);
  };

  const btn = (a) => ({ padding: "5px 11px", fontSize: 10, fontWeight: 600, color: a ? "#fff" : t.text, background: a ? t.accent : t.card, border: `1px solid ${a ? t.accent : t.border}`, borderRadius: 5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 3 });
  const borderFor = (isSel) => {
    if (layout === "brutalist") return { border: `3px solid ${t.text}`, boxShadow: `3px 3px 0 ${t.text}`, borderRadius: 0 };
    if (layout === "pixel") return { border: `3px solid ${t.accent}`, borderRadius: 0 };
    if (layout === "retro") return { border: `2px solid ${t.accent}`, borderRadius: 0 };
    return isSel && editing ? { border: `2px solid ${t.accent}`, borderRadius: 10 } : { border: `1px solid ${t.border}`, borderRadius: 10 };
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Outfit','Pretendard',sans-serif", color: t.text, transition: "background .4s" }}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${t.accent}33;border-radius:3px}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
input:focus,select:focus{border-color:${t.accent}!important;outline:none}
      `}</style>

      {/* TOOLBAR */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: t.bg, borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: t.text, marginRight: 3 }}>MY<span style={{ color: t.accent }}>PAGE</span></div>
        <div style={{ fontSize: 8, color: t.sub, marginRight: "auto" }}>@{user.username}</div>
        <button onClick={() => { setEditing(!editing); setShowAdd(false); setShowTheme(false); }} style={btn(editing)}>{editing ? "✓ 완료" : "✏️ 편집"}</button>

        {editing && (
          <>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowAdd(!showAdd); setShowTheme(false); }} style={btn(false)}>+ 블록</button>
              {showAdd && (
                <div style={{ position: "absolute", top: "calc(100% + 3px)", left: 0, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, padding: 5, zIndex: 200, width: 220, maxHeight: 360, overflowY: "auto", boxShadow: `0 10px 30px rgba(0,0,0,.5)` }}>
                  {openG === null ? CAT.map(g => (
                    <button key={g.key} onClick={() => setOpenG(g.key)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "7px 9px", fontSize: 10, color: t.text, background: "transparent", border: "none", borderRadius: 5, cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={(e) => e.currentTarget.style.background = t.border} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <span>{g.label}</span><span style={{ fontSize: 8, color: t.sub }}>{g.items.length}종→</span>
                    </button>
                  )) : (
                    <>
                      <button onClick={() => setOpenG(null)} style={{ width: "100%", padding: "5px 9px", fontSize: 9, color: t.accent, background: "transparent", border: "none", borderRadius: 5, cursor: "pointer", fontFamily: "inherit", textAlign: "left", marginBottom: 2 }}>← 뒤로</button>
                      {CAT.find(g => g.key === openG)?.items.map(cat => (
                        <button key={cat.type + cat.v} onClick={() => addBlock(cat)} style={{ display: "flex", width: "100%", padding: "6px 9px", fontSize: 10, color: t.text, background: "transparent", border: "none", borderRadius: 5, cursor: "pointer", fontFamily: "inherit" }} onMouseEnter={(e) => e.currentTarget.style.background = t.border} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                          <span style={{ flex: 1 }}>{cat.label}</span><span style={{ fontSize: 7, color: t.sub }}>{cat.w}×{cat.h}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <button onClick={() => { setShowTheme(!showTheme); setShowAdd(false); }} style={btn(false)}>🎨 스타일</button>
              {showTheme && (
                <div style={{ position: "absolute", top: "calc(100% + 3px)", right: 0, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, padding: 6, zIndex: 200, width: 240, maxHeight: 400, overflowY: "auto", boxShadow: `0 10px 30px rgba(0,0,0,.5)` }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                    {[["layout", "레이아웃"], ["color", "색상"]].map(([k, l]) => (
                      <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: 4, fontSize: 9, fontWeight: tab === k ? 700 : 400, color: tab === k ? t.accent : t.sub, background: tab === k ? `${t.accent}22` : "transparent", border: `1px solid ${tab === k ? t.accent : t.border}`, borderRadius: 4, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
                    ))}
                  </div>
                  {tab === "layout" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                      {Object.entries(LAYOUTS).map(([k, n]) => (
                        <button key={k} onClick={() => setLayout(k)} style={{ padding: "6px 3px", fontSize: 8, color: t.text, background: layout === k ? `${t.accent}22` : "transparent", border: layout === k ? `2px solid ${t.accent}` : `1px solid ${t.border}`, borderRadius: 4, cursor: "pointer", fontFamily: "inherit", fontWeight: layout === k ? 700 : 400 }}>{n}</button>
                      ))}
                    </div>
                  )}
                  {tab === "color" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        {PRESETS.map((cp, i) => (
                          <button key={i} onClick={() => setColors(cp)} style={{ display: "flex", alignItems: "center", gap: 3, padding: "5px 7px", fontSize: 8, color: cp.text, background: cp.bg, border: `1px solid ${cp.border}`, borderRadius: 5, cursor: "pointer", fontFamily: "inherit" }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: cp.accent }} />{cp.n}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontSize: 8, color: t.sub, marginTop: 3 }}>커스텀</div>
                      {[["배경", "bg"], ["텍스트", "text"], ["보조", "sub"], ["강조", "accent"], ["카드", "card"]].map(([l, k]) => (
                        <div key={k} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <span style={{ fontSize: 8, color: t.sub, width: 28 }}>{l}</span>
                          <input type="color" value={colors[k]?.startsWith("#") ? colors[k] : "#333333"} onChange={(e) => setColors({ ...colors, [k]: e.target.value })} style={{ width: 20, height: 16, borderRadius: 3, border: `1px solid ${t.border}`, cursor: "pointer", padding: 0 }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        <button onClick={handleLogout} style={{ ...btn(false), marginLeft: 2 }}>로그아웃</button>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "20px 20px 60px", animation: "fadeIn .5s ease" }} onClick={() => { if (editing) setSelId(null); }}>
        {editing && <div style={{ marginBottom: 10, padding: "6px 10px", borderRadius: 5, background: `${t.accent}15`, border: `1px solid ${t.accent}25`, fontSize: 9, color: t.accent }}>💡 드래그=이동 · 우하단=크기조절 · 블록 클릭 후 ✕로 삭제</div>}

        <div ref={gridRef} style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(${COLS},1fr)`, gridAutoRows: CELL, gap: GAP, width: "100%", minHeight: ROWS * (CELL + GAP) }}>
          {editing && Array.from({ length: COLS * ROWS }).map((_, i) => (
            <div key={`g${i}`} style={{ gridColumn: (i % COLS) + 1, gridRow: Math.floor(i / COLS) + 1, borderRadius: 2, border: `1px dashed ${t.grid}`, pointerEvents: "none" }} />
          ))}
          {editing && ghost && <div style={{ gridColumn: `${ghost.col}/span ${ghost.w}`, gridRow: `${ghost.row}/span ${ghost.h}`, borderRadius: 8, border: `2px dashed ${t.accent}`, background: `${t.accent}12`, pointerEvents: "none", zIndex: 5 }} />}
          {blocks.map((block) => {
            const isSel = selId === block.id;
            const isDrag = drag.current?.id === block.id;
            const st = block.st || {};
            return (
              <div key={block.id} style={{
                gridColumn: `${block.col}/span ${block.w}`, gridRow: `${block.row}/span ${block.h}`,
                background: t.card, position: "relative", zIndex: isDrag ? 10 : 2,
                opacity: isDrag ? .4 : 1, cursor: editing ? "grab" : "default",
                transition: isDrag ? "none" : "all .2s", overflow: "hidden",
                boxShadow: isSel && editing ? `0 4px 16px ${t.accent}30` : "none",
                ...borderFor(isSel),
              }} onMouseDown={(e) => editing && onDown(e, block.id, "move")}>
                {st.particle && <Particles effect={st.particle} count={st.particleCnt || 12} color={st.accent || t.accent} />}
                <div style={{ position: "relative", zIndex: 2, height: "100%" }}>
                  <LayoutWrap layout={layout} t={{ ...t, accent: st.accent || t.accent }} title={block.d?.name || block.d?.title || block.type}>
                    <BlockContent type={block.type} v={block.v} d={block.d} t={{ ...t, accent: st.accent || t.accent }} st={st} />
                  </LayoutWrap>
                </div>
                {editing && isSel && (
                  <>
                    <div onMouseDown={(e) => onDown(e, block.id, "resize")} style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, cursor: "nwse-resize", zIndex: 20, background: `${t.accent}44`, borderRadius: "5px 0 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="7" height="7" viewBox="0 0 10 10"><path d="M9 1L1 9M9 5L5 9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setBlocks(p => p.filter(b => b.id !== block.id)); setSelId(null); }} style={{ position: "absolute", top: 2, right: 3, background: "rgba(220,50,50,.85)", color: "#fff", border: "none", borderRadius: 3, width: 16, height: 16, fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>✕</button>
                  </>
                )}
              </div>
            );
          })}
        </div>
        {!editing && <div style={{ textAlign: "center", marginTop: 28, fontSize: 7, color: t.sub, letterSpacing: 2 }}>@{user.username} · MADE WITH ♡</div>}
      </div>
    </div>
  );
}
