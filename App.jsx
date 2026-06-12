import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Flame, ChevronRight, Star, X, Check } from 'lucide-react';

/* ============= GLOBAL STYLES — Apple motion system ============= */
const GLOBAL_CSS = `
  @keyframes xt-fade-up {
    from { opacity:0; transform:translateY(18px) scale(0.98); }
    to   { opacity:1; transform:translateY(0)    scale(1);    }
  }
  @keyframes xt-slide-in-right {
    from { opacity:0; transform:translateX(28px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes xt-slide-in-left {
    from { opacity:0; transform:translateX(-28px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes xt-scale-in {
    from { opacity:0; transform:scale(0.94); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes xt-check-in {
    0%   { transform: scale(0) rotate(-20deg); opacity:0; }
    60%  { transform: scale(1.3) rotate(5deg);  opacity:1; }
    100% { transform: scale(1)   rotate(0deg);  opacity:1; }
  }
  @keyframes xt-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes xt-breathe {
    0%,100% { opacity:1; }
    50%      { opacity:0.45; }
  }
  @keyframes xt-pop {
    0%   { transform: scale(1); }
    35%  { transform: scale(0.91); }
    65%  { transform: scale(1.06); }
    100% { transform: scale(1); }
  }

  .xt-page { animation: xt-fade-up 0.36s cubic-bezier(0.34,1.18,0.64,1) both; }

  .xt-card {
    animation: xt-scale-in 0.30s cubic-bezier(0.25,0.46,0.45,0.94) both;
    transition: transform 0.20s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.20s ease;
    will-change: transform;
  }

  .xt-btn {
    transition: transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94), background 0.18s ease, color 0.18s ease;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    will-change: transform;
  }
  .xt-btn.xt-pressing { transform: scale(0.93) !important; }

  .xt-check {
    transition: background 0.16s ease, border-color 0.16s ease, transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .xt-check.xt-pressing { transform: scale(0.88) !important; }
  .xt-check-icon { animation: xt-check-in 0.26s cubic-bezier(0.34,1.3,0.64,1) both; }

  .xt-row {
    transition: background 0.16s ease, border-color 0.16s ease, transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94);
    -webkit-tap-highlight-color: transparent;
    will-change: transform;
  }
  .xt-row.xt-pressing { transform: scale(0.990) !important; }

  .xt-seg-pill {
    transition: background 0.22s cubic-bezier(0.25,0.46,0.45,0.94), color 0.18s ease, transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .xt-seg-pill.xt-pressing { transform: scale(0.92) !important; }

  .xt-tab-btn {
    transition: background 0.22s cubic-bezier(0.25,0.46,0.45,0.94);
    -webkit-tap-highlight-color: transparent;
    will-change: transform;
  }
  .xt-tab-icon {
    transition: transform 0.22s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .xt-tab-btn.xt-pressing .xt-tab-icon { transform: scale(0.86) !important; }

  .xt-live-dot { animation: xt-breathe 2.2s ease-in-out infinite; }

  @keyframes xt-open-glow {
    0%,100% { box-shadow: 0 0 0 1px rgba(255,182,39,0.25), 0 0 8px rgba(255,182,39,0.12); }
    50%      { box-shadow: 0 0 0 1.5px rgba(255,182,39,0.55), 0 0 18px rgba(255,182,39,0.28); }
  }
  .xt-open-trade { animation: xt-open-glow 2.4s ease-in-out infinite; }

  /* Animazione orb AI */
  @keyframes xt-orb-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  /* Respiro continuo — fluido, con leggera rotazione e fluttuazione */
  @keyframes xt-orb-breathe {
    0%   { transform: scale(0.94) rotate(-2deg) translateY(0px); }
    25%  { transform: scale(1.08) rotate(1deg) translateY(-1.5px); }
    50%  { transform: scale(1.13) rotate(3deg) translateY(-2px); }
    75%  { transform: scale(1.06) rotate(1deg) translateY(-0.8px); }
    100% { transform: scale(0.94) rotate(-2deg) translateY(0px); }
  }
  /* Stato "thinking" */
  @keyframes xt-orb-think-expand {
    0%, 100% { transform: scale(1.05); }
    25%      { transform: scale(1.32); }
    55%      { transform: scale(1.18); }
    80%      { transform: scale(1.28); }
  }
  /* Press: espansione veloce e netta (al tap) */
  @keyframes xt-orb-press {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.32); }
    100% { transform: scale(1.06); }
  }

  /* Base SEMPRE attiva: rotazione + respiro */
  .xt-orb-animated {
    animation: xt-orb-spin 22s linear infinite, xt-orb-breathe 4.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  }
  .xt-orb-glow {}
  /* Quando l'AI sta "pensando" */
  .xt-orb-thinking .xt-orb-animated {
    animation: xt-orb-spin 5s linear infinite, xt-orb-think-expand 0.85s ease-in-out infinite !important;
  }
  .xt-orb-thinking {}
  /* Quando l'utente tocca il tab AI — pop espansivo */
  .xt-tab-btn.xt-pressing .xt-orb-animated {
    animation: xt-orb-spin 22s linear infinite, xt-orb-press 0.5s cubic-bezier(0.34, 1.7, 0.64, 1) !important;
  }

  @keyframes xt-cal-open-pulse {
    0%,100% { box-shadow: 0 0 0 1px rgba(255,182,39,0.30), 0 0 6px rgba(255,182,39,0.15); }
    50%      { box-shadow: 0 0 0 2px rgba(255,182,39,0.60), 0 0 14px rgba(255,182,39,0.30); }
  }
  .xt-cal-open { animation: xt-cal-open-pulse 2.2s ease-in-out infinite; }

  .xt-shimmer-overlay {
    background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.055) 50%, transparent 75%);
    background-size: 200% 100%;
    animation: xt-shimmer 4s linear infinite;
    pointer-events: none;
    border-radius: inherit;
  }

  .xt-stagger-1  { animation-delay: 0.04s; }
  .xt-stagger-2  { animation-delay: 0.08s; }
  .xt-stagger-3  { animation-delay: 0.12s; }
  .xt-stagger-4  { animation-delay: 0.16s; }
  .xt-stagger-5  { animation-delay: 0.20s; }
  .xt-stagger-6  { animation-delay: 0.24s; }
  .xt-stagger-7  { animation-delay: 0.28s; }

  * { -webkit-tap-highlight-color: transparent; }

  /* ── iOS Switch spring ── */
  .xt-switch-thumb {
    transition: left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
                transform 0.16s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .xt-switch-pressing .xt-switch-thumb { transform: scaleX(1.22) !important; }
  .xt-switch-track {
    transition: background 0.22s ease;
  }

  /* ── Star rating press ── */
  .xt-star {
    transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1), opacity 0.12s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .xt-star:active { transform: scale(0.80) !important; }

  /* ── Confluence chip press ── */
  .xt-chip {
    transition: transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94),
                background 0.16s ease, opacity 0.12s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .xt-chip.xt-pressing { transform: scale(0.88) !important; }

  /* ── Calendar cell press ── */
  .xt-cal-cell {
    transition: transform 0.18s cubic-bezier(0.25,0.46,0.45,0.94),
                background 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .xt-cal-cell.xt-pressing { transform: scale(0.90) !important; }

  /* ── Profondità: ombra dinamica su press ── */
  .xt-btn.xt-pressing { transform: scale(0.93) !important; box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important; }
  .xt-seg-pill.xt-pressing { transform: scale(0.90) !important; }
`;

/* ============= HAPTIC ENGINE =============
   Apple Taptic Engine simulation per web.
   iOS Safari: AudioContext click (22μs burst).
   Android: navigator.vibrate con pattern calibrati.
   Desktop: silenzioso (solo feedback visivo).
   ---------------------------------------- */


const _vibe = (pattern) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch(_) {}
  }
};



// Tipi Apple Taptic Engine → web
const haptic = {
  // Selezione — picker scroll, tab switch, star hover
  selection: () => {
    _vibe(2);
  },
  // Light impact — checkbox, chip tag
  light: () => {
    _vibe(4);
  },
  // Medium impact — toggle switch, button confirm
  medium: () => {
    _vibe(7);
  },
  // Heavy impact — destructive, important nav
  heavy: () => {
    _vibe(12);
  },
  // Rigid — toggle ON (snap netto)
  rigid: () => {
    _vibe([5, 0, 5]);
  },
  // Soft — toggle OFF (rilascio morbido)
  soft: () => {
    _vibe(3);
  },
  // Success — conferma operazione
  success: () => {
    _vibe([5, 60, 9]);
    setTimeout(()=>_audioClick(1100, 0.007, 0.16), 0);
    setTimeout(()=>_audioClick(1400, 0.006, 0.20), 65);
  },
  // Warning — attenzione
  warning: () => {
    _vibe([8, 50, 6, 50, 4]);
  },
  // Error
  error: () => {
    _vibe([10, 40, 10, 40, 14]);
  },
};



function injectGlobalCSS() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('xt-styles')) return;
  const s = document.createElement('style');
  s.id = 'xt-styles';
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

/* ============= SCROLL-AWARE PRESS MANAGER + HAPTIC =============
   Gestisce .xt-pressing + haptic automatico per ogni classe.
   ─────────────────────────────────────────────────────────── */
const DRAG_THRESHOLD = 8;

// Mappa classe → tipo haptic
const HAPTIC_MAP = {
  'xt-tab-btn':  'selection',   // tab bar
  'xt-seg-pill': 'selection',   // segmented control
  'xt-check':    'light',       // checkbox
  'xt-chip':     'light',       // confluence chip
  'xt-cal-cell': 'light',       // calendario giorno
  'xt-btn':      'medium',      // bottoni generici
  'xt-row':      'light',       // trade row expand
  'xt-star':     'selection',   // stelle confidence
};

function injectPressManager() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('xt-press-manager')) return;
  const marker = document.createElement('div');
  marker.id = 'xt-press-manager';
  document.body.appendChild(marker);

  let target = null;
  let startX = 0;
  let startY = 0;
  let moved  = false;
  const SELECTORS = '.xt-btn, .xt-check, .xt-row, .xt-seg-pill, .xt-tab-btn, .xt-chip, .xt-cal-cell, .xt-star';

  document.addEventListener('touchstart', (e) => {
    const el = e.target.closest(SELECTORS);
    if (!el) return;
    target  = el;
    startX  = e.touches[0].clientX;
    startY  = e.touches[0].clientY;
    moved   = false;
    target._pressTimer = setTimeout(() => {
      if (!moved && target) {
        target.classList.add('xt-pressing');
        // Haptic automatico al press — identifica tipo dal className
        const type = Object.keys(HAPTIC_MAP).find(cls => target.classList.contains(cls));
        if (type && haptic[HAPTIC_MAP[type]]) haptic[HAPTIC_MAP[type]]();
      }
    }, 12);
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!target) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      moved = true;
      clearTimeout(target._pressTimer);
      target.classList.remove('xt-pressing');
    }
  }, { passive: true });

  const release = () => {
    if (!target) return;
    clearTimeout(target._pressTimer);
    target.classList.remove('xt-pressing');
    target = null;
  };
  document.addEventListener('touchend',    release, { passive: true });
  document.addEventListener('touchcancel', release, { passive: true });
}


const useDragCrosshair = () => {
  const [crosshair, setCrosshair] = useState(null);
  const containerRef = useRef(null);
  const dataRef      = useRef([]);
  const activeRef    = useRef(false);   // crosshair attivo (gesto orizzontale confermato)
  const pendingRef   = useRef(false);   // touchstart ricevuto, direzione ancora da decidere
  const startXRef    = useRef(0);
  const startYRef    = useRef(0);

  const getIndexFromX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el || !dataRef.current.length) return null;
    const rect = el.getBoundingClientRect();
    const chartLeft  = rect.left + 40;
    const chartWidth = rect.width - 45;
    const fraction   = Math.max(0, Math.min(1, (clientX - chartLeft) / chartWidth));
    return Math.round(fraction * (dataRef.current.length - 1));
  }, []);

  const handleStart = useCallback((e) => {
    if (!e.touches) {
      // mouse: comportamento invariato
      activeRef.current = true;
      const idx = getIndexFromX(e.clientX);
      if (idx !== null) setCrosshair({ index: idx, x: e.clientX, y: e.clientY });
      return;
    }
    // touch: registra punto di partenza, aspetta di capire la direzione
    pendingRef.current = true;
    activeRef.current  = false;
    startXRef.current  = e.touches[0].clientX;
    startYRef.current  = e.touches[0].clientY;
  }, [getIndexFromX]);

  const handleMove = useCallback((e) => {
    if (!e.touches) {
      // mouse
      if (!activeRef.current) return;
      const idx = getIndexFromX(e.clientX);
      if (idx !== null) setCrosshair({ index: idx, x: e.clientX, y: e.clientY });
      return;
    }

    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    const dx = Math.abs(clientX - startXRef.current);
    const dy = Math.abs(clientY - startYRef.current);

    if (pendingRef.current) {
      // Direzione ancora da decidere — aspetta almeno 8px di movimento
      if (dx < 8 && dy < 8) return;
      if (dy >= dx) {
        // Gesto verticale → scroll, abbandona definitivamente
        pendingRef.current = false;
        activeRef.current  = false;
        return; // non bloccare, lascia propagare lo scroll
      }
      // Gesto orizzontale confermato → attiva crosshair
      pendingRef.current = false;
      activeRef.current  = true;
    }

    if (!activeRef.current) return;
    e.preventDefault(); // blocca scroll solo quando orizzontale confermato
    const idx = getIndexFromX(clientX);
    if (idx !== null) setCrosshair({ index: idx, x: clientX, y: clientY });
  }, [getIndexFromX]);

  const handleEnd = useCallback(() => {
    activeRef.current  = false;
    pendingRef.current = false;
    setCrosshair(null);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchstart',  handleStart, { passive: true });
    el.addEventListener('touchmove',   handleMove,  { passive: false });
    el.addEventListener('touchend',    handleEnd,   { passive: true });
    el.addEventListener('touchcancel', handleEnd,   { passive: true });
    el.addEventListener('mousedown',   handleStart, { passive: true });
    el.addEventListener('mousemove',   handleMove,  { passive: true });
    el.addEventListener('mouseup',     handleEnd,   { passive: true });
    el.addEventListener('mouseleave',  handleEnd,   { passive: true });
    return () => {
      el.removeEventListener('touchstart',  handleStart);
      el.removeEventListener('touchmove',   handleMove);
      el.removeEventListener('touchend',    handleEnd);
      el.removeEventListener('touchcancel', handleEnd);
      el.removeEventListener('mousedown',   handleStart);
      el.removeEventListener('mousemove',   handleMove);
      el.removeEventListener('mouseup',     handleEnd);
      el.removeEventListener('mouseleave',  handleEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  return { containerRef, dataRef, crosshair };
};

/* ============= DRAG CHART WRAPPER ============= */
const DragChart = ({ C, data, height, children, labelKey, valueKey, valuePrefix='', valueSuffix='', valueColor }) => {
  const { containerRef, dataRef, crosshair } = useDragCrosshair();
  dataRef.current = data;
  const activePoint = crosshair !== null ? data[crosshair.index] : null;

  // Dimensioni del container tracciate in stato per forzare re-render corretto
  const [containerW, setContainerW] = useState(0);
  const [containerH, setContainerH] = useState(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      setContainerW(el.offsetWidth);
      setContainerH(el.offsetHeight);
    });
    obs.observe(el);
    setContainerW(el.offsetWidth);
    setContainerH(el.offsetHeight);
    return () => obs.disconnect();
  }, []);

  // Posizione X crosshair in pixel assoluti dentro il container
  const CHART_LEFT  = 40; // margine sinistro Recharts
  const CHART_RIGHT = 5;
  const chartWidth  = Math.max(containerW - CHART_LEFT - CHART_RIGHT, 1);
  const crosshairX  = crosshair !== null && data.length > 1
    ? CHART_LEFT + (crosshair.index / (data.length - 1)) * chartWidth
    : null;

  return (
    <div style={{ position: 'relative', userSelect: 'none', touchAction: 'pan-y' }}>
      <div ref={containerRef} style={{ cursor: 'crosshair', position: 'relative' }}>
        {children}
        {/* SVG overlay crosshair — sempre delle stesse dimensioni del container */}
        {crosshairX !== null && containerW > 0 && containerH > 0 && (
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              overflow: 'visible',
            }}
            viewBox={`0 0 ${containerW} ${containerH}`}
            preserveAspectRatio="none"
          >
            {/* Linea verticale tratteggiata */}
            <line
              x1={crosshairX} y1={0}
              x2={crosshairX} y2={containerH}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            {/* Linea orizzontale a puntini sottilissima */}
            <line
              x1={CHART_LEFT} y1={containerH / 2}
              x2={containerW - CHART_RIGHT} y2={containerH / 2}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={1}
              strokeDasharray="2 5"
            />
            {/* Pallino cyan sull'asse X */}
            <circle
              cx={crosshairX}
              cy={containerH - 2}
              r={4}
              fill="none"
              stroke="#7DF9FF"
              strokeWidth={1.5}
            />
          </svg>
        )}
      </div>
      {activePoint && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          background: C.glassBar,
          backdropFilter: 'saturate(180%) blur(30px)',
          WebkitBackdropFilter: 'saturate(180%) blur(30px)',
          border: `0.5px solid ${C.sep2}`,
          borderRadius: 12,
          padding: '6px 14px',
          pointerEvents: 'none',
          zIndex: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: C.secondary, fontSize: 11, fontFamily: FONT.mono }}>
            {activePoint[labelKey]}
          </span>
          <span style={{
            color: valueColor
              ? (typeof valueColor === 'function' ? valueColor(activePoint[valueKey]) : valueColor)
              : C.primary,
            fontSize: 14, fontFamily: FONT.mono, fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {valuePrefix}{typeof activePoint[valueKey] === 'number' ? activePoint[valueKey].toFixed(2) : activePoint[valueKey]}{valueSuffix}
          </span>
        </div>
      )}
    </div>
  );
};

/* ============= PERSISTED STATE ============= */
const usePersistedState = (key, initial) => {
  const [state, setState] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initial;
    } catch { return initial; }
  });
  const timer = useRef(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try { window.localStorage.setItem(key, JSON.stringify(state)); } catch {}
    }, 400);
    return () => timer.current && clearTimeout(timer.current);
  }, [key, state]);
  return [state, setState];
};

/* ============= AUTO LIGHT/DARK ============= */
const useColorScheme = () => {
  const [scheme, setScheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setScheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return scheme;
};

/* ============= ACCOUNTS ============= */
const ACCOUNT_DEFAULTS = [
  { id: 'main',  name: 'Portafoglio · Main',  broker: 'Wallet',  balanceInit: 0, currency: 'USD' },
];

/* ============= LIVE CLOCK ============= */
const useLiveClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

/* DEPLOY: 1778927090 */
/* ============= SUPABASE LAYER =============
   Legge i trade reali dalla tabella `trades` su Supabase.
   Polling ogni 30s, cache localStorage `xt_sb_cache`.
   ─────────────────────────────────────────────────── */
const SB_URL  = 'https://gzbvlgxfbzazlazaxhia.supabase.co';
const SB_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6YnZsZ3hmYnphemxhemF4aGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MzEyOTUsImV4cCI6MjA5NDQwNzI5NX0.4UiQQ1Rr0tB7KfVMn6EcbMwBdwmJq2HP4zlgzGvD71o';
const POLL_MS = 30_000;

// Converte numero/null da Supabase
const _n = v => {
  if (v == null || v === '') return 0;
  const p = parseFloat(String(v).replace(',', '.'));
  return isNaN(p) ? 0 : p;
};

// Normalizza data ISO → YYYY-MM-DD
const _d = v => {
  if (!v) return '';
  const s = String(v).trim();
  // ISO: 2026-05-15, 2026-05-15T10:30:00Z, 2026-05-15T10:30:00+02:00
  const iso = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  // EU: 15/05/2026
  const eu = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (eu) return `${eu[3]}-${eu[2]}-${eu[1]}`;
  // Timestamp numerico (ms)
  if (/^\d{10,13}$/.test(s)) {
    const d = new Date(s.length === 10 ? +s*1000 : +s);
    return d.toISOString().slice(0,10);
  }
  return s.slice(0, 10);
};

// Calcola tipo trade dalla durata in minuti
// < 60min → Scalp | < 360min → Intraday | < 7200min (5gg) → Swing | >= 7200min → Position
const calcTradeType = (explicit, durationMin) => {
  if (explicit && explicit !== 'Non spec.') return explicit;
  const d = Number(durationMin);
  if (!d || d <= 0) return 'Non spec.';
  if (d < 60)   return 'Scalp';
  if (d < 360)  return 'Intraday';
  if (d < 7200) return 'Swing';
  return 'Position';
};

// Calcola sessione dall'orario locale Amsterdam (CET=UTC+1, CEST=UTC+2)
// Le sessioni forex sono in ora locale Amsterdam:
//   Asia      : 01:00 – 09:00
//   Frankfurt : 09:00 – 10:00
//   London    : 09:00 – 18:00  (apre insieme a Frankfurt)
//   New York  : 14:00 – 23:00
// Priorità in caso di overlap: NEWYORK > LONDON > FRANKFURT > ASIA
const calcSession = (timeStr, dateStr) => {
  if (!timeStr) return 'NEWYORK';
  // Determina offset Amsterdam: CEST (UTC+2) da ultima domenica marzo a ultima domenica ottobre
  let offset = 1; // CET default
  if (dateStr) {
    const d = new Date(dateStr);
    const yr = d.getFullYear();
    // Ultima domenica di marzo
    const lastSunMar = new Date(yr, 2, 31);
    lastSunMar.setDate(31 - lastSunMar.getDay());
    // Ultima domenica di ottobre
    const lastSunOct = new Date(yr, 9, 31);
    lastSunOct.setDate(31 - lastSunOct.getDay());
    if (d >= lastSunMar && d < lastSunOct) offset = 2; // CEST
  }
  const [h, m] = String(timeStr).split(':').map(Number);
  const utcMins = h * 60 + (m || 0);
  const locMins = utcMins + offset * 60; // ora locale Amsterdam
  const lh = Math.floor(locMins / 60) % 24;
  const lm = locMins % 60;
  const local = lh * 60 + lm;
  if (local >= 14 * 60 && local < 23 * 60) return 'NEWYORK';
  if (local >=  9 * 60 && local < 18 * 60) return 'LONDON';
  if (local >=  9 * 60 && local < 10 * 60) return 'FRANKFURT';
  return 'ASIA';
};

// Calcola closed_to da prezzi
// TP  → exit entro 2$ dal tp
// BE  → sl preso, exit tra entry e entry+2$ (0-2$ in profit sul prezzo)
// SP  → sl preso, exit oltre entry+2$ (stop in profit oltre 2$)
// SL  → sl preso in perdita
// MAN → chiusura manuale (exit non coincide con sl né tp)
const calcClosedTo = (explicit, dir, entry, exit, sl, tp) => {
  if (explicit && !['', 'MAN', 'MANUAL'].includes(explicit.toUpperCase())) return explicit.toUpperCase();
  if (!exit || !entry) return explicit || 'MAN';
  const isLong  = String(dir).toUpperCase().includes('L') || String(dir).toUpperCase() === 'BUY';
  const TOL_TP  = 2.0; // tolleranza TP in punti prezzo
  const BE_MAX  = 2.0; // soglia BE/SP in punti prezzo
  // Controlla TP
  if (tp && Math.abs(exit - tp) <= TOL_TP) return 'TP';
  // Controlla se exit è vicino allo SL (entro 2$)
  if (sl && Math.abs(exit - sl) <= TOL_TP) {
    // Quanto è in profitto lo SL rispetto all'entry?
    const slProfitPts = isLong ? (sl - entry) : (entry - sl);
    if (slProfitPts >= BE_MAX) return 'SP';  // SL oltre 2$ in profit → Stop in Profit
    if (slProfitPts >= 0)      return 'BE';  // SL tra entry e +2$ → Break Even
    return 'SL';                              // SL in perdita
  }
  return 'MAN';
};

// Mappa riga Supabase → oggetto trade compatibile con l'app
const mapRow = (e, idx) => {
  const dateEntry = _d(e.date_entry);
  const dateExit  = _d(e.date_exit);
  const closed    = String(e.closed_to || '').toUpperCase().trim();
  const isOpen    = !dateExit || !closed || closed === 'LIVE' || closed === '';

  const partial = e.partial_exit_p != null && _n(e.partial_exit_p) > 0 ? {
    exit:     _n(e.partial_exit_p),
    size:     _n(e.partial_size),
    pnl:      _n(e.partial_pnl),
    rr:       _n(e.partial_rr),
    date:     _d(e.partial_date),
    time:     String(e.partial_time || '').slice(0, 5),
    closedTo: String(e.partial_closed_to || '').toUpperCase(),
  } : null;

  const dir        = String(e.direction || 'LONG').toUpperCase().trim();
  const entry      = _n(e.entry_p);
  const exitP      = isOpen ? null : _n(e.exit_p) || null;
  const sl         = _n(e.sl_price);
  const tp         = _n(e.tp_price);
  const size       = _n(e.size) || 0.01;
  const commission = _n(e.commission);
  const swap       = _n(e.swap);
  const spread     = _n(e.spread);
  const timeEntry  = String(e.time_entry || '').slice(0, 5);
  const timeExit   = isOpen ? null : String(e.time_exit || '').slice(0, 5);

  // Duration: usa DB se c'è, altrimenti calcola da date/time
  let duration = _n(e.duration);
  if (!duration && dateEntry && !isOpen && dateExit && timeEntry && timeExit) {
    const tIn  = new Date(`${dateEntry}T${timeEntry}`);
    const tOut = new Date(`${dateExit}T${timeExit}`);
    duration = Math.round((tOut - tIn) / 60000);
  }

  // PnL: usa DB se c'è, altrimenti calcola (XAUUSD: 1 lot = 100 oz, pip value = 1$ per 0.01 lot)
  let pnl = _n(e.pnl);
  if (!pnl && entry && exitP && size) {
    const isLong = dir.includes('L') || dir === 'BUY';
    const pts    = isLong ? (exitP - entry) : (entry - exitP);
    pnl = Math.round(pts * size * 100 * 100) / 100;
  }

  // PnL netto: usa DB se c'è, altrimenti pnl - commission - swap - spread
  let pnlNetto = _n(e.pnl_netto);
  if (!pnlNetto && pnl !== 0) {
    pnlNetto = Math.round((pnl - (commission || 0) - (swap || 0) - (spread || 0)) * 100) / 100;
  }

  // RR: usa DB se c'è, altrimenti calcola
  let rr = isOpen ? null : _n(e.rr) || null;
  if (!rr && !isOpen && entry && exitP && sl) {
    const isLong = dir.includes('L') || dir === 'BUY';
    const risk   = isLong ? (entry - sl) : (sl - entry);
    const reward = isLong ? (exitP - entry) : (entry - exitP);
    if (risk > 0) rr = Math.round(reward / risk * 100) / 100;
  }

  // Session: usa DB se c'è, altrimenti calcola da ora entrata (Amsterdam)
  const session = (e.session && e.session.trim())
    ? String(e.session).toUpperCase().trim()
    : calcSession(timeEntry, dateEntry);

  // Closed_to: usa DB se c'è, altrimenti deriva da prezzi
  const closedTo = isOpen ? null : calcClosedTo(closed, dir, entry, exitP, sl, tp);

  return {
    id:           e.id || idx + 1,
    supabaseId:   e.id,
    basket:       String(e.basket_id || `B-${1600 + idx}`),
    partialIndex: _n(e.partial_index),
    mt5Ticket:    e.mt5_ticket || null,
    date:         dateEntry,
    dateExit:     isOpen ? null : dateExit,
    timeEntry,
    timeExit,
    duration,
    dir,
    session,
    entry,
    exit:         exitP,
    sl,
    tp,
    currentPrice: isOpen ? _n(e.exit_p) || null : null,
    size,
    spread,
    commission,
    swap,
    slippage:     0,
    pnl,
    pnlNetto,
    rr,
    tradeType:    calcTradeType(String(e.tradetype || e.trade_type || '').trim(), duration),
    closed:       closedTo,
    equity:       _n(e.equity),
    mae:          _n(e.mae),
    mfe:          _n(e.mfe),
    symbol:       String(e.symbol || 'XAUUSD'),
    accountId:    String(e.account_id || 'main'),
    partials:     partial ? [partial] : [],
    tags:         [],
    open:         isOpen,
  };
};

// Raggruppa partial (partialIndex > 0) sul trade parent (partialIndex === 0)
const groupTrades = rows => {
  const map = {};
  rows.forEach(r => {
    const key = r.basket || `auto-${r.id}`;
    if (!map[key]) map[key] = { parent: null, partials: [] };
    r = { ...r, basket: key }; // normalizza basket
    // Se partialIndex è 0 o non definito → è il parent
    if (!r.partialIndex || r.partialIndex === 0) map[key].parent = r;
    else {
      const key2 = r.basket;
      if (map[key2]) {
        map[key2].partials.push(...(r.partials||[]));
        if (map[key2].parent) {
          map[key2].parent.pnl      = (map[key2].parent.pnl||0) + (r.pnl||0);
          map[key2].parent.pnlNetto = (map[key2].parent.pnlNetto||0) + (r.pnlNetto||0);
        }
      }
    }
  });
  const out = [];
  Object.values(map).forEach(({ parent, partials }) => {
    if (!parent) return;
    parent.partials = (parent.partials || []).concat(partials).sort((a, b) =>
      (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || ''));
    out.push(parent);
  });
  return out.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id);
};

// Costruisce equity curve dai trade chiusi
const buildEquityCurve = (trades, balanceInit = 0) => {
  const byDate = {};
  trades.filter(t => !t.open).forEach(t => { byDate[t.dateExit] = (byDate[t.dateExit] || 0) + t.pnl; });
  const dates = Object.keys(byDate).sort();
  const curve = [{ day: 'Dep.', value: balanceInit, dateKey: null }];
  let eq = balanceInit;
  dates.forEach(d => {
    eq += byDate[d];
    const [, mm, dd] = d.split('-');
    curve.push({ day: `${dd}/${mm}`, value: Math.round(eq * 100) / 100, dateKey: d });
  });
  return curve;
};

