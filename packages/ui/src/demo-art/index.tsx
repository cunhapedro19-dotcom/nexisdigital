"use client";

import type { ReactNode } from "react";

/**
 * DemoArt — Ilustrações SVG próprias para demonstrações.
 * Substitui fotos: zero dependência, escalável, funciona offline,
 * compatível com basePath (GitHub Pages), consistente com Tech Minimal.
 */

export type ArtVariant =
  | "burger"
  | "burger-double"
  | "fries"
  | "drink"
  | "dessert"
  | "tee"
  | "hoodie"
  | "cap"
  | "bag"
  | "beach"
  | "beach-wide"
  | "room"
  | "room-warm"
  | "store"
  | "dashboard"
  | "calendar"
  | "chart"
  | "users"
  | "settings";

/**
 * Container da ilustração.
 * Por padrão preenche o pai (position: relative esperado no pai).
 * Passe className para ajustar tamanho/posição.
 */
export function DemoArt({
  variant,
  className = "absolute inset-0",
  ariaHidden = true,
}: {
  variant: ArtVariant;
  className?: string;
  ariaHidden?: boolean;
}) {
  return (
    <div className={className} aria-hidden={ariaHidden}>
      <svg
        viewBox="0 0 160 120"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-label={`Ilustração: ${variant}`}
      >
        {SCENES[variant] ?? SCENES.store}
      </svg>
    </div>
  );
}

/* =========================================================
   Cenas — cada uma ocupa o viewBox 160×120
   ========================================================= */