// Hook principale — fetch + polling + cache
const useSupabaseData = () => {
  const [state, setState] = React.useState({
    loading: true, error: null, trades: null, equity: null, lastSync: null, fromLocal: false,
  });

  const fetch_ = React.useCallback(async (force = false) => {
    if (!force) setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(
        `${SB_URL}/rest/v1/trades?select=*&order=date_entry.asc,partial_index.asc`,
        { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' } }
      );
      if (!res.ok) {
        const err = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${err}`);
      }
      const rows = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) {
        setState({ loading: false, error: null, trades: [], equity: [], lastSync: new Date(), fromLocal: false });
        return;
      }
      const mapped  = rows.map((r, i) => mapRow(r, i)).filter(t => t.date && t.date.length >= 10);
      const grouped = groupTrades(mapped);
      const equity  = buildEquityCurve(grouped);
      try { localStorage.setItem('xt_sb_cache', JSON.stringify({ trades: grouped, equity, ts: Date.now() })); } catch(_) {}
      setState({ loading: false, error: null, trades: grouped, equity, lastSync: new Date(), fromLocal: false });
    } catch (err) {
      // Fallback cache
      let fromLocal = false, trades = null, equity = null;
      try {
        const cache = JSON.parse(localStorage.getItem('xt_sb_cache') || 'null');
        if (cache && Array.isArray(cache.trades)) { trades = cache.trades; equity = cache.equity; fromLocal = true; }
      } catch(_) {}
      setState(s => ({ ...s, loading: false, error: err.message, trades, equity, lastSync: new Date(), fromLocal }));
    }
  }, []);

  // Mount fetch + polling ogni 30s
  React.useEffect(() => {
    fetch_();
    const id = setInterval(() => fetch_(true), POLL_MS);
    return () => clearInterval(id);
  }, [fetch_]);

  return { ...state, refetch: () => fetch_() };
};

/* ============= CONF COLORS ============= */
const CONF_COLORS_MAP = {
  FIBREVERSE: '#C77DFF', '3D': '#C77DFF', SWEEP: '#C77DFF',
  VAO: '#C77DFF', POC: '#C77DFF', VAH: '#C77DFF', VAL: '#C77DFF',
  ORIGINE: '#7DF9FF', 'ORIGINE REVERSE': '#7DF9FF', OBB: '#7DF9FF',
  OBV: '#7DF9FF', VWAP: '#FFB627',
};

/* ============= COSTS / FRICTION ============= */

/* ============= METRICHE TOTALI (PERFORMANCE TAB SHEETS) ============= */
/* ============= COMPUTE ALL STATS FROM REAL TRADES ============= */
// Unica fonte di verità — nessun dato mock hardcoded
const computeAllStats = (trades) => {
  const closed = (trades || []).filter(t => !t.open);
  const n = closed.length;
  if (n === 0) return null; // nessun dato → UI mostra stato vuoto

  const wins   = closed.filter(t => t.pnl > 0);
  const losses = closed.filter(t => t.pnl < 0);
  const wr     = Math.round(wins.length / n * 100);
  const grossW = wins.reduce((s,t) => s+t.pnl, 0);
  const grossL = Math.abs(losses.reduce((s,t) => s+t.pnl, 0));
  const total  = grossW - grossL;
  const avgWin = wins.length   ? grossW / wins.length   : 0;
  const avgLos = losses.length ? grossL / losses.length : 0;
  const pf     = grossL > 0 ? grossW / grossL : grossW > 0 ? 99 : 0;
  const exp    = total / n;
  const rrs    = closed.filter(t=>t.rr>0).map(t=>t.rr);
  const avgRR  = rrs.length ? rrs.reduce((s,r)=>s+r,0)/rrs.length : 0;
  const bestRR = rrs.length ? rrs.reduce((a,b)=>a>b?a:b,0) : 0;
  const lgWin  = wins.length   ? wins.reduce((a,b)=>a.pnl>b.pnl?a:b).pnl   : 0;
  const lgLos  = losses.length ? losses.reduce((a,b)=>a.pnl<b.pnl?a:b).pnl : 0;

  // Equity curve
  const BALANCE_INIT = (()=>{const f=closed.find(t=>t.equity!=null);return f?Math.round((f.equity-(f.pnl||0))*100)/100:0;})();
  const byDate = {};
  closed.forEach(t => { byDate[t.dateExit] = (byDate[t.dateExit]||0) + t.pnl; });
  const dates = Object.keys(byDate).sort();
  let eq = BALANCE_INIT, hwm = BALANCE_INIT, maxDD = 0;
  dates.forEach(d => {
    eq += byDate[d];
    if (eq > hwm) hwm = eq;
    const dd = hwm - eq;
    if (dd > maxDD) maxDD = dd;
  });
  const currEq  = BALANCE_INIT + total;
  const currDD  = hwm - currEq;
  const maxDDPct = hwm > 0 ? maxDD/hwm*100 : 0;
  const roi     = (total/BALANCE_INIT)*100;
  const tradeDays = dates.length || 1;
  const roiDaily  = roi / tradeDays;
  const roiWeekly = roiDaily * 5;
  const roiMonthly = roiDaily * 22;

  // Sharpe / Sortino
  const pnls = closed.map(t=>t.pnl);
  const mean = total/n;
  const variance = pnls.reduce((s,p)=>s+(p-mean)**2,0)/n;
  const stdDev = Math.sqrt(variance);
  const sharpe = stdDev > 0 ? mean/stdDev : 0;
  const sharpeAnnual = sharpe * Math.sqrt(252);
  const downPnls = pnls.filter(p=>p<0);
  const downVar  = downPnls.reduce((s,p)=>s+p**2,0)/Math.max(downPnls.length,1);
  const sortino  = downVar > 0 ? mean/Math.sqrt(downVar) : 0;
  const kelly    = avgLos > 0 ? (wr/100 - (1-wr/100)*(avgWin/avgLos)) : 0;

  // Statistical edge
  const skew = stdDev > 0 ? pnls.reduce((s,p)=>s+((p-mean)/stdDev)**3,0)/n : 0;
  const zscore = stdDev > 0 ? (mean/stdDev)*Math.sqrt(n) : 0;

  // MAE / MFE
  const maes = closed.filter(t=>t.mae && t.mae!==0).map(t=>t.mae);
  const mfes = closed.filter(t=>t.mfe && t.mfe!==0).map(t=>t.mfe);
  const avgMAE = maes.length ? maes.reduce((s,v)=>s+v,0)/maes.length : 0;
  const avgMFE = mfes.length ? mfes.reduce((s,v)=>s+v,0)/mfes.length : 0;
  const maxMAE = maes.length ? maes.reduce((a,b)=>a<b?a:b, 0) : 0;
  const maxMFE = mfes.length ? mfes.reduce((a,b)=>a>b?a:b, 0) : 0;
  const mfeMaeRatio = avgMAE < 0 ? Math.abs(avgMFE/avgMAE) : 0;
  const edgeCaptured = avgMFE > 0 ? Math.min((avgWin/avgMFE)*100, 100) : 0;

  // Streak
  let maxW=0, maxL=0, curW=0, curL=0;
  const sorted = [...closed].sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id);
  sorted.forEach(t => {
    if (t.pnl>0) { curW++; curL=0; if(curW>maxW)maxW=curW; }
    else          { curL++; curW=0; if(curL>maxL)maxL=curL; }
  });
  // Current streak
  let curStreak=0, curType=null;
  [...sorted].reverse().forEach(t => {
    if (t.pnl===0) return;
    const isW = t.pnl>0;
    if (curType===null) { curType=isW; curStreak=1; }
    else if (curType===isW) curStreak++;
  });

  // Closures
  const nTP     = closed.filter(t=>t.closed==='TP').length;
  const nSL     = closed.filter(t=>t.closed==='SL').length;
  const nBE     = closed.filter(t=>t.closed==='BE').length;
  const nSP     = closed.filter(t=>t.closed==='SP').length;
  const nManual = closed.filter(t=>!['TP','SL','BE','SP'].includes(t.closed||'')).length;

  // Costs
  const totSpread = closed.reduce((s,t)=>s+(t.spread||0),0);
  const totComm   = closed.reduce((s,t)=>s+(t.commission||0),0);
  const totSwap   = closed.reduce((s,t)=>s+(t.swap||0),0);
  const totSlip   = closed.reduce((s,t)=>s+(t.slippage||0),0);
  const totCost   = totSpread+totComm+totSwap+totSlip;
  const costPerTrade = n ? totCost/n : 0;
  const costOnPnl    = total !== 0 ? Math.abs(totCost/total)*100 : 0;

  // Best/Worst day
  const dayEntries = Object.entries(byDate);
  const bestDay  = dayEntries.length > 0 ? dayEntries.reduce((a,b)=>b[1]>a[1]?b:a) : null;
  const lossDays = dayEntries.filter(([,v])=>v<0);
  const worstDay = lossDays.length > 0 ? lossDays.reduce((a,b)=>b[1]<a[1]?b:a) : null;

  // Avg holding
  const durs = closed.filter(t=>t.duration>0).map(t=>t.duration);
  const avgHold = durs.length ? durs.reduce((s,v)=>s+v,0)/durs.length : 0;
  const avgHoldStr = avgHold > 0 ? avgHold >= 60 ? `${Math.floor(avgHold/60)}h ${Math.round(avgHold%60)}m` : `${Math.round(avgHold)}m` : '—';

  // Breakdowns
  const SESS_COLORS = { ASIAN:'#FF457A', FRANKFURT:'#FFB627', LONDON:'#C77DFF', NEWYORK:'#7DF9FF' };
  const breakSess = ['ASIAN','FRANKFURT','LONDON','NEWYORK'].map(s => {
    const t = closed.filter(tr=>(tr.session||'').toUpperCase()===s);
    const w = t.filter(tr=>tr.pnl>0).length;
    const p = t.reduce((acc,tr)=>acc+(tr.pnl||0),0);
    const r = t.filter(tr=>tr.rr>0).map(tr=>tr.rr);
    return { name:s==='NEWYORK'?'New York':s.charAt(0)+s.slice(1).toLowerCase(), trades:t.length, wr:t.length?Math.round(w/t.length*100):0, pnl:p, avg:t.length?p/t.length:0, rr:r.length?r.reduce((a,b)=>a+b,0)/r.length:0, color:SESS_COLORS[s] };
  }).filter(s=>s.trades>0);

  const breakDay = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map((name,i) => {
    const t = closed.filter(tr=>{
      const p=(tr.date||'').split('-');
      return p.length===3?(new Date(+p[0],+p[1]-1,+p[2]).getDay()+6)%7===i:false;
    });
    const w = t.filter(tr=>tr.pnl>0).length;
    const p = t.reduce((acc,tr)=>acc+(tr.pnl||0),0);
    const r = t.filter(tr=>tr.rr>0).map(tr=>tr.rr);
    return { name, trades:t.length, wr:t.length?Math.round(w/t.length*100):0, pnl:p, avg:t.length?p/t.length:0, rr:r.length?r.reduce((a,b)=>a+b,0)/r.length:0 };
  });

  const MONTH_NAMES = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  const breakMonth = MONTH_NAMES.map((name,i) => {
    const t = closed.filter(tr=>new Date(tr.dateExit || tr.date).getMonth()===i);
    const w = t.filter(tr=>tr.pnl>0).length;
    const p = t.reduce((acc,tr)=>acc+(tr.pnl||0),0);
    return { name, trades:t.length, wr:t.length?Math.round(w/t.length*100):0, pnl:p, avg:t.length?p/t.length:0 };
  }).filter(m=>m.trades>0);

  const breakType = [...new Set(['Scalp','Intraday','Swing','Position',...closed.map(tr=>(tr.tradeType||'').trim()).map(s=>s||'Non spec.').filter(s=>s)])].map(name => {
        const t = closed.filter(tr=>((tr.tradeType||'').trim()||'Non spec.').toLowerCase()===name.toLowerCase());
    const w = t.filter(tr=>tr.pnl>0).length;
    const p = t.reduce((acc,tr)=>acc+(tr.pnl||0),0);
    return { name, trades:t.length, wr:t.length?Math.round(w/t.length*100):0, pnl:p, avg:t.length?p/t.length:0 };
  }).filter(s=>s.trades>0);

  const breakHour = Array.from({length:24},(_,h) => {
    const t = closed.filter(tr => {
      const te = tr.timeEntry || tr.time_entry || '';
      if (!te) return false;
      const utcH = parseInt(te.split(':')[0])||0;
      return ((utcH+2)%24)===h;
    });
    const w = t.filter(tr=>tr.pnl>0).length;
    const p = t.reduce((acc,tr)=>acc+(tr.pnl||0),0);
    return { name:`${String(h).padStart(2,'0')}:00`, trades:t.length, wr:t.length?Math.round(w/t.length*100):0, pnl:p, avg:t.length?p/t.length:0 };
  }).filter(h=>h.trades>0);

  const HOLD_BUCKETS = [{name:'<15min',min:0,max:15},{name:'15-30m',min:15,max:30},{name:'30-60m',min:30,max:60},{name:'1-4h',min:60,max:240},{name:'4-8h',min:240,max:480},{name:'>8h',min:480,max:Infinity}];
  const breakHolding = HOLD_BUCKETS.map(b => {
    const t = closed.filter(tr=>tr.duration>=b.min&&tr.duration<b.max);
    const w = t.filter(tr=>tr.pnl>0).length;
    const p = t.reduce((acc,tr)=>acc+(tr.pnl||0),0);
    return { name:b.name, trades:t.length, wr:t.length?Math.round(w/t.length*100):0, pnl:p, avg:t.length?p/t.length:0 };
  }).filter(b=>b.trades>0);

  // Matrice giorno × sessione calcolata
  const DAYS = ['Lun','Mar','Mer','Gio','Ven'];
  const SESS = ['ASIAN','FRANKFURT','LONDON','NEWYORK'];
  const matrixData = DAYS.map((_,di) =>
    SESS.map(s => {
      const t = closed.filter(tr=>{
        // Parse manuale: evita timezone offset di new Date('YYYY-MM-DD')
        const parts = (tr.date||'').split('-');
        const dow = parts.length===3 ? new Date(+parts[0],+parts[1]-1,+parts[2]).getDay() : -1;
        return (dow+6)%7===di && (tr.session||'').toUpperCase()===s;
      });
      const w = t.filter(tr=>tr.pnl>0).length;
      const p = t.reduce((acc,tr)=>acc+(tr.pnl||0),0);
      const r = t.filter(tr=>tr.rr>0).map(tr=>tr.rr);
      return { pnl:p, wr:t.length?Math.round(w/t.length*100):0, rr:r.length?r.reduce((a,b)=>a+b,0)/r.length:0, trades:t.length };
    })
  );

  // Rolling (30/60/90 trades)
  const rolling = [30,60,90].map(k => {
    const slice = sorted.slice(-k);
    if (slice.length < 3) return { period:`${k}T`, sharpe:0, pf:0, wr:0 };
    const sw = slice.filter(t=>t.pnl>0).length;
    const sgw = slice.filter(t=>t.pnl>0).reduce((s,t)=>s+(t.pnl||0),0);
    const sgl = Math.abs(slice.filter(t=>t.pnl<0).reduce((s,t)=>s+(t.pnl||0),0));
    const sm = slice.reduce((s,t)=>s+(t.pnl||0),0)/Math.max(slice.length,1);
    const sv = slice.reduce((s,t)=>s+((t.pnl||0)-sm)**2,0)/Math.max(slice.length,1);
    const ss = Math.sqrt(sv);
    return { period:`${k}T`, sharpe:ss>0?sm/ss:0, pf:sgl>0?sgw/sgl:0, wr:slice.length?Math.round(sw/slice.length*100):0 };
  });

  // Behavioral post-streak (calcolato dai trade reali)
  const buckets = {after3Wplus:[],after2W:[],base:[],after1L:[],after2Lplus:[]};
  for (let i=1;i<sorted.length;i++) {
    let cw=0,cl=0;
    for (let j=i-1;j>=0;j--) { if(sorted[j].pnl>0)cw++; else break; }
    for (let j=i-1;j>=0;j--) { if(sorted[j].pnl<0)cl++; else break; }
    const t = sorted[i];
    if (cl>=2) buckets.after2Lplus.push(t);
    else if (cl===1) buckets.after1L.push(t);
    else if (cw>=3) buckets.after3Wplus.push(t);
    else if (cw>=2) buckets.after2W.push(t);
    else buckets.base.push(t);
  }
  const postStreak = [
    {name:'Dopo 3W+',arr:buckets.after3Wplus},
    {name:'Dopo 2W', arr:buckets.after2W},
    {name:'Base',    arr:buckets.base},
    {name:'Dopo 1L', arr:buckets.after1L},
    {name:'Dopo 2L+',arr:buckets.after2Lplus},
  ].map(b => {
    const bw=b.arr.filter(t=>t.pnl>0).length;
    const bp=b.arr.reduce((s,t)=>s+(t.pnl||0),0);
    return {name:b.name,trades:b.arr.length,wr:b.arr.length?Math.round(bw/b.arr.length*100):0,pnl:bp,avg:b.arr.length?bp/b.arr.length:0};
  });

  const fmt = (v,d=2) => isFinite(v)&&!isNaN(v) ? v.toFixed(d) : '—';

  return {
    // metriche per MetricsView
    general: [
      {label:'Win Rate',      value:`${wr}%`,             sub:`${wins.length}/${n} trades`},
      {label:'Profit Tot',    value:`${total>=0?'+':''}$${fmt(total)}`, sub:'netto', accent:'green'},
      {label:'Trades',        value:`${n}`,               sub:'chiusi'},
      {label:'R:R Medio',     value:`${fmt(avgRR)}`,      sub:'media multipli'},
      {label:'Best R:R',      value:`${fmt(bestRR,1)}`,   sub:'miglior trade'},
      {label:'Avg Win',       value:`+$${fmt(avgWin)}`,   sub:'media vincite', accent:'green'},
      {label:'Avg Loss',      value:`−$${fmt(avgLos)}`,   sub:'media perdite', accent:'red'},
      {label:'Largest Win',   value:`+$${fmt(lgWin)}`,    accent:'green'},
      {label:'Largest Loss',  value:`−$${fmt(Math.abs(lgLos))}`, accent:'red'},
      {label:'Expectancy',    value:`${exp>=0?'+':''}$${fmt(exp)}`, sub:'per trade', accent:'green'},
    ],
    equity: [
      {label:'Current Equity',  value:`$${fmt(currEq)}`,  sub:'live', accent:'green'},
      {label:'High Water Mark', value:`$${fmt(hwm)}`,     sub:'massimo storico', accent:'cyan'},
      {label:'Current DD',      value:`−$${fmt(currDD)}`, sub:'da HWM'},
      {label:'Max DD $',        value:`−$${fmt(maxDD)}`,  accent:'red'},
      {label:'Max DD %',        value:`−${fmt(maxDDPct)}%`, accent:'red'},
      {label:'ROI Totale',      value:`${roi>=0?'+':''}${fmt(roi)}%`, sub:'su balance iniziale', accent:'green'},
    ],
    risk: [
      {label:'Profit Factor',   value:`${fmt(pf)}`,           sub:'gross W / |gross L|', accent:'cyan'},
      {label:'Sharpe',          value:`${fmt(sharpe)}`,        sub:'per trade'},
      {label:'Sharpe Annual',   value:`${fmt(sharpeAnnual,1)}`,sub:'×√252', accent:'green'},
      {label:'Sortino',         value:`${fmt(sortino)}`,       sub:'downside risk', accent:'cyan'},
      {label:'Kelly %',         value:`${fmt(kelly*100,1)}%`,  sub:'optimal sizing', accent:'purple'},
      {label:'Max DD $',        value:`−$${fmt(maxDD)}`,       accent:'red'},
      {label:'Max DD %',        value:`−${fmt(maxDDPct)}%`,    accent:'red'},
      {label:'Skewness',        value:`${skew>=0?'+':''}${fmt(skew)}`, sub:'> 0 = right-tail', accent: skew>=0?'green':'red'},
      {label:'Z-Score',         value:`${fmt(zscore)}`,        sub:'> 2 = significativo', accent:'green'},
    ],
    excursion: [
      {label:'Avg MAE',       value:`−$${fmt(Math.abs(avgMAE))}`, sub:'max adverse', accent:'red'},
      {label:'Avg MFE',       value:`+$${fmt(avgMFE)}`,          sub:'max favorable', accent:'green'},
      {label:'Max MAE',       value:`−$${fmt(Math.abs(maxMAE))}`,sub:'peggiore intra-trade', accent:'red'},
      {label:'Max MFE',       value:`+$${fmt(maxMFE)}`,          sub:'migliore intra-trade', accent:'green'},
      {label:'MFE/MAE Ratio', value:`${fmt(mfeMaeRatio)}`,       sub:'efficienza setup', accent:'cyan'},
      {label:'Edge Captured', value:`${fmt(edgeCaptured)}%`,     sub:'P&L / max MFE', accent:'purple'},
    ],
    roi: [
      {label:'ROI Totale',  value:`${roi>=0?'+':''}${fmt(roi)}%`,          sub:'su balance iniziale', accent:'green'},
      {label:'ROI Daily',   value:`${roiDaily>=0?'+':''}${fmt(roiDaily)}%`,sub:'media giornaliera', accent:'cyan'},
      {label:'ROI Weekly',  value:`${roiWeekly>=0?'+':''}${fmt(roiWeekly)}%`,sub:'proiezione settimana', accent:'purple'},
      {label:'ROI Monthly', value:`${roiMonthly>=0?'+':''}${fmt(roiMonthly)}%`,sub:'proiezione mese', accent:'yellow'},
    ],
    streak: [
      {label:'Max Streak Win',  value:`${maxW}`, sub:'consecutive', accent:'green'},
      {label:'Max Streak Loss', value:`${maxL}`, sub:'consecutive', accent:'red'},
      {label:'Gross Win',       value:`+$${fmt(grossW)}`, accent:'green'},
      {label:'Gross Loss',      value:`−$${fmt(grossL)}`, accent:'red'},
    ],
    closures: [
      {label:'# TP',     value:`${nTP}`,     accent:'green'},
      {label:'# SL',     value:`${nSL}`,     accent:'red'},
      {label:'# BE',     value:`${nBE}`,     accent:'yellow'},
      {label:'# SP',     value:`${nSP}`,     accent:'cyan'},
      {label:'# Manual', value:`${nManual}`, accent:'tertiary'},
    ],
    costs: [
      {label:'Spread Tot',   value:`${fmt(totSpread)}$`,    accent:'red'},
      {label:'Commissione',  value:`${fmt(totComm)}$`,      accent:'red'},
      {label:'Swap Tot',     value:`${fmt(totSwap)}$`,      accent:'red'},
      {label:'Costi Tot',    value:`${fmt(totCost)}$`,      sub:'attriti totali', accent:'red'},
      {label:'Costo/Trade',  value:`${fmt(costPerTrade)}$`, sub:'tutto incluso',  accent:'orange'},
      {label:'Costi su P&L', value:`${fmt(costOnPnl)}%`,   sub:'incidenza',      accent:'yellow'},
      {label:'Avg Slippage', value:`${fmt(durs.length?totSlip/n:0)}$`, sub:'per trade', accent:'orange'},
    ],
    extremes: [
      {label:'Best Day',   value:bestDay  ? `+$${fmt(bestDay[1])}`           : '—', sub:bestDay?bestDay[0]:'',     accent:'green'},
      {label:'Worst Day',  value:worstDay ? `−$${fmt(Math.abs(worstDay[1]))}`: '—', sub:worstDay?worstDay[0]:'', accent:'red'},
      {label:'Avg Hold',   value:avgHoldStr, sub:'per trade', accent:'cyan'},
      {label:'R:R Realiz.',value:`${fmt(avgRR)}`, sub:'reale', accent:'yellow'},
    ],
    rolling: rolling.map(r => ([
      {label:`Sharpe ${r.period}`, value:fmt(r.sharpe), sub:'rolling'},
      {label:`PF ${r.period}`,     value:fmt(r.pf),     sub:'rolling', accent:'cyan'},
      {label:`WR ${r.period}`,     value:`${r.wr}%`,    sub:'rolling', accent: r.wr>=60?'green':r.wr>=40?'yellow':'red'},
    ])).flat(),
    // breakdown
    breakSess:    breakSess,
    breakDay:     breakDay,
    breakMonth:   breakMonth,
    breakType:    breakType,
    breakHour:    breakHour,
    breakHolding: breakHolding,
    postStreak:   postStreak,
    matrixData:   matrixData,
    // equity per proiezione
    currEq, hwm, total, mean, BALANCE_INIT, tradeDays,
    currentStreak: { streak:curStreak, isWin:curType },
    // raw per grafici
    closedTrades: closed,
  };
};

/* ============= PALETTE LIGHT/DARK ============= */
const palette = {
  dark: {
    green:'#39FF14', cyan:'#7DF9FF', purple:'#C77DFF', red:'#FF073A',
    yellow:'#FFE600', orange:'#FFB627', pink:'#FF457A',
    bg:'#000000',
    glass:    '#1C1C1E',
    glass2:   '#2C2C2E',
    glass3:   '#3A3A3C',
    glassBar: '#1C1C1E',
    sep:      'rgba(255,255,255,0.08)',
    sep2:     'rgba(255,255,255,0.12)',
    primary:  '#FFFFFF',
    secondary:'rgba(255,255,255,0.65)',
    tertiary: 'rgba(255,255,255,0.38)',
    quat:     'rgba(255,255,255,0.18)',
    iconBg:   '#000',
    ambient:  `none`,
  },
  light: {
    green:'#00B814', cyan:'#0099B3', purple:'#8B2EBC', red:'#D9001F',
    yellow:'#B89400', orange:'#D17500', pink:'#C92668',
    bg:'#F2F2F7',
    glass:    'rgba(255, 255, 255, 0.72)',
    glass2:   'rgba(245, 245, 247, 0.85)',
    glass3:   'rgba(229, 229, 234, 0.85)',
    glassBar: 'rgba(255, 255, 255, 0.78)',
    sep:      'rgba(0,0,0,0.08)',
    sep2:     'rgba(0,0,0,0.12)',
    primary:  '#000000',
    secondary:'rgba(0,0,0,0.65)',
    tertiary: 'rgba(0,0,0,0.40)',
    quat:     'rgba(0,0,0,0.20)',
    iconBg:   '#FFF',
    ambient:  `radial-gradient(circle at 20% 0%, #C77DFF20, transparent 50%), radial-gradient(circle at 80% 100%, #7DF9FF15, transparent 50%)`,
  },
};


/* ============================================================
   MOCK_STORE — unica fonte di verità (STRUTTURA REALE, DATI VUOTI).
   Nessun dato di esempio: popola questi campi dalle API o dagli
   inserimenti manuali. Le viste gestiscono lo stato vuoto.
   ============================================================ */
const MOCK_STORE = (() => {
  const T = 0;
  const RAW = [];
  const assets = RAW.map(a => ({
    ...a,
    id:       a.symbol.toLowerCase(),
    amount:   (T * a.alloc / 100) / a.price,
    value:    T * a.alloc / 100,
    price24h: a.price / (1 + a.chg24h / 100),
    mcapTier: a.mcap > 10e9 ? 'large' : a.mcap > 500e6 ? 'mid' : 'small',
    allocPct: a.alloc,
  }));
  const totalValue   = assets.reduce((s,a) => s + a.value, 0);
  const totalPnl24h  = assets.reduce((s,a) => s + a.value * (a.chg24h/100), 0);
  const onChainValue = assets.filter(a=>a.type==='wallet').reduce((s,a)=>s+a.value,0);
  const spark = (price, chg7d) => {
    const start = price / (1 + chg7d/100);
    return Array.from({length:7}, (_,i) => {
      const t = i/6;
      return +(start + (price-start)*t + Math.sin(i*1.8)*price*0.012).toFixed(5);
    });
  };
  return {
    assets,
    totalValue,
    totalPnl24h,
    totalPnl24hPct: totalValue>0 ? (totalPnl24h/totalValue)*100 : 0,
    onChainValue,
    exchValue:      totalValue - onChainValue,
    stableValue:    0,
    stablePct:      0,
    equityCurve: [],
    transactions: [],
    globalPrices:    assets.slice(0,5).map(a=>({...a,vol24h:Math.round(a.mcap*0.03),spark:spark(a.price,a.chg7d)})),
    portfolioPrices: [...assets.slice(5)].sort((a,b)=>b.mcap-a.mcap).map(a=>({...a,vol24h:Math.round(a.mcap*0.05),spark:spark(a.price,a.chg7d)})),
    rebalanceTargets:{},
    perf:{twrr:0,mwrr:0,cagr:0,roi7d:0,roi30d:0,roi90d:0,roi1y:0,bestAsset:'—',bestPct:0,worstAsset:'—',worstPct:0,btcBench:0,ethBench:0,sp500Bench:0},
    risk:{sharpe:0,var95:0,var95Usd:0,drawdown:0,drawdownUsd:0,volatility:0,beta:0},
    comp:{
      herfindahl:0.12,stableRatio:0,stableUsd:0,
      onChainPct: totalValue>0 ? +(onChainValue/totalValue*100).toFixed(1) : 0,
      cexPct: totalValue>0 ? +((totalValue-onChainValue)/totalValue*100).toFixed(1) : 0,
      turnover:0,
      dca: [],
    },
  };
})();
/* ============================================================ */

const FONT = {
  display: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
  text:    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
  mono:    '"SF Mono", ui-monospace, Menlo, Monaco, monospace',
};

const RADIUS = { card: 32, inset: 22, pill: 999 };

/* ── neonText: sfumatura neon leggerissima solo sulle scritte grandi ── */
const neonText = (color, scheme) => {
  if (scheme !== 'dark') return {};
  // intensità bassissima: visibile ma non aggressiva
  return { textShadow: `0 0 24px ${color}1E, 0 0 8px ${color}0F` };
};

/* ============= COMPONENTS ============= */
const Glass = ({ C, children, className='', padding='p-5', radius=RADIUS.card, style={} }) => (
  <div className={`xt-card ${className}`} style={{
    background: C.glass,
    border: `0.5px solid ${C.sep2}`,
    borderRadius: radius,
    boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
    ...style,
  }}>
    <div className={padding}>{children}</div>
  </div>
);

const GlassInset = ({ C, children, className='', padding='p-3', style={} }) => (
  <div className={className} style={{
    background: C.glass2,
    border: `0.5px solid ${C.sep}`,
    borderRadius: RADIUS.inset,
    ...style,
  }}>
    <div className={padding}>{children}</div>
  </div>
);

const Sparkline = ({ data, color, height = 28 }) => {
  const min = data.length ? Math.min(...data) : 0;
  const max = data.length ? Math.max(...data) : 1;
  const norm = (v) => max === min ? 0.5 : (v - min) / (max - min);
  const w = 72;
  const padding = 2;
  const h = height - padding * 2;
  // Smooth curve usando comandi quadratici Bezier
  const points = data.map((v,i)=>[(data.length > 1 ? i/(data.length-1) : 0.5)*w, padding + h - norm(v)*h]);
  let path = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    const [px, py] = points[i-1];
    const cx = (px + x) / 2;
    path += ` Q ${cx},${py} ${cx},${(py+y)/2} T ${x},${y}`;
  }
  return (
    <svg width={w} height={height} style={{overflow:'visible'}}>
      <defs>
        <linearGradient id={`sparkGrad-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={`${path} L ${w},${height} L 0,${height} Z`} fill={`url(#sparkGrad-${color.replace('#','')})`}/>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
};

const Stat = ({C, label, value, sub, color, spark, sparkColor, className='', style={}}) => (
  <Glass C={C} padding="p-4" className={className} style={style}>
    <div className="flex items-start justify-between mb-1.5">
      <span style={{color:C.secondary,fontSize:12,fontFamily:FONT.text,fontWeight:500,letterSpacing:'-0.08px'}}>{label}</span>
      {spark && <Sparkline data={spark} color={sparkColor || color || C.primary}/>}
    </div>
    <div style={{color: color || C.primary, fontSize:28, fontFamily:FONT.display, fontWeight:600, letterSpacing:'-0.6px', lineHeight:1.1, fontVariantNumeric:'tabular-nums', ...neonText(color || C.primary, C.scheme)}}>{value}</div>
    {sub && <div style={{color:C.tertiary, fontSize:11, fontFamily:FONT.mono, marginTop:4}}>{sub}</div>}
  </Glass>
);

const SectionHeader = ({C, children, action}) => (
  <div className="flex items-end justify-between mb-3 px-1">
    <h2 style={{fontFamily:FONT.display, fontSize:22, fontWeight:700, letterSpacing:'-0.4px', color:C.primary, ...neonText(C.primary, C.scheme)}}>{children}</h2>
    {action}
  </div>
);

const Eyebrow = ({C, children}) => (
  <div style={{color:C.tertiary, fontSize:11, fontFamily:FONT.text, fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase', marginBottom:12}}>
    {children}
  </div>
);

const SegmentedControl = ({C, options, value, onChange}) => (
  <div className="inline-flex p-0.5" style={{
    background:C.glass2, borderRadius:RADIUS.pill,
    backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
    border:`0.5px solid ${C.sep}`,
  }}>
    {options.map(opt=>(
      <button key={opt} onClick={()=>{haptic.selection();onChange?.(opt);}} className="xt-seg-pill"
        style={{
          padding:'6px 14px', fontSize:12, fontFamily:FONT.text, fontWeight:600,
          color: value===opt ? C.primary : C.secondary,
          background: value===opt ? C.glass3 : 'transparent',
          borderRadius: RADIUS.pill, border:'none', cursor:'pointer', letterSpacing:'-0.08px',
        }}>
        {opt}
      </button>
    ))}
  </div>
);

const Tag = ({children, color, size='md'}) => (
  <span style={{
    fontSize: size==='sm'?10:11, fontFamily:FONT.text, fontWeight:600, color,
    background:`${color}1F`, padding: size==='sm'?'2.5px 8px':'3px 10px',
    borderRadius:7, letterSpacing:'-0.06px', textTransform:'uppercase',
    lineHeight: 1.2,
  }}>{children}</span>
);

const FilterChip = ({C, label, active, onClick, count, color}) => (
  <button onClick={()=>{haptic.selection();onClick?.();}} className="xt-btn xt-chip" style={{
    padding:'5px 12px', fontSize:11, fontFamily:FONT.text, fontWeight:600,
    color: active ? (color ? C.bg : C.bg) : (color || C.secondary),
    background: active ? (color || C.primary) : C.glass2,
    backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
    border:`0.5px solid ${active ? (color || C.primary) : color ? color+'55' : C.sep}`,
    borderRadius:RADIUS.pill, cursor:'pointer', letterSpacing:'-0.08px', transition:'all 0.15s',
  }}>
    {label}{count !== undefined && <span style={{marginLeft:5,opacity:0.6}}>{count}</span>}
  </button>
);

const ConfidenceRating = ({C, value, onChange}) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(n=>(
      <button key={n}
        onClick={()=>{ haptic.selection(); onChange?.(n); }}
        className="xt-star"
        style={{background:'none',border:'none',cursor:'pointer',padding:'2px',lineHeight:0}}>
        <Star size={14} fill={n <= (value||0) ? C.yellow : 'none'} stroke={n <= (value||0) ? C.yellow : C.tertiary} strokeWidth={1.5}/>
      </button>
    ))}
  </div>
);

/* ============= GOAL TRACKER ============= */
const GoalRow = ({ C, label, balanceInit, currentPnl, targetPct, color, editing, onTargetChange }) => {
  const pct     = parseFloat(targetPct) || 0;
  const targetUsd = balanceInit * pct / 100;
  const donePct   = targetUsd > 0 ? Math.min(currentPnl / targetUsd * 100, 100) : 0;
  const missingPct = Math.max(pct - (balanceInit > 0 ? currentPnl / balanceInit * 100 : 0), 0);
  return (
    <div>
      <div className="flex justify-between items-start mb-2 gap-2">
        <span style={{color:C.secondary,fontSize:12,fontFamily:FONT.text,fontWeight:600,letterSpacing:'-0.08px',flexShrink:0}}>{label}</span>
        <div className="flex flex-col items-end gap-0.5">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono}}>Target %</span>
              <input type="text" inputMode="decimal" value={targetPct}
                onChange={e=>onTargetChange(e.target.value)}
                style={{background:C.glass2,border:`0.5px solid ${C.sep}`,borderRadius:6,padding:'2px 6px',
                  color:C.primary,fontSize:13,fontFamily:FONT.mono,fontWeight:600,width:60,
                  textAlign:'right',outline:'none',WebkitAppearance:'none'}}/>
              <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono}}>%</span>
            </div>
          ) : (
            <span style={{color:color,fontSize:15,fontFamily:FONT.mono,fontWeight:700,fontVariantNumeric:'tabular-nums'}}>
              {pct.toFixed(1)}% → ${targetUsd.toFixed(0)}
            </span>
          )}
          <div className="flex items-center gap-2">
            <span style={{color:C.green,fontSize:11,fontFamily:FONT.mono,fontWeight:600}}>
              +{(currentPnl/balanceInit*100).toFixed(2)}% fatto
            </span>
            <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono}}>·</span>
            <span style={{color:missingPct > 0 ? C.orange : C.green, fontSize:11,fontFamily:FONT.mono,fontWeight:600}}>
              {missingPct > 0 ? `−${missingPct.toFixed(2)}% manca` : '✓ raggiunto'}
            </span>
          </div>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{background:C.glass3}}>
        <div className="h-full rounded-full transition-all" style={{
          width:`${donePct}%`,
          background:`linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow:`0 0 8px ${color}40`,
        }}/>
      </div>
    </div>
  );
};

const GoalTracker = ({ C }) => {
  const _gc = MOCK_STORE.equityCurve;
  const balanceInit = _gc[0]?.value || 0;
  const currentPnl  = (_gc[_gc.length-1]?.value ?? balanceInit) - balanceInit;

  const [goals, setGoals] = usePersistedState('xt_goals_pct', {
    monthly: { targetPct: '15.0' },
    yearly:  { targetPct: '120.0' },
  });
  const [editing, setEditing] = useState(false);

  return (
    <Glass C={C}>
      <SectionHeader C={C} action={
        <button onClick={()=>setEditing(!editing)} style={{
          padding:'4px 10px',fontSize:11,fontFamily:FONT.text,fontWeight:600,
          color:editing?C.cyan:C.secondary, background:'transparent',
          border:'none',borderRadius:RADIUS.pill,cursor:'pointer',letterSpacing:'-0.08px',
        }}>{editing?'Fine':'Modifica'}</button>
      }>Obiettivi</SectionHeader>
      <div className="space-y-4">
        <GoalRow C={C} label="Mensile" balanceInit={balanceInit} currentPnl={currentPnl}
          targetPct={goals.monthly.targetPct} color={C.green} editing={editing}
          onTargetChange={(v)=>setGoals({...goals, monthly:{targetPct:v}})}/>
        <GoalRow C={C} label="Annuale" balanceInit={balanceInit} currentPnl={currentPnl}
          targetPct={goals.yearly.targetPct} color={C.cyan} editing={editing}
          onTargetChange={(v)=>setGoals({...goals, yearly:{targetPct:v}})}/>
      </div>
      {editing && (
        <div style={{marginTop:10,color:C.tertiary,fontSize:10,fontFamily:FONT.text,textAlign:'center'}}>
          Inserisci la % del conto che vuoi raggiungere. Il sistema calcola quanto manca.
        </div>
      )}
    </Glass>
  );
};

/* ============= iOS SWITCH ============= */
const IOSSwitch = ({ value, onChange, color }) => {
  const [pressing, setPressing] = React.useState(false);
  const handleToggle = () => {
    // Rigid = ON snap, Soft = OFF release
    if (!value) haptic.rigid(); else haptic.soft();
    onChange(!value);
  };
  return (
    <button
      onClick={handleToggle}
      onMouseDown={()=>setPressing(true)}
      onMouseUp={()=>setPressing(false)}
      onMouseLeave={()=>setPressing(false)}
      onTouchStart={()=>setPressing(true)}
      onTouchEnd={()=>setPressing(false)}
      role="switch" aria-checked={value}
      className={pressing ? 'xt-switch-track xt-switch-pressing' : 'xt-switch-track'}
      style={{
        position:'relative',
        width:44, height:26, borderRadius:13,
        background: value ? (color || '#39FF14') : 'rgba(120,120,128,0.32)',
        border:'none', cursor:'pointer', padding:0,
        transition:'background 0.22s ease',
        flexShrink:0, outline:'none',
      }}>
      <div className="xt-switch-thumb" style={{
        position:'absolute', top:1,
        left: value ? 19 : 1,
        width:22, height:22, borderRadius:'50%',
        background:'#fff',
        boxShadow:'0 2px 4px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.04)',
        transformOrigin: value ? 'right center' : 'left center',
        // Thumb si schiaccia verso destra/sinistra al press (identico UIKit)
        transform: pressing ? (value ? 'scaleX(1.18) translateX(-2px)' : 'scaleX(1.18) translateX(2px)') : 'scaleX(1)',
        transition:'left 0.28s cubic-bezier(0.34,1.56,0.64,1), transform 0.14s cubic-bezier(0.25,0.46,0.45,0.94)',
      }}/>
    </button>
  );
};

/* ============= SETTINGS MODAL ============= */
// Row e SectionTitle a livello modulo — evita ricreazione ad ogni render
const SettingsRow = ({ C, label, sub, children }) => (
  <div className="flex items-center justify-between py-3" style={{borderBottom:`0.5px solid ${C.sep}`}}>
    <div className="flex-1 min-w-0">
      <div style={{color:C.primary,fontSize:14,fontFamily:FONT.text,fontWeight:500,letterSpacing:'-0.1px'}}>{label}</div>
      {sub && <div style={{color:C.tertiary,fontSize:11,fontFamily:FONT.text,marginTop:2}}>{sub}</div>}
    </div>
    <div className="ml-3 flex-shrink-0">{children}</div>
  </div>
);

const SettingsSectionTitle = ({ children }) => (
  <div style={{
    color:'rgba(128,128,136,1)', fontSize:11, fontFamily:FONT.text, fontWeight:600,
    letterSpacing:'0.4px', textTransform:'uppercase', padding:'18px 4px 8px',
  }}>{children}</div>
);

const SettingsModal = ({C,open,onClose,settings,setSettings,scheme,schemeOverride,setSchemeOverride}) => {
  const [nwName,setNwName]=useState('');
  const [nwAddr,setNwAddr]=useState('');
  const [nwChain,setNwChain]=useState('ETH');
  const [neName,setNeName]=useState('');
  const [neKey,setNeKey]=useState('');
  const [neSecret,setNeSecret]=useState('');
  const [neId,setNeId]=useState('binance');
  if(!open) return null;
  const wallets=settings.wallets||[];
  const exchanges=settings.exchanges||[];
  const addWallet=()=>{if(!nwAddr.trim())return;const w={id:Date.now(),name:nwName.trim()||`Wallet ${wallets.length+1}`,address:nwAddr.trim(),chain:nwChain};setSettings({...settings,wallets:[...wallets,w]});setNwName('');setNwAddr('');haptic.success();};
  const removeWallet=id=>{setSettings({...settings,wallets:wallets.filter(w=>w.id!==id)});haptic.medium();};
  const addExchange=()=>{if(!neKey.trim())return;const e={id:Date.now(),name:neName.trim()||neId,exchangeId:neId,apiKey:neKey.trim(),apiSecret:neSecret.trim()};setSettings({...settings,exchanges:[...exchanges,e]});setNeName('');setNeKey('');setNeSecret('');haptic.success();};
  const removeExchange=id=>{setSettings({...settings,exchanges:exchanges.filter(e=>e.id!==id)});haptic.medium();};
  const inp={width:'100%',padding:'8px 10px',fontSize:13,fontFamily:FONT.text,background:'rgba(128,128,128,0.1)',border:'0.5px solid rgba(128,128,128,0.2)',borderRadius:10,color:'inherit',outline:'none',boxSizing:'border-box'};
  const CHAINS=['ETH','BTC','SOL','BNB','MATIC','AVAX','ARB','OP','XDC'];
  const EXCHS=['binance','kraken','bybit','coinbase','okx','kucoin'];
  return (
    <div style={{position:'fixed',inset:0,zIndex:100,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'env(safe-area-inset-top,0) 16px env(safe-area-inset-bottom,0)',overflowY:'auto'}} onClick={onClose}>
      <div style={{marginTop:60,marginBottom:60,width:'100%',maxWidth:520,background:C.glass,backdropFilter:'saturate(180%) blur(50px)',WebkitBackdropFilter:'saturate(180%) blur(50px)',border:`0.5px solid ${C.sep2}`,borderRadius:32,padding:24,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h2 style={{fontFamily:FONT.display,fontSize:22,fontWeight:700,letterSpacing:'-0.4px',color:C.primary}}>Impostazioni</h2>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:15,background:C.glass2,border:`0.5px solid ${C.sep}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={14} style={{color:C.secondary}}/></button>
        </div>
        {/* Aspetto */}
        <SettingsSectionTitle>Aspetto</SettingsSectionTitle>
        <div style={{background:C.glass2,borderRadius:14,padding:'2px 14px'}}>
          <SettingsRow C={C} label="Tema" sub={schemeOverride==='auto'?`Auto · ${scheme==='dark'?'attualmente scuro':'attualmente chiaro'}`:(schemeOverride==='dark'?'Sempre scuro':'Sempre chiaro')}>
            <SegmentedControl C={C} options={['Auto','Scuro','Chiaro']} value={schemeOverride==='auto'?'Auto':schemeOverride==='dark'?'Scuro':'Chiaro'} onChange={v=>setSchemeOverride(v==='Auto'?'auto':v==='Scuro'?'dark':'light')}/>
          </SettingsRow>
        </div>
        {/* Generale */}
        <SettingsSectionTitle>Generale</SettingsSectionTitle>
        <div style={{background:C.glass2,borderRadius:14,padding:'2px 14px'}}>
          <SettingsRow C={C} label="Valuta base" sub="Valore visualizzato in tutto il portfolio">
            <SegmentedControl C={C} options={['USD','EUR','BTC']} value={settings.currency||'USD'} onChange={v=>setSettings({...settings,currency:v})}/>
          </SettingsRow>
          <SettingsRow C={C} label="Auto-refresh" sub="Aggiornamento prezzi e saldi">
            <SegmentedControl C={C} options={['30s','60s','5m']} value={settings.refreshInterval===30?'30s':settings.refreshInterval===300?'5m':'60s'} onChange={v=>setSettings({...settings,refreshInterval:v==='30s'?30:v==='5m'?300:60})}/>
          </SettingsRow>
        </div>
        {/* Wallet */}
        <SettingsSectionTitle>Wallet On-Chain</SettingsSectionTitle>
        <div style={{background:C.glass2,borderRadius:14,padding:'2px 14px'}}>
          {wallets.length===0&&<SettingsRow C={C} label="Nessun wallet" sub="Aggiungi un indirizzo pubblico"/>}
          {wallets.map(w=>(
            <SettingsRow C={C} key={w.id} label={w.name} sub={`${w.chain} · ${(w.address||'').slice(0,8)}…`}>
              <button onClick={()=>removeWallet(w.id)} style={{padding:'5px 10px',fontSize:11,fontFamily:FONT.text,fontWeight:600,color:C.red,background:`${C.red}15`,border:`1px solid ${C.red}40`,borderRadius:RADIUS.pill,cursor:'pointer'}}>Rimuovi</button>
            </SettingsRow>
          ))}
          <div style={{paddingTop:12,paddingBottom:8,display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',gap:8}}>
              <input placeholder="Nome wallet" value={nwName} onChange={e=>setNwName(e.target.value)} style={{...inp,flex:1}}/>
              <select value={nwChain} onChange={e=>setNwChain(e.target.value)} style={{...inp,width:80,flex:'none'}}>{CHAINS.map(c=><option key={c}>{c}</option>)}</select>
            </div>
            <input placeholder="Indirizzo pubblico (0x… / bc1… / …)" value={nwAddr} onChange={e=>setNwAddr(e.target.value)} style={inp}/>
            <button onClick={addWallet} style={{padding:'8px 0',fontSize:13,fontFamily:FONT.text,fontWeight:600,color:C.bg,background:C.cyan,border:'none',borderRadius:10,cursor:'pointer',width:'100%'}}>+ Aggiungi Wallet</button>
          </div>
        </div>
        {/* Exchange */}
        <SettingsSectionTitle>Exchange</SettingsSectionTitle>
        <div style={{background:C.glass2,borderRadius:14,padding:'2px 14px'}}>
          {exchanges.length===0&&<SettingsRow C={C} label="Nessun exchange" sub="Usa API key read-only"/>}
          {exchanges.map(ex=>(
            <SettingsRow C={C} key={ex.id} label={ex.name} sub={`${ex.exchangeId} · ${ex.apiKey.slice(0,8)}…`}>
              <button onClick={()=>removeExchange(ex.id)} style={{padding:'5px 10px',fontSize:11,fontFamily:FONT.text,fontWeight:600,color:C.red,background:`${C.red}15`,border:`1px solid ${C.red}40`,borderRadius:RADIUS.pill,cursor:'pointer'}}>Rimuovi</button>
            </SettingsRow>
          ))}
          <div style={{paddingTop:12,paddingBottom:8,display:'flex',flexDirection:'column',gap:8}}>
            <div style={{display:'flex',gap:8}}>
              <input placeholder="Nome exchange" value={neName} onChange={e=>setNeName(e.target.value)} style={{...inp,flex:1}}/>
              <select value={neId} onChange={e=>setNeId(e.target.value)} style={{...inp,width:100,flex:'none'}}>{EXCHS.map(ex=><option key={ex} value={ex}>{ex.charAt(0).toUpperCase()+ex.slice(1)}</option>)}</select>
            </div>
            <input placeholder="API Key (read-only)" value={neKey} onChange={e=>setNeKey(e.target.value)} style={inp}/>
            <input placeholder="API Secret" value={neSecret} onChange={e=>setNeSecret(e.target.value)} style={inp} type="password"/>
            <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>⚠️ Solo API key read-only — mai prelievi</div>
            <button onClick={addExchange} style={{padding:'8px 0',fontSize:13,fontFamily:FONT.text,fontWeight:600,color:C.bg,background:C.green,border:'none',borderRadius:10,cursor:'pointer',width:'100%'}}>+ Collega Exchange</button>
          </div>
        </div>
        {/* Export */}
        <SettingsSectionTitle>Export</SettingsSectionTitle>
        <div style={{background:C.glass2,borderRadius:14,padding:'2px 14px'}}>
          <SettingsRow C={C} label="Export CSV portfolio" sub="Asset, prezzi e allocazioni">
            <button onClick={()=>{const now=new Date().toISOString();const rows=[['Data','Tipo','Nome','Simbolo','Quantità','Prezzo USD','Valore USD','% Portfolio','Fonte']];const csvA=MOCK_STORE.assets;const tot=MOCK_STORE.totalValue;csvA.forEach(a=>{rows.push([now.slice(0,10),a.type==='wallet'?'DEX':'CEX',a.name,a.symbol,a.amount.toFixed(6),a.price.toFixed(4),a.value.toFixed(2),tot>0?((a.value/tot)*100).toFixed(2)+'%':'0%',a.exchange||(a.type==='wallet'?'Wallet':'Exchange')]);});const csv=rows.map(r=>r.join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`cryptofolio-${now.slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);haptic.success();}} style={{padding:'6px 14px',fontSize:12,fontFamily:FONT.text,fontWeight:600,color:C.bg,background:C.green,border:'none',borderRadius:RADIUS.pill,cursor:'pointer'}}>CSV</button>
          </SettingsRow>
        </div>
        {/* Backup */}
        <SettingsSectionTitle>Backup & Ripristino</SettingsSectionTitle>
        <div style={{background:C.glass2,borderRadius:14,padding:'2px 14px'}}>
          <SettingsRow C={C} label="Salva backup JSON" sub="Esporta wallet, exchange e impostazioni">
            <button onClick={()=>{const data={};Object.keys(localStorage).filter(k=>k.startsWith('xt_')).forEach(k=>{data[k]=localStorage.getItem(k);});data['_date']=new Date().toISOString();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`cryptofolio-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);haptic.success();}} style={{padding:'6px 14px',fontSize:12,fontFamily:FONT.text,fontWeight:600,color:C.bg,background:C.primary,border:'none',borderRadius:RADIUS.pill,cursor:'pointer'}}>Salva</button>
          </SettingsRow>
          <SettingsRow C={C} label="Ripristina da file" sub="Carica un backup — sovrascrive i dati">
            <label style={{padding:'6px 14px',fontSize:12,fontFamily:FONT.text,fontWeight:600,color:C.cyan,background:`${C.cyan}15`,border:`1px solid ${C.cyan}40`,borderRadius:RADIUS.pill,cursor:'pointer',display:'inline-block'}}>Carica<input type="file" accept=".json" style={{display:'none'}} onChange={e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{try{const d=JSON.parse(ev.target.result);Object.entries(d).forEach(([k,v])=>{if(k.startsWith('xt_'))localStorage.setItem(k,v);});haptic.success();setTimeout(()=>window.location.reload(),400);}catch{haptic.error();alert('File non valido.');}};reader.readAsText(file);e.target.value='';}}/>
            </label>
          </SettingsRow>
        </div>
        <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono,marginTop:20,textAlign:'center'}}>CryptoFolio · v1.0</div>
      </div>
    </div>
  );
};


const tradeGrade = (rr, C) => {
  const r = rr || 0;
  if (r >= 3) return { label: 'A+', color: C.green };
  if (r >= 2) return { label: 'A',  color: C.cyan };
  if (r >= 1) return { label: 'B',  color: C.purple };
  return { label: 'C', color: C.tertiary };
};

/* ============= CONFLUENCE TAGGER ============= */

const TF_LIST = ['M1','M2','M3','M7','M13','M17','M25','M33','M90','M99','H2','H3','H6','H12','D1','D3','1W'];

// Colori per categoria
const CONF_COLORS = {
  noTF:   '#C77DFF', // viola — confluenze senza TF
  withTF: '#7DF9FF', // cyan  — confluenze con TF
  vwap:   '#FFB627', // arancio — VWAP/KEYZONE
};

// Definizione confluenze
const CONF_NO_TF = ['FIBREVERSE','3D','VAO','POC','VAH','VAL','SWEEP'];
const CONF_WITH_TF = ['ORIGINE','ORIGINE REVERSE','OBB','OBV'];
// VWAP è gestita separatamente

// TF Dropdown
const TFDropdown = ({ C, value, onChange, placeholder='TF' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} style={{position:'relative', flexShrink:0}}>
      <button onClick={()=>setOpen(!open)} className="xt-btn flex items-center gap-1" style={{
        padding:'4px 8px', borderRadius:8, border:`0.5px solid ${value ? CONF_COLORS.withTF+'60' : C.sep}`,
        background: value ? `${CONF_COLORS.withTF}18` : C.glass3,
        color: value ? CONF_COLORS.withTF : C.tertiary,
        fontSize:10, fontFamily:FONT.mono, fontWeight:700, cursor:'pointer', minWidth:44,
      }}>
        {value || placeholder}
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:50,
          background:'#1C1C1E', border:`0.5px solid ${C.sep2}`,
          borderRadius:12, padding:4, minWidth:64,
          boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
          display:'grid', gridTemplateColumns:'1fr 1fr', gap:2,
        }}>
          {value && (
            <button onClick={()=>{ onChange(null); setOpen(false); }}
              style={{gridColumn:'1/-1', padding:'4px 8px', borderRadius:7, border:'none',
                background:`${C.red}22`, color:C.red, fontSize:10, fontFamily:FONT.mono,
                fontWeight:600, cursor:'pointer', marginBottom:2}}>
              Reset
            </button>
          )}
          {TF_LIST.map(tf=>(
            <button key={tf} onClick={()=>{ onChange(tf); setOpen(false); }} className="xt-btn"
              style={{
                padding:'5px 6px', borderRadius:7, border:'none', cursor:'pointer',
                background: value===tf ? `${CONF_COLORS.withTF}28` : 'transparent',
                color: value===tf ? CONF_COLORS.withTF : C.secondary,
                fontSize:10, fontFamily:FONT.mono, fontWeight:700, textAlign:'center',
              }}>
              {tf}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Chip confluenza generica (con o senza TF)
const ConfChip = ({ C, label, color, tfs=[], onRemoveTF, onAddTF, onRemove, withTF=false }) => {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', flexWrap:'wrap', gap:4,
      padding:'4px 6px 4px 10px',
      background:`${color}18`, border:`0.5px solid ${color}45`,
      borderRadius:12, marginBottom:2,
    }}>
      <span style={{fontSize:11, fontFamily:FONT.text, fontWeight:700, color, letterSpacing:'0.1px'}}>{label}</span>
      {/* TF badges */}
      {tfs.map((tf,i)=>(
        <div key={i} className="flex items-center gap-0.5" style={{
          padding:'2px 4px 2px 6px', borderRadius:6,
          background:`${color}28`, border:`0.5px solid ${color}50`,
        }}>
          <span style={{fontSize:9, fontFamily:FONT.mono, fontWeight:700, color}}>{tf}</span>
          <button onClick={()=>onRemoveTF(i)} style={{background:'none',border:'none',cursor:'pointer',padding:'0 1px',display:'flex',lineHeight:1}}>
            <X size={8} style={{color}}/>
          </button>
        </div>
      ))}
      {/* Add TF button */}
      {withTF && (
        <TFDropdown C={C} value={null} placeholder="+ TF" onChange={(tf)=>{ if(tf) onAddTF(tf); }}/>
      )}
      {/* Remove chip */}
      <button onClick={onRemove} style={{background:'none',border:'none',cursor:'pointer',padding:'0 2px',display:'flex',lineHeight:1,marginLeft:2}}>
        <X size={10} style={{color:`${color}90`}}/>
      </button>
    </div>
  );
};

// VWAP chip speciale
const VWAPChip = ({ C, item, onRemove, onAddTF, onRemoveTF }) => {
  const isKZ = item.bull && item.bear;
  const color = isKZ ? '#FF457A' : item.bull ? C.green : C.red;
  const label = isKZ ? 'VWAP KEYZONE' : item.bull ? 'VWAP ▲' : 'VWAP ▼';
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', flexWrap:'wrap', gap:4,
      padding:'4px 6px 4px 10px',
      background:`${color}18`, border:`0.5px solid ${color}45`,
      borderRadius:12, marginBottom:2,
    }}>
      <span style={{fontSize:11, fontFamily:FONT.text, fontWeight:700, color, letterSpacing:'0.1px'}}>{label}</span>
      {item.tfs.map((tf,i)=>(
        <div key={i} className="flex items-center gap-0.5" style={{
          padding:'2px 4px 2px 6px', borderRadius:6,
          background:`${color}28`, border:`0.5px solid ${color}50`,
        }}>
          <span style={{fontSize:9, fontFamily:FONT.mono, fontWeight:700, color}}>{tf}</span>
          <button onClick={()=>onRemoveTF(i)} style={{background:'none',border:'none',cursor:'pointer',padding:'0 1px',display:'flex'}}>
            <X size={8} style={{color}}/>
          </button>
        </div>
      ))}
      <TFDropdown C={C} value={null} placeholder="+ TF" onChange={(tf)=>{ if(tf) onAddTF(tf); }}/>
      <button onClick={onRemove} style={{background:'none',border:'none',cursor:'pointer',padding:'0 2px',display:'flex',marginLeft:2}}>
        <X size={10} style={{color:`${color}90`}}/>
      </button>
    </div>
  );
};

const ConfluenceTagger = ({ C, tradeId, confluences, setConfluences }) => {
  const data = confluences[tradeId] || { noTF: [], withTF: [], vwap: [] };

  // ── helpers ──
  const update = (fn) => setConfluences(prev => ({ ...prev, [tradeId]: fn(prev[tradeId] || { noTF:[], withTF:[], vwap:[] }) }));

  // noTF: toggle semplice
  const toggleNoTF = (name) => update(d => {
    const exists = d.noTF.find(x=>x.name===name);
    if (exists) return { ...d, noTF: d.noTF.filter(x=>x.name!==name) };
    if (name === 'FIBREVERSE' || name === '3D') return { ...d, noTF: [...d.noTF, { name, count:1 }] };
    return { ...d, noTF: [...d.noTF, { name }] };
  });
  const incFib = () => update(d => ({ ...d, noTF: d.noTF.map(x=>x.name==='FIBREVERSE'?{...x,count:(x.count||1)+1}:x) }));
  const decFib = () => update(d => ({ ...d, noTF: d.noTF.map(x=>x.name==='FIBREVERSE'?{...x,count:Math.max(1,(x.count||1)-1)}:x) }));
  const inc3D  = () => update(d => ({ ...d, noTF: d.noTF.map(x=>x.name==='3D'?{...x,count:(x.count||1)+1}:x) }));
  const dec3D  = () => update(d => ({ ...d, noTF: d.noTF.map(x=>x.name==='3D'?{...x,count:Math.max(1,(x.count||1)-1)}:x) }));

  // withTF: aggiungi istanza con TF array
  const addWithTF = (name) => update(d => ({ ...d, withTF: [...d.withTF, { name, tfs:[] }] }));
  const removeWithTF = (idx) => update(d => ({ ...d, withTF: d.withTF.filter((_,i)=>i!==idx) }));
  const addTFtoWithTF = (idx, tf) => update(d => ({
    ...d, withTF: d.withTF.map((x,i)=>i===idx && !x.tfs.includes(tf) ? {...x,tfs:[...x.tfs,tf]}:x)
  }));
  const removeTFfromWithTF = (idx, tfi) => update(d => ({
    ...d, withTF: d.withTF.map((x,i)=>i===idx ? {...x,tfs:x.tfs.filter((_,j)=>j!==tfi)}:x)
  }));

  // VWAP
  const addVWAP = (type) => update(d => ({ ...d, vwap: [...d.vwap, { bull: type==='bull', bear: type==='bear', tfs:[] }] }));
  const addVWAPKZ = () => update(d => ({ ...d, vwap: [...d.vwap, { bull:true, bear:true, tfs:[] }] }));
  const removeVWAP = (idx) => update(d => ({ ...d, vwap: d.vwap.filter((_,i)=>i!==idx) }));
  const addTFtoVWAP = (idx, tf) => update(d => ({
    ...d, vwap: d.vwap.map((x,i)=>i===idx && !x.tfs.includes(tf) ? {...x,tfs:[...x.tfs,tf]}:x)
  }));
  const removeTFfromVWAP = (idx, tfi) => update(d => ({
    ...d, vwap: d.vwap.map((x,i)=>i===idx ? {...x,tfs:x.tfs.filter((_,j)=>j!==tfi)}:x)
  }));

  const totalCount = data.noTF.length + data.withTF.length + data.vwap.length;

  // VWAP popup
  const [vwapOpen, setVwapOpen] = useState(false);
  const vwapRef = useRef(null);
  useEffect(() => {
    if (!vwapOpen) return;
    const handler = (e) => { if (vwapRef.current && !vwapRef.current.contains(e.target)) setVwapOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [vwapOpen]);

  return (
    <GlassInset C={C} padding="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full" style={{background:C.cyan}}/>
          <span style={{color:C.secondary,fontSize:10,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.3px',textTransform:'uppercase'}}>
            Confluenze {totalCount > 0 && <span style={{color:C.cyan}}>· {totalCount}</span>}
          </span>
        </div>
      </div>

      {/* ── Chips attive ── */}
      {totalCount > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {data.noTF.map((x,i)=>(
            x.name === 'FIBREVERSE' ? (
              <div key={i} style={{
                display:'inline-flex', alignItems:'center', gap:4,
                padding:'4px 6px 4px 10px',
                background:`${CONF_COLORS.noTF}18`, border:`0.5px solid ${CONF_COLORS.noTF}45`,
                borderRadius:12,
              }}>
                <span style={{fontSize:11,fontFamily:FONT.text,fontWeight:700,color:CONF_COLORS.noTF}}>FIBREVERSE</span>
                <div className="flex items-center" style={{background:`${CONF_COLORS.noTF}28`,borderRadius:8,overflow:'hidden'}}>
                  <button onClick={decFib} style={{background:'none',border:'none',cursor:'pointer',padding:'2px 6px',color:CONF_COLORS.noTF,fontSize:13,lineHeight:1,fontWeight:700}}>−</button>
                  <span style={{fontSize:11,fontFamily:FONT.mono,fontWeight:700,color:CONF_COLORS.noTF,minWidth:16,textAlign:'center'}}>{x.count||1}</span>
                  <button onClick={incFib} style={{background:'none',border:'none',cursor:'pointer',padding:'2px 6px',color:CONF_COLORS.noTF,fontSize:13,lineHeight:1,fontWeight:700}}>+</button>
                </div>
                <button onClick={()=>toggleNoTF('FIBREVERSE')} style={{background:'none',border:'none',cursor:'pointer',padding:'0 2px',display:'flex',marginLeft:2}}>
                  <X size={10} style={{color:`${CONF_COLORS.noTF}90`}}/>
                </button>
              </div>
            ) : x.name === '3D' ? (
              <div key={i} style={{
                display:'inline-flex', alignItems:'center', gap:4,
                padding:'4px 6px 4px 10px',
                background:`${CONF_COLORS.noTF}18`, border:`0.5px solid ${CONF_COLORS.noTF}45`,
                borderRadius:12,
              }}>
                <span style={{fontSize:11,fontFamily:FONT.text,fontWeight:700,color:CONF_COLORS.noTF}}>3D</span>
                <div className="flex items-center" style={{background:`${CONF_COLORS.noTF}28`,borderRadius:8,overflow:'hidden'}}>
                  <button onClick={dec3D} style={{background:'none',border:'none',cursor:'pointer',padding:'2px 6px',color:CONF_COLORS.noTF,fontSize:13,lineHeight:1,fontWeight:700}}>−</button>
                  <span style={{fontSize:11,fontFamily:FONT.mono,fontWeight:700,color:CONF_COLORS.noTF,minWidth:16,textAlign:'center'}}>{x.count||1}</span>
                  <button onClick={inc3D} style={{background:'none',border:'none',cursor:'pointer',padding:'2px 6px',color:CONF_COLORS.noTF,fontSize:13,lineHeight:1,fontWeight:700}}>+</button>
                </div>
                <button onClick={()=>toggleNoTF('3D')} style={{background:'none',border:'none',cursor:'pointer',padding:'0 2px',display:'flex',marginLeft:2}}>
                  <X size={10} style={{color:`${CONF_COLORS.noTF}90`}}/>
                </button>
              </div>
            ) : (
              <ConfChip key={i} C={C} label={x.name} color={CONF_COLORS.noTF}
                onRemove={()=>toggleNoTF(x.name)} withTF={false}/>
            )
          ))}
          {data.withTF.map((x,i)=>(
            <ConfChip key={i} C={C} label={x.name} color={CONF_COLORS.withTF}
              tfs={x.tfs} withTF
              onAddTF={(tf)=>addTFtoWithTF(i,tf)}
              onRemoveTF={(tfi)=>removeTFfromWithTF(i,tfi)}
              onRemove={()=>removeWithTF(i)}/>
          ))}
          {data.vwap.map((x,i)=>(
            <VWAPChip key={i} C={C} item={x}
              onAddTF={(tf)=>addTFtoVWAP(i,tf)}
              onRemoveTF={(tfi)=>removeTFfromVWAP(i,tfi)}
              onRemove={()=>removeVWAP(i)}/>
          ))}
        </div>
      )}

      {/* ── Gruppo 1: FIBREVERSE, OBB, 3D, ORIGINE, ORIGINE REVERSE, SWEEP ── */}
      <div className="mb-2">
        <div className="flex flex-wrap gap-1.5">
          {['FIBREVERSE','3D'].map(name=>{
            const active = data.noTF.find(x=>x.name===name);
            return (
              <button key={name} onClick={()=>{haptic.light();toggleNoTF(name);}} className="xt-btn xt-chip" style={{
                padding:'5px 10px', borderRadius:8, cursor:'pointer',
                border:`0.5px solid ${active ? CONF_COLORS.noTF+'60' : C.sep}`,
                background: active ? `${CONF_COLORS.noTF}22` : C.glass3,
                color: active ? CONF_COLORS.noTF : C.secondary,
                fontSize:11, fontFamily:FONT.mono, fontWeight:700,
              }}>{name}</button>
            );
          })}
          {['OBB','ORIGINE','ORIGINE REVERSE'].map(name=>(
            <button key={name} onClick={()=>{haptic.light();addWithTF(name);}} className="xt-btn xt-chip" style={{
              padding:'5px 10px', borderRadius:8, cursor:'pointer',
              border:`0.5px solid ${C.sep}`,
              background: C.glass3,
              color: C.secondary,
              fontSize:11, fontFamily:FONT.mono, fontWeight:700,
            }}>{name}</button>
          ))}
          {['SWEEP'].map(name=>{
            const active = data.noTF.find(x=>x.name===name);
            return (
              <button key={name} onClick={()=>{haptic.light();toggleNoTF(name);}} className="xt-btn xt-chip" style={{
                padding:'5px 10px', borderRadius:8, cursor:'pointer',
                border:`0.5px solid ${active ? CONF_COLORS.noTF+'60' : C.sep}`,
                background: active ? `${CONF_COLORS.noTF}22` : C.glass3,
                color: active ? CONF_COLORS.noTF : C.secondary,
                fontSize:11, fontFamily:FONT.mono, fontWeight:700,
              }}>{name}</button>
            );
          })}
        </div>
      </div>

      {/* ── Gruppo 2: VWAP, OBV, VAO, POC, VAH, VAL ── */}
      <div className="mb-2" style={{borderTop:`0.5px solid ${C.sep}`, paddingTop:8}}>
        <div className="flex flex-wrap gap-1.5">
          {/* VWAP — singolo bottone, popup con le 3 scelte */}
          <div ref={vwapRef} style={{position:'relative', display:'inline-block'}}>
            <button onClick={()=>setVwapOpen(o=>!o)} className="xt-btn" style={{
              padding:'5px 10px', borderRadius:8, cursor:'pointer',
              border:`0.5px solid ${C.sep}`,
              background: C.glass3,
              color: C.secondary,
              fontSize:11, fontFamily:FONT.mono, fontWeight:700,
            }}>VWAP</button>
            {vwapOpen && (
              <div style={{
                position:'absolute', top:'calc(100% + 6px)', left:0, zIndex:60,
                background:'#1C1C1E', border:`0.5px solid rgba(255,255,255,0.12)`,
                borderRadius:12, padding:'6px', minWidth:130,
                boxShadow:'0 8px 32px rgba(0,0,0,0.65)',
                display:'flex', flexDirection:'column', gap:4,
              }}>
                <button onClick={()=>{ addVWAP('bull'); setVwapOpen(false); }} className="xt-btn" style={{
                  padding:'7px 12px', borderRadius:8, cursor:'pointer', border:'none',
                  background:`${C.green}18`, color:C.green,
                  fontSize:11, fontFamily:FONT.mono, fontWeight:700, textAlign:'left',
                }}>▲ RIALZISTA</button>
                <button onClick={()=>{ addVWAP('bear'); setVwapOpen(false); }} className="xt-btn" style={{
                  padding:'7px 12px', borderRadius:8, cursor:'pointer', border:'none',
                  background:`${C.red}18`, color:C.red,
                  fontSize:11, fontFamily:FONT.mono, fontWeight:700, textAlign:'left',
                }}>▼ RIBASSISTA</button>
                <button onClick={()=>{ addVWAPKZ(); setVwapOpen(false); }} className="xt-btn" style={{
                  padding:'7px 12px', borderRadius:8, cursor:'pointer', border:'none',
                  background:'#FF457A18', color:'#FF457A',
                  fontSize:11, fontFamily:FONT.mono, fontWeight:700, textAlign:'left',
                }}>⬡ KEYZONE</button>
              </div>
            )}
          </div>
          {['OBV'].map(name=>(
            <button key={name} onClick={()=>{haptic.light();addWithTF(name);}} className="xt-btn xt-chip" style={{
              padding:'5px 10px', borderRadius:8, cursor:'pointer',
              border:`0.5px solid ${C.sep}`,
              background: C.glass3,
              color: C.secondary,
              fontSize:11, fontFamily:FONT.mono, fontWeight:700,
            }}>{name}</button>
          ))}
          {['VAO','POC','VAH','VAL'].map(name=>{
            const active = data.noTF.find(x=>x.name===name);
            return (
              <button key={name} onClick={()=>{haptic.light();toggleNoTF(name);}} className="xt-btn xt-chip" style={{
                padding:'5px 10px', borderRadius:8, cursor:'pointer',
                border:`0.5px solid ${active ? CONF_COLORS.noTF+'60' : C.sep}`,
                background: active ? `${CONF_COLORS.noTF}22` : C.glass3,
                color: active ? CONF_COLORS.noTF : C.secondary,
                fontSize:11, fontFamily:FONT.mono, fontWeight:700,
              }}>{name}</button>
            );
          })}
        </div>
      </div>

    </GlassInset>
  );
};

/* ============= MARKDOWN MINI RENDER ============= */
// Supporta **bold**, *italic*, - bullet, [text](url)
const renderMarkdown = (text, C) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    let html = line
      .replace(/\*\*(.+?)\*\*/g, `<strong style="color:${C.primary};font-weight:600">$1</strong>`)
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, `<a href="$2" target="_blank" rel="noopener" style="color:${C.cyan};text-decoration:underline">$1</a>`);
    if (line.trim().startsWith('- ')) {
      html = `<span style="color:${C.tertiary}">•</span> ` + html.replace(/^- /, '');
    }
    return <div key={i} dangerouslySetInnerHTML={{__html: html || '&nbsp;'}}/>;
  });
};

const detectStreak = (trades) => {
  let streak = 0; let type = null;
  const sorted = [...trades].sort((a,b)=>b.id - a.id);
  for (const t of sorted) {
    if (t.pnl === 0) continue;
    const isWin = t.pnl > 0;
    if (type === null) { type = isWin; streak = 1; }
    else if (type === isWin) streak++;
    else break;
  }
  return { streak, isWin: type };
};

// Cooldown: dopo 2 trade loss consecutivi (un trade = un basket, anche con scaglioni multipli conta come 1)
const detectCooldown = (trades) => {
  // Aggrega per basket
  const baskets = {};
  trades.forEach(t => {
    if (!baskets[t.basket]) baskets[t.basket] = { pnl: 0, date: t.date, id: t.id };
    baskets[t.basket].pnl += t.pnl;
    if (t.id > baskets[t.basket].id) baskets[t.basket].id = t.id;
  });
  const list = Object.values(baskets).sort((a,b)=>b.id - a.id);
  let count = 0;
  for (const b of list) {
    if (b.pnl < 0) count++;
    else break;
  }
  return count >= 2;
};

// Daily target check
const checkDailyTarget = (todayTrades, target) => {
  const pnl = todayTrades.reduce((s,t)=>s+(t.pnl||0), 0);
  return { reached: pnl >= target && target > 0, pnl };
};

/* ============= APP ICONS ============= */
const AppIcon = ({ children, gradient, active, size = 32 }) => (
  <div style={{
    width: size, height: size,
    borderRadius: size * 0.32,
    background: gradient,
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow: active
      ? `0 0 0 0.5px rgba(255,255,255,0.18), 0 4px 12px rgba(0,0,0,0.5)`
      : `0 0 0 0.5px rgba(255,255,255,0.08)`,
    transition:'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
    transform: active ? 'scale(1)' : 'scale(0.92)',
    flexShrink: 0,
  }}>
    {children}
  </div>
);

const IconToday = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill={color}/>
  </svg>
);
const IconHistory = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="2.5" stroke={color} strokeWidth="2"/>
    <path d="M3 9h18M8 3v4M16 3v4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="14" r="1.4" fill={color}/>
    <circle cx="15" cy="14" r="1.4" fill={color}/>
  </svg>
);
const IconStats = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect x="3"  y="11" width="4" height="10" rx="1.2" fill={color}/>
    <rect x="10" y="6"  width="4" height="15" rx="1.2" fill={color}/>
    <rect x="17" y="2"  width="4" height="19" rx="1.2" fill={color}/>
  </svg>
);

const IconAnalytics = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="6"  cy="18" r="2" fill={color}/>
    <circle cx="12" cy="12" r="2" fill={color}/>
    <circle cx="18" cy="6"  r="2" fill={color}/>
    <path d="M6 16l6-4 6-6" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* IconAI — orb "pensante" con puntini bianchi/grigi.
   Pattern: cerchio outer + diversi nodi interni distribuiti, varie tonalità.
   Niente colore vivo: solo grigi/bianchi per essere "neutra" come chiesto. */