const SCENES: Record<ArtVariant, ReactNode> = {
  /* ---- Gastronomia / Cardápio ---- */
  burger: (
    <g>
      <defs>
        <linearGradient id="bgBurger" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2415" />
          <stop offset="1" stopColor="#1d1208" />
        </linearGradient>
        <linearGradient id="bun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3c078" />
          <stop offset="1" stopColor="#d99a4e" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgBurger)" />
      <circle cx="128" cy="24" r="34" fill="#5a3418" opacity="0.55" />
      <circle cx="22" cy="100" r="30" fill="#2b1a0d" opacity="0.8" />
      <ellipse cx="80" cy="96" rx="52" ry="9" fill="#120a04" opacity="0.7" />
      <ellipse cx="80" cy="74" rx="38" ry="12" fill="#6b3a1f" />
      <path d="M46 68 L114 68 L106 80 L54 80 Z" fill="#f7b93e" />
      <path d="M44 62 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 L116 58 L44 58 Z" fill="#7cb342" />
      <path d="M46 82 h68 a4 8 0 0 1 -4 10 h-60 a4 8 0 0 1 -4 -10 Z" fill="#e0a558" />
      <path d="M42 58 a38 20 0 0 1 76 0 Z" fill="url(#bun)" />
      <circle cx="66" cy="46" r="1.6" fill="#fbe3b8" />
      <circle cx="82" cy="42" r="1.6" fill="#fbe3b8" />
      <circle cx="97" cy="47" r="1.6" fill="#fbe3b8" />
    </g>
  ),

  "burger-double": (
    <g>
      <defs>
        <linearGradient id="bgBurger2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#43260f" />
          <stop offset="1" stopColor="#201207" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgBurger2)" />
      <circle cx="30" cy="20" r="30" fill="#5f3a17" opacity="0.5" />
      <ellipse cx="80" cy="98" rx="50" ry="8" fill="#140b04" opacity="0.7" />
      <ellipse cx="80" cy="78" rx="36" ry="10" fill="#5f3419" />
      <ellipse cx="80" cy="64" rx="36" ry="10" fill="#6f3d1f" />
      <path d="M48 60 L112 60 L105 70 L55 70 Z" fill="#f7b93e" />
      <path d="M48 74 L112 74 L105 84 L55 84 Z" fill="#e8a52e" />
      <path d="M50 56 q15 -8 30 0 q15 8 30 0" stroke="#c98adf" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M44 86 h72 a4 7 0 0 1 -4 9 h-64 a4 7 0 0 1 -4 -9 Z" fill="#dda057" />
      <path d="M42 50 a38 18 0 0 1 76 0 Z" fill="#f0b869" />
      <circle cx="68" cy="40" r="1.5" fill="#fbe3b8" />
      <circle cx="84" cy="37" r="1.5" fill="#fbe3b8" />
      <circle cx="98" cy="42" r="1.5" fill="#fbe3b8" />
    </g>
  ),

  fries: (
    <g>
      <defs>
        <linearGradient id="bgFries" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3113" />
          <stop offset="1" stopColor="#241708" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgFries)" />
      <circle cx="132" cy="92" r="28" fill="#5f421c" opacity="0.45" />
      <g strokeLinecap="round">
        <line x1="62" y1="62" x2="58" y2="30" stroke="#f4c542" strokeWidth="7" />
        <line x1="74" y1="60" x2="74" y2="24" stroke="#f9d976" strokeWidth="7" />
        <line x1="86" y1="60" x2="90" y2="28" stroke="#f4c542" strokeWidth="7" />
        <line x1="98" y1="62" x2="104" y2="34" stroke="#eab52f" strokeWidth="7" />
        <line x1="68" y1="61" x2="66" y2="34" stroke="#eab52f" strokeWidth="7" />
        <line x1="92" y1="61" x2="96" y2="38" stroke="#f9d976" strokeWidth="7" />
      </g>
      <path d="M50 58 L110 58 L104 100 L56 100 Z" fill="#c0392b" />
      <path d="M50 58 L110 58 L108 72 L52 72 Z" fill="#e74c3c" />
      <circle cx="80" cy="80" r="6" fill="#f9d976" opacity="0.9" />
      <circle cx="66" cy="84" r="4" fill="#f9d976" opacity="0.7" />
      <circle cx="94" cy="84" r="4" fill="#f9d976" opacity="0.7" />
    </g>
  ),

  drink: (
    <g>
      <defs>
        <linearGradient id="bgDrink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f2f3d" />
          <stop offset="1" stopColor="#081820" />
        </linearGradient>
        <linearGradient id="soda" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e74c3c" />
          <stop offset="1" stopColor="#922b21" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgDrink)" />
      <circle cx="26" cy="90" r="26" fill="#123a4a" opacity="0.6" />
      <path d="M60 34 L100 34 L94 100 L66 100 Z" fill="#dfe8ec" opacity="0.28" />
      <path d="M62 48 L98 48 L94 100 L66 100 Z" fill="url(#soda)" />
      <circle cx="72" cy="60" r="2" fill="#ffffff" opacity="0.5" />
      <circle cx="86" cy="72" r="1.6" fill="#ffffff" opacity="0.4" />
      <circle cx="78" cy="86" r="1.3" fill="#ffffff" opacity="0.35" />
      <circle cx="90" cy="56" r="1.4" fill="#ffffff" opacity="0.45" />
      <rect x="58" y="30" width="44" height="6" rx="3" fill="#bdcdd4" />
      <line x1="88" y1="30" x2="96" y2="8" stroke="#f4c542" strokeWidth="4" strokeLinecap="round" />
      <rect x="68" y="50" width="9" height="9" rx="2" fill="#ffffff" opacity="0.25" transform="rotate(12 72 54)" />
      <rect x="82" y="62" width="8" height="8" rx="2" fill="#ffffff" opacity="0.2" transform="rotate(-14 86 66)" />
    </g>
  ),

  dessert: (
    <g>
      <defs>
        <linearGradient id="bgDessert" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d2416" />
          <stop offset="1" stopColor="#1c100a" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgDessert)" />
      <circle cx="130" cy="26" r="26" fill="#4f2f1c" opacity="0.5" />
      <ellipse cx="80" cy="98" rx="48" ry="8" fill="#140b06" opacity="0.7" />
      <rect x="48" y="66" width="42" height="28" rx="5" fill="#5d3a1a" />
      <rect x="48" y="66" width="42" height="9" rx="4" fill="#7a4d24" />
      <circle cx="103" cy="78" r="15" fill="#f6e3c6" />
      <circle cx="103" cy="78" r="15" fill="none" stroke="#e4cba4" strokeWidth="2" opacity="0.6" />
      <path d="M92 70 q11 -8 22 0" stroke="#8e44ad" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="103" cy="60" r="4" fill="#c0392b" />
      <path d="M103 56 q2 -6 6 -8" stroke="#7cb342" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="56" cy="64" rx="5" ry="3" fill="#7cb342" transform="rotate(-20 56 64)" />
    </g>
  ),

  /* ---- Catálogo / Loja ---- */
  tee: (
    <g>
      <defs>
        <linearGradient id="bgTee" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b3040" />
          <stop offset="1" stopColor="#14171f" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgTee)" />
      <circle cx="130" cy="90" r="26" fill="#39445c" opacity="0.4" />
      <path d="M62 30 L72 24 Q80 30 88 24 L98 30 L112 44 L102 54 L98 48 L98 96 L62 96 L62 48 L58 54 L48 44 Z" fill="#aab4c8" />
      <path d="M72 24 Q80 31 88 24 L86 28 Q80 33 74 28 Z" fill="#8d97ad" />
      <circle cx="80" cy="66" r="11" fill="none" stroke="#313a4d" strokeWidth="2.5" />
      <path d="M74 66 l4 4 l8 -8" stroke="#313a4d" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),

  hoodie: (
    <g>
      <defs>
        <linearGradient id="bgHoodie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#332a20" />
          <stop offset="1" stopColor="#191410" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgHoodie)" />
      <circle cx="28" cy="94" r="26" fill="#453a2b" opacity="0.4" />
      <path d="M60 32 L70 26 Q80 33 90 26 L100 32 L114 48 L104 58 L100 51 L100 96 L60 96 L60 51 L56 58 L46 48 Z" fill="#8d6e4f" />
      <path d="M68 30 Q80 44 92 30 Q86 22 80 22 Q74 22 68 30 Z" fill="#6f573c" />
      <path d="M74 32 q6 8 12 0" stroke="#4d3b27" strokeWidth="2" fill="none" />
      <line x1="76" y1="34" x2="75" y2="46" stroke="#e8dcc8" strokeWidth="2" strokeLinecap="round" />
      <line x1="84" y1="34" x2="85" y2="46" stroke="#e8dcc8" strokeWidth="2" strokeLinecap="round" />
      <path d="M66 78 L94 78 L90 92 L70 92 Z" fill="#7a5f42" />
      <path d="M66 78 L94 78" stroke="#5f4932" strokeWidth="2" />
    </g>
  ),

  cap: (
    <g>
      <defs>
        <linearGradient id="bgCap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e2620" />
          <stop offset="1" stopColor="#171310" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgCap)" />
      <circle cx="128" cy="30" r="26" fill="#3f3529" opacity="0.45" />
      <path d="M40 70 Q80 84 122 70 Q124 78 118 80 Q80 92 44 80 Q38 78 40 70 Z" fill="#b3854a" />
      <path d="M52 68 Q52 34 80 34 Q108 34 108 68 Q80 76 52 68 Z" fill="#cf9c58" />
      <path d="M80 34 Q92 40 92 68" stroke="#a87c40" strokeWidth="2" fill="none" />
      <path d="M80 34 Q68 40 68 68" stroke="#a87c40" strokeWidth="2" fill="none" />
      <circle cx="80" cy="34" r="3" fill="#8a6332" />
    </g>
  ),

  bag: (
    <g>
      <defs>
        <linearGradient id="bgBag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22332e" />
          <stop offset="1" stopColor="#101a17" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgBag)" />
      <circle cx="30" cy="28" r="24" fill="#2e453d" opacity="0.5" />
      <path d="M62 46 Q62 22 80 22 Q98 22 98 46" stroke="#8a9a6d" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="48" y="46" width="64" height="54" rx="7" fill="#a9bb84" />
      <rect x="48" y="46" width="64" height="12" rx="6" fill="#8fa267" />
      <rect x="66" y="64" width="28" height="22" rx="4" fill="#8fa267" />
      <circle cx="80" cy="70" r="2.2" fill="#5d6e43" />
    </g>
  ),

  /* ---- Pousadas ---- */
  beach: (
    <g>
      <defs>
        <linearGradient id="skyBeach" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7b267" />
          <stop offset="0.55" stopColor="#f4845f" />
          <stop offset="1" stopColor="#f27059" />
        </linearGradient>
        <linearGradient id="seaBeach" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c7da0" />
          <stop offset="1" stopColor="#1a5a7d" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#skyBeach)" />
      <circle cx="106" cy="38" r="15" fill="#fff3b0" />
      <circle cx="106" cy="38" r="22" fill="#fff3b0" opacity="0.25" />
      <ellipse cx="34" cy="26" rx="16" ry="5" fill="#ffffff" opacity="0.35" />
      <ellipse cx="120" cy="16" rx="13" ry="4" fill="#ffffff" opacity="0.3" />
      <rect y="52" width="160" height="34" fill="url(#seaBeach)" />
      <path d="M0 56 q20 3 40 0 q20 -3 40 0 q20 3 40 0 q20 -3 40 0" stroke="#a9d6e5" strokeWidth="1.6" fill="none" opacity="0.7" />
      <path d="M0 66 q20 3 40 0 q20 -3 40 0 q20 3 40 0 q20 -3 40 0" stroke="#a9d6e5" strokeWidth="1.2" fill="none" opacity="0.4" />
      <path d="M0 86 Q40 78 80 86 Q120 94 160 84 L160 120 L0 120 Z" fill="#f4d8a8" />
      <path d="M0 90 Q40 82 80 90" stroke="#e8c68c" strokeWidth="1.4" fill="none" opacity="0.6" />
      <path d="M30 92 Q28 62 40 46" stroke="#6b4226" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g fill="#2d6a4f">
        <ellipse cx="40" cy="42" rx="13" ry="4.5" transform="rotate(-18 40 42)" />
        <ellipse cx="46" cy="48" rx="12" ry="4" transform="rotate(14 46 48)" />
        <ellipse cx="34" cy="50" rx="11" ry="4" transform="rotate(38 34 50)" />
        <ellipse cx="48" cy="38" rx="10" ry="3.6" transform="rotate(-52 48 38)" />
      </g>
      <circle cx="41" cy="47" r="2.4" fill="#54300b" />
      <circle cx="44" cy="49" r="2.4" fill="#54300b" />
    </g>
  ),

  "beach-wide": (
    <g>
      <defs>
        <linearGradient id="skyBeach2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#86bbd8" />
          <stop offset="1" stopColor="#e0fbfc" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#skyBeach2)" />
      <circle cx="120" cy="30" r="12" fill="#fff3b0" />
      <ellipse cx="40" cy="22" rx="15" ry="5" fill="#ffffff" opacity="0.6" />
      <rect y="46" width="160" height="42" fill="#48a0c0" />
      <rect y="46" width="160" height="10" fill="#61b0cc" opacity="0.7" />
      <path d="M0 58 q20 3 40 0 q20 -3 40 0 q20 3 40 0 q20 -3 40 0" stroke="#cae9ff" strokeWidth="1.4" fill="none" opacity="0.6" />
      <path d="M92 58 L92 34 L104 56 Z" fill="#ffffff" />
      <path d="M88 58 L88 40 L80 56 Z" fill="#f28c8c" />
      <path d="M76 60 L106 60 L100 66 L82 66 Z" fill="#6b4226" />
      <path d="M0 88 Q40 80 80 88 Q120 96 160 86 L160 120 L0 120 Z" fill="#f4d8a8" />
      <line x1="34" y1="94" x2="34" y2="66" stroke="#6b4226" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M16 68 A18 12 0 0 1 52 68 Q34 60 16 68 Z" fill="#e76f51" />
      <path d="M24 66 A12 9 0 0 1 44 66" stroke="#f4a261" strokeWidth="3" fill="none" />
    </g>
  ),

  room: (
    <g>
      <defs>
        <linearGradient id="bgRoom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5c7466" />
          <stop offset="1" stopColor="#2f4237" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgRoom)" />
      <rect x="86" y="18" width="52" height="42" rx="4" fill="#d9eddf" />
      <rect x="90" y="22" width="44" height="34" rx="2" fill="#8fc1a9" />
      <circle cx="112" cy="30" r="6" fill="#fff3b0" />
      <path d="M90 50 q10 -8 20 0 q10 8 24 -2 L134 56 L90 56 Z" fill="#6ba584" />
      <line x1="112" y1="22" x2="112" y2="56" stroke="#d9eddf" strokeWidth="3" />
      <rect x="18" y="62" width="70" height="30" rx="5" fill="#b08968" />
      <rect x="18" y="56" width="70" height="12" rx="5" fill="#ddb892" />
      <rect x="22" y="48" width="22" height="12" rx="4" fill="#f5ebe0" />
      <rect x="48" y="48" width="22" height="12" rx="4" fill="#f5ebe0" />
      <rect x="12" y="40" width="5" height="52" rx="2" fill="#7f5539" />
      <rect x="84" y="40" width="5" height="52" rx="2" fill="#7f5539" />
      <ellipse cx="110" cy="98" rx="34" ry="9" fill="#e3d5c0" opacity="0.5" />
      <rect x="138" y="86" width="12" height="14" rx="2" fill="#9c6644" />
      <g fill="#588157">
        <ellipse cx="144" cy="78" rx="5" ry="10" />
        <ellipse cx="137" cy="82" rx="4.4" ry="8" transform="rotate(-24 137 82)" />
        <ellipse cx="151" cy="82" rx="4.4" ry="8" transform="rotate(24 151 82)" />
      </g>
    </g>
  ),

  "room-warm": (
    <g>
      <defs>
        <linearGradient id="bgRoom2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c5e43" />
          <stop offset="1" stopColor="#3e2f22" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgRoom2)" />
      <ellipse cx="104" cy="84" rx="34" ry="16" fill="#432818" />
      <ellipse cx="104" cy="78" rx="30" ry="12" fill="#8ecae6" />
      <ellipse cx="96" cy="76" rx="7" ry="2.6" fill="#ffffff" opacity="0.4" />
      <ellipse cx="114" cy="80" rx="6" ry="2.2" fill="#ffffff" opacity="0.3" />
      <path d="M96 64 q3 -6 0 -12" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />
      <path d="M110 62 q-3 -6 0 -12" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.25" strokeLinecap="round" />
      <g>
        <line x1="24" y1="18" x2="24" y2="30" stroke="#3e2f22" strokeWidth="1.6" />
        <circle cx="24" cy="34" r="4.4" fill="#ffd166" />
        <line x1="44" y1="18" x2="44" y2="28" stroke="#3e2f22" strokeWidth="1.6" />
        <circle cx="44" cy="32" r="4.4" fill="#ffd166" />
        <line x1="64" y1="18" x2="64" y2="30" stroke="#3e2f22" strokeWidth="1.6" />
        <circle cx="64" cy="34" r="4.4" fill="#ffd166" />
      </g>
      <rect x="20" y="72" width="44" height="26" rx="4" fill="#9c6644" />
      <rect x="24" y="64" width="18" height="10" rx="3" fill="#f5ebe0" />
      <rect x="44" y="64" width="16" height="10" rx="3" fill="#e3d5c0" />
    </g>
  ),

  /* ---- Genérica: Dashboard / SaaS ---- */
  store: (
    <g>
      <defs>
        <linearGradient id="bgStore" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d3765" />
          <stop offset="1" stopColor="#0a0b11" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgStore)" />
      <g>
        <rect x="16" y="24" width="36" height="46" rx="5" fill="#ffffff" opacity="0.08" />
        <rect x="62" y="24" width="36" height="46" rx="5" fill="#ffffff" opacity="0.12" />
        <rect x="108" y="24" width="36" height="46" rx="5" fill="#ffffff" opacity="0.08" />
        <circle cx="34" cy="40" r="8" fill="#60a5fa" opacity="0.55" />
        <circle cx="80" cy="40" r="8" fill="#a78bfa" opacity="0.55" />
        <circle cx="126" cy="40" r="8" fill="#34d399" opacity="0.55" />
        <rect x="24" y="54" width="20" height="4" rx="2" fill="#ffffff" opacity="0.25" />
        <rect x="70" y="54" width="20" height="4" rx="2" fill="#ffffff" opacity="0.25" />
        <rect x="116" y="54" width="20" height="4" rx="2" fill="#ffffff" opacity="0.25" />
      </g>
      <rect x="16" y="84" width="128" height="3" rx="1.5" fill="#60a5fa" opacity="0.4" />
      <rect x="16" y="94" width="88" height="3" rx="1.5" fill="#ffffff" opacity="0.12" />
    </g>
  ),

  dashboard: (
    <g>
      <defs>
        <linearGradient id="bgDash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f172a" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgDash)" />
      {/* Sidebar */}
      <rect x="8" y="8" width="36" height="104" rx="4" fill="#1e293b" />
      <circle cx="26" cy="22" r="6" fill="#06b6d4" opacity="0.3" />
      <rect x="18" y="42" width="16" height="3" rx="1.5" fill="#06b6d4" />
      <rect x="18" y="50" width="12" height="3" rx="1.5" fill="#475569" />
      <rect x="18" y="58" width="14" height="3" rx="1.5" fill="#475569" />
      {/* Cards */}
      <rect x="52" y="8" width="48" height="44" rx="4" fill="#1e293b" />
      <rect x="60" y="16" width="32" height="4" rx="2" fill="#06b6d4" />
      <rect x="60" y="26" width="24" height="3" rx="1.5" fill="#475569" />
      <rect x="60" y="34" width="28" height="3" rx="1.5" fill="#475569" />
      <rect x="108" y="8" width="48" height="44" rx="4" fill="#1e293b" />
      <rect x="116" y="16" width="32" height="4" rx="2" fill="#fbbf24" />
      <rect x="116" y="26" width="24" height="3" rx="1.5" fill="#475569" />
      <rect x="116" y="34" width="28" height="3" rx="1.5" fill="#475569" />
      {/* Chart area */}
      <rect x="52" y="60" width="104" height="52" rx="4" fill="#1e293b" />
      <path d="M60 98 L72 78 L84 86 L96 70 L108 82 L120 66 L132 74 L144 62" stroke="#06b6d4" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="60" cy="98" r="3" fill="#06b6d4" />
      <circle cx="72" cy="78" r="3" fill="#06b6d4" />
      <circle cx="84" cy="86" r="3" fill="#06b6d4" />
      <circle cx="96" cy="70" r="3" fill="#06b6d4" />
      <circle cx="108" cy="82" r="3" fill="#06b6d4" />
      <circle cx="120" cy="66" r="3" fill="#06b6d4" />
      <circle cx="132" cy="74" r="3" fill="#06b6d4" />
      <circle cx="144" cy="62" r="3" fill="#06b6d4" />
    </g>
  ),

  calendar: (
    <g>
      <defs>
        <linearGradient id="bgCal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1917" />
          <stop offset="1" stopColor="#0c0a09" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgCal)" />
      {/* Header do calendário */}
      <rect x="20" y="12" width="120" height="20" rx="4" fill="#1f1c1a" />
      <rect x="74" y="16" width="24" height="12" rx="2" fill="#06b6d4" opacity="0.2" />
      <text x="86" y="24" font-size="8" fill="#06b6d4" text-anchor="middle" font-family="monospace">JUL</text>
      {/* Grid */}
      <g stroke="#2a2623" strokeWidth="0.5">
        {/* Dias da semana */}
        <line x1="20" y1="38" x2="140" y2="38" />
        <line x1="20" y1="54" x2="140" y2="54" />
        <line x1="20" y1="70" x2="140" y2="70" />
        <line x1="20" y1="86" x2="140" y2="86" />
        <line x1="20" y1="102" x2="140" y2="102" />
        {/* Colunas */}
        <line x1="20" y1="38" x2="20" y2="102" />
        <line x1="40" y1="38" x2="40" y2="102" />
        <line x1="60" y1="38" x2="60" y2="102" />
        <line x1="80" y1="38" x2="80" y2="102" />
        <line x1="100" y1="38" x2="100" y2="102" />
        <line x1="120" y1="38" x2="120" y2="102" />
        <line x1="140" y1="38" x2="140" y2="102" />
      </g>
      {/* Números (alguns preenchidos) */}
      <g font-size="7" fill="#d4d0cb" font-family="monospace" text-anchor="middle">
        <text x="30" y="50">1</text>
        <text x="50" y="50">2</text>
        <text x="70" y="50">3</text>
        <text x="90" y="50">4</text>
        <text x="110" y="50">5</text>
        <text x="130" y="50">6</text>
        <text x="30" y="66">7</text>
        {/* Dia de hoje destacado */}
        <circle cx="90" cy="58" r="8" fill="#06b6d4" />
        <text x="90" y="66" fill="#0c0a09" font-weight="bold">10</text>
        <text x="110" y="66">11</text>
        <text x="130" y="66">12</text>
      </g>
      {/* Legenda */}
      <g font-size="6" fill="#9a958f" font-family="monospace">
        <text x="20" y="114">D S T Q Q S S</text>
      </g>
    </g>
  ),

  chart: (
    <g>
      <defs>
        <linearGradient id="bgChart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c0a09" />
          <stop offset="1" stopColor="#06141b" />
        </linearGradient>
        <linearGradient id="areaChart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#06b6d4" stopOpacity="0.3" />
          <stop offset="1" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgChart)" />
      {/* Área */}
      <path d="M20 100 L30 80 L45 90 L60 60 L75 70 L90 50 L105 65 L120 40 L135 55 L140 30 L140 100 Z" fill="url(#areaChart)" />
      {/* Linha */}
      <path d="M20 100 L30 80 L45 90 L60 60 L75 70 L90 50 L105 65 L120 40 L135 55 L140 30" stroke="#06b6d4" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Pontos */}
      <circle cx="20" cy="100" r="3" fill="#06b6d4" />
      <circle cx="30" cy="80" r="3" fill="#06b6d4" />
      <circle cx="45" cy="90" r="3" fill="#06b6d4" />
      <circle cx="60" cy="60" r="3" fill="#06b6d4" />
      <circle cx="75" cy="70" r="3" fill="#06b6d4" />
      <circle cx="90" cy="50" r="3" fill="#06b6d4" />
      <circle cx="105" cy="65" r="3" fill="#06b6d4" />
      <circle cx="120" cy="40" r="3" fill="#06b6d4" />
      <circle cx="135" cy="55" r="3" fill="#06b6d4" />
      <circle cx="140" cy="30" r="3" fill="#06b6d4" />
      {/* Grid sutil */}
      <g stroke="#1f1c1a" strokeWidth="0.5">
        <line x1="20" y1="30" x2="140" y2="30" />
        <line x1="20" y1="65" x2="140" y2="65" />
        <line x1="20" y1="100" x2="140" y2="100" />
      </g>
    </g>
  ),

  users: (
    <g>
      <defs>
        <linearGradient id="bgUsers" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1625" />
          <stop offset="1" stopColor="#0c0a09" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgUsers)" />
      {/* Avatars em grid */}
      <g>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <g key={i} transform={`translate(${30 + (i % 4) * 32}, ${30 + Math.floor(i / 4) * 40})`}>
            <circle cx="0" cy="0" r="14" fill="#1f1c1a" />
            <circle cx="0" cy="-2" r="9" fill="#a78bfa" opacity="0.3" />
            <circle cx="0" cy="-2" r="5" fill="#a78bfa" />
            <ellipse cx="0" cy="12" rx="10" ry="6" fill="#2a2623" />
            {/* Status online */}
            {i % 3 === 0 && <circle cx="10" cy="8" r="3.5" fill="#4ade80" stroke="#0c0a09" strokeWidth="1.5" />}
          </g>
        ))}
      </g>
      {/* Linha de conexão */}
      <path d="M42 30 Q80 50 118 30" stroke="#a78bfa" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="4 4" />
    </g>
  ),

  settings: (
    <g>
      <defs>
        <linearGradient id="bgSettings" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#18181b" />
          <stop offset="1" stopColor="#0c0a09" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" fill="url(#bgSettings)" />
      {/* Engrenagem central */}
      <g transform="translate(80, 60)">
        <circle cx="0" cy="0" r="24" fill="none" stroke="#2a2623" strokeWidth="2" />
        <circle cx="0" cy="0" r="12" fill="#1f1c1a" />
        {/* Dentes da engrenagem */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line
            key={i}
            x1="24"
            y1="0"
            x2="32"
            y2="0"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${i * 45})`}
          />
        ))}
        <circle cx="0" cy="0" r="6" fill="#06b6d4" />
      </g>
      {/* Sliders laterais */}
      <g>
        <rect x="20" y="30" width="8" height="50" rx="4" fill="#2a2623" />
        <circle cx="24" cy="40" r="6" fill="#06b6d4" />
        <rect x="132" y="30" width="8" height="50" rx="4" fill="#2a2623" />
        <circle cx="136" cy="60" r="6" fill="#fbbf24" />
      </g>
      {/* Toggles inferiores */}
      <g>
        <rect x="50" y="96" width="28" height="14" rx="7" fill="#2a2623" />
        <circle cx="62" cy="103" r="8" fill="#06b6d4" />
        <rect x="82" y="96" width="28" height="14" rx="7" fill="#06b6d4" />
        <circle cx="94" cy="103" r="8" fill="#0c0a09" />
      </g>
    </g>
  ),
};

/**
 * Lista de todas as variantes disponíveis (para uso em Admin/Select)
 */
export const ART_VARIANTS: readonly ArtVariant[] = [
  "burger",
  "burger-double",
  "fries",
  "drink",
  "dessert",
  "tee",
  "hoodie",
  "cap",
  "bag",
  "beach",
  "beach-wide",
  "room",
  "room-warm",
  "store",
  "dashboard",
  "calendar",
  "chart",
  "users",
  "settings",
] as const;

/**
 * Metadados por variante (para preview no Admin)
 */
export const ART_META: Record<ArtVariant, { label: string; category: string; tags: string[] }> = {
  burger: { label: "Hambúrguer", category: "Gastronomia", tags: ["lanche", "principal"] },
  "burger-double": { label: "Hambúrguer Duplo", category: "Gastronomia", tags: ["lanche", "principal"] },
  fries: { label: "Batatas Fritas", category: "Gastronomia", tags: ["acompanhamento"] },
  drink: { label: "Bebida/Refrigerante", category: "Gastronomia", tags: ["bebida"] },
  dessert: { label: "Sobremesa", category: "Gastronomia", tags: ["doce", "sobremesa"] },
  tee: { label: "Camiseta", category: "Vestuário", tags: ["roupa", "camiseta"] },
  hoodie: { label: "Moletom", category: "Vestuário", tags: ["roupa", "moletom"] },
  cap: { label: "Boné", category: "Vestuário", tags: ["acessorio", "bone"] },
  bag: { label: "Mochila/Bolsa", category: "Vestuário", tags: ["acessorio", "bolsa"] },
  beach: { label: "Praia", category: "Hospitalidade", tags: ["pousada", "praia", "externa"] },
  "beach-wide": { label: "Praia Panorâmica", category: "Hospitalidade", tags: ["pousada", "praia", "hero"] },
  room: { label: "Quarto Standard", category: "Hospitalidade", tags: ["pousada", "quarto", "interna"] },
  "room-warm": { label: "Quarto Premium (Ofurô)", category: "Hospitalidade", tags: ["pousada", "quarto", "premium"] },
  store: { label: "Loja Genérica", category: "SaaS", tags: ["dashboard", "generico"] },
  dashboard: { label: "Dashboard SaaS", category: "SaaS", tags: ["admin", "metricas", "graficos"] },
  calendar: { label: "Calendário/Disponibilidade", category: "SaaS", tags: ["agenda", "reservas", "calendario"] },
  chart: { label: "Gráfico/Analytics", category: "SaaS", tags: ["metricas", "analytics", "grafico"] },
  users: { label: "Usuários/Equipe", category: "SaaS", tags: ["team", "usuarios", "colaboradores"] },
  settings: { label: "Configurações", category: "SaaS", tags: ["admin", "config", "engrenagem"] },
};