const IconAI = ({ color = "#FFFFFF" } = {}) => (
  <svg width="34" height="34" viewBox="0 0 32 32" overflow="hidden" style={{ color }}>
    {/* Sfera di particelle — ~400 puntini bianchi piccoli distribuiti */}
    <circle cx="7.56" cy="18.6" r="0.38" fill="currentColor" opacity="0.76"/>
    <circle cx="6.97" cy="15.55" r="0.18" fill="currentColor" opacity="0.78"/>
    <circle cx="8.8" cy="8.35" r="0.16" fill="currentColor" opacity="0.69"/>
    <circle cx="24.94" cy="21.73" r="0.28" fill="currentColor" opacity="0.57"/>
    <circle cx="27.52" cy="14.71" r="0.28" fill="currentColor" opacity="0.83"/>
    <circle cx="16.79" cy="17.21" r="0.22" fill="currentColor" opacity="0.58"/>
    <circle cx="18.13" cy="21.4" r="0.14" fill="currentColor" opacity="0.76"/>
    <circle cx="5.92" cy="19.95" r="0.22" fill="currentColor" opacity="0.84"/>
    <circle cx="6.4" cy="16.01" r="0.20" fill="currentColor" opacity="0.68"/>
    <circle cx="27.77" cy="15.83" r="0.30" fill="currentColor" opacity="0.87"/>
    <circle cx="13.75" cy="21.19" r="0.18" fill="currentColor" opacity="0.58"/>
    <circle cx="16.76" cy="8.57" r="0.30" fill="currentColor" opacity="0.72"/>
    <circle cx="26.49" cy="13.17" r="0.14" fill="currentColor" opacity="0.64"/>
    <circle cx="22.84" cy="11.68" r="0.32" fill="currentColor" opacity="0.73"/>
    <circle cx="24.39" cy="20.15" r="0.28" fill="currentColor" opacity="0.67"/>
    <circle cx="21.81" cy="19.54" r="0.32" fill="currentColor" opacity="0.89"/>
    <circle cx="20.32" cy="19.96" r="0.16" fill="currentColor" opacity="0.58"/>
    <circle cx="17.45" cy="11.24" r="0.22" fill="currentColor" opacity="0.75"/>
    <circle cx="19.68" cy="25.4" r="0.16" fill="currentColor" opacity="0.84"/>
    <circle cx="21.69" cy="21.12" r="0.18" fill="currentColor" opacity="0.67"/>
    <circle cx="26.4" cy="14.08" r="0.18" fill="currentColor" opacity="0.95"/>
    <circle cx="17.81" cy="23.18" r="0.30" fill="currentColor" opacity="0.84"/>
    <circle cx="25.48" cy="22.92" r="0.18" fill="currentColor" opacity="0.67"/>
    <circle cx="16.96" cy="9.3" r="0.18" fill="currentColor" opacity="0.58"/>
    <circle cx="23.6" cy="20.83" r="0.16" fill="currentColor" opacity="0.82"/>
    <circle cx="10.5" cy="21.73" r="0.32" fill="currentColor" opacity="0.77"/>
    <circle cx="6.2" cy="11.04" r="0.18" fill="currentColor" opacity="0.62"/>
    <circle cx="24.95" cy="10.19" r="0.16" fill="currentColor" opacity="0.64"/>
    <circle cx="15.24" cy="4.58" r="0.18" fill="currentColor" opacity="0.98"/>
    <circle cx="22.77" cy="9.82" r="0.20" fill="currentColor" opacity="0.6"/>
    <circle cx="27.24" cy="18.79" r="0.16" fill="currentColor" opacity="0.87"/>
    <circle cx="15.53" cy="26.7" r="0.24" fill="currentColor" opacity="0.68"/>
    <circle cx="20.52" cy="24.94" r="0.14" fill="currentColor" opacity="0.65"/>
    <circle cx="5.85" cy="12.03" r="0.24" fill="currentColor" opacity="0.68"/>
    <circle cx="20.63" cy="13.36" r="0.14" fill="currentColor" opacity="0.67"/>
    <circle cx="13.27" cy="16.97" r="0.16" fill="currentColor" opacity="0.72"/>
    <circle cx="12.15" cy="14.12" r="0.18" fill="currentColor" opacity="0.95"/>
    <circle cx="25.49" cy="14.83" r="0.26" fill="currentColor" opacity="0.81"/>
    <circle cx="17.41" cy="17.71" r="0.14" fill="currentColor" opacity="0.96"/>
    <circle cx="12.49" cy="4.97" r="0.14" fill="currentColor" opacity="0.84"/>
    <circle cx="5.98" cy="17.12" r="0.18" fill="currentColor" opacity="1.0"/>
    <circle cx="23.76" cy="19.97" r="0.26" fill="currentColor" opacity="0.96"/>
    <circle cx="15.2" cy="6.13" r="0.28" fill="currentColor" opacity="0.96"/>
    <circle cx="10.17" cy="23.84" r="0.30" fill="currentColor" opacity="0.94"/>
    <circle cx="6.9" cy="21.22" r="0.28" fill="currentColor" opacity="0.81"/>
    <circle cx="10.84" cy="10.84" r="0.22" fill="currentColor" opacity="0.82"/>
    <circle cx="24.26" cy="20.56" r="0.32" fill="currentColor" opacity="0.95"/>
    <circle cx="15.0" cy="8.71" r="0.26" fill="currentColor" opacity="0.81"/>
    <circle cx="5.94" cy="19.94" r="0.14" fill="currentColor" opacity="0.89"/>
    <circle cx="24.99" cy="17.7" r="0.20" fill="currentColor" opacity="0.65"/>
    <circle cx="13.35" cy="8.11" r="0.24" fill="currentColor" opacity="0.96"/>
    <circle cx="15.95" cy="17.25" r="0.18" fill="currentColor" opacity="0.86"/>
    <circle cx="17.43" cy="20.65" r="0.30" fill="currentColor" opacity="0.85"/>
    <circle cx="5.59" cy="19.98" r="0.18" fill="currentColor" opacity="0.85"/>
    <circle cx="18.46" cy="23.34" r="0.28" fill="currentColor" opacity="0.96"/>
    <circle cx="21.34" cy="11.0" r="0.22" fill="currentColor" opacity="0.69"/>
    <circle cx="21.45" cy="22.28" r="0.28" fill="currentColor" opacity="0.93"/>
    <circle cx="13.23" cy="4.84" r="0.16" fill="currentColor" opacity="0.63"/>
    <circle cx="10.11" cy="17.89" r="0.16" fill="currentColor" opacity="0.74"/>
    <circle cx="10.16" cy="10.11" r="0.18" fill="currentColor" opacity="0.93"/>
    <circle cx="23.89" cy="15.11" r="0.14" fill="currentColor" opacity="0.56"/>
    <circle cx="17.68" cy="14.28" r="0.26" fill="currentColor" opacity="0.81"/>
    <circle cx="12.19" cy="25.78" r="0.14" fill="currentColor" opacity="0.61"/>
    <circle cx="14.22" cy="16.52" r="0.28" fill="currentColor" opacity="0.66"/>
    <circle cx="17.62" cy="17.98" r="0.24" fill="currentColor" opacity="0.75"/>
    <circle cx="9.46" cy="9.04" r="0.28" fill="currentColor" opacity="0.98"/>
    <circle cx="13.89" cy="11.17" r="0.20" fill="currentColor" opacity="0.63"/>
    <circle cx="24.09" cy="16.55" r="0.26" fill="currentColor" opacity="0.63"/>
    <circle cx="15.03" cy="22.87" r="0.26" fill="currentColor" opacity="0.78"/>
    <circle cx="8.28" cy="9.24" r="0.20" fill="currentColor" opacity="0.91"/>
    <circle cx="18.9" cy="14.06" r="0.30" fill="currentColor" opacity="0.88"/>
    <circle cx="21.44" cy="21.79" r="0.24" fill="currentColor" opacity="0.96"/>
    <circle cx="9.64" cy="22.22" r="0.28" fill="currentColor" opacity="0.91"/>
    <circle cx="23.55" cy="13.24" r="0.24" fill="currentColor" opacity="0.64"/>
    <circle cx="14.13" cy="5.49" r="0.24" fill="currentColor" opacity="0.87"/>
    <circle cx="18.56" cy="26.9" r="0.32" fill="currentColor" opacity="0.99"/>
    <circle cx="5.79" cy="13.59" r="0.18" fill="currentColor" opacity="0.96"/>
    <circle cx="20.3" cy="10.52" r="0.14" fill="currentColor" opacity="0.75"/>
    <circle cx="6.17" cy="12.79" r="0.20" fill="currentColor" opacity="0.56"/>
    <circle cx="17.08" cy="13.22" r="0.28" fill="currentColor" opacity="0.63"/>
    <circle cx="10.67" cy="25.02" r="0.16" fill="currentColor" opacity="0.62"/>
    <circle cx="6.02" cy="14.96" r="0.28" fill="currentColor" opacity="0.86"/>
    <circle cx="23.81" cy="13.23" r="0.30" fill="currentColor" opacity="0.59"/>
    <circle cx="17.53" cy="24.43" r="0.18" fill="currentColor" opacity="0.88"/>
    <circle cx="10.52" cy="9.46" r="0.28" fill="currentColor" opacity="0.8"/>
    <circle cx="13.25" cy="22.75" r="0.28" fill="currentColor" opacity="0.96"/>
    <circle cx="18.82" cy="26.51" r="0.30" fill="currentColor" opacity="0.79"/>
    <circle cx="11.26" cy="13.66" r="0.22" fill="currentColor" opacity="0.78"/>
    <circle cx="14.45" cy="14.79" r="0.30" fill="currentColor" opacity="0.78"/>
    <circle cx="7.43" cy="22.18" r="0.22" fill="currentColor" opacity="0.77"/>
    <circle cx="14.9" cy="13.18" r="0.22" fill="currentColor" opacity="0.74"/>
    <circle cx="26.93" cy="12.96" r="0.16" fill="currentColor" opacity="0.76"/>
    <circle cx="21.43" cy="21.56" r="0.28" fill="currentColor" opacity="0.96"/>
    <circle cx="9.43" cy="16.98" r="0.16" fill="currentColor" opacity="0.83"/>
    <circle cx="19.79" cy="14.08" r="0.28" fill="currentColor" opacity="0.56"/>
    <circle cx="17.94" cy="21.28" r="0.24" fill="currentColor" opacity="0.69"/>
    <circle cx="10.29" cy="23.33" r="0.14" fill="currentColor" opacity="0.88"/>
    <circle cx="22.04" cy="21.88" r="0.16" fill="currentColor" opacity="0.64"/>
    <circle cx="8.34" cy="14.52" r="0.18" fill="currentColor" opacity="0.74"/>
    <circle cx="11.36" cy="15.14" r="0.16" fill="currentColor" opacity="0.83"/>
    <circle cx="10.46" cy="9.44" r="0.28" fill="currentColor" opacity="0.83"/>
    <circle cx="19.54" cy="11.54" r="0.26" fill="currentColor" opacity="0.91"/>
    <circle cx="21.43" cy="12.19" r="0.18" fill="currentColor" opacity="0.97"/>
    <circle cx="18.34" cy="27.55" r="0.28" fill="currentColor" opacity="0.61"/>
    <circle cx="16.67" cy="26.04" r="0.16" fill="currentColor" opacity="0.59"/>
    <circle cx="19.78" cy="9.34" r="0.26" fill="currentColor" opacity="0.61"/>
    <circle cx="8.0" cy="21.6" r="0.14" fill="currentColor" opacity="0.64"/>
    <circle cx="11.36" cy="5.74" r="0.30" fill="currentColor" opacity="0.6"/>
    <circle cx="5.73" cy="15.63" r="0.20" fill="currentColor" opacity="0.86"/>
    <circle cx="17.17" cy="18.91" r="0.14" fill="currentColor" opacity="0.57"/>
    <circle cx="7.98" cy="13.3" r="0.22" fill="currentColor" opacity="0.62"/>
    <circle cx="18.13" cy="20.88" r="0.28" fill="currentColor" opacity="1.0"/>
    <circle cx="19.26" cy="14.39" r="0.14" fill="currentColor" opacity="0.98"/>
    <circle cx="5.97" cy="18.44" r="0.18" fill="currentColor" opacity="0.76"/>
    <circle cx="8.3" cy="15.26" r="0.24" fill="currentColor" opacity="0.56"/>
    <circle cx="12.72" cy="5.67" r="0.16" fill="currentColor" opacity="0.75"/>
    <circle cx="15.5" cy="8.5" r="0.16" fill="currentColor" opacity="0.62"/>
    <circle cx="14.54" cy="15.88" r="0.28" fill="currentColor" opacity="0.91"/>
    <circle cx="12.92" cy="5.49" r="0.24" fill="currentColor" opacity="0.73"/>
    <circle cx="9.21" cy="11.09" r="0.30" fill="currentColor" opacity="0.91"/>
    <circle cx="15.42" cy="27.25" r="0.26" fill="currentColor" opacity="0.9"/>
    <circle cx="18.97" cy="9.1" r="0.28" fill="currentColor" opacity="0.95"/>
    <circle cx="12.49" cy="6.28" r="0.26" fill="currentColor" opacity="0.73"/>
    <circle cx="15.46" cy="12.91" r="0.18" fill="currentColor" opacity="0.76"/>
    <circle cx="23.02" cy="16.47" r="0.24" fill="currentColor" opacity="0.83"/>
    <circle cx="17.29" cy="27.4" r="0.24" fill="currentColor" opacity="0.7"/>
    <circle cx="11.22" cy="8.49" r="0.22" fill="currentColor" opacity="0.73"/>
    <circle cx="25.46" cy="15.99" r="0.26" fill="currentColor" opacity="0.89"/>
    <circle cx="17.77" cy="15.78" r="0.24" fill="currentColor" opacity="0.88"/>
    <circle cx="15.69" cy="23.47" r="0.14" fill="currentColor" opacity="0.64"/>
    <circle cx="13.37" cy="18.61" r="0.16" fill="currentColor" opacity="0.96"/>
    <circle cx="8.0" cy="13.4" r="0.30" fill="currentColor" opacity="0.81"/>
    <circle cx="25.42" cy="15.71" r="0.28" fill="currentColor" opacity="0.58"/>
    <circle cx="7.59" cy="10.09" r="0.14" fill="currentColor" opacity="0.97"/>
    <circle cx="20.35" cy="22.84" r="0.16" fill="currentColor" opacity="0.77"/>
    <circle cx="13.81" cy="14.16" r="0.30" fill="currentColor" opacity="0.74"/>
    <circle cx="7.0" cy="14.47" r="0.18" fill="currentColor" opacity="0.68"/>
    <circle cx="11.04" cy="8.69" r="0.16" fill="currentColor" opacity="0.87"/>
    <circle cx="15.6" cy="17.34" r="0.16" fill="currentColor" opacity="0.57"/>
    <circle cx="21.68" cy="24.54" r="0.18" fill="currentColor" opacity="0.95"/>
    <circle cx="26.32" cy="16.26" r="0.20" fill="currentColor" opacity="0.93"/>
    <circle cx="28.36" cy="16.58" r="0.16" fill="currentColor" opacity="0.71"/>
    <circle cx="26.51" cy="18.43" r="0.16" fill="currentColor" opacity="0.92"/>
    <circle cx="26.85" cy="19.25" r="0.20" fill="currentColor" opacity="0.87"/>
    <circle cx="25.77" cy="19.78" r="0.18" fill="currentColor" opacity="0.71"/>
    <circle cx="25.43" cy="20.2" r="0.16" fill="currentColor" opacity="0.56"/>
    <circle cx="26.17" cy="22.0" r="0.16" fill="currentColor" opacity="0.62"/>
    <circle cx="25.01" cy="22.66" r="0.18" fill="currentColor" opacity="0.74"/>
    <circle cx="24.98" cy="24.67" r="0.18" fill="currentColor" opacity="0.61"/>
    <circle cx="24.87" cy="24.59" r="0.18" fill="currentColor" opacity="0.78"/>
    <circle cx="22.88" cy="24.39" r="0.18" fill="currentColor" opacity="0.75"/>
    <circle cx="22.37" cy="25.84" r="0.18" fill="currentColor" opacity="0.59"/>
    <circle cx="22.22" cy="26.9" r="0.20" fill="currentColor" opacity="0.9"/>
    <circle cx="20.5" cy="25.32" r="0.14" fill="currentColor" opacity="0.69"/>
    <circle cx="19.11" cy="25.97" r="0.16" fill="currentColor" opacity="0.53"/>
    <circle cx="19.11" cy="27.41" r="0.16" fill="currentColor" opacity="0.78"/>
    <circle cx="17.67" cy="27.23" r="0.14" fill="currentColor" opacity="0.65"/>
    <circle cx="16.25" cy="28.21" r="0.14" fill="currentColor" opacity="0.55"/>
    <circle cx="15.11" cy="27.66" r="0.18" fill="currentColor" opacity="0.6"/>
    <circle cx="14.63" cy="26.73" r="0.18" fill="currentColor" opacity="0.67"/>
    <circle cx="13.01" cy="28.21" r="0.16" fill="currentColor" opacity="0.75"/>
    <circle cx="11.88" cy="27.7" r="0.16" fill="currentColor" opacity="0.67"/>
    <circle cx="11.63" cy="27.5" r="0.14" fill="currentColor" opacity="0.54"/>
    <circle cx="10.55" cy="25.97" r="0.18" fill="currentColor" opacity="0.63"/>
    <circle cx="10.04" cy="24.5" r="0.14" fill="currentColor" opacity="0.8"/>
    <circle cx="9.55" cy="24.82" r="0.18" fill="currentColor" opacity="0.81"/>
    <circle cx="8.88" cy="23.78" r="0.16" fill="currentColor" opacity="0.83"/>
    <circle cx="8.2" cy="23.0" r="0.18" fill="currentColor" opacity="0.76"/>
    <circle cx="5.63" cy="22.89" r="0.20" fill="currentColor" opacity="0.7"/>
    <circle cx="6.45" cy="21.32" r="0.14" fill="currentColor" opacity="0.68"/>
    <circle cx="4.65" cy="20.87" r="0.14" fill="currentColor" opacity="0.66"/>
    <circle cx="5.69" cy="20.03" r="0.16" fill="currentColor" opacity="0.67"/>
    <circle cx="4.96" cy="19.41" r="0.18" fill="currentColor" opacity="0.74"/>
    <circle cx="4.57" cy="17.68" r="0.14" fill="currentColor" opacity="0.84"/>
    <circle cx="5.14" cy="16.56" r="0.14" fill="currentColor" opacity="0.73"/>
    <circle cx="4.44" cy="15.95" r="0.20" fill="currentColor" opacity="0.79"/>
    <circle cx="5.72" cy="14.76" r="0.16" fill="currentColor" opacity="0.85"/>
    <circle cx="5.7" cy="14.57" r="0.18" fill="currentColor" opacity="0.9"/>
    <circle cx="4.58" cy="13.35" r="0.14" fill="currentColor" opacity="0.84"/>
    <circle cx="5.96" cy="12.06" r="0.14" fill="currentColor" opacity="0.84"/>
    <circle cx="5.17" cy="10.75" r="0.16" fill="currentColor" opacity="0.65"/>
    <circle cx="6.15" cy="9.47" r="0.16" fill="currentColor" opacity="0.74"/>
    <circle cx="6.53" cy="8.79" r="0.20" fill="currentColor" opacity="0.68"/>
    <circle cx="7.37" cy="7.95" r="0.18" fill="currentColor" opacity="0.86"/>
    <circle cx="7.78" cy="6.81" r="0.20" fill="currentColor" opacity="0.79"/>
    <circle cx="8.6" cy="6.68" r="0.18" fill="currentColor" opacity="0.69"/>
    <circle cx="10.12" cy="7.24" r="0.18" fill="currentColor" opacity="0.95"/>
    <circle cx="10.86" cy="6.73" r="0.14" fill="currentColor" opacity="0.69"/>
    <circle cx="10.84" cy="4.59" r="0.14" fill="currentColor" opacity="0.64"/>
    <circle cx="11.94" cy="4.97" r="0.18" fill="currentColor" opacity="0.58"/>
    <circle cx="13.01" cy="5.1" r="0.16" fill="currentColor" opacity="0.91"/>
    <circle cx="14.12" cy="5.71" r="0.14" fill="currentColor" opacity="0.6"/>
    <circle cx="15.15" cy="4.11" r="0.16" fill="currentColor" opacity="0.6"/>
    <circle cx="16.15" cy="5.13" r="0.14" fill="currentColor" opacity="0.84"/>
    <circle cx="17.33" cy="4.56" r="0.18" fill="currentColor" opacity="0.72"/>
    <circle cx="18.45" cy="3.92" r="0.20" fill="currentColor" opacity="0.65"/>
    <circle cx="19.92" cy="4.13" r="0.16" fill="currentColor" opacity="0.6"/>
    <circle cx="20.38" cy="4.32" r="0.18" fill="currentColor" opacity="0.67"/>
    <circle cx="21.45" cy="5.94" r="0.14" fill="currentColor" opacity="0.95"/>
    <circle cx="22.07" cy="7.11" r="0.14" fill="currentColor" opacity="0.71"/>
    <circle cx="23.43" cy="6.43" r="0.18" fill="currentColor" opacity="0.77"/>
    <circle cx="23.04" cy="8.11" r="0.16" fill="currentColor" opacity="0.62"/>
    <circle cx="24.89" cy="8.8" r="0.18" fill="currentColor" opacity="0.95"/>
    <circle cx="25.13" cy="9.04" r="0.14" fill="currentColor" opacity="0.85"/>
    <circle cx="26.12" cy="9.24" r="0.18" fill="currentColor" opacity="0.87"/>
    <circle cx="25.57" cy="10.89" r="0.18" fill="currentColor" opacity="0.54"/>
    <circle cx="26.59" cy="12.0" r="0.20" fill="currentColor" opacity="0.76"/>
    <circle cx="26.63" cy="13.47" r="0.18" fill="currentColor" opacity="0.69"/>
    <circle cx="26.32" cy="14.57" r="0.18" fill="currentColor" opacity="0.59"/>
    <circle cx="27.42" cy="15.02" r="0.14" fill="currentColor" opacity="0.87"/>
    <circle cx="10.86" cy="28.67" r="0.12" fill="currentColor" opacity="0.5"/>
    <circle cx="1.51" cy="19.03" r="0.14" fill="currentColor" opacity="0.65"/>
    <circle cx="26.95" cy="24.57" r="0.14" fill="currentColor" opacity="0.77"/>
    <circle cx="23.03" cy="3.17" r="0.12" fill="currentColor" opacity="0.53"/>
    <circle cx="12.65" cy="2.96" r="0.14" fill="currentColor" opacity="0.56"/>
    <circle cx="31.54" cy="17.02" r="0.16" fill="currentColor" opacity="0.46"/>
    <circle cx="5.85" cy="6.93" r="0.14" fill="currentColor" opacity="0.6"/>
    <circle cx="11.9" cy="29.12" r="0.14" fill="currentColor" opacity="0.65"/>
    <circle cx="15.46" cy="29.35" r="0.16" fill="currentColor" opacity="0.51"/>
    <circle cx="29.53" cy="11.13" r="0.16" fill="currentColor" opacity="0.51"/>
    <circle cx="22.07" cy="4.44" r="0.12" fill="currentColor" opacity="0.42"/>
    <circle cx="9.51" cy="2.72" r="0.12" fill="currentColor" opacity="0.54"/>
    <circle cx="23.51" cy="3.64" r="0.12" fill="currentColor" opacity="0.47"/>
    <circle cx="23.25" cy="26.97" r="0.14" fill="currentColor" opacity="0.41"/>
    <circle cx="28.29" cy="9.31" r="0.14" fill="currentColor" opacity="0.64"/>
    <circle cx="17.6" cy="0.99" r="0.14" fill="currentColor" opacity="0.51"/>
    <circle cx="5.06" cy="22.74" r="0.14" fill="currentColor" opacity="0.66"/>
    <circle cx="30.91" cy="14.3" r="0.16" fill="currentColor" opacity="0.62"/>
    <circle cx="29.63" cy="17.6" r="0.14" fill="currentColor" opacity="0.64"/>
    <circle cx="26.88" cy="24.58" r="0.14" fill="currentColor" opacity="0.7"/>
    <circle cx="22.6" cy="3.08" r="0.12" fill="currentColor" opacity="0.69"/>
    <circle cx="27.75" cy="7.79" r="0.14" fill="currentColor" opacity="0.58"/>
    <circle cx="25.31" cy="27.51" r="0.18" fill="currentColor" opacity="0.59"/>
    <circle cx="12.73" cy="1.22" r="0.12" fill="currentColor" opacity="0.76"/>
    <circle cx="6.68" cy="6.43" r="0.12" fill="currentColor" opacity="0.48"/>
    <circle cx="2.92" cy="9.18" r="0.14" fill="currentColor" opacity="0.75"/>
    <circle cx="6.93" cy="26.79" r="0.12" fill="currentColor" opacity="0.77"/>
    <circle cx="26.1" cy="27.54" r="0.14" fill="currentColor" opacity="0.6"/>
    <circle cx="3.42" cy="10.99" r="0.18" fill="currentColor" opacity="0.78"/>
    <circle cx="21.96" cy="2.8" r="0.12" fill="currentColor" opacity="0.71"/>
    <circle cx="12.32" cy="30.86" r="0.12" fill="currentColor" opacity="0.61"/>
    <circle cx="22.47" cy="4.36" r="0.14" fill="currentColor" opacity="0.41"/>
    <circle cx="29.04" cy="18.66" r="0.18" fill="currentColor" opacity="0.76"/>
    <circle cx="8.56" cy="4.54" r="0.16" fill="currentColor" opacity="0.68"/>
    <circle cx="5.36" cy="25.79" r="0.16" fill="currentColor" opacity="0.39"/>
    <circle cx="20.4" cy="29.41" r="0.12" fill="currentColor" opacity="0.53"/>
    <circle cx="3.96" cy="10.38" r="0.14" fill="currentColor" opacity="0.49"/>
    <circle cx="3.51" cy="10.31" r="0.16" fill="currentColor" opacity="0.4"/>
    <circle cx="9.71" cy="4.39" r="0.18" fill="currentColor" opacity="0.62"/>
    <circle cx="2.3" cy="18.62" r="0.14" fill="currentColor" opacity="0.66"/>
    <circle cx="16.75" cy="1.11" r="0.14" fill="currentColor" opacity="0.78"/>
    <circle cx="24.0" cy="3.08" r="0.14" fill="currentColor" opacity="0.55"/>
    <circle cx="1.96" cy="9.82" r="0.14" fill="currentColor" opacity="0.59"/>
    <circle cx="2.04" cy="22.33" r="0.12" fill="currentColor" opacity="0.4"/>
    <circle cx="13.66" cy="0.86" r="0.16" fill="currentColor" opacity="0.62"/>
    {/* Extra dots — strato aggiuntivo denso */}
    <circle cx="9.0" cy="16.0" r="0.15" fill="currentColor" opacity="0.72"/>
    <circle cx="11.5" cy="19.5" r="0.13" fill="currentColor" opacity="0.65"/>
    <circle cx="14.0" cy="20.0" r="0.17" fill="currentColor" opacity="0.8"/>
    <circle cx="19.0" cy="18.0" r="0.14" fill="currentColor" opacity="0.7"/>
    <circle cx="22.0" cy="15.0" r="0.16" fill="currentColor" opacity="0.6"/>
    <circle cx="18.0" cy="12.0" r="0.13" fill="currentColor" opacity="0.75"/>
    <circle cx="12.0" cy="12.0" r="0.15" fill="currentColor" opacity="0.82"/>
    <circle cx="16.0" cy="14.0" r="0.12" fill="currentColor" opacity="0.9"/>
    <circle cx="20.0" cy="16.0" r="0.14" fill="currentColor" opacity="0.68"/>
    <circle cx="10.0" cy="14.0" r="0.16" fill="currentColor" opacity="0.77"/>
    <circle cx="23.0" cy="18.0" r="0.13" fill="currentColor" opacity="0.63"/>
    <circle cx="15.0" cy="18.0" r="0.15" fill="currentColor" opacity="0.85"/>
    <circle cx="9.5" cy="12.5" r="0.12" fill="currentColor" opacity="0.7"/>
    <circle cx="19.5" cy="22.5" r="0.14" fill="currentColor" opacity="0.6"/>
    <circle cx="13.5" cy="10.0" r="0.16" fill="currentColor" opacity="0.73"/>
    <circle cx="22.5" cy="9.0" r="0.13" fill="currentColor" opacity="0.8"/>
    <circle cx="7.5" cy="17.5" r="0.15" fill="currentColor" opacity="0.65"/>
    <circle cx="24.5" cy="12.0" r="0.14" fill="currentColor" opacity="0.72"/>
    <circle cx="11.0" cy="22.5" r="0.16" fill="currentColor" opacity="0.58"/>
    <circle cx="20.5" cy="7.5" r="0.13" fill="currentColor" opacity="0.67"/>
    <circle cx="16.5" cy="25.0" r="0.15" fill="currentColor" opacity="0.76"/>
    <circle cx="8.5" cy="10.5" r="0.14" fill="currentColor" opacity="0.89"/>
    <circle cx="25.0" cy="16.5" r="0.12" fill="currentColor" opacity="0.61"/>
    <circle cx="14.5" cy="8.0" r="0.16" fill="currentColor" opacity="0.74"/>
    <circle cx="21.0" cy="25.5" r="0.13" fill="currentColor" opacity="0.55"/>
    <circle cx="6.5" cy="13.0" r="0.15" fill="currentColor" opacity="0.79"/>
    <circle cx="26.0" cy="20.0" r="0.14" fill="currentColor" opacity="0.64"/>
    <circle cx="12.5" cy="24.0" r="0.16" fill="currentColor" opacity="0.71"/>
    <circle cx="18.5" cy="7.0" r="0.13" fill="currentColor" opacity="0.83"/>
    <circle cx="9.0" cy="20.5" r="0.15" fill="currentColor" opacity="0.68"/>
    <circle cx="23.5" cy="22.0" r="0.14" fill="currentColor" opacity="0.57"/>
    <circle cx="15.5" cy="11.0" r="0.12" fill="currentColor" opacity="0.91"/>
    <circle cx="20.0" cy="11.0" r="0.16" fill="currentColor" opacity="0.66"/>
    <circle cx="7.0" cy="16.5" r="0.13" fill="currentColor" opacity="0.78"/>
    <circle cx="24.0" cy="23.5" r="0.15" fill="currentColor" opacity="0.53"/>
    <circle cx="13.0" cy="7.0" r="0.14" fill="currentColor" opacity="0.86"/>
    <circle cx="22.0" cy="6.0" r="0.16" fill="currentColor" opacity="0.69"/>
    <circle cx="10.0" cy="26.5" r="0.13" fill="currentColor" opacity="0.62"/>
    <circle cx="19.0" cy="29.0" r="0.15" fill="currentColor" opacity="0.48"/>
    <circle cx="6.0" cy="23.5" r="0.14" fill="currentColor" opacity="0.73"/>
    <circle cx="27.0" cy="11.0" r="0.16" fill="currentColor" opacity="0.59"/>
    <circle cx="14.0" cy="28.5" r="0.13" fill="currentColor" opacity="0.55"/>
    <circle cx="21.0" cy="3.5" r="0.15" fill="currentColor" opacity="0.7"/>
    <circle cx="8.0" cy="7.0" r="0.14" fill="currentColor" opacity="0.82"/>
    <circle cx="25.5" cy="8.0" r="0.16" fill="currentColor" opacity="0.65"/>
    <circle cx="11.5" cy="3.5" r="0.13" fill="currentColor" opacity="0.77"/>
    <circle cx="17.0" cy="3.0" r="0.15" fill="currentColor" opacity="0.68"/>
    <circle cx="28.0" cy="14.0" r="0.14" fill="currentColor" opacity="0.56"/>
    <circle cx="3.0" cy="15.0" r="0.16" fill="currentColor" opacity="0.71"/>
    <circle cx="29.0" cy="20.0" r="0.13" fill="currentColor" opacity="0.49"/>
    <circle cx="4.0" cy="12.0" r="0.15" fill="currentColor" opacity="0.74"/>
    <circle cx="28.5" cy="22.0" r="0.14" fill="currentColor" opacity="0.43"/>
    <circle cx="2.5" cy="14.0" r="0.16" fill="currentColor" opacity="0.67"/>
    <circle cx="30.0" cy="16.0" r="0.13" fill="currentColor" opacity="0.52"/>
    <circle cx="1.5" cy="16.0" r="0.15" fill="currentColor" opacity="0.6"/>
    <circle cx="16.0" cy="30.5" r="0.14" fill="currentColor" opacity="0.44"/>
    <circle cx="16.0" cy="1.5" r="0.16" fill="currentColor" opacity="0.7"/>
    <circle cx="9.3" cy="18.2" r="0.13" fill="currentColor" opacity="0.69"/>
    <circle cx="14.8" cy="16.8" r="0.15" fill="currentColor" opacity="0.77"/>
    <circle cx="18.6" cy="15.5" r="0.12" fill="currentColor" opacity="0.85"/>
    <circle cx="11.8" cy="16.3" r="0.14" fill="currentColor" opacity="0.71"/>
    <circle cx="20.8" cy="13.5" r="0.16" fill="currentColor" opacity="0.63"/>
    <circle cx="13.6" cy="19.3" r="0.13" fill="currentColor" opacity="0.79"/>
    <circle cx="17.0" cy="20.0" r="0.15" fill="currentColor" opacity="0.67"/>
    <circle cx="10.4" cy="12.8" r="0.14" fill="currentColor" opacity="0.86"/>
    <circle cx="22.5" cy="17.5" r="0.16" fill="currentColor" opacity="0.58"/>
    <circle cx="15.8" cy="13.5" r="0.13" fill="currentColor" opacity="0.92"/>
    <circle cx="19.3" cy="20.5" r="0.15" fill="currentColor" opacity="0.64"/>
    <circle cx="12.8" cy="18.2" r="0.14" fill="currentColor" opacity="0.75"/>
    <circle cx="21.2" cy="14.8" r="0.16" fill="currentColor" opacity="0.7"/>
    <circle cx="8.6" cy="18.8" r="0.13" fill="currentColor" opacity="0.8"/>
    <circle cx="16.4" cy="22.0" r="0.15" fill="currentColor" opacity="0.6"/>
    <circle cx="11.2" cy="11.5" r="0.14" fill="currentColor" opacity="0.88"/>
    <circle cx="24.2" cy="17.0" r="0.16" fill="currentColor" opacity="0.53"/>
    <circle cx="14.6" cy="23.5" r="0.13" fill="currentColor" opacity="0.72"/>
    <circle cx="20.6" cy="8.0" r="0.15" fill="currentColor" opacity="0.78"/>
    <circle cx="7.8" cy="11.5" r="0.14" fill="currentColor" opacity="0.83"/>
    <circle cx="23.8" cy="10.5" r="0.16" fill="currentColor" opacity="0.61"/>
    <circle cx="12.4" cy="26.5" r="0.13" fill="currentColor" opacity="0.57"/>
    <circle cx="18.8" cy="24.0" r="0.15" fill="currentColor" opacity="0.69"/>
    <circle cx="9.8" cy="8.0" r="0.14" fill="currentColor" opacity="0.9"/>
    <circle cx="22.2" cy="23.0" r="0.16" fill="currentColor" opacity="0.54"/>
    <circle cx="15.2" cy="10.5" r="0.13" fill="currentColor" opacity="0.84"/>
    <circle cx="17.8" cy="9.5" r="0.15" fill="currentColor" opacity="0.76"/>
    <circle cx="10.6" cy="20.0" r="0.14" fill="currentColor" opacity="0.67"/>
    <circle cx="20.2" cy="21.0" r="0.16" fill="currentColor" opacity="0.59"/>
    <circle cx="13.2" cy="13.0" r="0.13" fill="currentColor" opacity="0.87"/>
    <circle cx="21.8" cy="16.5" r="0.15" fill="currentColor" opacity="0.65"/>
    <circle cx="8.4" cy="15.0" r="0.14" fill="currentColor" opacity="0.81"/>
    <circle cx="24.6" cy="14.5" r="0.16" fill="currentColor" opacity="0.56"/>
    <circle cx="16.8" cy="24.5" r="0.13" fill="currentColor" opacity="0.63"/>
    <circle cx="19.6" cy="6.5" r="0.15" fill="currentColor" opacity="0.79"/>
    <circle cx="7.2" cy="19.5" r="0.14" fill="currentColor" opacity="0.73"/>
    <circle cx="25.8" cy="21.0" r="0.16" fill="currentColor" opacity="0.48"/>
    <circle cx="11.6" cy="7.5" r="0.13" fill="currentColor" opacity="0.85"/>
    <circle cx="23.4" cy="25.0" r="0.15" fill="currentColor" opacity="0.52"/>
    <circle cx="6.8" cy="9.0" r="0.14" fill="currentColor" opacity="0.76"/>
    <circle cx="27.6" cy="13.0" r="0.16" fill="currentColor" opacity="0.61"/>
    <circle cx="14.4" cy="27.5" r="0.13" fill="currentColor" opacity="0.58"/>
    <circle cx="21.4" cy="27.5" r="0.15" fill="currentColor" opacity="0.45"/>
    <circle cx="5.4" cy="17.0" r="0.14" fill="currentColor" opacity="0.78"/>
    <circle cx="26.8" cy="16.0" r="0.16" fill="currentColor" opacity="0.55"/>
    <circle cx="12.0" cy="29.5" r="0.13" fill="currentColor" opacity="0.5"/>
    <circle cx="18.4" cy="28.5" r="0.15" fill="currentColor" opacity="0.46"/>
    <circle cx="4.2" cy="21.5" r="0.14" fill="currentColor" opacity="0.69"/>
    <circle cx="28.8" cy="12.0" r="0.16" fill="currentColor" opacity="0.57"/>
    <circle cx="10.8" cy="6.0" r="0.13" fill="currentColor" opacity="0.81"/>
    <circle cx="24.4" cy="5.5" r="0.15" fill="currentColor" opacity="0.64"/>
    <circle cx="6.2" cy="24.5" r="0.14" fill="currentColor" opacity="0.7"/>
    <circle cx="27.2" cy="22.5" r="0.16" fill="currentColor" opacity="0.47"/>
    <circle cx="13.8" cy="3.5" r="0.13" fill="currentColor" opacity="0.74"/>
    <circle cx="20.0" cy="3.0" r="0.15" fill="currentColor" opacity="0.68"/>
    <circle cx="4.8" cy="11.5" r="0.14" fill="currentColor" opacity="0.77"/>
    <circle cx="29.5" cy="15.0" r="0.16" fill="currentColor" opacity="0.44"/>
    <circle cx="8.2" cy="26.0" r="0.13" fill="currentColor" opacity="0.6"/>
    <circle cx="25.6" cy="6.5" r="0.15" fill="currentColor" opacity="0.66"/>
    <circle cx="3.6" cy="18.0" r="0.14" fill="currentColor" opacity="0.71"/>
    <circle cx="28.4" cy="19.5" r="0.16" fill="currentColor" opacity="0.42"/>
    <circle cx="11.4" cy="30.0" r="0.13" fill="currentColor" opacity="0.47"/>
    <circle cx="19.4" cy="30.5" r="0.15" fill="currentColor" opacity="0.41"/>
    <circle cx="2.0" cy="13.0" r="0.14" fill="currentColor" opacity="0.65"/>
    <circle cx="30.5" cy="18.0" r="0.16" fill="currentColor" opacity="0.38"/>
    <circle cx="15.0" cy="31.0" r="0.13" fill="currentColor" opacity="0.43"/>
    <circle cx="17.5" cy="1.5" r="0.15" fill="currentColor" opacity="0.73"/>
  </svg>
);

const IconChart = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="2" stroke={color} strokeWidth="1.8"/>
    <path d="M6 16l3-4 3 3 3-6 3 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const tabIcons = (C) => ({
  portfolio: { glyph: IconToday,     gradient: `linear-gradient(135deg, ${C.green}, #14a300)` },
  storico:   { glyph: IconHistory,   gradient: `linear-gradient(135deg, ${C.cyan}, #0099b3)` },
  ai:        { glyph: IconAI,        gradient: null },
  mercato:   { glyph: IconStats,     gradient: `linear-gradient(135deg, ${C.red}, #b3001a)` },
  stats:     { glyph: IconAnalytics, gradient: `linear-gradient(135deg, ${C.purple}, #5500cc)` },
  daily:     { glyph: IconToday,     gradient: `linear-gradient(135deg, ${C.green}, #14a300)` },
  temporal:  { glyph: IconHistory,   gradient: `linear-gradient(135deg, ${C.cyan}, #0099b3)` },
  metrics:   { glyph: IconStats,     gradient: `linear-gradient(135deg, ${C.red}, #b3001a)` },
  analytics: { glyph: IconAnalytics, gradient: `linear-gradient(135deg, ${C.purple}, #5500cc)` },
  chart:     { glyph: IconChart,     gradient: `linear-gradient(135deg, ${C.purple}, #6a00c8)` },
});

/* ============= RISK BAR (protezioni) ============= */
const RiskBar = ({ C, label, current, limit, isPct, editing, rawValue, onRawChange }) => {
  const ok = current > limit;
  const pctFill = limit < 0 ? Math.min(Math.abs(Math.min(current, 0) / limit) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span style={{color:C.secondary,fontSize:11,fontFamily:FONT.text,fontWeight:500}}>{label}</span>
        <div className="flex items-center gap-2">
          <span style={{color: ok?C.green:C.red, fontSize:12, fontFamily:FONT.mono, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>
            {current >= 0 ? '+' : ''}{current.toFixed(2)}{isPct?'%':''}
          </span>
          <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono}}>/</span>
          {editing ? (
            <div className="flex items-center" style={{
              background:C.glass3, border:`0.5px solid ${C.red}50`,
              borderRadius:8, padding:'3px 8px', gap:2, display:'flex', alignItems:'center',
            }}>
              <span style={{color:C.red,fontSize:13,fontFamily:FONT.mono,fontWeight:700,userSelect:'none'}}>−</span>
              <input
                type="text"
                inputMode="decimal"
                value={rawValue}
                onChange={e => {
                  // allow empty string, digits and single dot only
                  const v = e.target.value.replace(/[^0-9.]/g, '');
                  onRawChange(v);
                }}
                onBlur={e => {
                  // on blur: if empty or 0, reset to '0.1'
                  if (!e.target.value || parseFloat(e.target.value) === 0) onRawChange('0.1');
                }}
                style={{
                  width:44, background:'transparent', border:'none', outline:'none',
                  color:C.red, fontSize:13, fontFamily:FONT.mono, fontWeight:700,
                  textAlign:'right', fontVariantNumeric:'tabular-nums',
                }}
              />
              <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono}}>%</span>
            </div>
          ) : (
            <span style={{color:C.secondary, fontSize:12, fontFamily:FONT.mono, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>
              −{Math.abs(limit).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{background:C.glass3}}>
        <div className="h-full rounded-full transition-all"
             style={{width:`${pctFill}%`, background: ok ? (pctFill > 70 ? C.yellow : C.green) : C.red}}/>
      </div>
    </div>
  );
};

/* ============= PROTEZIONI CARD ============= */
const ProtezioniCard = ({ C, dayPnLPct, weeklyPnLPct, consecLoss }) => {
  const [editing, setEditing] = useState(false);
  const [config, setConfig] = usePersistedState('xt_risk_limits', {
    dailyLoss: '2.5',
    weeklyLoss: '5.0',
    maxConsec: '3',
  });

  // raw strings during editing — separate so we can clear without issues
  const [rawDaily,  setRawDaily]  = useState(config.dailyLoss);
  const [rawWeekly, setRawWeekly] = useState(config.weeklyLoss);
  const [rawConsec, setRawConsec] = useState(config.maxConsec);

  const startEdit = () => {
    setRawDaily(config.dailyLoss);
    setRawWeekly(config.weeklyLoss);
    setRawConsec(config.maxConsec);
    setEditing(true);
  };

  const commitEdit = () => {
    const d = Math.max(0.1, parseFloat(rawDaily)  || 0.1).toFixed(1);
    const w = Math.max(0.1, parseFloat(rawWeekly) || 0.1).toFixed(1);
    const c = Math.max(1,   parseInt(rawConsec)   || 1).toString();
    setConfig({ dailyLoss: d, weeklyLoss: w, maxConsec: c });
    setEditing(false);
  };

  const dailyLimit   = -(parseFloat(config.dailyLoss)  || 2.5);
  const weeklyLimit  = -(parseFloat(config.weeklyLoss) || 5.0);
  const maxConsec    =   parseInt(config.maxConsec)     || 3;

  const dailyOk   = dayPnLPct   > dailyLimit;
  const weeklyOk  = weeklyPnLPct > weeklyLimit;
  const consecOk  = consecLoss   < maxConsec;
  const allOk     = dailyOk && weeklyOk && consecOk;

  return (
    <Glass C={C}>
      <SectionHeader C={C} action={
        <div className="flex items-center gap-2">
          <span style={{
            color: allOk ? C.green : C.red,
            fontSize:11, fontFamily:FONT.text, fontWeight:600,
            letterSpacing:'0.3px', textTransform:'uppercase',
          }}>● {allOk ? 'Operativo' : 'STOP'}</span>
          <button onClick={editing ? commitEdit : startEdit} style={{
            padding:'4px 10px', fontSize:11, fontFamily:FONT.text, fontWeight:600,
            color: editing ? C.cyan : C.secondary,
            background:'transparent', border:'none',
            borderRadius:RADIUS.pill, cursor:'pointer',
          }}>{editing ? 'Fine' : 'Limiti'}</button>
        </div>
      }>Protezioni</SectionHeader>

      <div className="space-y-4">
        <RiskBar C={C} label="Daily P&L" current={dayPnLPct}
          limit={dailyLimit} isPct
          editing={editing} rawValue={rawDaily} onRawChange={setRawDaily}/>
        <RiskBar C={C} label="Weekly P&L" current={weeklyPnLPct}
          limit={weeklyLimit} isPct
          editing={editing} rawValue={rawWeekly} onRawChange={setRawWeekly}/>

        <div className="flex items-center justify-between">
          <span style={{color:C.secondary,fontSize:11,fontFamily:FONT.text,fontWeight:500}}>Loss consecutive</span>
          <div className="flex items-center gap-2">
            <span style={{color: consecOk ? C.green : C.red, fontSize:12, fontFamily:FONT.mono, fontWeight:600}}>
              {consecLoss}
            </span>
            <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono}}>/</span>
            {editing ? (
              <div className="flex items-center" style={{
                background:C.glass3, border:`0.5px solid ${C.orange}50`,
                borderRadius:8, padding:'3px 8px', display:'flex', alignItems:'center', gap:2,
              }}>
                <input
                  type="text"
                  inputMode="numeric"
                  value={rawConsec}
                  onChange={e => setRawConsec(e.target.value.replace(/[^0-9]/g, ''))}
                  onBlur={e => { if (!e.target.value || parseInt(e.target.value) < 1) setRawConsec('1'); }}
                  style={{
                    width:28, background:'transparent', border:'none', outline:'none',
                    color:C.orange, fontSize:13, fontFamily:FONT.mono, fontWeight:700,
                    textAlign:'center', fontVariantNumeric:'tabular-nums',
                  }}
                />
              </div>
            ) : (
              <span style={{color:C.secondary, fontSize:12, fontFamily:FONT.mono, fontWeight:600}}>
                {maxConsec}
              </span>
            )}
          </div>
        </div>
      </div>
    </Glass>
  );
};

/* ============= PORTFOLIO VIEW ============= */
const DailyView = ({C,now,settings,trades,equity,activePortfolio,portfolioList}) =>
  <PortfolioView C={C} now={now} settings={settings} activePortfolio={activePortfolio} portfolioList={portfolioList}/>;

const PortfolioView = ({C, now, settings, activePortfolio, portfolioList}) => {
  const [timeFilter, setTimeFilter] = usePersistedState('xt_port_tf','7D');
  const [assetExpanded, setAssetExpanded] = useState(null);
  const currency = settings?.currency || 'USD';
  const currSym  = currency==='EUR'?'€':currency==='BTC'?'₿':'$';
  const wallets   = settings?.wallets   || [];
  const exchanges = settings?.exchanges || [];

  // ── MOCK_STORE ──
  const allAssets = MOCK_STORE.assets;
  const assets = useMemo(()=>{
    if(activePortfolio==='total') return allAssets;
    const port=(portfolioList||[]).find(p=>p.id===activePortfolio);
    if(!port) return allAssets;
    return allAssets.filter(a=>port.type==='wallet'?a.type==='wallet':a.type==='exchange');
  },[activePortfolio,portfolioList]);

  const totalValue    = useMemo(()=>assets.reduce((s,a)=>s+a.value,0),[assets]);
  const totalValue24h = useMemo(()=>assets.reduce((s,a)=>s+a.amount*a.price24h,0),[assets]);
  const pnl24h    = totalValue - totalValue24h;
  const pnl24hPct = totalValue24h>0?(pnl24h/totalValue24h)*100:0;
  const isPos     = pnl24h>=0;
  const snapshotValue = MOCK_STORE.equityCurve[0]?.value || 0;
  const totalROI  = snapshotValue>0?((totalValue-snapshotValue)/snapshotValue)*100:0;
  const onChainVal = useMemo(()=>assets.filter(a=>a.type==='wallet').reduce((s,a)=>s+a.value,0),[assets]);
  const exchVal    = totalValue - onChainVal;
  const equityCurve = MOCK_STORE.equityCurve;

  const allocations = useMemo(()=>assets.map(a=>({
    ...a,
    pnl:     a.amount*(a.price-a.price24h),
    pnlPct:  a.price24h>0?((a.price-a.price24h)/a.price24h)*100:0,
    allocPct:totalValue>0?(a.value/totalValue)*100:0,
  })).sort((a,b)=>b.value-a.value),[assets,totalValue]);

  const fmt      = (v,d=2) => v.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
  const fmtShort = v => v>=1000?`${fmt(v/1000,1)}k`:fmt(v);
  const timeStr  = now.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
  const dateStr  = now.toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long'}).replace(/^./,c=>c.toUpperCase());

  const minV=Math.min(...equityCurve.map(d=>d.value));
  const maxV=Math.max(...equityCurve.map(d=>d.value));
  const rng=maxV-minV||1;
  const W=100,H=80;
  const sparkPts=equityCurve.map((d,i)=>{
    const x=(i/Math.max(equityCurve.length-1,1))*W;
    const y=H-((d.value-minV)/rng)*H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const sparkLine=sparkPts.join(' ');
  const areaPath=`M0,${H} ${sparkLine} ${W},${H} Z`;
  const eqColor=totalROI>=0?C.green:C.red;

  return (
    <div className="space-y-4">
      {/* CARD PRINCIPALE */}
      <Glass C={C} padding="p-6">
        <div className="flex items-center justify-between mb-3">
          <div style={{color:C.tertiary,fontSize:11,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.4px',textTransform:'uppercase'}}>{dateStr} · {timeStr}</div>
          <div className="flex items-center gap-1.5 px-2.5 py-1" style={{background:`${C.green}12`,border:`0.5px solid ${C.green}35`,borderRadius:RADIUS.pill}}>
            <div className="w-1 h-1 rounded-full xt-live-dot" style={{background:C.green}}/>
            <span style={{color:C.green,fontSize:11,fontFamily:FONT.mono,fontWeight:600}}>Live</span>
          </div>
        </div>
        <div style={{fontFamily:FONT.display,fontSize:48,fontWeight:700,letterSpacing:'-1.2px',lineHeight:1,color:C.primary,fontVariantNumeric:'tabular-nums'}}>
          {currSym}{fmtShort(totalValue)}
        </div>
        <div style={{color:isPos?C.green:C.red,fontSize:15,fontFamily:FONT.mono,fontWeight:600,marginTop:4,fontVariantNumeric:'tabular-nums'}}>
          {isPos?'+':''}{currSym}{fmt(Math.abs(pnl24h))} ({isPos?'+':''}{pnl24hPct.toFixed(2)}%) oggi
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Tag color={C.cyan}>{assets.length} asset</Tag>
          <Tag color={isPos?C.green:C.red}>24h {isPos?'+':''}{pnl24hPct.toFixed(2)}%</Tag>
          <Tag color={C.purple}>ROI {totalROI>=0?'+':''}{totalROI.toFixed(1)}%</Tag>
        </div>
        {/* Barra DEX vs CEX */}
        <div className="mt-4 pt-4" style={{borderTop:`0.5px solid ${C.sep}`}}>
          <div className="flex items-center justify-between mb-2">
            <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.text,fontWeight:500}}>DEX vs CEX</span>
            <span style={{fontSize:11,fontFamily:FONT.mono}}>
              <span style={{color:C.green,fontWeight:700}}>{currSym}{fmtShort(onChainVal)}</span>
              <span style={{color:C.tertiary}}> / </span>
              <span style={{color:C.orange,fontWeight:700}}>{currSym}{fmtShort(exchVal)}</span>
            </span>
          </div>
          <div style={{display:'flex',height:6,borderRadius:9999,overflow:'hidden'}}>
            <div style={{width:`${totalValue>0?(onChainVal/totalValue)*100:50}%`,background:`linear-gradient(90deg,${C.green},${C.cyan})`}}/>
            <div style={{flex:1,background:`linear-gradient(90deg,${C.orange},${C.pink})`}}/>
          </div>
        </div>
      </Glass>

      {/* STAT 4 COL */}
      <div className="grid grid-cols-2 gap-3">
        <Stat C={C} label="P&L 24h"    value={`${isPos?'+':''}${currSym}${fmt(Math.abs(pnl24h))}`} color={isPos?C.green:C.red} sub={`${pnl24hPct>=0?'+':''}${pnl24hPct.toFixed(2)}%`}/>
        <Stat C={C} label="ROI totale" value={`${totalROI>=0?'+':''}${totalROI.toFixed(1)}%`}       color={totalROI>=0?C.cyan:C.red} sub="da giu 2026"/>
        <Stat C={C} label="Stablecoin" value="0%"                                                    color={C.yellow} sub="$0"/>
        <Stat C={C} label="Asset"      value={`${assets.length}`}                                    color={C.purple} sub={`${wallets.length}W · ${exchanges.length}EX`}/>
      </div>

      {/* EQUITY */}
      <Glass C={C}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span style={{fontFamily:FONT.display,fontSize:17,fontWeight:700,letterSpacing:'-0.3px',color:C.primary}}>Equity</span>
          <SegmentedControl C={C} options={['24H','7D','30D','ALL']} value={timeFilter} onChange={setTimeFilter}/>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:110,overflow:'visible'}} preserveAspectRatio="none">
          <defs>
            <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={eqColor} stopOpacity="0.22"/>
              <stop offset="100%" stopColor={eqColor} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {equityCurve.length>0 && <path d={areaPath} fill="url(#eqGrad)"/>}
          {equityCurve.length>0 && <polyline points={sparkLine} fill="none" stroke={eqColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>}
        </svg>
        <div className="flex items-center justify-between mt-2 pt-3" style={{borderTop:`0.5px solid ${C.sep}`}}>
          <div>
            <span style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text}}>Snapshot</span>
            <span style={{color:C.secondary,fontSize:12,fontFamily:FONT.mono,fontWeight:600,marginLeft:6}}>{currSym}10,000</span>
          </div>
          <div style={{textAlign:'right'}}>
            <span style={{color:C.primary,fontSize:12,fontFamily:FONT.mono,fontWeight:600}}>{currSym}{fmtShort(totalValue)}</span>
            <span style={{color:eqColor,fontSize:10,fontFamily:FONT.mono,marginLeft:6}}>{totalROI>=0?'↑':'↓'}{Math.abs(totalROI).toFixed(1)}%</span>
            <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.mono,marginTop:1}}>agg. {timeStr}</div>
          </div>
        </div>
      </Glass>

      {/* ASSET LIST */}
      <Glass C={C}>
        <SectionHeader C={C}>Asset</SectionHeader>
        <div className="space-y-1">
          {allocations.length===0 && (
            <div style={{color:C.tertiary,fontSize:12,fontFamily:FONT.text,textAlign:'center',padding:'20px 0'}}>Nessun asset in portafoglio — aggiungi le tue posizioni</div>
          )}
          {allocations.map((a,idx)=>{
            const isExp=assetExpanded===a.symbol;
            return (
              <div key={a.symbol} style={{borderTop:idx===0?'none':`0.5px solid ${C.sep}`}}>
                <div onClick={()=>setAssetExpanded(isExp?null:a.symbol)}
                  className="xt-row flex items-center justify-between py-3 cursor-pointer px-2.5 -mx-2.5"
                  style={{background:isExp?C.glass3:'transparent',borderRadius:RADIUS.inset}}>
                  <div className="flex items-center gap-3">
                    <div style={{width:4,height:32,borderRadius:9999,background:a.pnlPct>=0?C.green:C.red}}/>
                    <div>
                      <div className="flex items-center gap-2">
                        <span style={{color:C.primary,fontSize:13,fontFamily:FONT.text,fontWeight:600}}>{a.symbol}</span>
                        <Tag color={C.tertiary} size="sm">{a.name}</Tag>
                        <Tag color={a.type==='wallet'?C.green:C.orange} size="sm">{a.type==='wallet'?'DEX':'CEX'}</Tag>
                      </div>
                      <div style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono,marginTop:1}}>
                        {a.amount>=1?a.amount.toFixed(2):a.amount.toFixed(4)} {a.symbol} · {currSym}{a.price>=1000?a.price.toLocaleString():a.price.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{textAlign:'right'}}>
                      <div style={{color:C.primary,fontSize:14,fontFamily:FONT.mono,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{currSym}{fmtShort(a.value)}</div>
                      <div style={{color:a.pnlPct>=0?C.green:C.red,fontSize:10,fontFamily:FONT.mono,fontWeight:500}}>{a.pnlPct>=0?'+':''}{a.pnlPct.toFixed(2)}% · {a.allocPct.toFixed(1)}%</div>
                    </div>
                    <ChevronRight size={12} style={{color:C.tertiary,transform:isExp?'rotate(90deg)':'rotate(0deg)',transition:'transform 0.2s'}}/>
                  </div>
                </div>
                {isExp&&(
                  <div className="pb-3 px-2.5 -mx-2.5 space-y-2">
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {[
                        {l:'Prezzo',  v:`${currSym}${a.price>=1000?a.price.toLocaleString():a.price.toFixed(4)}`},
                        {l:'P&L 24h', v:`${a.pnl>=0?'+':''}${currSym}${Math.abs(a.pnl).toFixed(2)}`,c:a.pnl>=0?C.green:C.red},
                        {l:'Quantità',v:`${a.amount>=1?a.amount.toFixed(2):a.amount.toFixed(4)}`},
                        {l:'Alloc.',  v:`${a.allocPct.toFixed(1)}%`,c:C.cyan},
                      ].map((d,i)=>(
                        <GlassInset C={C} key={i} padding="p-2.5">
                          <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.3px',textTransform:'uppercase'}}>{d.l}</div>
                          <div style={{color:d.c||C.primary,fontSize:11,fontFamily:FONT.mono,fontWeight:600,marginTop:2,fontVariantNumeric:'tabular-nums'}}>{d.v}</div>
                        </GlassInset>
                      ))}
                    </div>
                    <GlassInset C={C} padding="p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text}}>Peso portfolio</span>
                        <span style={{color:C.cyan,fontSize:11,fontFamily:FONT.mono,fontWeight:600}}>{a.allocPct.toFixed(2)}%</span>
                      </div>
                      <div style={{display:'flex',height:6,borderRadius:9999,overflow:'hidden',background:C.glass3}}>
                        <div style={{width:`${a.allocPct}%`,background:`linear-gradient(90deg,${C.cyan},${C.purple})`,borderRadius:9999,transition:'width 0.5s cubic-bezier(0.34,1.18,0.64,1)'}}/>
                      </div>
                    </GlassInset>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Glass>

      {/* DEX & CEX */}
      {(wallets.length>0||exchanges.length>0)?(
        <Glass C={C}>
          <SectionHeader C={C}>DEX & CEX</SectionHeader>
          <div className="space-y-1">
            {[...wallets.map(w=>({...w,kind:'wallet',sub:`${w.chain}·${(w.address||'').slice(0,8)}…`,col:C.green})),
              ...exchanges.map(e=>({...e,kind:'exchange',sub:e.exchangeId,col:C.orange}))].map((item,idx)=>(
              <div key={item.id} className="flex items-center justify-between py-3" style={{borderTop:idx===0?'none':`0.5px solid ${C.sep}`}}>
                <div className="flex items-center gap-3">
                  <div style={{width:32,height:32,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:item.kind==='wallet'?`linear-gradient(135deg,${C.green},#14a300)`:`linear-gradient(135deg,${C.orange},${C.pink})`}}>
                    {item.kind==='wallet'
                      ?<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="#000" strokeWidth="2"/><circle cx="16" cy="13" r="1.5" fill="#000"/></svg>
                      :<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    }
                  </div>
                  <div>
                    <div style={{color:C.primary,fontSize:13,fontFamily:FONT.text,fontWeight:500}}>{item.name}</div>
                    <div style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono,marginTop:1}}>{item.sub}</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color:C.primary,fontSize:13,fontFamily:FONT.mono,fontWeight:600}}>—</div>
                  <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>In attesa API</div>
                </div>
              </div>
            ))}
          </div>
        </Glass>
      ):(
        <Glass C={C} padding="p-5">
          <div className="flex flex-col items-center gap-3 py-4">
            <span style={{color:C.tertiary,fontSize:13,fontFamily:FONT.text,fontWeight:500}}>Nessun portafoglio collegato</span>
            <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.text,textAlign:'center'}}>Apri le impostazioni per aggiungere wallet e exchange</span>
          </div>
        </Glass>
      )}
    </div>
  );
};

/* ============= EQUITY CHART CARD (standalone, con state propri) ============= */
const EquityChartCard = ({ C, equity }) => {
  const equityCurve = equity && equity.length > 0 ? equity : [{day:'—',value:0}];
  const equityFull = equityCurve.map(d=>({...d,projection:null}));
  const [equityRange, setEquityRange] = usePersistedState('xt_equity_range', '1W');
  const [showProjection, setShowProjection] = usePersistedState('xt_show_proj', false);
  const [showCalPicker, setShowCalPicker] = useState(false);
  const [calPickerMonth, setCalPickerMonth] = useState(4);
  const [customRange, setCustomRange] = useState(null);

  const equityRangeData = useMemo(() => {
    const n = equityCurve.length;
    if (n === 0) return [{day:'—',value:0,projection:null}];
    const last = equityCurve[n-1].value;
    if (equityRange === '1D') {
      const prev = n > 1 ? equityCurve[n-2].value : last;
      return Array.from({length:24},(_,h)=>({
        day: `${String(h).padStart(2,'0')}:00`,
        value: n >= 2 ? Math.round(prev + (last-prev) * (h/23)) : last,
        projection: null,
      }));
    }
    if (equityRange === '1M') return equityCurve.slice(-31).map(d=>({...d,projection:null}));
    if (equityRange === 'ALL') {
      if (showProjection) {
        const g = n > 1 ? (last - equityCurve[0].value) / Math.max(n-1,1) : 0;
        const proj = Array.from({length:30},(_,i)=>({day:`+${i+1}g`,value:null,projection:Math.round(last+g*(i+1))}));
        return [...equityCurve.map(d=>({...d,projection:null})),{...equityCurve[n-1],projection:last},...proj];
      }
      return equityCurve.map(d=>({...d,projection:null}));
    }
    return equityCurve.slice(-8).map(d=>({...d,projection:null}));
  }, [equityRange, showProjection, equityCurve]);

  const BALANCE_NOW = equityCurve[equityCurve.length-1]?.value || 0;
  const BALANCE_INIT = equityCurve[0]?.value || 0;

  return (
    <Glass C={C}>
      {/* Header row: titolo + toggle proiezione + range + calendario */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <span style={{fontFamily:FONT.display,fontSize:17,fontWeight:700,letterSpacing:'-0.3px',color:C.primary}}>Equity</span>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={()=>setShowProjection(!showProjection)} className="xt-btn flex items-center gap-1.5 px-2.5 py-1" style={{
            background: showProjection ? `${C.purple}22` : C.glass2,
            border: `0.5px solid ${showProjection ? C.purple : C.sep}`,
            borderRadius: RADIUS.pill, cursor:'pointer',
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke={showProjection ? C.purple : C.tertiary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{color: showProjection ? C.purple : C.tertiary, fontSize:10, fontFamily:FONT.text, fontWeight:600}}>Proiezione</span>
          </button>
          <SegmentedControl C={C} options={['1D','1W','1M','ALL']} value={equityRange} onChange={v=>{setEquityRange(v);setCustomRange(null);}}/>
          <button onClick={()=>setShowCalPicker(!showCalPicker)} className="xt-btn" style={{
            width:28,height:28,borderRadius:8,
            background: customRange ? `${C.cyan}22` : C.glass2,
            border:`0.5px solid ${customRange ? C.cyan : C.sep}`,
            cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="16" rx="2.5" stroke={customRange ? C.cyan : C.tertiary} strokeWidth="1.8"/>
              <path d="M3 9h18M8 3v4M16 3v4" stroke={customRange ? C.cyan : C.tertiary} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mini calendar picker */}
      {showCalPicker && (
        <GlassInset C={C} className="mb-3" padding="p-3">
          {(() => {
            const MONTHS = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
            const DAYS_IN = [31,28,31,30,31,30,31,31,30,31,30,31];
            const month = calPickerMonth;
            const year  = 2026;
            const daysInMonth = DAYS_IN[month];
            const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
            const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
            const toKey = (m, d) => `${year}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const fromKey = customRange?.from;
            const toKeyEnd = customRange?.to;
            return (
              <>
                <div className="flex items-center justify-between mb-2">
                  <button onClick={()=>setCalPickerMonth(m=>Math.max(0,m-1))} style={{background:'none',border:'none',cursor:'pointer',padding:'2px 6px',color:C.tertiary,fontSize:16}}>‹</button>
                  <span style={{color:C.primary,fontSize:12,fontFamily:FONT.text,fontWeight:700}}>{MONTHS[month]} {year}</span>
                  <button onClick={()=>setCalPickerMonth(m=>Math.min(11,m+1))} style={{background:'none',border:'none',cursor:'pointer',padding:'2px 6px',color:C.tertiary,fontSize:16}}>›</button>
                  <button onClick={()=>setShowCalPicker(false)} style={{background:'none',border:'none',cursor:'pointer',padding:2,marginLeft:4}}>
                    <X size={12} style={{color:C.tertiary}}/>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-0.5" style={{marginBottom:4}}>
                  {['L','M','M','G','V','S','D'].map((d,i)=>(
                    <div key={i} style={{color:C.tertiary,fontSize:9,fontFamily:FONT.mono,textAlign:'center',padding:'2px 0'}}>{d}</div>
                  ))}
                  {Array.from({length:totalCells},(_,i)=>{
                    const dayNum = i - firstDow + 1;
                    if (dayNum < 1 || dayNum > daysInMonth) return <div key={i}/>;
                    const key = toKey(month, dayNum);
                    const isFrom = key === fromKey;
                    const isTo   = key === toKeyEnd;
                    const inRange = fromKey && toKeyEnd && key > fromKey && key < toKeyEnd;
                    const isEdge  = isFrom || isTo;
                    return (
                      <button key={i} onClick={()=>{
                        if (!customRange || customRange.to) {
                          setCustomRange({from:key, to:null});
                        } else {
                          const sorted = [customRange.from, key].sort();
                          setCustomRange({from:sorted[0], to:sorted[1]});
                          setShowCalPicker(false);
                        }
                      }} style={{
                        width:'100%',aspectRatio:'1',borderRadius:6,border:'none',cursor:'pointer',
                        background: isEdge ? C.cyan : inRange ? `${C.cyan}22` : 'transparent',
                        color: isEdge ? C.bg : inRange ? C.cyan : C.secondary,
                        fontSize:10,fontFamily:FONT.mono,fontWeight:isEdge?700:400,
                      }}>{dayNum}</button>
                    );
                  })}
                </div>
                {customRange && !customRange.to && (
                  <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,marginTop:4,textAlign:'center'}}>Tocca la data di fine</div>
                )}
                {customRange?.from && customRange?.to && (
                  <div className="flex items-center justify-between mt-2">
                    <span style={{color:C.cyan,fontSize:11,fontFamily:FONT.mono,fontWeight:600}}>
                      {customRange.from} → {customRange.to}
                    </span>
                    <button onClick={()=>setCustomRange(null)} style={{
                      background:'none',border:`0.5px solid ${C.sep}`,borderRadius:6,padding:'2px 8px',
                      color:C.tertiary,fontSize:10,fontFamily:FONT.text,cursor:'pointer',
                    }}>Reset</button>
                  </div>
                )}
              </>
            );
          })()}
        </GlassInset>
      )}

      {/* Equity corrente */}
      <div className="flex items-end justify-between mb-3 px-1">
        <div>
          <div style={{color:C.tertiary, fontSize:9, fontFamily:FONT.text, fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase', marginBottom:4}}>Equity</div>
          <div style={{fontFamily:FONT.display, fontSize:36, fontWeight:700, letterSpacing:'-1px', lineHeight:1, color:C.green, fontVariantNumeric:'tabular-nums', ...neonText(C.green, C.scheme)}}>
            ${BALANCE_NOW.toFixed(2)}
          </div>
        </div>
        <div className="text-right pb-1">
          <div style={{color:C.green, fontSize:14, fontFamily:FONT.mono, fontWeight:600, fontVariantNumeric:'tabular-nums'}}>
            +${(BALANCE_NOW - BALANCE_INIT).toFixed(2)}
          </div>
          <div style={{color:C.green, fontSize:11, fontFamily:FONT.mono, fontWeight:500, opacity:0.75}}>
            +{((BALANCE_NOW - BALANCE_INIT)/BALANCE_INIT*100).toFixed(2)}%
          </div>
        </div>
      </div>

      <DragChart C={C} data={equityRangeData} height={260} labelKey="day" valueKey="value" valuePrefix="$" valueColor={C.green}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={equityRangeData} margin={{top:5,right:5,left:-10,bottom:0}}>
            <defs>
              {(() => {
                const vals = equityRangeData.map(d => d.value).filter(v => v != null);
                // Guard array vuoto: evita Math.min/max(...[]) → ±Infinity → NaN nel gradient SVG
                if (vals.length === 0) {
                  return (
                    <linearGradient id="equityLineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.green} stopOpacity={1}/>
                    </linearGradient>
                  );
                }
                const minV = Math.min(...vals) - 50;
                const maxV = Math.max(...vals) + 50;
                const range = maxV - minV || 1;
                // posizione percentuale del deposito iniziale nella scala Y (0=bottom, 1=top in SVG è invertito)
                const pct = Math.max(0, Math.min(1, (BALANCE_INIT - minV) / range));
                // In SVG Y=0 è in alto, quindi invertiamo
                const stopPct = `${((1 - pct) * 100).toFixed(1)}%`;
                return (
                  <linearGradient id="equityLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={stopPct} stopColor={C.green} stopOpacity={1}/>
                    <stop offset={stopPct} stopColor={C.red} stopOpacity={1}/>
                  </linearGradient>
                );
              })()}
            </defs>
            <CartesianGrid stroke={C.sep} vertical={false}/>
            <XAxis dataKey="day" tick={{fill:C.tertiary,fontSize:10,fontFamily:FONT.mono}} axisLine={false} tickLine={false} dy={8} interval="preserveStartEnd"/>
            <YAxis tick={{fill:C.tertiary,fontSize:11,fontFamily:FONT.mono}} axisLine={false} tickLine={false} domain={['dataMin - 50','dataMax + 50']}/>
            <ReferenceLine
              y={BALANCE_INIT}
              stroke={C.sep} strokeWidth={1} strokeDasharray="3 4" strokeOpacity={0.6}
            />
            <Line type="monotone" dataKey="value" stroke="url(#equityLineGrad)" strokeWidth={1.75} dot={false} connectNulls={false} isAnimationActive={false}/>
            {showProjection && equityRange === 'ALL' && (
              <Line type="monotone" dataKey="projection" stroke={C.purple} strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls={false} isAnimationActive={false}/>
            )}
          </LineChart>
        </ResponsiveContainer>
      </DragChart>
      {showProjection && equityRange === 'ALL' && (
        <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,marginTop:6,textAlign:'center'}}>
          Proiezione · <span style={{color:C.purple,fontFamily:FONT.mono}}>+$56/giorno</span> stimati · attiva solo in vista ALL
        </div>
      )}
    </Glass>
  );
};

/* ============= TEMPORAL ============= */


// buildCalData usa i trade reali passati come parametro
const buildCalData = (year, month, tradesByDate = {}) => {
  const DAYS_IN = [31,28+(year%4===0&&(year%100!==0||year%400===0)?1:0),31,30,31,30,31,31,30,31,30,31];
  const daysInMonth = DAYS_IN[month];
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // 0=Lun
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const key = `${year}-${String(month+1).padStart(2,'0')}`;
  

  return Array.from({length: totalCells}, (_, i) => {
    const dayNum = i - firstDow + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return { day: null, pnl: 0, trades: [], openCount: 0, tradeCount: 0, closedCount: 0 };
    const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
    const dayTrades = tradesByDate[dateKey] || [];
    const closedTrades = dayTrades.filter(t=>!t.open);
    const openTrades   = dayTrades.filter(t=>t.open);
    const pnl = closedTrades.reduce((s,t)=>s+(t.pnl||0), 0);
    // Mostra il giorno anche se ha solo trade aperti (pnl=0 ma openCount>0)
    return {
      day: dayNum, dateKey, pnl,
      trades: dayTrades,
      openCount: openTrades.length,
      tradeCount: dayTrades.length,
      closedCount: closedTrades.length,
      hasAny: dayTrades.length > 0,
    };
  });
};

const MONTHS_IT = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

// Componente riga trade singolo nel pannello giorno
const DayTradePill = ({ C, t, balance = 10510 }) => {
  const grade = tradeGrade(t.rr || 0, C);
  const pnlPct = (t.pnl / balance * 100);
  const isOpen = t.open;
  const dirColor = t.dir === 'LONG' ? C.green : C.red;

  return (
    <div className={isOpen ? 'xt-open-trade' : ''} style={{
      background: isOpen
        ? `linear-gradient(135deg, ${C.orange}14, ${C.orange}08)`
        : t.pnl >= 0 ? `${C.green}0A` : `${C.red}0A`,
      border: isOpen
        ? `1px dashed ${C.orange}60`
        : `0.5px solid ${t.pnl >= 0 ? C.green+'28' : C.red+'28'}`,
      borderRadius: 14,
      padding: '10px 12px',
      marginBottom: 6,
    }}>
      <div className="flex items-center justify-between">
        {/* Left: dir badge + basket + session */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dir pill */}
          <div style={{
            padding:'2px 7px', borderRadius: 6,
            background: `${dirColor}22`,
            border: `0.5px solid ${dirColor}50`,
            fontSize: 10, fontFamily: FONT.mono, fontWeight: 700,
            color: dirColor, letterSpacing: '0.3px',
          }}>{t.dir}</div>
          <span style={{color:C.secondary,fontSize:12,fontFamily:FONT.text,fontWeight:500}}>{t.basket}</span>
          <span style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>{t.session}</span>
          {isOpen && (
            <div className="flex items-center gap-1" style={{
              padding:'2px 7px', borderRadius:6,
              background:`${C.orange}22`, border:`0.5px solid ${C.orange}55`,
            }}>
              <div className="xt-live-dot w-1 h-1 rounded-full" style={{background:C.orange, width:5, height:5}}/>
              <span style={{color:C.orange,fontSize:9,fontFamily:FONT.mono,fontWeight:700,letterSpacing:'0.4px'}}>LIVE</span>
            </div>
          )}
        </div>
        {/* Right: P&L + % */}
        <div className="text-right">
          <div style={{
            color: t.pnl >= 0 ? C.green : C.red,
            fontSize: 13, fontFamily: FONT.mono, fontWeight: 700,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.2px',
          }}>
            {(t.pnl??0) >= 0 ? '+' : ''}${(+(t.pnl??0)).toFixed(2)}
          </div>
          <div style={{
            color: t.pnl >= 0 ? C.green : C.red,
            fontSize: 10, fontFamily: FONT.mono, fontWeight: 600,
            opacity: 0.72, fontVariantNumeric: 'tabular-nums',
          }}>
            {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Second row: entry / exit (or current) / size / R:R / grade */}
      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        <span style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>
          E: <span style={{color:C.secondary}}>{t.entry!=null?t.entry.toFixed(1):'—'}</span>
        </span>
        {isOpen ? (
          <span style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>
            Now: <span style={{color:C.orange,fontWeight:600}}>{t.currentPrice?.toFixed(1)}</span>
          </span>
        ) : (
          <span style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>
            X: <span style={{color:C.secondary}}>{t.exit?.toFixed(1)}</span>
          </span>
        )}
        <span style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>
          {t.size.toFixed(2)}L
        </span>
        {!isOpen && t.rr > 0 && (
          <span style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>
            <span style={{color:grade.color,fontWeight:700}}>{(t.rr??0).toFixed(1)}R</span>
          </span>
        )}
        {!isOpen && t.closed && (
          <div style={{
            padding:'1.5px 6px', borderRadius:5,
            background: t.closed==='TP'?`${C.green}22`:t.closed==='SL'?`${C.red}22`:`${C.yellow}22`,
            border: `0.5px solid ${t.closed==='TP'?C.green+'44':t.closed==='SL'?C.red+'44':C.yellow+'44'}`,
            fontSize:9, fontFamily:FONT.mono, fontWeight:700,
            color: t.closed==='TP'?C.green:t.closed==='SL'?C.red:C.yellow,
            letterSpacing:'0.3px',
          }}>{t.closed}</div>
        )}
        {t.tags?.map(tag=>(
          <Tag key={tag} color={tag==='A+'?C.green:tag==='FOMO'?C.red:C.purple} size="sm">{tag}</Tag>
        ))}
      </div>
    </div>
  );
};

const TemporalView = ({C,trades,equity,activePortfolio,portfolioList}) =>
  <StoricoView C={C} activePortfolio={activePortfolio} portfolioList={portfolioList}/>;

const StoricoView = ({C,activePortfolio,portfolioList}) => {
  const [timeFilter,setTimeFilter]=usePersistedState('xt_stor_tf','30D');
  const [typeFilter,setTypeFilter]=usePersistedState('xt_stor_type','Tutti');
  const [expanded,setExpanded]=useState(null);

  const equitySnap = MOCK_STORE.equityCurve;
  const TX = MOCK_STORE.transactions;
  const txFiltered = typeFilter==='Tutti'?TX:TX.filter(t=>t.type===typeFilter);

  const totalIn  = TX.filter(t=>t.type==='Deposito').reduce((s,t)=>s+t.amount,0);
  const totalOut = TX.filter(t=>t.type==='Prelievo').reduce((s,t)=>s+t.amount,0);
  const totalFee = TX.reduce((s,t)=>s+parseFloat((t.fee||'$0').replace('$','')),0);

  const minV=Math.min(...equitySnap.map(d=>d.value));
  const maxV=Math.max(...equitySnap.map(d=>d.value));
  const rng=maxV-minV||1;
  const W=100,H=70;
  const pts=equitySnap.map((d,i)=>{
    const x=(i/Math.max(equitySnap.length-1,1))*W;
    const y=H-((d.value-minV)/rng)*H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const chartColor=equitySnap[equitySnap.length-1]?.value>=equitySnap[0]?.value?C.green:C.red;
  const typeColors={Deposito:C.green,Prelievo:C.red,Trade:C.cyan,Fee:C.orange,Swap:C.purple};

  return (
    <div className="space-y-4">
      <Glass C={C}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span style={{fontFamily:FONT.display,fontSize:17,fontWeight:700,letterSpacing:'-0.3px',color:C.primary}}>Patrimonio nel tempo</span>
          <SegmentedControl C={C} options={['7D','30D','90D','ALL']} value={timeFilter} onChange={setTimeFilter}/>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:90,overflow:'visible'}} preserveAspectRatio="none">
          <defs>
            <linearGradient id="storGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={chartColor} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {equitySnap.length>0 && <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#storGrad)"/>}
          {equitySnap.length>0 && <polyline points={pts} fill="none" stroke={chartColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>}
        </svg>
        {equitySnap.length===0 && (
          <div style={{color:C.tertiary,fontSize:12,fontFamily:FONT.text,textAlign:'center',marginTop:-46,paddingBottom:24}}>Nessun dato storico — registra depositi e operazioni</div>
        )}
        <div className="flex items-center justify-between mt-2 pt-3" style={{borderTop:`0.5px solid ${C.sep}`}}>
          {[
            {l:'Inizio',v:`$${(equitySnap[0]?.value ?? 0).toLocaleString()}`,c:C.secondary},
            {l:'Oggi',  v:`$${(equitySnap[equitySnap.length-1]?.value ?? 0).toLocaleString()}`,c:C.primary},
            {l:'Δ',     v:equitySnap.length>1?`${(((equitySnap[equitySnap.length-1].value-equitySnap[0].value)/equitySnap[0].value)*100).toFixed(1)}%`:'—',
              c:(equitySnap[equitySnap.length-1]?.value ?? 0)>=(equitySnap[0]?.value ?? 0)?C.green:C.red},
          ].map((d,i)=>(
            <div key={i} style={{textAlign:'center'}}>
              <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,fontWeight:500}}>{d.l}</div>
              <div style={{color:d.c,fontSize:13,fontFamily:FONT.mono,fontWeight:600,marginTop:2}}>{d.v}</div>
            </div>
          ))}
        </div>
      </Glass>
      <Glass C={C}>
        <div className="flex items-end justify-between gap-4">
          <div style={{minWidth:0}}>
            <div style={{color:C.secondary,fontSize:12,fontFamily:FONT.text,fontWeight:500,letterSpacing:'-0.08px'}}>Depositato</div>
            <div style={{color:C.green,fontSize:30,fontFamily:FONT.display,fontWeight:600,letterSpacing:'-0.6px',lineHeight:1.1,marginTop:6,fontVariantNumeric:'tabular-nums',...neonText(C.green,C.scheme)}}>${totalIn.toLocaleString()}</div>
            <div style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono,marginTop:4}}>totale in entrata</div>
          </div>
          <div className="flex gap-5" style={{textAlign:'right',flexShrink:0}}>
            <div>
              <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,fontWeight:500}}>Netto</div>
              <div style={{color:(totalIn-totalOut)>=0?C.green:C.red,fontSize:15,fontFamily:FONT.mono,fontWeight:700,marginTop:3,fontVariantNumeric:'tabular-nums'}}>${(totalIn-totalOut).toLocaleString()}</div>
            </div>
            <div>
              <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,fontWeight:500}}>Depositi</div>
              <div style={{color:C.primary,fontSize:15,fontFamily:FONT.mono,fontWeight:700,marginTop:3}}>{TX.filter(t=>t.type==='Deposito').length}</div>
            </div>
          </div>
        </div>
      </Glass>
      <div className="grid grid-cols-2 gap-3">
        <Stat C={C} label="Prelevato"  value={`$${totalOut.toLocaleString()}`}  color={C.red}    sub="totale in uscita"/>
        <Stat C={C} label="Fee totali" value={`$${totalFee.toFixed(2)}`}        color={C.orange} sub="commissioni"/>
      </div>
      <Glass C={C}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span style={{fontFamily:FONT.display,fontSize:17,fontWeight:700,letterSpacing:'-0.3px',color:C.primary}}>Transazioni</span>
          <SegmentedControl C={C} options={['Tutti','Trade','Deposito','Prelievo']} value={typeFilter} onChange={setTypeFilter}/>
        </div>
        <div className="space-y-1">
          {txFiltered.length===0 && (
            <div style={{color:C.tertiary,fontSize:12,fontFamily:FONT.text,textAlign:'center',padding:'20px 0'}}>Nessuna transazione registrata</div>
          )}
          {txFiltered.map((tx,idx)=>{
            const isExp=expanded===tx.id;
            const col=typeColors[tx.type]||C.secondary;
            return (
              <div key={tx.id} style={{borderTop:idx===0?'none':`0.5px solid ${C.sep}`}}>
                <div onClick={()=>setExpanded(isExp?null:tx.id)}
                  className="xt-row flex items-center justify-between py-3 cursor-pointer px-2.5 -mx-2.5"
                  style={{background:isExp?C.glass3:'transparent',borderRadius:RADIUS.inset}}>
                  <div className="flex items-center gap-3">
                    <div style={{width:32,height:32,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:`${col}18`,border:`0.5px solid ${col}40`}}>
                      <span style={{color:col,fontSize:14}}>{tx.type==='Deposito'?'↓':tx.type==='Prelievo'?'↑':'⇄'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span style={{color:C.primary,fontSize:13,fontFamily:FONT.text,fontWeight:600}}>{tx.asset}</span>
                        <Tag color={col} size="sm">{tx.type}</Tag>
                        <Tag color={C.tertiary} size="sm">{tx.source}</Tag>
                      </div>
                      <div style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono,marginTop:1}}>{tx.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div style={{textAlign:'right'}}>
                      <div style={{color:tx.type==='Deposito'?C.green:tx.type==='Prelievo'?C.red:C.primary,fontSize:14,fontFamily:FONT.mono,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>
                        {tx.type==='Deposito'?'+':tx.type==='Prelievo'?'-':''}${Math.abs(tx.amount).toLocaleString()}
                      </div>
                      <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>{tx.qty} {tx.asset}</div>
                    </div>
                    <ChevronRight size={12} style={{color:C.tertiary,transform:isExp?'rotate(90deg)':'rotate(0deg)',transition:'transform 0.2s'}}/>
                  </div>
                </div>
                {isExp&&(
                  <div className="pb-3 px-2.5 -mx-2.5">
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {[
                        {l:'Prezzo',  v:`$${tx.price?.toLocaleString()||'—'}`},
                        {l:'Valore',  v:`$${tx.amount?.toLocaleString()||'—'}`},
                        {l:'Fee',     v:tx.fee||'—',c:C.orange},
                        {l:'Hash/ID', v:tx.hash?`${tx.hash.slice(0,8)}…`:'—'},
                        {l:'Wallet',  v:tx.wallet||'—'},
                        {l:'Stato',   v:tx.status||'Confermata',c:C.green},
                      ].map((d,i)=>(
                        <GlassInset C={C} key={i} padding="p-2.5">
                          <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.3px',textTransform:'uppercase'}}>{d.l}</div>
                          <div style={{color:d.c||C.primary,fontSize:11,fontFamily:FONT.mono,fontWeight:600,marginTop:2}}>{d.v}</div>
                        </GlassInset>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Glass>
    </div>
  );
};

/* ============= MATRICE ============= */
const MatrixView = ({ C, matrixData }) => {
  const DAYS = ['Lun','Mar','Mer','Gio','Ven'];
  const SESS = ['ASIAN','FRANKFURT','LONDON','NEWYORK'];
  const data = matrixData || DAYS.map(() => SESS.map(() => ({pnl:0,wr:0,rr:0,trades:0})));
  const allPnl = data.flat().map(c=>c.pnl).filter(v=>v!==0);
  const maxPnl = allPnl.length ? Math.max(...allPnl.map(Math.abs)) : 1;

  const cellColor = (pnl) => {
    if (pnl === 0) return { bg: C.glass2, text: C.tertiary, border: C.sep };
    const intensity = Math.min(Math.abs(pnl) / maxPnl, 1);
    const alpha = Math.round(intensity * 55).toString(16).padStart(2,'0');
    if (pnl > 0) return { bg: `${C.green}${alpha}`, text: C.green, border: `${C.green}40` };
    return { bg: `${C.red}${alpha}`, text: C.red, border: `${C.red}40` };
  };

  return (
    <Glass C={C}>
      <SectionHeader C={C} action={<span style={{color:C.secondary,fontSize:11,fontFamily:FONT.mono}}>P&L · WR · R:R</span>}>
        Matrice Giorno × Sessione
      </SectionHeader>
      <div className="overflow-x-auto">
        <div style={{ minWidth: 320 }}>
          {/* Header row */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `52px repeat(${SESS.length}, 1fr)`, marginBottom:4 }}>
            <div/>
            {SESS.map(s=>(
              <div key={s} style={{
                color:C.tertiary,fontSize:9,fontFamily:FONT.text,fontWeight:600,
                letterSpacing:'0.3px',textTransform:'uppercase',textAlign:'center',padding:'4px 2px',
              }}>{s}</div>
            ))}
          </div>
          {/* Data rows */}
          {DAYS.map((day,di) => (
            <div key={day} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `52px repeat(${SESS.length}, 1fr)` }}>
              <div style={{
                color:C.secondary,fontSize:11,fontFamily:FONT.text,fontWeight:600,
                display:'flex',alignItems:'center',paddingLeft:4,
              }}>{day}</div>
              {SESS.map((sess,si)=>{
                const c = data[di]?.[si] || {pnl:0,wr:0,rr:0,trades:0};
                const col = cellColor(c.pnl);
                const empty = c.trades === 0;
                return (
                  <div key={si} style={{
                    background: col.bg,
                    border: `0.5px solid ${col.border}`,
                    borderRadius: 10,
                    padding:'6px 4px',
                    textAlign:'center',
                  }}>
                    {empty ? (
                      <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono}}>—</span>
                    ) : (
                      <div style={{display:'flex',flexDirection:'column',gap:1}}>
                        <span style={{color:col.text,fontSize:11,fontFamily:FONT.mono,fontWeight:700,fontVariantNumeric:'tabular-nums'}}>
                          {c.pnl > 0 ? '+' : ''}{c.pnl.toFixed(0)}
                        </span>
                        <span style={{color:c.wr>=60?C.green:c.wr>=40?C.yellow:C.red,fontSize:9,fontFamily:FONT.mono,fontWeight:600}}>
                          {c.wr}%
                        </span>
                        <span style={{color:C.tertiary,fontSize:9,fontFamily:FONT.mono}}>
                          {(c.rr||0).toFixed(1)}R
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {/* Legend */}
          <div className="flex items-center gap-3 mt-2" style={{paddingLeft:4}}>
            <span style={{color:C.tertiary,fontSize:9,fontFamily:FONT.mono}}>P&L $</span>
            <span style={{color:C.tertiary,fontSize:9,fontFamily:FONT.mono}}>· WR %</span>
            <span style={{color:C.tertiary,fontSize:9,fontFamily:FONT.mono}}>· R:R</span>
          </div>
        </div>
      </div>
    </Glass>
  );
};

/* ============= STATISTICHE BREAKDOWN VIEW ============= */
const BreakdownView = ({ C, trades, stats, confluences, confidence, confBreakdown, confCorr }) => {
  const postStreak = stats?.postStreak || [];
  return (
  <div className="space-y-4">
    <MatrixView C={C} matrixData={stats?.matrixData}/>

    <BreakdownTable C={C} title="Per Sessione"
      columns={['Sessione','Trades','WR','P&L','Avg']}
      rows={stats?.breakSess || []} showColor/>

    <BreakdownTable C={C} title="Per Tipo Trade"
      columns={['Tipo','Trades','WR','P&L','Avg']}
      rows={stats?.breakType || []} showColor/>

    <BreakdownTable C={C} title="Per Giorno Settimana"
      columns={['Giorno','Trades','WR','P&L','Avg']}
      rows={(stats?.breakDay || []).filter(d=>d.trades>0)}/>

    <BreakdownTable C={C} title="Per Mese"
      columns={['Mese','Trades','WR','P&L']}
      rows={stats?.breakMonth || []}/>

    <BreakdownTable C={C} title="Per Ora · Amsterdam (DST auto)"
      action={<span style={{color:C.secondary,fontSize:13,fontFamily:FONT.mono}}>00:00 — 23:00</span>}
      columns={['Ora','Trades','WR','P&L']}
      rows={stats?.breakHour || []}/>

    <BreakdownTable C={C} title="Per Holding Time"
      columns={['Bucket','Trades','WR','P&L','Avg']}
      rows={stats?.breakHolding || []}/>

    <BreakdownTable C={C} title="Behavioral · Performance dopo streak"
      action={<span style={{color:C.secondary,fontSize:13,fontFamily:FONT.mono}}>tilt detection</span>}
      columns={['Stato','Trades','WR','P&L','Avg']}
      rows={postStreak.filter(r=>r.trades>0)}/>

    <BreakdownTable C={C} title="Behavioral · Confidence vs P&L"
      action={<span style={{color:C.secondary,fontSize:11,fontFamily:FONT.mono}}>correlazione stelle → risultati</span>}
      columns={['Rating','Trades','WR','P&L','Avg']}
      rows={confCorr || []}/>

    <BreakdownTable C={C} title="Per Confluenza"
      action={
        <span style={{color:C.secondary,fontSize:11,fontFamily:FONT.mono}}>
          {Object.keys(confluences||{}).length > 0 ? '● dati reali' : '○ inserisci confluenze'}
        </span>
      }
      columns={['CONFLUENZA','TRADES','WR','RR']}
      rows={confBreakdown || []} showColor showRR noPnl/>

    <SetupEdgeView C={C}/>
  </div>
  );
};

/* ============= SETUP EDGE DATA ============= */
// Combinazioni di confluenze — ordinate per WR reale sui trade registrati
// Esempi di riferimento setup — verranno calcolati dai trade reali una volta disponibili
// setupCombos: calcolato dai trade reali + confluences localStorage
// Nessun dato mock — appare solo quando ci sono trade taggati

/* ============= SETUP EDGE VIEW ============= */
const SetupEdgeView = ({ C }) => {
  const [confluences] = usePersistedState('xt_confluences', {});
  const [allTrades]   = usePersistedState('xt_sb_cache', null);
  const trades = React.useMemo(() => {
    try { const c = JSON.parse(localStorage.getItem('xt_sb_cache') || 'null'); return c?.trades || []; } catch { return []; }
  }, []);

  // Calcola combo dai tag reali
  const sorted = React.useMemo(() => {
    const closed = trades.filter(t => !t.open);
    if (closed.length === 0 || Object.keys(confluences).length === 0) return [];
    const comboMap = {};
    closed.forEach(trade => {
      const conf = confluences[trade.id] || confluences[trade.basket];
      if (!conf) return;
      const names = [
        ...(conf.noTF||[]).map(x=>x.name),
        ...(conf.withTF||[]).map(x=>x.name),
        ...(conf.vwap||[]).map(x=>x.bull&&x.bear?'VWAP KZ':x.bull?'VWAP ▲':'VWAP ▼'),
      ];
      if (names.length < 2) return;
      const key = [...names].sort().join(' + ');
      if (!comboMap[key]) comboMap[key] = { combo: names.join(' + '), trades:[], colors: names.map(n=>CONF_COLORS_MAP[n]||'#C77DFF') };
      comboMap[key].trades.push(trade);
    });
    return Object.values(comboMap).map(({combo,trades:tl,colors}) => {
      const wins = tl.filter(t=>t.pnl>0).length;
      const pnl  = tl.reduce((s,t)=>s+(t.pnl||0),0);
      const rrs  = tl.filter(t=>t.rr>0).map(t=>t.rr);
      return { combo, trades:tl.length, wr:Math.round(wins/tl.length*100), rr:rrs.length?rrs.reduce((s,r)=>s+r,0)/rrs.length:0, pnl, avg:pnl/tl.length, colors };
    }).sort((a,b) => b.wr!==a.wr ? b.wr-a.wr : b.trades-a.trades);
  }, [trades, confluences]);

  if (sorted.length === 0) return (
    <Glass C={C}>
      <SectionHeader C={C}>Setup Edge · Combo</SectionHeader>
      <div style={{color:C.tertiary,fontSize:13,textAlign:'center',padding:'24px 0',fontFamily:FONT.text}}>
        Appare quando hai trade con confluenze multiple taggate.<br/>
        <span style={{fontSize:11,opacity:0.6}}>Almeno 2 confluenze per trade.</span>
      </div>
    </Glass>
  );

  return (
    <Glass C={C}>
      <SectionHeader C={C}
        action={<span style={{color:C.secondary,fontSize:11,fontFamily:FONT.mono}}>↓ WIN RATE</span>}>
        Setup Edge · Combo
      </SectionHeader>

      <div className="space-y-2">
        {sorted.map((row, i) => {
          const wrColor = row.wr >= 80 ? C.green : row.wr >= 67 ? C.cyan : row.wr >= 50 ? C.yellow : C.red;
          const wins = Math.round(row.trades * row.wr / 100);
          return (
            <div key={i} style={{
              background: i % 2 === 1 ? C.glass2 : 'transparent',
              borderRadius: 12,
              padding: '10px 12px',
              border: `0.5px solid ${i === 0 ? C.green+'30' : C.sep}`,
            }}>
              {/* Chips combo + WR badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-1" style={{flex:1, minWidth:0}}>
                  {i === 0 && (
                    <span style={{
                      fontSize:9, fontFamily:FONT.mono, fontWeight:700,
                      color:C.green, background:`${C.green}18`,
                      padding:'1px 6px', borderRadius:6, marginRight:2,
                    }}>BEST</span>
                  )}
                  {row.combo.split(' + ').map((part, ci) => (
                    <span key={ci} style={{
                      fontSize:11, fontFamily:FONT.mono, fontWeight:700,
                      color: row.colors[ci] || C.secondary,
                      background:`${row.colors[ci] || C.secondary}15`,
                      padding:'2px 7px', borderRadius:7,
                      border:`0.5px solid ${(row.colors[ci] || C.secondary)}35`,
                      whiteSpace:'nowrap',
                    }}>{part}</span>
                  ))}
                </div>
                {/* WR badge */}
                <div style={{
                  flexShrink:0,
                  background:`${wrColor}15`,
                  border:`0.5px solid ${wrColor}40`,
                  borderRadius:8, padding:'4px 10px',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:1,
                }}>
                  <span style={{fontSize:16,fontFamily:FONT.mono,fontWeight:700,color:wrColor,fontVariantNumeric:'tabular-nums',lineHeight:1}}>{row.wr}%</span>
                  <span style={{fontSize:8,fontFamily:FONT.text,fontWeight:600,color:C.tertiary,letterSpacing:'0.2px',textTransform:'uppercase'}}>win rate</span>
                </div>
              </div>

              {/* Barra WR */}
              <div style={{height:3, borderRadius:2, background:C.glass3, marginBottom:6, overflow:'hidden'}}>
                <div style={{
                  height:'100%', borderRadius:2,
                  width:`${row.wr}%`,
                  background:`linear-gradient(90deg, ${wrColor}, ${wrColor}88)`,
                  boxShadow:`0 0 6px ${wrColor}40`,
                }}/>
              </div>

              {/* Trades W/L + RR */}
              <div className="flex items-center gap-3 flex-wrap">
                <span style={{fontSize:10,fontFamily:FONT.mono,color:C.secondary,fontWeight:600}}>
                  {row.trades} trade{row.trades!==1?'s':''}
                </span>
                <span style={{color:C.tertiary,fontSize:10}}>·</span>
                <span style={{fontSize:10,fontFamily:FONT.mono}}>
                  <span style={{color:C.green,fontWeight:700}}>{wins}W</span>
                  <span style={{color:C.tertiary}}> / </span>
                  <span style={{color:C.red,fontWeight:700}}>{row.trades - wins}L</span>
                </span>
                <span style={{color:C.tertiary,fontSize:10}}>·</span>
                <span style={{fontSize:10,fontFamily:FONT.mono,color:C.cyan,fontWeight:600}}>{row.rr!=null?(+row.rr).toFixed(1):'—'}R medio</span>
              </div>
            </div>
          );
        })}
      </div>
    </Glass>
  );
};

/* ============= CONFLUENCE & CONFIDENCE BREAKDOWN ============= */
const computeConfluenceBreakdown = (trades, confluences) => {
  if (!trades||!confluences||Object.keys(confluences).length===0) return [];
  const confMap = {};
  trades.filter(t=>!t.open).forEach(trade => {
    const conf = confluences[trade.id] || confluences[trade.basket];
    if (!conf) return;
    const names = [
      ...(conf.noTF||[]).map(x=>x.name),
      ...(conf.withTF||[]).map(x=>x.name),
      ...(conf.vwap||[]).map(x=>x.bull&&x.bear?'VWAP KEYZONE':x.bull?'VWAP ▲':'VWAP ▼'),
    ].map(n=>n.startsWith('VWAP')?'VWAP':n);
    [...new Set(names)].forEach(name=>{
      if(!confMap[name])confMap[name]=[];
      confMap[name].push(trade);
    });
  });
  return Object.entries(confMap).map(([name,tlist])=>{
    const wins=tlist.filter(t=>t.pnl>0);
    const pnl=tlist.reduce((s,t)=>s+(t.pnl||0),0);
    const rrs=tlist.filter(t=>t.rr>0).map(t=>t.rr);
    return { name, trades:tlist.length, wr:tlist.length?Math.round(wins.length/tlist.length*100):0,
      rr:rrs.length?rrs.reduce((s,r)=>s+r,0)/rrs.length:0, pnl, avg:tlist.length?pnl/tlist.length:0,
      color:CONF_COLORS_MAP[name]||'#C77DFF' };
  }).sort((a,b)=>b.wr!==a.wr?b.wr-a.wr:(b.rr||0)-(a.rr||0));
};

const computeConfidenceBreakdown = (trades, confidence) => {
  if (!trades||!confidence) return [];
  const closed=trades.filter(t=>!t.open);
  const buckets={1:[],2:[],3:[],4:[],5:[]};
  closed.forEach(t=>{ const c=confidence[t.id]; if(c>=1&&c<=5)buckets[c].push(t); });
  const labels={1:'1 ★',2:'2 ★★',3:'3 ★★★',4:'4 ★★★★',5:'5 ★★★★★'};
  return [1,2,3,4,5].map(star=>{
    const tlist=buckets[star];
    const wins=tlist.filter(t=>t.pnl>0);
    const pnl=tlist.reduce((s,t)=>s+(t.pnl||0),0);
    return { name:labels[star], trades:tlist.length,
      wr:tlist.length?Math.round(wins.length/tlist.length*100):0, pnl, avg:tlist.length?pnl/tlist.length:0 };
  }).filter(r=>r.trades>0);
};


/* ============= ERROR BOUNDARY ============= */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, info) { console.error('[Journal]', e, info); }
  render() {
    if (this.state.error) {
      const C = this.props.C || { bg:'#000', primary:'#fff', secondary:'#888',
        tertiary:'#555', glass2:'#1c1c1e', sep:'#2c2c2e', green:'#39FF14',
        red:'#FF073A', cyan:'#7DF9FF' };
      return (
        <div style={{
          padding:'32px 20px', textAlign:'center',
          background: C.glass2, borderRadius:20, margin:16,
          border: `1px solid ${C.sep}`,
        }}>
          <div style={{fontSize:32, marginBottom:12}}>⚠️</div>
          <div style={{color:C.primary, fontSize:16, fontWeight:600, marginBottom:8}}>
            Errore di rendering
          </div>
          <div style={{color:C.secondary, fontSize:12, fontFamily:'monospace',
            background:'rgba(255,7,58,0.08)', padding:'12px', borderRadius:10,
            textAlign:'left', wordBreak:'break-all', marginBottom:16,
          }}>
            {this.state.error?.message || 'Errore sconosciuto'}
          </div>
          <button onClick={()=>this.setState({error:null})}
            style={{padding:'8px 20px', background:C.green, color:'#000',
              border:'none', borderRadius:20, cursor:'pointer', fontWeight:600}}>
            Riprova
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============= AI VIEW — Chat con Gemini ============= */
const AIView = ({ C, trades, equity, settings, activeAccount, currentTab, setAiThinking, setInputFocused }) => {
  const [messages, setMessagesRaw] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('xt_ai_messages')||'[]'); } catch { return []; }
  });
  const setMessages = React.useCallback(msgs => {
    setMessagesRaw(msgs);
    try { localStorage.setItem('xt_ai_messages', JSON.stringify(msgs.slice(-40))); } catch {}
  }, []);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const scrollRef = React.useRef(null);
  const inputRef = React.useRef(null);

  // Auto-scroll in fondo quando arrivano messaggi
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const buildContext = React.useCallback(() => {
    const wallets  = settings?.wallets   || [];
    const exchanges= settings?.exchanges || [];
    const currency = settings?.currency  || 'USD';
    const aiAssets = MOCK_STORE.assets;
    const totalValue  = MOCK_STORE.totalValue;
    const totalPnl24h = MOCK_STORE.totalPnl24h;
    const stableValue = 0;
    const stablePct   = '0.0';
    let rebalanceTargets = {};
    try { rebalanceTargets = JSON.parse(localStorage.getItem('xt_rb_targets') || '{}'); } catch {}
    return {
      data_ora: new Date().toLocaleString('it-IT'),
      valuta_base: currency,
      portfolio: {
        valore_totale_usd: totalValue.toFixed(2),
        pnl_24h_usd: totalPnl24h.toFixed(2),
        pnl_24h_pct: ((totalPnl24h/totalValue)*100).toFixed(2),
        stablecoin_usd: stableValue,
        stablecoin_pct: stablePct,
        wallet_collegati: wallets.length,
        exchange_collegati: exchanges.length,
      },
      asset: aiAssets.map(a => ({
        simbolo: a.symbol, nome: a.name, quantita: a.amount,
        prezzo_usd: a.price, valore_usd: a.value.toFixed(2),
        variazione_24h_pct: a.chg24h, allocazione_pct: a.alloc, tipo: a.type,
      })),
      target_rebalance: rebalanceTargets,
    };
  }, [settings]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setAiThinking?.(true);
    haptic.light();

    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 2000;

    const attemptFetch = async (attempt) => {
      const ctx = buildContext();
      const r = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context: ctx }),
      });

      // 429 Too Many Requests — attendi e riprova con backoff esponenziale
      if (r.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter = parseInt(r.headers.get('Retry-After') || '0', 10) * 1000;
        const delay = retryAfter > 0 ? retryAfter : BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await new Promise(res => setTimeout(res, delay));
        return attemptFetch(attempt + 1);
      }

      return r;
    };

    try {
      const r = await attemptFetch(1);
      const data = await r.json();
      if (!r.ok) {
        const msg = r.status === 429
          ? 'Limite richieste raggiunto (429) — riprova tra qualche minuto.'
          : (data.error || `Errore ${r.status}`);
        setError(msg);
        haptic.error();
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.text }]);
        haptic.success();
      }
    } catch (err) {
      setError('Connessione fallita: ' + err.message);
      haptic.error();
    } finally { setLoading(false); setAiThinking?.(false); }
  };

  const clearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm('Cancellare tutta la conversazione?')) {
      haptic.medium();
      setMessages([]);
      setError(null);
    }
  };

  const suggestions = [
    'Come è distribuito il mio portfolio?',
    'Quali asset hanno performato meglio?',
    'Il mio portfolio è troppo concentrato?',
    'Suggerisci come ribilanciare',
  ];

  return (
    <div style={{
      /* Container full height del pager — l'input resta sempre in fondo, mai coperto dalla tab bar */
      display: 'flex', flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      gap: 12,
    }}>
      {/* Pulsante "Nuova chat" — appare solo quando ci sono messaggi, in alto a destra */}
      {messages.length > 0 && (
        <div className="flex justify-end px-1" style={{flexShrink:0}}>
          <button onClick={clearChat} className="xt-btn" style={{
            padding: '6px 12px', fontSize: 11, fontFamily: FONT.text, fontWeight: 600,
            color: C.tertiary, background: 'transparent',
            border: `0.5px solid ${C.sep}`, borderRadius: RADIUS.pill,
            cursor: 'pointer',
          }}>Nuova chat</button>
        </div>
      )}

      {/* MESSAGGI — flex:1, occupa tutto lo spazio disponibile, scrolla solo internamente */}
      <div ref={scrollRef} style={{
        flex: 1, minHeight: 0,
        overflowY: messages.length > 0 ? 'auto' : 'hidden',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch', padding: '4px 2px',
      }}>
        {messages.length === 0 && (
          <Glass C={C} padding="p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div style={{
                width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconAI color={C.primary}/>
              </div>
              <div>
                <div style={{
                  color: C.primary, fontSize: 16, fontFamily: FONT.display,
                  fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 4,
                }}>Chiedimi qualunque cosa</div>
                <div style={{
                  color: C.tertiary, fontSize: 12, fontFamily: FONT.text,
                  lineHeight: 1.5, maxWidth: 280,
                }}>
                  Ho accesso completo ai tuoi trade, metriche e note.
                  Rispondo descrivendo i dati, non do consigli operativi.
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => { haptic.selection(); setInput(s); inputRef.current?.focus(); }}
                    className="xt-btn xt-chip" style={{
                    padding: '6px 12px', fontSize: 11, fontFamily: FONT.text, fontWeight: 500,
                    color: C.secondary, background: C.glass2,
                    border: `0.5px solid ${C.sep}`, borderRadius: RADIUS.pill,
                    cursor: 'pointer', letterSpacing: '-0.08px',
                  }}>{s}</button>
                ))}
              </div>
            </div>
          </Glass>
        )}

        {messages.map((m, i) => (
          <div key={i} className="xt-page" style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 10,
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: m.role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
              background: m.role === 'user' ? C.glass3 : C.glass2,
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: `0.5px solid ${C.sep2}`,
              color: C.primary,
              fontSize: 14, fontFamily: FONT.text, fontWeight: 400,
              letterSpacing: '-0.1px', lineHeight: 1.45,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
            }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '20px 20px 20px 6px',
              background: C.glass2,
              border: `0.5px solid ${C.sep2}`,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {[0,1,2].map(i => (
                <div key={i} className="xt-live-dot" style={{
                  width: 6, height: 6, borderRadius: 3,
                  background: C.secondary, opacity: 0.6,
                  animationDelay: `${i * 0.15}s`,
                }}/>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: `${C.red}15`,
            border: `0.5px solid ${C.red}40`,
            borderRadius: 14, padding: '10px 14px',
            color: C.red, fontSize: 12, fontFamily: FONT.mono,
            marginBottom: 10,
          }}>⚠️ {error}</div>
        )}
      </div>

      {/* INPUT — fisso in fondo al container, sopra la tab bar */}
      <div style={{flexShrink:0, marginBottom: 15}}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          background: C.glass, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: `0.5px solid ${C.sep2}`,
          borderRadius: 24, padding: '6px 6px 6px 14px',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={e=>{e.target.style.fontSize='16px';setInputFocused?.(true);}}
            onBlur={e=>{e.target.style.fontSize='14px';setInputFocused?.(false);}}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Chiedi qualcosa sui tuoi dati..."
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: C.primary, fontSize: 16, fontFamily: FONT.text,
              resize: 'none', padding: '8px 0', maxHeight: 120,
              letterSpacing: '-0.1px', lineHeight: 1.4,
            }}
          />
          <button onClick={send} disabled={loading || !input.trim()} className="xt-btn" style={{
            width: 36, height: 36, borderRadius: 18,
            background: !input.trim() || loading ? C.glass3 : C.primary,
            border: 'none', cursor: !input.trim() || loading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7"
                stroke={!input.trim() || loading ? C.tertiary : C.bg}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

/* ============= MERCATO VIEW ============= */
const MercatoView = ({C, settings}) => {
  const currency=settings?.currency||'USD';
  const currSym=currency==='EUR'?'€':currency==='BTC'?'₿':'$';
  const GLOBAL       = MOCK_STORE.globalPrices;
  const PORT         = MOCK_STORE.portfolioPrices;
  const ALL_PRICES   = [...GLOBAL,...PORT];
  // Dati globali di mercato: collegare a un'API prezzi (es. CoinGecko). Nessun valore inventato.
  const BTC_DOM=0, TOTAL_MCAP=0, FNG={value:0,label:'—',color:C.tertiary};
  const ETH_BTC=GLOBAL.length>1?(GLOBAL[1].price/GLOBAL[0].price).toFixed(5):'—';
  const MOVERS=[...ALL_PRICES].sort((a,b)=>Math.abs(b.chg24h)-Math.abs(a.chg24h)).slice(0,4);
  const fmtB=v=>v>=1e12?`${(v/1e12).toFixed(2)}T`:v>=1e9?`${(v/1e9).toFixed(1)}B`:`${(v/1e6).toFixed(0)}M`;
  const fmtP=v=>v>=1000?v.toLocaleString('en-US',{maximumFractionDigits:0}):v<0.01?v.toFixed(6):v<1?v.toFixed(4):v.toFixed(2);
  const W=48,H=24;
  const renderSpark=(p)=>{
    if(!p.spark||p.spark.length<2) return null;
    const sv=p.spark,mn=Math.min(...sv),mx=Math.max(...sv),rn=mx-mn||1;
    const pts=sv.map((v,i)=>{
      const x=(i/(sv.length-1))*W,y=H-((v-mn)/rn)*H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const sc=p.chg7d>=0?C.green:C.red;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{flexShrink:0}}>
        <defs><linearGradient id={`sg_${p.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sc} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={sc} stopOpacity="0"/>
        </linearGradient></defs>
        <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#sg_${p.id})`}/>
        <polyline points={pts} fill="none" stroke={sc} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };
  return (
    <div className="space-y-4">
      {/* SENTIMENT 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        <Glass C={C} padding="p-4">
          <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.4px',textTransform:'uppercase',marginBottom:6}}>Fear & Greed</div>
          <div style={{position:'relative',width:'100%',paddingBottom:'52%',overflow:'hidden'}}>
            <svg viewBox="0 0 100 52" style={{position:'absolute',inset:0,width:'100%',height:'100%'}} preserveAspectRatio="xMidYMid meet">
              <path d="M5,50 A45,45 0 0,1 95,50" fill="none" stroke={C.glass3} strokeWidth="10" strokeLinecap="round"/>
              <path d="M5,50 A45,45 0 0,1 95,50" fill="none" stroke={FNG.color} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(FNG.value/100)*141.4} 141.4`}/>
              <text x="50" y="46" textAnchor="middle" fill={C.primary} fontSize="19" fontFamily="monospace" fontWeight="700">{FNG.value}</text>
            </svg>
          </div>
          <div style={{color:FNG.color,fontSize:12,fontFamily:FONT.text,fontWeight:600,textAlign:'center',marginTop:2}}>{FNG.label}</div>
        </Glass>
        <Glass C={C} padding="p-4">
          <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.4px',textTransform:'uppercase',marginBottom:6}}>BTC Dominance</div>
          <div style={{fontFamily:FONT.display,fontSize:30,fontWeight:700,letterSpacing:'-0.8px',color:C.orange}}>{BTC_DOM}%</div>
          <div style={{display:'flex',height:6,borderRadius:9999,overflow:'hidden',marginTop:8}}>
            <div style={{width:`${BTC_DOM}%`,background:`linear-gradient(90deg,${C.orange},${C.yellow})`}}/>
            <div style={{flex:1,background:C.glass3}}/>
          </div>
          <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,marginTop:4}}>Alt {(100-BTC_DOM).toFixed(1)}%</div>
        </Glass>
        <Glass C={C} padding="p-4">
          <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.4px',textTransform:'uppercase',marginBottom:6}}>Total MCap</div>
          <div style={{fontFamily:FONT.display,fontSize:28,fontWeight:700,letterSpacing:'-0.6px',color:C.cyan}}>${TOTAL_MCAP}T</div>
          <div style={{color:C.red,fontSize:11,fontFamily:FONT.mono,fontWeight:600,marginTop:4}}>-2.1% 24h</div>
          <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,marginTop:2}}>capitalizzazione globale</div>
        </Glass>
        <Glass C={C} padding="p-4">
          <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.4px',textTransform:'uppercase',marginBottom:6}}>ETH / BTC</div>
          <div style={{fontFamily:FONT.display,fontSize:28,fontWeight:700,letterSpacing:'-0.6px',color:C.purple}}>{ETH_BTC}</div>
          <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,marginTop:4}}>rapporto relativo</div>
        </Glass>
      </div>
      {/* TOP MOVERS */}
      <Glass C={C}>
        <SectionHeader C={C}>Top Movers 24h</SectionHeader>
        <div className="grid grid-cols-2 gap-2">
          {MOVERS.map(p=>(
            <GlassInset C={C} key={p.id} padding="p-3">
              <div className="flex items-center justify-between mb-1">
                <span style={{color:C.primary,fontSize:12,fontFamily:FONT.text,fontWeight:600}}>{p.symbol}</span>
                <Tag color={p.chg24h>=0?C.green:C.red} size="sm">{p.chg24h>=0?'▲':'▼'}</Tag>
              </div>
              <div style={{color:p.chg24h>=0?C.green:C.red,fontSize:15,fontFamily:FONT.mono,fontWeight:700,fontVariantNumeric:'tabular-nums'}}>{p.chg24h>=0?'+':''}{p.chg24h.toFixed(2)}%</div>
              <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono,marginTop:2}}>{currSym}{fmtP(p.price)}</div>
            </GlassInset>
          ))}
        </div>
      </Glass>
      {/* PREZZI LIVE */}
      <Glass C={C}>
        <div className="flex items-center justify-between mb-3">
          <span style={{fontFamily:FONT.display,fontSize:17,fontWeight:700,letterSpacing:'-0.3px',color:C.primary}}>Prezzi live</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1" style={{background:`${C.red}12`,border:`0.5px solid ${C.red}35`,borderRadius:RADIUS.pill}}>
            <div className="w-1 h-1 rounded-full" style={{background:C.red}}/>
            <span style={{color:C.red,fontSize:11,fontFamily:FONT.mono,fontWeight:600}}>Sample</span>
          </div>
        </div>
        <div className="space-y-1">
          {ALL_PRICES.map((p,idx)=>(
            <div key={p.id} className="flex items-center justify-between py-3" style={{borderTop:idx===0?'none':`0.5px solid ${C.sep}`}}>
              <div className="flex items-center gap-3">
                <div style={{width:32,height:32,borderRadius:10,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:p.chg24h>=0?`${C.green}18`:`${C.red}18`,border:`0.5px solid ${p.chg24h>=0?C.green:C.red}35`}}>
                  <span style={{color:p.chg24h>=0?C.green:C.red,fontSize:10,fontFamily:FONT.mono,fontWeight:700}}>{p.symbol.slice(0,4)}</span>
                </div>
                <div>
                  <div style={{color:C.primary,fontSize:13,fontFamily:FONT.text,fontWeight:600}}>{p.name}</div>
                  <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono,marginTop:1}}>Vol {fmtB(p.vol24h)} · {fmtB(p.mcap)}</div>
                </div>
              </div>
              {renderSpark(p)}
              <div style={{textAlign:'right'}}>
                <div style={{color:C.primary,fontSize:14,fontFamily:FONT.mono,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{currSym}{fmtP(p.price)}</div>
                <div style={{color:p.chg24h>=0?C.green:C.red,fontSize:11,fontFamily:FONT.mono,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{p.chg24h>=0?'+':''}{p.chg24h.toFixed(2)}% · 7d {p.chg7d>=0?'+':''}{p.chg7d.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
};

/* ============= STATS ROOT VIEW ============= */
const MetricheView = ({C,trades}) => <StatsRootView C={C}/>;
const StatsRootView = ({C}) => {
  const [section,setSection]=usePersistedState('xt_stats_sec','Performance');
  const SECTIONS=['Performance','Rischio','Composizione','Rebalance'];
  const perf=MOCK_STORE.perf, risk=MOCK_STORE.risk, comp=MOCK_STORE.comp;
  const fmt=(v,d=1)=>isFinite(v)?v.toFixed(d):'—';
  const fmtUsd=v=>`$${Math.abs(v).toLocaleString('en-US',{maximumFractionDigits:0})}`;
  return (
    <div className="space-y-4">
      <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch',paddingBottom:2}}>
        <div style={{display:'flex',gap:6,minWidth:'max-content'}}>
          {SECTIONS.map(s=>(
            <button key={s} onClick={()=>setSection(s)} style={{
              padding:'7px 16px',borderRadius:RADIUS.pill,border:'none',cursor:'pointer',
              fontFamily:FONT.text,fontSize:13,fontWeight:section===s?600:400,
              color:section===s?C.bg:C.secondary,
              background:section===s?C.primary:C.glass2,
              whiteSpace:'nowrap',transition:'all 0.15s ease',
            }}>{s}</button>
          ))}
        </div>
      </div>
      {section==='Performance'&&(
        <div className="space-y-4">
          <Glass C={C}>
            <SectionHeader C={C}>Rendimento</SectionHeader>
            <div className="grid grid-cols-2 gap-2">
              {[
                {l:'TWRR',   v:`${perf.twrr>=0?'+':''}${fmt(perf.twrr)}%`,   c:perf.twrr>=0?C.green:C.red,   sub:'time-weighted'},
                {l:'MWRR',   v:`${perf.mwrr>=0?'+':''}${fmt(perf.mwrr)}%`,   c:perf.mwrr>=0?C.green:C.red,   sub:'money-weighted'},
                {l:'CAGR',   v:`${fmt(perf.cagr)}%`,                           c:C.cyan,                        sub:'annualizzato'},
                {l:'ROI 30D',v:`${perf.roi30d>=0?'+':''}${fmt(perf.roi30d)}%`,c:C.purple,                      sub:'ultimi 30 giorni'},
              ].map((d,i)=>(
                <GlassInset C={C} key={i} padding="p-3">
                  <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.3px',textTransform:'uppercase'}}>{d.l}</div>
                  <div style={{color:d.c,fontSize:18,fontFamily:FONT.mono,fontWeight:700,marginTop:4,fontVariantNumeric:'tabular-nums'}}>{d.v}</div>
                  <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,marginTop:2}}>{d.sub}</div>
                </GlassInset>
              ))}
            </div>
          </Glass>
          <Glass C={C}>
            <SectionHeader C={C}>Asset Performance</SectionHeader>
            <div className="grid grid-cols-2 gap-2">
              <GlassInset C={C} padding="p-3">
                <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.3px',textTransform:'uppercase',marginBottom:4}}>Best</div>
                <div style={{color:C.green,fontSize:20,fontFamily:FONT.mono,fontWeight:700}}>+{fmt(perf.bestPct)}%</div>
                <div style={{color:C.primary,fontSize:13,fontFamily:FONT.text,fontWeight:600,marginTop:2}}>{perf.bestAsset}</div>
              </GlassInset>
              <GlassInset C={C} padding="p-3">
                <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.3px',textTransform:'uppercase',marginBottom:4}}>Worst</div>
                <div style={{color:C.red,fontSize:20,fontFamily:FONT.mono,fontWeight:700}}>{fmt(perf.worstPct)}%</div>
                <div style={{color:C.primary,fontSize:13,fontFamily:FONT.text,fontWeight:600,marginTop:2}}>{perf.worstAsset}</div>
              </GlassInset>
            </div>
          </Glass>
          <Glass C={C}>
            <SectionHeader C={C}>Benchmark</SectionHeader>
            <div className="space-y-2">
              {[
                {l:'Portfolio',v:perf.roi30d,c:C.cyan},
                {l:'BTC',      v:perf.btcBench,c:C.orange},
                {l:'ETH',      v:perf.ethBench,c:C.purple},
                {l:'S&P 500',  v:perf.sp500Bench,c:C.yellow},
              ].map((b,i)=>(
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{color:i===0?C.primary:C.secondary,fontSize:12,fontFamily:FONT.text,fontWeight:i===0?600:400}}>{b.l}</span>
                    <span style={{color:b.v>=0?C.green:C.red,fontSize:12,fontFamily:FONT.mono,fontWeight:600}}>{b.v>=0?'+':''}{fmt(b.v)}%</span>
                  </div>
                  <div style={{display:'flex',height:4,borderRadius:9999,overflow:'hidden',background:C.glass3}}>
                    <div style={{width:`${Math.min(Math.abs(b.v)/15*100,100)}%`,background:b.v>=0?`linear-gradient(90deg,${b.c},${b.c}88)`:C.red,borderRadius:9999,transition:'width 0.6s cubic-bezier(0.34,1.18,0.64,1)'}}/>
                  </div>
                </div>
              ))}
            </div>
          </Glass>
          <Glass C={C}>
            <SectionHeader C={C}>DCA Tracker</SectionHeader>
            <div className="space-y-1">
              {comp.dca.map((d,i)=>(
                <div key={d.symbol} className="flex items-center justify-between py-2.5" style={{borderTop:i===0?'none':`0.5px solid ${C.sep}`}}>
                  <div>
                    <span style={{color:C.primary,fontSize:13,fontFamily:FONT.text,fontWeight:600}}>{d.symbol}</span>
                    <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono,marginLeft:8}}>avg ${d.avgPrice.toLocaleString()}</span>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{color:C.primary,fontSize:12,fontFamily:FONT.mono}}>${d.currentPrice.toLocaleString()}</div>
                    <div style={{color:d.pct>=0?C.green:C.red,fontSize:11,fontFamily:FONT.mono,fontWeight:600}}>{d.pct>=0?'+':''}{fmt(d.pct)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Glass>
        </div>
      )}
      {section==='Rischio'&&(
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Stat C={C} label="Sharpe"       value={fmt(risk.sharpe)}            color={C.cyan}   sub="risk-adjusted"/>
            <Stat C={C} label="VaR 95%"      value={`${fmt(risk.var95)}%`}       color={C.red}    sub={`${fmtUsd(risk.var95Usd)} max 24h`}/>
            <Stat C={C} label="Max Drawdown" value={`${fmt(risk.drawdown)}%`}   color={C.red}    sub={fmtUsd(risk.drawdownUsd)}/>
            <Stat C={C} label="Volatilità"   value={`${fmt(risk.volatility)}%`} color={C.yellow} sub="annualizzata"/>
          </div>
          <Glass C={C}>
            <SectionHeader C={C}>Beta & Correlazione</SectionHeader>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <GlassInset C={C} padding="p-3">
                <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.3px',textTransform:'uppercase',marginBottom:4}}>Beta vs BTC</div>
                <div style={{color:C.orange,fontSize:22,fontFamily:FONT.mono,fontWeight:700}}>{fmt(risk.beta)}</div>
                <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,marginTop:2}}>{risk.beta<0.8?'meno volatile di BTC':risk.beta>1.2?'più volatile di BTC':'in linea con BTC'}</div>
              </GlassInset>
              <GlassInset C={C} padding="p-3">
                <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.3px',textTransform:'uppercase',marginBottom:4}}>Herfindahl</div>
                <div style={{color:comp.herfindahl>0.5?C.red:comp.herfindahl>0.25?C.yellow:C.green,fontSize:22,fontFamily:FONT.mono,fontWeight:700}}>{fmt(comp.herfindahl,2)}</div>
                <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,marginTop:2}}>{comp.herfindahl>0.5?'alta concentrazione':comp.herfindahl>0.25?'concentrazione media':'ben diversificato'}</div>
              </GlassInset>
            </div>
          </Glass>
        </div>
      )}
      {section==='Composizione'&&(
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Stat C={C} label="Stablecoin" value="0%"                           color={C.yellow} sub="$0 liquidità"/>
            <Stat C={C} label="Turnover"   value="0%"                           color={C.cyan}   sub="rotazione mensile"/>
          </div>
          <Glass C={C}>
            <SectionHeader C={C}>DEX vs CEX</SectionHeader>
            <div className="flex items-center justify-between mb-2">
              <span style={{color:C.green,fontSize:13,fontFamily:FONT.mono,fontWeight:600}}>DEX {comp.onChainPct}%</span>
              <span style={{color:C.orange,fontSize:13,fontFamily:FONT.mono,fontWeight:600}}>CEX {comp.cexPct}%</span>
            </div>
            <div style={{display:'flex',height:8,borderRadius:9999,overflow:'hidden'}}>
              <div style={{width:`${comp.onChainPct}%`,background:`linear-gradient(90deg,${C.green},${C.cyan})`}}/>
              <div style={{flex:1,background:`linear-gradient(90deg,${C.orange},${C.pink})`}}/>
            </div>
          </Glass>
          <Glass C={C}>
            <SectionHeader C={C}>DCA Tracker</SectionHeader>
            <div className="space-y-1">
              {comp.dca.map((d,i)=>(
                <div key={d.symbol} className="flex items-center justify-between py-2.5" style={{borderTop:i===0?'none':`0.5px solid ${C.sep}`}}>
                  <div>
                    <span style={{color:C.primary,fontSize:13,fontFamily:FONT.text,fontWeight:600}}>{d.symbol}</span>
                    <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono,marginLeft:8}}>avg ${d.avgPrice.toLocaleString()}</span>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{color:C.primary,fontSize:12,fontFamily:FONT.mono}}>${d.currentPrice.toLocaleString()}</div>
                    <div style={{color:d.pct>=0?C.green:C.red,fontSize:11,fontFamily:FONT.mono,fontWeight:600}}>{d.pct>=0?'+':''}{fmt(d.pct)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Glass>
        </div>
      )}
      {section==='Rebalance'&&<RebalanceView C={C}/>}
    </div>
  );
};

/* ============= REBALANCE VIEW ============= */
const RebalanceView = ({C}) => {
  const [targets,setTargets]=usePersistedState('xt_rb_targets',MOCK_STORE.rebalanceTargets);
  const [rebalanceLog,setRebalanceLog]=usePersistedState('xt_rb_log',[]);
  const [editingTarget,setEditingTarget]=useState(null);
  const [editVal,setEditVal]=useState('');
  const CURRENT=MOCK_STORE.assets;
  const totalValue=MOCK_STORE.totalValue;
  const assets=CURRENT.map(a=>{
    const target=targets[a.symbol]??0;
    const actualPct=totalValue>0?(a.value/totalValue)*100:0;
    const diff=actualPct-target;
    const diffUsd=(Math.abs(diff)/100)*totalValue;
    const diffTokens=diffUsd/a.price;
    return{...a,target,actualPct,diff,diffUsd,diffTokens};
  });
  const totalTarget=Object.values(targets).reduce((s,v)=>s+(Number(v)||0),0);
  const targetOk=Math.abs(totalTarget-100)<0.1;
  const surplusPool=assets.filter(a=>a.diff>0).map(a=>({...a,remaining:a.diffUsd})).sort((a,b)=>b.diff-a.diff);
  const deficitPool=assets.filter(a=>a.diff<0).map(a=>({...a,remaining:a.diffUsd})).sort((a,b)=>a.diff-b.diff);
  const actions=[];
  deficitPool.forEach(def=>{
    let needed=def.diffUsd;
    const ordered=[...surplusPool.filter(s=>s.mcapTier===def.mcapTier&&s.remaining>0),...surplusPool.filter(s=>s.mcapTier!==def.mcapTier&&s.remaining>0)];
    ordered.forEach(sur=>{
      if(needed<=0) return;
      const use=Math.min(sur.remaining,needed);
      if(use<1) return;
      actions.push({type:'swap',sell:sur,buy:def,amountUsd:use,sellTokens:use/sur.price,buyTokens:use/def.price,sameTier:sur.mcapTier===def.mcapTier});
      sur.remaining-=use; needed-=use;
    });
    if(needed>1) actions.push({type:'fiat',buy:def,amountUsd:needed,buyTokens:needed/def.price});
  });
  const fmtUsd=v=>`$${Math.abs(v).toLocaleString('en-US',{maximumFractionDigits:0})}`;
  const fmtTok=(v,price)=>price>=1000?v.toFixed(6):price>=1?v.toFixed(4):v.toFixed(2);
  const fmtPrc=v=>v>=1000?v.toLocaleString('en-US',{maximumFractionDigits:0}):v<1?v.toFixed(4):v.toFixed(2);
  const startEdit=(sym,val)=>{setEditingTarget(sym);setEditVal(String(val));};
  const commitEdit=sym=>{const v=parseFloat(editVal);if(!isNaN(v)&&v>=0&&v<=100)setTargets({...targets,[sym]:v});setEditingTarget(null);};
  const balanced=actions.length===0;
  const totalSwap=actions.filter(a=>a.type==='swap').reduce((s,a)=>s+a.amountUsd,0);
  const totalFiat=actions.filter(a=>a.type==='fiat').reduce((s,a)=>s+a.amountUsd,0);
  return (
    <div className="space-y-4">
      {!balanced&&(
        <Glass C={C} padding="p-4">
          <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.4px',textTransform:'uppercase',marginBottom:10}}>Riepilogo rebalance</div>
          <div style={{display:'flex',gap:8}}>
            <GlassInset C={C} padding="p-3" style={{flex:1}}>
              <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>Swap interni</div>
              <div style={{color:C.cyan,fontSize:16,fontFamily:FONT.mono,fontWeight:700}}>{fmtUsd(totalSwap)}</div>
              <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,marginTop:2}}>{actions.filter(a=>a.type==='swap').length} operaz.</div>
            </GlassInset>
            <GlassInset C={C} padding="p-3" style={{flex:1}}>
              <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>Fiat necessario</div>
              <div style={{color:totalFiat>0?C.yellow:C.green,fontSize:16,fontFamily:FONT.mono,fontWeight:700}}>{totalFiat>0?fmtUsd(totalFiat):'Nessuno'}</div>
              <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,marginTop:2}}>{totalFiat>0?'da depositare':'100% interno'}</div>
            </GlassInset>
          </div>
        </Glass>
      )}
      {actions.map((act,i)=>act.type==='swap'?(
        <Glass C={C} padding="p-4" key={i}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
            <div style={{padding:'2px 8px',borderRadius:RADIUS.pill,background:`${C.cyan}15`,border:`0.5px solid ${C.cyan}40`,color:C.cyan,fontSize:9,fontFamily:FONT.text,fontWeight:600,textTransform:'uppercase'}}>{act.sameTier?'Swap stesso tier':'Swap cross-tier'}</div>
            <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>{fmtUsd(act.amountUsd)}</div>
            <button onClick={()=>{setRebalanceLog(prev=>[{id:Date.now(),date:new Date().toLocaleDateString('it-IT'),type:'Swap',sell:act.sell.symbol,buy:act.buy.symbol,amountUsd:act.amountUsd,sellTokens:act.sellTokens,buyTokens:act.buyTokens},...(prev||[])].slice(0,50));haptic.success();}} style={{marginLeft:'auto',padding:'3px 10px',fontSize:10,fontFamily:FONT.text,fontWeight:600,color:C.bg,background:C.green,border:'none',borderRadius:RADIUS.pill,cursor:'pointer'}}>✓ Eseguito</button>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'stretch'}}>
            <div style={{flex:1,padding:'10px 12px',borderRadius:12,background:`${C.red}12`,border:`0.5px solid ${C.red}40`}}>
              <div style={{color:C.red,fontSize:9,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.5px',textTransform:'uppercase',marginBottom:6}}>Vendi</div>
              <div style={{color:C.red,fontSize:17,fontFamily:FONT.mono,fontWeight:700}}>{act.sell.symbol}</div>
              <div style={{color:C.primary,fontSize:12,fontFamily:FONT.mono,fontWeight:600,marginTop:4}}>{fmtTok(act.sellTokens,act.sell.price)} {act.sell.symbol}</div>
              <div style={{color:C.secondary,fontSize:11,fontFamily:FONT.mono,marginTop:1}}>{fmtUsd(act.amountUsd)}</div>
              <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono,marginTop:1}}>surplus {act.sell.diff.toFixed(1)}%</div>
            </div>
            <div style={{display:'flex',alignItems:'center',color:C.tertiary,fontSize:20,flexShrink:0}}>→</div>
            <div style={{flex:1,padding:'10px 12px',borderRadius:12,background:`${C.green}12`,border:`0.5px solid ${C.green}40`}}>
              <div style={{color:C.green,fontSize:9,fontFamily:FONT.text,fontWeight:600,letterSpacing:'0.5px',textTransform:'uppercase',marginBottom:6}}>Compra</div>
              <div style={{color:C.green,fontSize:17,fontFamily:FONT.mono,fontWeight:700}}>{act.buy.symbol}</div>
              <div style={{color:C.primary,fontSize:12,fontFamily:FONT.mono,fontWeight:600,marginTop:4}}>{fmtTok(act.buyTokens,act.buy.price)} {act.buy.symbol}</div>
              <div style={{color:C.secondary,fontSize:11,fontFamily:FONT.mono,marginTop:1}}>{fmtUsd(act.amountUsd)}</div>
              <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono,marginTop:1}}>deficit {act.buy.diff.toFixed(1)}%</div>
            </div>
          </div>
        </Glass>
      ):(
        <Glass C={C} padding="p-4" key={i}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
            <div style={{padding:'2px 8px',borderRadius:RADIUS.pill,background:`${C.yellow}15`,border:`0.5px solid ${C.yellow}40`,color:C.yellow,fontSize:9,fontFamily:FONT.text,fontWeight:600,textTransform:'uppercase'}}>Deposita Fiat</div>
            <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>{fmtUsd(act.amountUsd)}</div>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'stretch'}}>
            <div style={{flex:1,padding:'10px 12px',borderRadius:12,background:`${C.yellow}12`,border:`0.5px solid ${C.yellow}40`}}>
              <div style={{color:C.yellow,fontSize:9,fontFamily:FONT.text,fontWeight:600,textTransform:'uppercase',marginBottom:6}}>Deposita</div>
              <div style={{color:C.yellow,fontSize:17,fontFamily:FONT.mono,fontWeight:700}}>Fiat</div>
              <div style={{color:C.primary,fontSize:12,fontFamily:FONT.mono,fontWeight:600,marginTop:4}}>{fmtUsd(act.amountUsd)}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',color:C.tertiary,fontSize:20,flexShrink:0}}>→</div>
            <div style={{flex:1,padding:'10px 12px',borderRadius:12,background:`${C.green}12`,border:`0.5px solid ${C.green}40`}}>
              <div style={{color:C.green,fontSize:9,fontFamily:FONT.text,fontWeight:600,textTransform:'uppercase',marginBottom:6}}>Compra</div>
              <div style={{color:C.green,fontSize:17,fontFamily:FONT.mono,fontWeight:700}}>{act.buy.symbol}</div>
              <div style={{color:C.primary,fontSize:12,fontFamily:FONT.mono,fontWeight:600,marginTop:4}}>{fmtTok(act.buyTokens,act.buy.price)} {act.buy.symbol}</div>
              <div style={{color:C.secondary,fontSize:11,fontFamily:FONT.mono,marginTop:1}}>{fmtUsd(act.amountUsd)}</div>
            </div>
          </div>
        </Glass>
      ))}
      {balanced&&(
        <Glass C={C} padding="p-4">
          <div className="flex items-center gap-3">
            <div style={{width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:`${C.green}18`,border:`0.5px solid ${C.green}40`}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div style={{color:C.primary,fontSize:13,fontFamily:FONT.text,fontWeight:600}}>Portfolio bilanciato</div>
              <div style={{color:C.tertiary,fontSize:11,fontFamily:FONT.text,marginTop:2}}>Tutti gli asset sono nei target</div>
            </div>
          </div>
        </Glass>
      )}
      <Glass C={C}>
        <div className="flex items-center justify-between mb-3">
          <SectionHeader C={C}>Allocazione</SectionHeader>
          <span style={{color:targetOk?C.green:C.red,fontSize:11,fontFamily:FONT.mono,fontWeight:600}}>Σ {totalTarget.toFixed(0)}% {targetOk?'✓':'≠ 100'}</span>
        </div>
        <div className="space-y-1">
          {assets.length===0 && (
            <div style={{color:C.tertiary,fontSize:12,fontFamily:FONT.text,textAlign:'center',padding:'20px 0'}}>Nessun asset — il ribilanciamento appare quando il portafoglio è popolato</div>
          )}
          {assets.map((a,idx)=>{
            const isOver=a.diff>0;
            const barCol=Math.abs(a.diff)<1?C.green:isOver?C.red:C.cyan;
            return (
              <div key={a.symbol} style={{borderTop:idx===0?'none':`0.5px solid ${C.sep}`,paddingTop:idx===0?0:10,paddingBottom:10}}>
                <div className="flex items-center justify-between mb-2">
                  <div style={{flex:1,minWidth:0,marginRight:8}}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{color:C.primary,fontSize:13,fontFamily:FONT.text,fontWeight:600}}>{a.symbol}</span>
                      <span style={{color:C.tertiary,fontSize:11,fontFamily:FONT.mono}}>${fmtPrc(a.price)}</span>
                      {Math.abs(a.diff)>=1&&(
                        <div style={{padding:'2px 7px',borderRadius:RADIUS.pill,fontSize:10,fontFamily:FONT.mono,fontWeight:600,color:isOver?C.red:C.green,background:isOver?`${C.red}15`:`${C.green}15`,border:isOver?`0.5px solid ${C.red}40`:`0.5px solid ${C.green}40`}}>
                          {isOver?'▲':'▼'} {Math.abs(a.diff).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono,marginTop:2}}>{fmtUsd(a.value)} · attuale {a.actualPct.toFixed(1)}%</div>
                  </div>
                  {editingTarget===a.symbol?(
                    <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
                      <input type="number" min="0" max="100" step="1" value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={()=>commitEdit(a.symbol)} onKeyDown={e=>e.key==='Enter'&&commitEdit(a.symbol)} autoFocus style={{width:44,padding:'3px 6px',fontSize:12,fontFamily:FONT.mono,background:C.glass3,border:`1px solid ${C.cyan}`,borderRadius:8,color:C.primary,outline:'none',textAlign:'center'}}/>
                      <span style={{color:C.tertiary,fontSize:11}}>%</span>
                    </div>
                  ):(
                    <button onClick={()=>startEdit(a.symbol,a.target)} style={{background:'none',border:`0.5px solid ${C.sep}`,cursor:'pointer',padding:'4px 10px',borderRadius:8,flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center'}}>
                      <span style={{color:C.cyan,fontSize:13,fontFamily:FONT.mono,fontWeight:600}}>{a.target}%</span>
                      <span style={{color:C.tertiary,fontSize:9,fontFamily:FONT.text}}>target</span>
                    </button>
                  )}
                </div>
                <div style={{position:'relative',height:6,borderRadius:9999,background:C.glass3,overflow:'hidden'}}>
                  <div style={{position:'absolute',top:0,left:0,height:'100%',width:`${a.target}%`,background:`${C.cyan}20`,borderRadius:9999}}/>
                  <div style={{position:'absolute',top:0,left:0,height:'100%',width:`${Math.min(a.actualPct,100)}%`,background:`linear-gradient(90deg,${barCol},${barCol}99)`,borderRadius:9999,transition:'width 0.5s cubic-bezier(0.34,1.18,0.64,1)'}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                  <span style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono}}>attuale {a.actualPct.toFixed(1)}%</span>
                  <span style={{color:Math.abs(a.diff)<1?C.green:isOver?C.red:C.green,fontSize:10,fontFamily:FONT.mono,fontWeight:600}}>
                    {a.diff>=0?'+':''}{a.diff.toFixed(1)}% · {Math.abs(a.diff)>=1?(isOver?`vendi ${fmtTok(a.diffTokens,a.price)} ${a.symbol} (${fmtUsd(a.diffUsd)})`:(`compra ${fmtTok(a.diffTokens,a.price)} ${a.symbol} (${fmtUsd(a.diffUsd)})`)):'ok'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,marginTop:6,paddingTop:8,borderTop:`0.5px solid ${C.sep}`}}>Tocca il target % per modificarlo</div>
      </Glass>
      {(rebalanceLog||[]).length>0&&(
        <Glass C={C}>
          <div className="flex items-center justify-between mb-3">
            <SectionHeader C={C}>Storico rebalance</SectionHeader>
            <button onClick={()=>{if(window.confirm('Cancellare lo storico?')){setRebalanceLog([]);haptic.medium();}}} style={{background:'none',border:`0.5px solid ${C.sep}`,borderRadius:RADIUS.pill,padding:'3px 10px',cursor:'pointer',color:C.tertiary,fontSize:10,fontFamily:FONT.text}}>Cancella</button>
          </div>
          <div className="space-y-1">
            {(rebalanceLog||[]).map((log,idx)=>(
              <div key={log.id} className="flex items-center justify-between py-2.5" style={{borderTop:idx===0?'none':`0.5px solid ${C.sep}`}}>
                <div>
                  <div className="flex items-center gap-2">
                    <span style={{color:C.red,fontSize:12,fontFamily:FONT.mono,fontWeight:600}}>{log.sell}</span>
                    <span style={{color:C.tertiary,fontSize:11}}>→</span>
                    <span style={{color:C.green,fontSize:12,fontFamily:FONT.mono,fontWeight:600}}>{log.buy}</span>
                    <Tag color={C.cyan} size="sm">{log.type}</Tag>
                  </div>
                  <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.mono,marginTop:2}}>{log.date}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{color:C.primary,fontSize:12,fontFamily:FONT.mono,fontWeight:600}}>{fmtUsd(log.amountUsd)}</div>
                </div>
              </div>
            ))}
          </div>
        </Glass>
      )}
    </div>
  );
};

/* ============= ANNUAL HEATMAP ============= */
const AnnualHeatmap = ({ C, data, year, setYear }) => {
  const all = data || [];
  const [tooltip, setTooltip] = useState(null);
  const currentYear = new Date().getFullYear();

  // Costanti layout
  const CELL = 11, GAP = 2, LABEL_W = 18;

  const maxV = (() => {
    const vals = all.map(d => Math.abs(d.pnl || 0)).filter(v => v > 0);
    return vals.length ? Math.max(...vals) : 1;
  })();

  const totalWeeks = all.length
    ? all.reduce((m, d) => Math.max(m, d.week), 0) + 1
    : 53;

  const gridW = totalWeeks * (CELL + GAP);

  // Mesi: primo giorno di ogni mese → settimana in cui appare
  const monthLabels = (() => {
    const MONTHS_IT = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
    const seen = {};
    all.forEach(c => {
      const key = `${c.year}-${c.month}`;
      if (c.dom === 1 && seen[key] === undefined) seen[key] = { label: MONTHS_IT[c.month], week: c.week };
    });
    return Object.values(seen).sort((a, b) => a.week - b.week);
  })();

  
  const cellColor = pnl => {
    if (!pnl || pnl === 0) return C.glass2;
          const alpha = +(Math.min(Math.abs(pnl) / maxV, 1) * 0.8).toFixed(2);
      return pnl > 0 ? `rgba(34,197,94,${alpha})` : `rgba(239,68,68,${alpha})`;
  };

  return (
    <Glass C={C}>
      <SectionHeader C={C} action={
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>setYear(y=>y-1)} style={{
            background:'none',border:`0.5px solid ${C.sep}`,borderRadius:6,
            color:C.secondary,fontSize:12,cursor:'pointer',padding:'1px 7px',lineHeight:'20px',
          }}>‹</button>
          <span style={{color:C.secondary,fontSize:11,fontFamily:FONT.mono,fontWeight:600,minWidth:36,textAlign:'center'}}>{year}</span>
          <button onClick={()=>setYear(y=>Math.min(y+1,currentYear))} style={{
            background:'none',border:`0.5px solid ${C.sep}`,borderRadius:6,
            color: year>=currentYear ? C.tertiary : C.secondary,
            fontSize:12,cursor:year>=currentYear?'default':'pointer',padding:'1px 7px',lineHeight:'20px',
          }}>›</button>
        </div>
      }>
        Heatmap Annuale
      </SectionHeader>
      <div style={{overflowX:'auto', position:'relative'}} onClick={() => setTooltip(null)}>
        {tooltip && (
          <div style={{
            position:'fixed',
            top: Math.max(8, tooltip.vy - 56),
            left: Math.max(8, Math.min(tooltip.vx - 50, (typeof window!=='undefined'?window.innerWidth:400) - 150)),
            background: C.glass2,
            border: `0.5px solid ${(tooltip.pnl||0) >= 0 ? C.green : C.red}66`,
            borderRadius: RADIUS.inset, padding:'6px 10px', zIndex:200,
            backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
            pointerEvents:'none', whiteSpace:'nowrap',
          }}>
            <div style={{color:C.tertiary,fontSize:9,fontFamily:FONT.mono}}>{tooltip.date}</div>
            <div style={{color:(tooltip.pnl||0)>=0?C.green:C.red,fontSize:14,fontFamily:FONT.mono,fontWeight:700}}>
              {(tooltip.pnl||0)>=0?'+':''}${Math.abs(tooltip.pnl||0).toFixed(2)}
            </div>
          </div>
        )}
        <div style={{minWidth: LABEL_W + gridW + 8, paddingBottom:4}}>
          {/* Etichette mesi — posizionate assolutamente */}
          <div style={{position:'relative', height:14, marginLeft: LABEL_W}}>
            {monthLabels.map(({label, week}, i) => (
              <div key={i} style={{
                position:'absolute',
                left: week * (CELL + GAP),
                top:0, fontSize:9, fontFamily:FONT.mono, color:C.tertiary, fontWeight:600,
              }}>{label}</div>
            ))}
          </div>
          {/* Griglia */}
          <div style={{display:'flex', gap:0, marginTop:2}}>
            {/* L M M G V S D */}
            <div style={{display:'flex', flexDirection:'column', gap:GAP, width:LABEL_W, flexShrink:0}}>
              {['L','','M','','G','','D'].map((d,i) => (
                <div key={i} style={{height:CELL, fontSize:7, fontFamily:FONT.mono,
                  color:C.tertiary, display:'flex', alignItems:'center', lineHeight:1}}>
                  {d}
                </div>
              ))}
            </div>
            {/* Celle */}
            <div style={{display:'flex', gap:GAP}}>
              {Array.from({length: totalWeeks}, (_, w) => (
                <div key={w} style={{display:'flex', flexDirection:'column', gap:GAP}}>
                  {[0,1,2,3,4,5,6].map(dow => {
                    const cell = all.find(c => c.week === w && c.day === dow);
                    const hasTrade = cell && cell.pnl !== 0;
                    return (
                      <div key={dow}
                        onClick={e => {
                          e.stopPropagation();
                          if (!hasTrade) return;
                          const r = e.currentTarget.getBoundingClientRect();
                          setTooltip(t => t?.date === cell.date ? null
                            : { date: cell.date, pnl: cell.pnl, vx: r.left + CELL/2, vy: r.top });
                        }}
                        style={{
                          width: CELL, height: CELL, borderRadius: 2,
                          background: cell ? cellColor(cell.pnl) : 'transparent',
                          border: (cell && !hasTrade) ? `0.5px solid ${C.sep}44` : 'none',
                          cursor: hasTrade ? 'pointer' : 'default',
                          transition: 'transform 0.1s',
                          transform: tooltip?.date === cell?.date ? 'scale(1.8)' : 'scale(1)',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {/* Legenda */}
          <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8, marginLeft:LABEL_W}}>
            <span style={{color:C.tertiary, fontSize:9, fontFamily:FONT.mono}}>meno</span>
            {[0.15,0.35,0.6,0.85,1].map((i,idx) => (
              <div key={idx} style={{width:CELL, height:CELL, borderRadius:2,
                background:`${C.green}${Math.round(i*200+40).toString(16).padStart(2,'0')}`}}/>
            ))}
            <span style={{color:C.tertiary, fontSize:9, fontFamily:FONT.mono}}>più</span>
            <div style={{marginLeft:8, display:'flex', gap:4}}>
              <div style={{width:CELL, height:CELL, borderRadius:2, background:`${C.red}99`}}/>
              <span style={{color:C.tertiary, fontSize:9, fontFamily:FONT.mono}}>perdita</span>
            </div>
          </div>
        </div>
      </div>
    </Glass>
  );
};

/* ============= STREAK DISTRIBUTION ============= */
const StreakDistribution = ({ C, data }) => {
  if (!data || data.length === 0) return (
    <Glass C={C}>
      <SectionHeader C={C}>Distribuzione Streak</SectionHeader>
      <div style={{color:C.tertiary,fontSize:12,fontFamily:FONT.text,padding:'24px 4px',textAlign:'center',opacity:0.7}}>
        Appare quando hai almeno 3 trade chiusi consecutivi.
      </div>
    </Glass>
  );
  return (
    <Glass C={C}>
      <SectionHeader C={C}>Distribuzione Streak</SectionHeader>
      <DragChart C={C} data={data} height={180} labelKey="len" valueKey="count" valueSuffix=" volte"
        valueColor={(v) => C.secondary}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{top:5,right:5,left:-15,bottom:0}}>
            <CartesianGrid stroke={C.sep} vertical={false}/>
            <XAxis dataKey="len" tick={{fill:C.tertiary,fontSize:11,fontFamily:FONT.mono}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.tertiary,fontSize:11,fontFamily:FONT.mono}} axisLine={false} tickLine={false}/>
            <Bar dataKey="count" radius={[4,4,0,0]} isAnimationActive={false}>
              {data.map((d,i)=>(
                <Cell key={i} fill={d.type==='win'?C.green:C.red}/>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </DragChart>
      <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,marginTop:8,textAlign:'center'}}>
        Verde = streak vincenti · Rosso = streak perdenti
      </div>
    </Glass>
  );
};

/* ============= MAE/MFE SCATTER ============= */
const MaeMfeScatter = ({ C, data }) => {
  const pts = (data || []).filter(t => t.mae || t.mfe).map((t,i) => ({id:i,mae:t.mae||0,mfe:t.mfe||0,pnl:t.pnl||0,label:t.basket||`T${i+1}`}));
  if (pts.length === 0) return (
    <Glass C={C}>
      <SectionHeader C={C}>MAE / MFE Scatter</SectionHeader>
      <div style={{color:C.tertiary,fontSize:12,fontFamily:FONT.text,padding:'24px 4px',textAlign:'center',opacity:0.7}}>
        Appare quando i trade hanno dati MAE/MFE.<br/>
        <span style={{fontSize:10,opacity:0.6}}>Inviati dall'EA MT5 via webhook.</span>
      </div>
    </Glass>
  );
  const mfeMax = pts.reduce((a,d) => Math.max(a, Math.abs(d.mfe)||1), 1);
  const maeMin = pts.reduce((a,d) => Math.min(a, d.mae||0), -1);
  const W = 320, H = 220, PX = 40, PY = 20;

  const xScale = (v) => PX + ((v - maeMin) / (-maeMin || 1)) * (W - PX - 10);
  const yScale = (v) => PY + (1 - v / mfeMax) * (H - PY - 20);

  return (
    <Glass C={C}>
      <SectionHeader C={C} action={<span style={{color:C.secondary,fontSize:11,fontFamily:FONT.mono}}>ogni punto = 1 trade</span>}>MAE / MFE Scatter</SectionHeader>
      <div style={{overflowX:'auto'}}>
        <svg width={W} height={H} style={{overflow:'visible',display:'block',margin:'0 auto'}}>
          {/* Grid */}
          {[0,0.25,0.5,0.75,1].map((t,i)=>(
            <line key={i} x1={PX} x2={W-10} y1={PY+t*(H-PY-20)} y2={PY+t*(H-PY-20)}
              stroke={C.sep} strokeWidth={0.5}/>
          ))}
          {/* Axis labels */}
          <text x={W/2} y={H} fontSize={9} fill={C.tertiary} fontFamily={FONT.mono} textAnchor="middle">MAE (drawdown intra-trade)</text>
          <text x={8} y={H/2} fontSize={9} fill={C.tertiary} fontFamily={FONT.mono} textAnchor="middle" transform={`rotate(-90,8,${H/2})`}>MFE</text>
          {/* Diagonal guide: MAE = MFE */}
          <line x1={PX} x2={W-10} y1={H-20} y2={PY} stroke={C.sep} strokeWidth={1} strokeDasharray="3 3"/>
          {/* Points */}
          {pts.map(d=>{
            const cx = xScale(d.mae), cy = yScale(d.mfe);
            const color = d.pnl >= 0 ? C.green : C.red;
            const r = 5 + Math.abs(d.pnl)/50;
            return (
              <g key={d.id}>
                <circle cx={cx} cy={cy} r={r} fill={`${color}40`} stroke={color} strokeWidth={1.5}/>
                <text x={cx+r+2} y={cy+3} fontSize={8} fill={C.tertiary} fontFamily={FONT.mono}>{d.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{color:C.tertiary,fontSize:10,fontFamily:FONT.text,marginTop:8,textAlign:'center'}}>
        Sopra la diagonale = hai lasciato correre · Sotto = hai chiuso troppo presto
      </div>
    </Glass>
  );
};

/* ============= P&L DISTRIBUTION ============= */
const PnlDistribution = ({ C, data }) => {
  const trades = data || [];
  if (trades.length === 0) return (
    <Glass C={C}>
      <SectionHeader C={C}>Distribuzione P&L</SectionHeader>
      <div style={{color:C.tertiary,fontSize:12,fontFamily:FONT.text,padding:'24px 4px',textAlign:'center',opacity:0.7}}>
        Appare dopo i primi trade chiusi.
      </div>
    </Glass>
  );
  const pnls = trades.map(t => t.pnl||0);
  const minP = pnls.length ? Math.min(...pnls) : -50;
  const maxP = pnls.length ? Math.max(...pnls) : 50;
  const step = Math.max(Math.ceil((maxP - minP) / 12 / 20) * 20, 20);
  const bins = [];
  for (let v = Math.floor(minP/step)*step; v <= maxP + step; v += step) bins.push(v);
  const counts = bins.slice(0,-1).map((lo,i) => ({
    range:`${lo}`,
    count: trades.filter(t => t.pnl>=lo && t.pnl<bins[i+1]).length,
    color: lo >= 0 ? C.green : C.red,
  }));
  const n = trades.length;
  const mean = pnls.reduce((s,v)=>s+v,0)/n;
  const std = Math.sqrt(pnls.reduce((s,v)=>s+(v-mean)**2,0)/n);
  const skew = std>0 ? pnls.reduce((s,v)=>s+((v-mean)/std)**3,0)/n : 0;
  const wr = Math.round(trades.filter(t=>t.pnl>0).length/n*100);
  return (
    <Glass C={C}>
      <SectionHeader C={C} action={<span style={{color:C.secondary,fontSize:11,fontFamily:FONT.mono}}>istogramma P&L</span>}>Distribuzione P&L</SectionHeader>
      <DragChart C={C} data={counts} height={200} labelKey="range" valueKey="count" valueSuffix=" trade"
        valueColor={(v) => C.secondary}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={counts} margin={{top:5,right:5,left:-15,bottom:0}}>
            <CartesianGrid stroke={C.sep} vertical={false}/>
            <XAxis dataKey="range" tick={{fill:C.tertiary,fontSize:10,fontFamily:FONT.mono}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.tertiary,fontSize:11,fontFamily:FONT.mono}} axisLine={false} tickLine={false}/>
            <Bar dataKey="count" radius={[4,4,0,0]} isAnimationActive={false}>
              {counts.map((d,i)=><Cell key={i} fill={d.color}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </DragChart>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          {l:'Skewness',v:`${skew>=0?'+':''}${skew.toFixed(2)}`,c:skew>=0?C.green:C.red},
          {l:'% win',v:`${wr}%`,c:C.cyan},
          {l:'Trades',v:`${n}`,c:C.purple},
        ].map((m,i)=>(
          <GlassInset C={C} key={i} padding="p-2">
            <div style={{color:C.tertiary,fontSize:8,fontFamily:FONT.text,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.3px'}}>{m.l}</div>
            <div style={{color:m.c,fontSize:16,fontFamily:FONT.mono,fontWeight:700,marginTop:2}}>{m.v}</div>
          </GlassInset>
        ))}
      </div>
    </Glass>
  );
};

/* ============= ANALYTICS ROOT VIEW ============= */
const AnalyticsView = ({ C, trades }) => {
  const closed = (trades || []).filter(t => !t.open);

  // Heatmap annuale — GitHub-style, allineata alla settimana
  const [heatYear, setHeatYear] = useState(new Date().getFullYear());

  const annualHeatmapData = useMemo(() => {
    const byDate = {};
    closed.forEach(t => {
      const k = (t.date||'').slice(0,10);
      if (k) byDate[k] = (byDate[k]||0) + (t.pnl||0);
    });
    const today = new Date(); today.setHours(0,0,0,0);
    const jan1 = new Date(heatYear, 0, 1);
    const dow1 = (jan1.getDay()+6)%7;
    const start = new Date(jan1);
    start.setDate(jan1.getDate() - dow1);
    const end = heatYear === today.getFullYear() ? today : new Date(heatYear, 11, 31);

    const cells = [];
    let week = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const dow = (cur.getDay()+6)%7;
      if (dow === 0 && cur > start) week++;
      const d = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
      cells.push({ date:d, day:dow, week, pnl:byDate[d]||0,
        month:cur.getMonth(), year:cur.getFullYear(), dom:cur.getDate() });
      cur.setDate(cur.getDate()+1);
    }
    return cells;
  }, [closed, heatYear]);

  // Streak distribution dai trade reali
  const streakDistData = (() => {
    if (closed.length === 0) return [];
    const sorted = [...closed].sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id);
    const wins = {}, losses = {};
    let cw=0, cl=0;
    sorted.forEach(t => {
      if (t.pnl > 0) { cw++; cl=0; wins[cw]=(wins[cw]||0)+1; }
      else            { cl++; cw=0; losses[cl]=(losses[cl]||0)+1; }
    });
    const wKeys = Object.keys(wins).map(Number);
    const lKeys = Object.keys(losses).map(Number);
    const maxW = wKeys.length ? Math.max(...wKeys) : 0;
    const maxL = lKeys.length ? Math.max(...lKeys) : 0;
    return [
      ...Array.from({length:Math.min(maxW,7)},(_,i)=>({len:`${i+1}W`,count:wins[i+1]||0,type:'win'})),
      ...Array.from({length:Math.min(maxL,5)},(_,i)=>({len:`${i+1}L`,count:losses[i+1]||0,type:'loss'})),
    ].filter(d=>d.count>0);
  })();

  return(
  <div className="space-y-4">
    <PnlDistribution C={C} data={closed}/>
    <MaeMfeScatter C={C} data={closed.filter(t=>t.mae||t.mfe)}/>
    <StreakDistribution C={C} data={streakDistData}/>
    <AnnualHeatmap C={C} data={annualHeatmapData} year={heatYear} setYear={setHeatYear}/>
  </div>
  );
};

/* ============= CHART VIEW ============= */
// Dati OHLC reali XAU/USD da TwelveData (chiave utente, CORS aperto dal browser)
// Simbolo: XAU/USD  |  exchange: non necessario (forex pair nativo)
// Docs: https://twelvedata.com/docs#time-series
//
// TF nativi TwelveData: 1min 5min 15min 30min 45min 1h 2h 4h 8h 1day 1week 1month
// TF personalizzati (3m,7m,13m,17m,33m,90m,3D) → aggregazione client-side
// da resolution più fine:
//   3m  = 3×1min    7m  = 7×1min    13m = 13×1min   17m = 17×1min
//   33m = 33×1min   90m = 3×30min   3h  = 3×1h      6h  = 6×1h
//   1D  = native 1day               3D  = 3×1day
//
// Prezzo spot (ultima candela close) = dato reale dall'API, non simulato.

const CHART_TF_OPTIONS = ['3m','7m','13m','17m','33m','90m','3h','6h','1D','3D'];
const CHART_TF_LABELS  = {'3m':'M3','7m':'M7','13m':'M13','17m':'M17','33m':'M33','90m':'M90','3h':'H3','6h':'H6','1D':'D1','3D':'3D'};

const TD_KEY = 'd2496490923349bcb89e39da55c76f58';
const TD_BASE = 'https://api.twelvedata.com';
const TD_SYMBOL = 'XAU/USD';

// Mapping TF app → { resolution TwelveData, aggregazione N, outputsize }
// Piano free TwelveData: 800 req/day, 8 req/min; in pratica restituisce max ~800-1000 barre.
// Per TF aggregati outputsize = barre_finali × aggN × 1.35 (margine weekend ~30% + sessioni chiuse).
// H6: usa 2h come base (aggN=3 → 6h) così servono solo 500×3×1.35=~2000 barre raw invece di 3000.
const TF_TD = {
  '3m':  { res: '1min',  aggN: 3,  outputsize: 5000 }, // ~1200 barre finali
  '7m':  { res: '1min',  aggN: 7,  outputsize: 5000 }, // ~500 barre finali
  '13m': { res: '5min',  aggN: 3,  outputsize: 2400 }, // ~550 barre finali (≈15min)
  '17m': { res: '5min',  aggN: 4,  outputsize: 2400 }, // ~420 barre finali (≈20min)
  '33m': { res: '15min', aggN: 2,  outputsize: 2400 }, // ~850 barre finali (≈30min)
  '90m': { res: '30min', aggN: 3,  outputsize: 2400 }, // ~560 barre finali
  '3h':  { res: '1h',    aggN: 3,  outputsize: 2400 }, // ~560 barre finali (~70 giorni)
  '6h':  { res: '2h',    aggN: 3,  outputsize: 2400 }, // ~560 barre finali (~140 giorni)
  '1D':  { res: '1day',  aggN: 1,  outputsize: 500  }, // 500 daily (~2 anni)
  '3D':  { res: '1day',  aggN: 3,  outputsize: 1500 }, // ~500 barre finali
};

// TwelveData ritorna timestamps come stringhe ISO "2026-05-17 14:32:00" (UTC per forex)
const tdTimeParse = (str, isDaily) => {
  if (!str) return null;
  if (isDaily) return str.slice(0, 10); // 'YYYY-MM-DD'
  // Accetta sia "2026-05-17 14:32:00" che "2026-05-17T14:32:00" (con o senza Z/offset)
  const normalized = str.trim().replace(' ', 'T');
  // Se non ha già indicatore di timezone, aggiungi Z (TwelveData forex = UTC)
  const withZ = /[Zz]$|[+-]\d{2}:\d{2}$/.test(normalized) ? normalized : normalized + 'Z';
  const ms = new Date(withZ).getTime();
  return isFinite(ms) ? Math.trunc(ms / 1000) : null;
};

// Aggrega N candele consecutive in una sola.
// Usa i < bars.length per includere l'ultima candela parziale (coda incompleta)
// → nessuna barra viene mai scartata silenziosamente anche se il gruppo è incompleto.
const aggregateBars = (bars, n) => {
  if (n <= 1) return bars;
  const out = [];
  for (let i = 0; i < bars.length; i += n) {
    const slice = bars.slice(i, i + n);
    out.push({
      time:  slice[0].time,
      open:  slice[0].open,
      high:  Math.max(...slice.map(b => b.high)),
      low:   Math.min(...slice.map(b => b.low)),
      close: slice[slice.length - 1].close,
    });
  }
  return out;
};

// Rimuove barre weekend/chiusura forex.
// DEVE essere applicato PRIMA dell'aggregazione: se una barra weekend finisce
// in un gruppo aggregato, contamina open/high/low/close della candela risultante
// e crea gap visivi perché il timestamp di quella barra cade nel weekend.
// Forex chiude venerdì ~22:00 UTC, riapre domenica ~21:00 UTC.
const filterForexBars = (bars, isDaily) => {
  if (isDaily) {
    return bars.filter(b => {
      const dow = new Date(b.time + 'T00:00:00Z').getUTCDay();
      return dow !== 0 && dow !== 6; // escludi domenica(0) e sabato(6)
    });
  }
  return bars.filter(b => {
    const d    = new Date(b.time * 1000);
    const dow  = d.getUTCDay();
    const utcH = d.getUTCHours();
    if (dow === 6) return false;               // sabato tutto
    if (dow === 0 && utcH < 21) return false;  // domenica prima delle 21:00 UTC
    if (dow === 5 && utcH >= 22) return false; // venerdì dopo le 22:00 UTC
    return true;
  });
};

// Rimappa le barre intraday a indici 0,1,2,… (sequential index).
// LW Charts v4.1 con unix timestamp reale crea gap fisici nel weekend perché
// il tempo scorre anche a mercati chiusi. Con indici interi le candele sono
// sempre contigue — nessun gap, identico a TradingView.
// originalTime conserva il timestamp unix reale per il tickMarkFormatter e i trade.
const remapSequential = (bars) =>
  bars.map((b, i) => ({ ...b, originalTime: b.time, time: i }));

// Cache TF → { bars, spotData, isDaily, ts }
const _tdCache = {};
const TD_TTL_MS = 90_000; // 90s

const fetchChartData = async (tf) => {
  const now = Date.now();
  if (_tdCache[tf] && (now - _tdCache[tf].ts) < TD_TTL_MS) {
    return _tdCache[tf].data;
  }

  const { res, aggN, outputsize } = TF_TD[tf];
  const isDaily = res === '1day' || res === '1week';

  const url = new URL(`${TD_BASE}/time_series`);
  url.searchParams.set('symbol',     TD_SYMBOL);
  url.searchParams.set('interval',   res);
  url.searchParams.set('outputsize', String(outputsize));
  url.searchParams.set('apikey',     TD_KEY);
  url.searchParams.set('format',     'JSON');

  const resp = await fetch(url.toString(), {
    mode: 'cors',
    signal: AbortSignal.timeout(15000),
  });
  if (!resp.ok) throw new Error(`TwelveData HTTP ${resp.status}`);

  const json = await resp.json();
  if (json.status === 'error') {
    throw new Error(`TwelveData: ${json.message || json.code || 'errore sconosciuto'}`);
  }
  if (!json.values || !Array.isArray(json.values) || json.values.length === 0) {
    throw new Error('TwelveData: nessun dato ricevuto (mercato chiuso o quota esaurita)');
  }

  // Parse newest-first → oldest-first
  const seen = new Set();
  const parsed = json.values
    .map(v => {
      const time  = tdTimeParse(v.datetime, isDaily);
      const open  = parseFloat(v.open);
      const high  = parseFloat(v.high);
      const low   = parseFloat(v.low);
      const close = parseFloat(v.close);
      return { time, open, high, low, close };
    })
    .filter(b => {
      if (b.time == null) return false;
      const k = String(b.time);
      if (seen.has(k)) return false;
      seen.add(k);
      return isFinite(b.open) && isFinite(b.high) && isFinite(b.low) && isFinite(b.close)
        && b.open > 0 && b.high >= b.low;
    })
    .reverse(); // oldest -> newest

  // Sort esplicito per garantire ordine cronologico corretto
  if (!isDaily) parsed.sort((a, b) => a.time - b.time);

  if (parsed.length === 0) throw new Error('TwelveData: nessuna barra valida dopo il parse');

  // Salva l'ultima barra raw (candela corrente, potenzialmente incompleta).
  const lastRawBar = parsed[parsed.length - 1];

  // 1) Filtra weekend/chiusura PRIMA di aggregare
  let filtered = filterForexBars(parsed, isDaily);

  // Reinserisci l'ultima barra raw se il filtro l'ha eliminata (es. domenica apertura)
  if (!isDaily && (filtered.length === 0 || filtered[filtered.length - 1].time !== lastRawBar.time)) {
    filtered = [...filtered, lastRawBar];
  }

  if (filtered.length === 0) throw new Error('TwelveData: nessuna barra dopo filtro forex');

  // 2) Aggrega (la coda incompleta è inclusa → ultima candela sempre presente)
  const aggregated = aggregateBars(filtered, aggN);

  // 3) Intraday: rimappa a indici sequenziali → zero gap visivi
  const bars = isDaily ? aggregated : remapSequential(aggregated);

  const last = bars[bars.length - 1];
  const prev = bars.length > 1 ? bars[bars.length - 2] : null;
  const ch   = prev ? last.close - prev.close : 0;
  const chp  = prev && prev.close > 0 ? (ch / prev.close) * 100 : 0;
  const spotData = {
    price:     last.close,
    prevClose: prev?.close ?? last.open,
    ch, chp,
    source:    'twelvedata',
  };

  const result = { bars, spotData, isDaily };
  _tdCache[tf] = { data: result, ts: now };
  console.log(`[Chart] XAU/USD ${tf}: ${bars.length} barre, close $${last.close}`);
  return result;
};

// Converte prezzo → pixel Y dentro il chart (area canvas)
// Usa la scala corrente del chart LW
const priceToY = (chart, series, price) => {
  try { return series.priceToCoordinate(price); } catch { return null; }
};
const timeToX = (chart, time) => {
  try { return chart.timeScale().timeToCoordinate(time); } catch { return null; }
};

const ChartView = ({ C, trades }) => {
  const containerRef  = useRef(null);
  const canvasRef     = useRef(null);
  const chartRef      = useRef(null);
  const seriesRef     = useRef(null);
  const resizeObsRef  = useRef(null);
  const pollRef       = useRef(null);
  const barsRef       = useRef([]);

  const [tf, setTf]               = usePersistedState('xt_chart_tf', '17m');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [lastPrice, setLastPrice] = useState(null);
  const [spotInfo, setSpotInfo]   = useState(null);
  const [lwReady, setLwReady]     = useState(false);
  const [crosshairInfo, setCrosshairInfo] = useState(null);

  // Carica Lightweight Charts da CDN una volta sola
  useEffect(() => {
    if (window.LightweightCharts) { setLwReady(true); return; }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js';
    s.onload  = () => setLwReady(true);
    s.onerror = () => setError('Errore caricamento libreria chart');
    document.head.appendChild(s);
  }, []);

  // Disegna i rettangoli TV-style sul canvas overlay
  const drawTrades = useCallback(() => {
    const canvas = canvasRef.current;
    const chart  = chartRef.current;
    const series = seriesRef.current;
    const bars   = barsRef.current;
    if (!canvas || !chart || !series || !bars.length) return;

    const ctx = canvas.getContext('2d');
    const W   = canvas.width;
    const H   = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const visRange = chart.timeScale().getVisibleLogicalRange();
    let candleW = 8;
    if (visRange && bars.length > 1) {
      const visibleBars = visRange.to - visRange.from;
      if (visibleBars > 0) candleW = W / visibleBars;
    }
    const xOpenEnd = W + candleW * 0.5;

    const isBarDaily = typeof bars[0]?.time === 'string';
    const isIndexed  = !isBarDaily && bars[0]?.originalTime !== undefined;

    // Dato un unix-seconds UTC, trova la chiave (indice sequenziale o YYYY-MM-DD) da passare a timeToX.
    const findBarKey = (unixSec, dateStr) => {
      if (isBarDaily) return dateStr;
      if (!isIndexed) return unixSec;
      // bisezione su originalTime
      let lo = 0, hi = bars.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (bars[mid].originalTime < unixSec) lo = mid + 1;
        else hi = mid;
      }
      if (lo > 0 && Math.abs(bars[lo-1].originalTime - unixSec) < Math.abs(bars[lo].originalTime - unixSec)) lo--;
      return bars[lo].time; // indice sequenziale
    };

    trades.forEach(tr => {
      if (!tr.entry || !tr.sl) return;

      const yEntry = priceToY(chart, series, tr.entry);
      const ySL    = priceToY(chart, series, tr.sl);
      const yTP    = tr.tp ? priceToY(chart, series, tr.tp) : null;
      if (yEntry === null || ySL === null) return;

      // Converte data+ora locale (CET/CEST, senza Z) → unix seconds UTC
      const toUnix = (dateStr, timeStr) => {
        if (!dateStr) return null;
        const hhmm = timeStr ? timeStr.slice(0, 5) : '00:00';
        const ms = new Date(`${dateStr}T${hhmm}:00`).getTime();
        return isFinite(ms) ? Math.trunc(ms / 1000) : null;
      };

      const entryUnix = toUnix(tr.date, tr.timeEntry);
      const entryKey  = entryUnix !== null ? findBarKey(entryUnix, tr.date) : null;
      let xEntry = entryKey !== null ? timeToX(chart, entryKey) : null;
      if (xEntry === null) xEntry = 0;

      let xExit = null;
      if (!tr.open && tr.dateExit && tr.timeExit) {
        const exitUnix = toUnix(tr.dateExit, tr.timeExit);
        const exitKey  = exitUnix !== null ? findBarKey(exitUnix, tr.dateExit) : null;
        const xExitRaw = exitKey !== null ? timeToX(chart, exitKey) : null;
        if (xExitRaw !== null) xExit = xExitRaw + candleW * 0.5;
      }

      const xR = (!tr.open && xExit != null && xExit > xEntry)
        ? xExit
        : xOpenEnd + candleW * 3;
      const xL = xEntry;
      if (xR - xL < 1) return;

      // Zona SL
      const ySlTop = Math.min(yEntry, ySL);
      const ySlBot = Math.max(yEntry, ySL);
      const slH    = ySlBot - ySlTop;
      if (slH > 1) {
        ctx.fillStyle = 'rgba(255,0,0,0.33)';
        ctx.fillRect(xL, ySlTop, xR - xL, slH);
      }

      // Zona TP
      if (yTP !== null) {
        const yTpTop = Math.min(yEntry, yTP);
        const yTpBot = Math.max(yEntry, yTP);
        const tpH    = yTpBot - yTpTop;
        if (tpH > 1) {
          ctx.fillStyle = 'rgba(0,240,255,0.30)';
          ctx.fillRect(xL, yTpTop, xR - xL, tpH);
        }
      }

      // RR label
      const rr = tr.rr != null && tr.rr !== 0
        ? tr.rr
        : (() => {
            if (!tr.tp || !tr.sl) return null;
            const risk   = Math.abs(tr.entry - tr.sl);
            const reward = Math.abs(tr.entry - (tr.tp || tr.entry));
            return risk > 0 ? reward / risk : null;
          })();

      if (rr !== null && yTP !== null) {
        const cx = xL + (xR - xL) / 2;
        const cy = yEntry;
        const rrText = `${Number(rr).toFixed(2)}R`;
        const fontSize = 11;
        ctx.font = `600 ${fontSize}px "Trebuchet MS", "Helvetica Neue", Arial, sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        const tw = ctx.measureText(rrText).width;
        const ph = 5, pw = 8, br = 3;
        const bw = tw + pw * 2, bh = fontSize + ph * 2;
        ctx.fillStyle = 'rgba(0,0,0,0.60)';
        ctx.beginPath();
        ctx.roundRect(cx - bw/2, cy - bh/2, bw, bh, br);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(rrText, cx, cy);
      }
    });
  }, [trades]);

  // tfRef: mirror di tf accessibile dentro callback async senza stale closure
  const tfRef = useRef(tf);
  useEffect(() => { tfRef.current = tf; }, [tf]);

  // Crea una nuova candlestick series (chiamata sia al mount che ad ogni cambio TF)
  // LW Charts NON permette di cambiare il tipo di timestamp (number↔string) sulla stessa
  // istanza di series: passare da intraday (unix int) a daily ('YYYY-MM-DD') crasha con
  // "The string did not match the expected pattern". Soluzione: rimuovi e ricrea la series.
  const createSeries = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return null;
    // Rimuovi series precedente se esiste
    if (seriesRef.current) {
      try { chart.removeSeries(seriesRef.current); } catch (_) {}
      seriesRef.current = null;
    }
    const s = chart.addCandlestickSeries({
      upColor:         '#000000',
      downColor:       '#000000',
      borderUpColor:   '#00ff00',
      borderDownColor: '#ff00ff',
      wickUpColor:     '#00ff00',
      wickDownColor:   '#ff00ff',
      priceFormat:     { type:'price', precision:2, minMove:0.01 },
    });
    seriesRef.current = s;
    return s;
  }, []);

  // Crea chart quando la libreria è pronta (UNA SOLA VOLTA)
  useEffect(() => {
    if (!lwReady || !containerRef.current) return;
    const el = containerRef.current;

    const chart = window.LightweightCharts.createChart(el, {
      width:  el.clientWidth,
      height: el.clientHeight,
      layout: {
        background: { type: 'solid', color: '#000000' },
        textColor:  '#ffffff',
        fontSize:   10,
        fontFamily: 'SF Mono, ui-monospace, Menlo, monospace',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: 1,
        vertLine: { color:'#636363', width:1, style:2, visible:true, labelVisible:true, labelBackgroundColor:'#111' },
        horzLine: { color:'#ffffff', width:1, style:3, visible:true, labelVisible:true, labelBackgroundColor:'#111' },
      },
      rightPriceScale: {
        visible:          true,
        borderVisible:    false,
        // NESSUN scaleMargins fisso → scala libera come TradingView
        autoScale:        true,
        ticksVisible:     true,
        entireTextOnly:   false,
        // Permette drag verticale sull'asse Y per zoomare il prezzo
        mode:             0, // 0 = Normal (non bloccato)
      },
      leftPriceScale:  { visible: false },
      timeScale: {
        borderVisible:  false,
        timeVisible:    false,
        secondsVisible: false,
        rightOffset:    7,
        barSpacing:     8,
        minBarSpacing:  1,
      },
      watermark: {
        visible:   true,
        fontSize:  13,
        horzAlign: 'left',
        vertAlign: 'top',
        color:     'rgba(255,255,255,0.85)',
        text:      'XAUUSD',
      },
      // Scroll e scale completi — identici a TradingView
      handleScroll: {
        mouseWheel:        true,
        pressedMouseMove:  true,
        horzTouchDrag:     true,
        vertTouchDrag:     true,   // era false → ora permette scroll verticale sul grafico
      },
      handleScale: {
        mouseWheel:             true,
        pinch:                  true,
        axisPressedMouseMove:   { time: true, price: true }, // drag sugli assi per zoom indipendente
        axisDoubleClickReset:   true,  // doppio click sull'asse Y → reset scala
      },
    });

    chartRef.current = chart;

    // Inizializza canvas overlay
    if (canvasRef.current) {
      canvasRef.current.width  = el.clientWidth;
      canvasRef.current.height = el.clientHeight;
    }

    // Aggiorna dimensioni al resize
    resizeObsRef.current = new ResizeObserver(() => {
      if (!chartRef.current || !el) return;
      chartRef.current.applyOptions({ width:el.clientWidth, height:el.clientHeight });
      if (canvasRef.current) {
        canvasRef.current.width  = el.clientWidth;
        canvasRef.current.height = el.clientHeight;
      }
      drawTrades();
    });
    resizeObsRef.current.observe(el);

    // Ridisegna trade al pan/zoom e al crosshair
    chart.timeScale().subscribeVisibleLogicalRangeChange(() => drawTrades());
    chart.subscribeCrosshairMove(param => {
      if (param.seriesData?.size && seriesRef.current) {
        const d = param.seriesData.get(seriesRef.current);
        if (d) {
          setLastPrice(d.close);
          const bars = barsRef.current;
          const idx  = typeof param.time === 'number' ? param.time : null;
          const bar  = (idx !== null && bars[idx]) ? bars[idx] : null;
          const origTime = bar?.originalTime ?? null;
          let label = '';
          if (origTime) {
            const dt  = new Date(origTime * 1000);
            const pad = n => String(n).padStart(2,'0');
            label = pad(dt.getUTCDate())+'/'+pad(dt.getUTCMonth()+1)+' '+pad(dt.getUTCHours())+':'+pad(dt.getUTCMinutes());
          } else if (typeof param.time === 'string') {
            label = param.time;
          }
          setCrosshairInfo({ label, open:d.open, high:d.high, low:d.low, close:d.close });
        }
      } else {
        setCrosshairInfo(null);
      }
      drawTrades();
    });

    return () => {
      clearInterval(pollRef.current);
      resizeObsRef.current?.disconnect();
      chart.remove();
      chartRef.current  = null;
      seriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lwReady]); // SOLO lwReady — il chart viene creato una volta sola

  // Carica dati OHLC reali da TwelveData (XAU/USD) + aggrega per TF personalizzati
  const loadData = useCallback(async (requestedTf) => {
    if (!chartRef.current) return;
    const targetTf = requestedTf || tfRef.current;
    try {
      setError(null);
      const series = createSeries();
      if (!series) return;
      barsRef.current = [];

      const { bars, spotData, isDaily } = await fetchChartData(targetTf);
      if (tfRef.current !== targetTf) return;
      if (!seriesRef.current) return;

      barsRef.current = bars;

      // Intraday con indici sequenziali: timeVisible:false + tickMarkFormatter custom
      // che traduce idx → originalTime → data/ora leggibile sull'asse X.
      const isIndexed = !isDaily && bars.length > 0 && bars[0].originalTime !== undefined;
      const tickMarkFormatter = isIndexed
        ? (idx, markType) => {
            const bar = bars[idx];
            if (!bar || bar.originalTime == null) return '';
            const d   = new Date(bar.originalTime * 1000);
            const pad = n => String(n).padStart(2, '0');
            if (markType <= 1) return `${d.getUTCFullYear()}`;
            if (markType === 2) return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth()+1)}`;
            return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
          }
        : null;

      // timeFormatter: controlla la label del crosshair sull'asse X (indice → data/ora)
      const timeFormatter = isIndexed
        ? (idx) => {
            const bar = bars[typeof idx === 'number' ? idx : 0];
            if (!bar || bar.originalTime == null) return String(idx);
            const d   = new Date(bar.originalTime * 1000);
            const pad = n => String(n).padStart(2,'0');
            return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth()+1)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
          }
        : null;

      chartRef.current.applyOptions({
        localization: {
          timeFormatter: timeFormatter || undefined,
        },
        timeScale: {
          timeVisible:       isDaily,
          tickMarkFormatter: tickMarkFormatter,
        },
      });

      seriesRef.current.setData(bars);
      const spot = spotData.price;
      setLastPrice(spot);
      setSpotInfo({ ch: spotData.ch, chp: spotData.chp, price: spot });
      drawTrades();
      setLoading(false);
    } catch (err) {
      console.error('[Chart] loadData error:', err);
      if (tfRef.current !== targetTf) return;
      setError(`${err?.message || 'Errore caricamento dati — riprova.'}`);
      setLoading(false);
    }
  }, [createSeries, drawTrades]);

  // Trigger al cambio TF o quando la lib è pronta
  useEffect(() => {
    if (!lwReady || !chartRef.current) return;
    setLoading(true);
    clearInterval(pollRef.current);
    const t = setTimeout(() => {
      loadData(tf);
      // Poll ogni 60s — allineato al TTL cache TwelveData (non spamma l'API)
      pollRef.current = setInterval(() => loadData(tf), 60_000);
    }, 80);
    return () => {
      clearTimeout(t);
      clearInterval(pollRef.current);
    };
  }, [lwReady, tf, loadData]);

  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, bottom:'calc(env(safe-area-inset-bottom, 0px) + 68px)', background:'#000', display:'flex', flexDirection:'column' }}>

      {/* Toolbar TF */}
      <div className="flex items-center justify-between px-3" style={{
        height:44, background:'#000', borderBottom:'0.5px solid #14191d', flexShrink:0,
      }}>
        <div className="flex items-center gap-0.5">
          {CHART_TF_OPTIONS.map(t => (
            <button key={t} onClick={()=>{ haptic.light(); setTf(t); setLoading(true); }} className="xt-btn" style={{
              padding:'5px 9px', borderRadius:7, border:'none',
              background: tf===t ? 'rgba(255,255,255,0.14)' : 'transparent',
              color:      tf===t ? '#ffffff' : 'rgba(255,255,255,0.38)',
              fontSize:12, fontFamily: FONT.display, fontWeight:600,
              cursor:'pointer', letterSpacing:'-0.2px',
            }}>{CHART_TF_LABELS[t]}</button>
          ))}
        </div>

        {/* Prezzo spot XAU/USD reale — TwelveData */}
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          {lastPrice && (
            <span style={{ color:'#ffffff', fontSize:13, fontFamily:FONT.mono, fontWeight:700, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.3px' }}>
              {lastPrice.toFixed(2)}
            </span>
          )}
          {spotInfo && spotInfo.chp != null && (
            <span style={{
              fontSize:10, fontFamily:FONT.mono, fontWeight:600,
              color: spotInfo.chp >= 0 ? '#00ff00' : '#ff00ff',
              fontVariantNumeric:'tabular-nums',
            }}>
              {spotInfo.chp >= 0 ? '+' : ''}{spotInfo.chp.toFixed(2)}%
            </span>
          )}
          {!loading && !error && (
            <div style={{ display:'flex', alignItems:'center', gap:3 }}>
              <div className="xt-live-dot" style={{ width:5, height:5, borderRadius:'50%', background:'#00ff00' }}/>
              <span style={{ color:'rgba(255,255,255,0.28)', fontSize:9, fontFamily:FONT.mono, letterSpacing:'0.3px' }}>SPOT</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart + canvas overlay — touch diretto al crosshair (no scroll in questa tab) */}
      <div
        ref={containerRef}
        style={{ flex:1, position:'relative', overflow:'hidden' }}
        onTouchStart={e => {
          const t = e.touches[0];
          const chart = chartRef.current, series = seriesRef.current;
          if (!chart || !series) return;
          const rect = containerRef.current.getBoundingClientRect();
          try {
            const time  = chart.timeScale().coordinateToTime(t.clientX - rect.left);
            const price = series.coordinateToPrice(t.clientY - rect.top);
            if (time !== null && price !== null) chart.setCrosshairPosition(price, time, series);
          } catch(_) {}
        }}
        onTouchMove={e => {
          const t = e.touches[0];
          const chart = chartRef.current, series = seriesRef.current;
          if (!chart || !series) return;
          const rect = containerRef.current.getBoundingClientRect();
          try {
            const time  = chart.timeScale().coordinateToTime(t.clientX - rect.left);
            const price = series.coordinateToPrice(t.clientY - rect.top);
            if (time !== null && price !== null) chart.setCrosshairPosition(price, time, series);
          } catch(_) {}
        }}
        onTouchEnd={() => {
          try { if (chartRef.current) chartRef.current.clearCrosshairPosition(); } catch(_) {}
          setCrosshairInfo(null);
        }}
      >
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:5 }}/>


        {loading && (
          <div style={{ position:'absolute', inset:0, zIndex:10, display:'flex', alignItems:'center', justifyContent:'center', background:'#000' }}>
            <div style={{ textAlign:'center' }}>
              <div className="xt-live-dot" style={{ width:8, height:8, borderRadius:4, background:'#00ff00', margin:'0 auto 10px' }}/>
              <span style={{ color:'#636363', fontSize:11, fontFamily:FONT.mono }}>Caricamento XAUUSD…</span>
            </div>
          </div>
        )}
        {error && !loading && (
          <div style={{ position:'absolute', inset:0, zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#000', padding:24 }}>
            <div style={{ color:'#ff3333', fontSize:13, fontFamily:FONT.mono, marginBottom:16, textAlign:'center' }}>{error}</div>
            <button onClick={()=>{ setLoading(true); loadData(tf); }} style={{
              padding:'8px 18px', borderRadius:20,
              background:'rgba(255,255,255,0.08)', border:'0.5px solid #636363',
              color:'#fff', fontSize:12, fontFamily:FONT.mono, cursor:'pointer',
            }}>Riprova</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============= SETTINGS DEFAULTS ============= */
const SETTINGS_DEFAULTS = {
  currency:           'USD',
  refreshInterval:    60,
  pdfExportEnabled:   false,
  wallets:            [],
  exchanges:          [],
  snapshotDate:       '2026-06-01',
};

/* ============= ROOT ============= */
export default function TradingApp() {
  useEffect(() => { injectGlobalCSS(); injectPressManager(); }, []);

  // Altezza reale in state React — unico modo per forzare il wrapper a ridisegnarsi.
  // CSS vars su documentElement non triggano re-render, per questo il nero persisteva.
  const getH = () => {
    const isStandalone =
      ('standalone' in navigator && navigator.standalone === true) ||
      window.matchMedia('(display-mode: standalone)').matches;
    return isStandalone ? screen.height : window.innerHeight;
  };
  const [appHeight, setAppHeight] = useState(() => getH());
  useEffect(() => {
    const update = () => setAppHeight(getH());
    update();
    const t = setTimeout(update, 300);
    window.addEventListener('pageshow', update);
    window.addEventListener('resize', update);
    return () => { clearTimeout(t); window.removeEventListener('pageshow', update); window.removeEventListener('resize', update); };
  }, []);



  // ── Dati reali da Supabase ──────────────────────────
  const { loading: sbLoading, error: sbError, trades: sbTrades,
          equity: sbEquity, lastSync, fromLocal, refetch } = useSupabaseData();

  const trades = sbTrades || [];
  const equity = sbEquity || [];

  const sysScheme = useColorScheme();
  const [schemeOverride, setSchemeOverride] = usePersistedState('xt_scheme_override', 'auto');
  const scheme = schemeOverride === 'auto' ? sysScheme : schemeOverride;
  const C = { ...palette[scheme], scheme };
  const now = useLiveClock();

  const [settings, setSettings]           = usePersistedState('xt_settings', SETTINGS_DEFAULTS);
  const [accounts]                         = useState(ACCOUNT_DEFAULTS);
  const [activeAccount, setActiveAccount]  = usePersistedState('xt_active_account', 'main');
  const [settingsOpen, setSettingsOpen]    = useState(false);
  const [activePortfolio,setActivePortfolio]=usePersistedState('xt_active_portfolio','total');
  const [portfolioDropOpen,setPortfolioDropOpen]=useState(false);
  const [aiThinking, setAiThinking]        = useState(false);
  const [inputFocused, setInputFocused]    = useState(false);
  const portfolioList=useMemo(()=>{const w=(settings.wallets||[]).map(x=>({id:`w_${x.id}`,label:x.name||`Wallet`,type:'wallet'}));const e=(settings.exchanges||[]).map(x=>({id:`e_${x.id}`,label:x.name||x.exchangeId,type:'exchange'}));return [{id:'total',label:'Totale',type:'total'},...w,...e];},[settings.wallets,settings.exchanges]);

  const TAB_ORDER = ['portfolio', 'storico', 'ai', 'mercato', 'stats'];
  const [tabIdx, setTabIdx] = useState(0);
  const tabIdxRef = useRef(0); // mirror di tabIdx, accessibile nei listener senza closure stale

  // Sync ref ogni volta che tabIdx cambia da React
  useEffect(() => { tabIdxRef.current = tabIdx; }, [tabIdx]);

  // ── Tab navigation — solo tap ──────────────────
  const pagerRef = useRef(null);

  const snapTo = (idx) => {
    const clampedIdx = Math.max(0, Math.min(TAB_ORDER.length - 1, idx));
    if (clampedIdx !== tabIdxRef.current) {
      tabIdxRef.current = clampedIdx;
      setTabIdx(clampedIdx);
    }
  };

  const handleTabTap = (idx) => {
    if (idx === tabIdx) { haptic.selection(); return; } // tap su tab già attiva: light tick
    haptic.medium(); // cambio tab: medium impact
    snapTo(idx);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const tabs = [
    { id:'portfolio', label:'Portfolio' },
    { id:'storico',   label:'Storico'   },
    { id:'ai',        label:'AI'        },
    { id:'mercato',   label:'Mercato'   },
    { id:'stats',     label:'Stats'     },
  ];
  // streak/cooldown/dailyLock rimossi
  const icons = useMemo(() => tabIcons(C), [C]);
  const timeStr = now.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' });

  return (
    <div className="relative" onClick={()=>portfolioDropOpen&&setPortfolioDropOpen(false)} style={{
      background: C.bg, color: C.primary, fontFamily: FONT.text,
      WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale',

      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: appHeight,

      display: 'flex', flexDirection: 'column',
    }}>
      <div className="fixed inset-0 pointer-events-none" style={{ background: C.ambient }}/>

      {/* SETTINGS MODAL */}
      <SettingsModal
        C={C} open={settingsOpen} onClose={()=>setSettingsOpen(false)}
        settings={settings} setSettings={setSettings}
        accounts={accounts} activeAccount={activeAccount} setActiveAccount={setActiveAccount}
        scheme={sysScheme} schemeOverride={schemeOverride} setSchemeOverride={setSchemeOverride}
      />

      {/* HEADER */}
      <header className="sticky z-30 overflow-hidden"  style={{
        top: 0,
        transform: 'translateY(-6px)',
        background: scheme === 'dark' ? 'rgba(0,0,0,0.48)' : 'rgba(255,255,255,0.58)',
        backdropFilter: 'saturate(200%) blur(32px)',
        WebkitBackdropFilter: 'saturate(200%) blur(32px)',
        borderBottom: `0.5px solid ${C.sep}`,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}>
        <div className="absolute inset-0 xt-shimmer-overlay" style={{opacity: scheme==='dark'?1:0.4}}/>
        <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between relative">
          {/* Sinistra: dropdown portafoglio */}
          <div style={{position:'relative'}}>
            <button onClick={()=>{haptic.selection();setPortfolioDropOpen(o=>!o);}} style={{background:'none',border:'none',cursor:'pointer',padding:'4px 0',display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontFamily:FONT.text,fontSize:13,fontWeight:600,color:C.primary,letterSpacing:'-0.2px'}}>{portfolioList.find(p=>p.id===activePortfolio)?.label||'Totale'}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{transform:portfolioDropOpen?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.2s ease'}}><path d="M6 9l6 6 6-6" stroke={C.secondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {portfolioDropOpen&&(
              <div onClick={e=>e.stopPropagation()} style={{position:'absolute',top:'100%',left:0,marginTop:8,zIndex:200,background:C.glassBar,backdropFilter:'saturate(180%) blur(40px)',WebkitBackdropFilter:'saturate(180%) blur(40px)',border:`0.5px solid ${C.sep2}`,borderRadius:18,padding:'6px 0',boxShadow:'0 12px 40px rgba(0,0,0,0.5)',minWidth:190}}>
                {portfolioList.map((p,i)=>(
                  <button key={p.id} onClick={()=>{haptic.selection();setActivePortfolio(p.id);setPortfolioDropOpen(false);}} style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'9px 16px',background:activePortfolio===p.id?(scheme==='dark'?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)'):'transparent',border:'none',cursor:'pointer',borderBottom:i<portfolioList.length-1?`0.5px solid ${C.sep}`:'none'}}>
                    <div style={{width:22,height:22,borderRadius:6,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:p.type==='total'?`linear-gradient(135deg,${C.cyan},${C.purple})`:p.type==='wallet'?`linear-gradient(135deg,${C.green},#14a300)`:`linear-gradient(135deg,${C.orange},${C.pink})`}}>
                      {p.type==='total'&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      {p.type==='wallet'&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="#000" strokeWidth="2"/><circle cx="16" cy="13" r="1.5" fill="#000"/></svg>}
                      {p.type==='exchange'&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span style={{fontFamily:FONT.text,fontSize:13,fontWeight:activePortfolio===p.id?600:400,color:activePortfolio===p.id?C.primary:C.secondary,letterSpacing:'-0.1px'}}>{p.label}</span>
                    {activePortfolio===p.id&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{marginLeft:'auto'}}><path d="M20 6L9 17l-5-5" stroke={C.cyan} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Destra: settings */}
          <div className="flex items-center gap-1.5">
            {/* Settings */}
            <button onClick={()=>setSettingsOpen(true)} className="xt-btn" style={{
              width:30, height:30, borderRadius:15,
              background: C.glass2, border:`0.5px solid ${C.sep}`,
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke={C.secondary} strokeWidth="1.8"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={C.secondary} strokeWidth="1.8"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* PAGER — tab AI: no scroll esterno, AIView gestisce layout internamente */}
      {TAB_ORDER[tabIdx] === 'ai' ? (
        <div style={{ flex:1, minHeight:0, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', maxWidth:896, width:'100%', margin:'0 auto', padding:'0 20px', paddingBottom:80 }}>
            <ErrorBoundary C={C}><AIView C={C} trades={trades} equity={equity} settings={settings} activeAccount={activeAccount} currentTab="ai" setAiThinking={setAiThinking} setInputFocused={setInputFocused}/></ErrorBoundary>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', WebkitOverflowScrolling:'touch', overscrollBehavior:'none', paddingBottom:'env(safe-area-inset-bottom, 0px)' }}>
          <div className="max-w-7xl mx-auto px-5 py-4"
            style={{ paddingBottom: 70 }}>
            {(TAB_ORDER[tabIdx]==='daily'||TAB_ORDER[tabIdx]==='portfolio')&&<ErrorBoundary C={C}><DailyView C={C} now={now} settings={settings} trades={trades} equity={equity} activePortfolio={activePortfolio} portfolioList={portfolioList}/></ErrorBoundary>}
            {(TAB_ORDER[tabIdx]==='temporal'||TAB_ORDER[tabIdx]==='storico')&&<ErrorBoundary C={C}><TemporalView C={C} trades={trades} equity={equity} activePortfolio={activePortfolio} portfolioList={portfolioList}/></ErrorBoundary>}
            {(TAB_ORDER[tabIdx]==='metrics'||TAB_ORDER[tabIdx]==='stats')&&<ErrorBoundary C={C}><MetricheView C={C} trades={trades}/></ErrorBoundary>}
            {TAB_ORDER[tabIdx]==='mercato'&&<ErrorBoundary C={C}><MercatoView C={C} settings={settings}/></ErrorBoundary>}
            {TAB_ORDER[tabIdx]==='analytics'&&<ErrorBoundary C={C}><AnalyticsFullView C={C} trades={trades}/></ErrorBoundary>}
          </div>
        </div>
      )}



      {/* BOTTOM TAB BAR — si nasconde quando l'utente digita nell'input AI */}
      <div className="fixed left-1/2 z-50" style={{
        transform: inputFocused
          ? 'translateX(-50%) translateY(120%)'
          : 'translateX(-50%) translateY(0)',
        opacity: inputFocused ? 0 : 1,
        pointerEvents: inputFocused ? 'none' : 'auto',
        bottom: 17,
        transition: 'transform 0.28s cubic-bezier(0.34, 1.18, 0.64, 1), opacity 0.22s ease-out',
      }}>
        <div style={{
          background: C.glassBar,
          backdropFilter: 'saturate(200%) blur(52px)',
          WebkitBackdropFilter: 'saturate(200%) blur(52px)',
          border: `0.5px solid ${C.sep2}`,
          borderRadius: 36,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          boxShadow: scheme === 'dark'
            ? '0 14px 44px rgba(0,0,0,0.70), 0 0 0 0.5px rgba(255,255,255,0.05) inset'
            : '0 14px 44px rgba(0,0,0,0.20), 0 0 0 0.5px rgba(255,255,255,0.55) inset',
        }}>
          {tabs.map((t, i) => {
            const active = tabIdx === i;
            const Icon = icons[t.id]?.glyph;
            const grad = icons[t.id]?.gradient;
            const isAI = t.id === 'ai';
            return (
              <button key={t.id} onClick={() => handleTabTap(i)}
                      className="xt-tab-btn flex items-center"
                      style={{
                        padding: '7px 14px',
                        borderRadius: 30,
                        /* AI: nessun pill bg quando attiva, resta sempre trasparente */
                        background: (!isAI && active) ? (scheme==='dark'?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.06)') : 'transparent',
                        border: 'none', cursor: 'pointer',
                      }}>
                <div className="xt-tab-icon">
                  {isAI ? (
                    /* AI: orb sfera di 160 particelle — 44px (più grande delle altre 32) per essere ben in evidenza.
                       NO gradient bg, NO pill bg. Animazioni:
                       - base: rotazione 22s + respiro 4.5s + glow pulse 3.2s
                       - press (tap): pop espansivo 0.45s
                       - thinking (AI sta elaborando): espansione rapida 1.1s + glow forte 1.3s */
                    <div className={`xt-orb-glow ${aiThinking ? 'xt-orb-thinking' : ''}`} style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: scheme === 'dark'
                        ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 70%)'
                        : 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.04) 0%, transparent 70%)',
                      boxShadow: active
                        ? (scheme === 'dark' ? '0 0 4px 1px rgba(255,255,255,0.03)' : '0 0 4px 1px rgba(0,0,0,0.04)')
                        : 'none',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transform: active ? 'scale(1.04)' : 'scale(1)',
                      transition:'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      flexShrink: 0,
                      // In light mode i puntini con opacity<1 diventano grigi su sfondo bianco.
                      // Boost contrasto + scurire per renderli nero pieno e ben visibili
                      filter: scheme === 'dark' ? 'none' : 'contrast(1.7) brightness(0.4)',
                    }}>
                      <div className="xt-orb-animated" style={{display:'flex'}}>
                        <Icon color={scheme === 'dark' ? '#FFFFFF' : '#000000'}/>
                      </div>
                    </div>
                  ) : Icon && grad ? (
                    <AppIcon gradient={grad} active={active} size={32}>
                      <Icon color={C.iconBg}/>
                    </AppIcon>
                  ) : (
                    <div style={{width:32,height:32,borderRadius:10,background:active?`linear-gradient(135deg,${C.orange},${C.pink})`:`${C.glass2}`,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.25s'}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" stroke={active?C.iconBg:C.tertiary} strokeWidth="1.8" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
