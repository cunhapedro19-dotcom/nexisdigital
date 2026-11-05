/**
 * Design Tokens - Tech Minimal
 * Fonte única de verdade para cores, spacing, tipografia, bordas, sombras.
 * Usado por Tailwind (via config) e componentes React.
 */

// ===== CORES =====
export const colors = {
  // Base (dark-first)
  bg: {
    primary: "#0c0a09",      // fundo principal
    secondary: "#12100e",    // cards, superfícies elevadas
    tertiary: "#1a1715",     // hover, bordas sutis
    inverse: "#faf9f7",      // fundo claro (modais light)
  },
  text: {
    primary: "#f5f3f0",      // texto principal
    secondary: "#d4d0cb",    // texto secundário
    muted: "#9a958f",        // placeholders, labels
    inverse: "#0c0a09",      // texto em fundo claro
    accent: "#06b6d4",       // links, ações primárias (cyan-400)
    accentHover: "#0891b2",  // hover (cyan-500)
    warning: "#fbbf24",      // amber-400
    danger: "#f87171",       // red-400
    success: "#4ade80",      // green-400
  },
  border: {
    default: "#2a2623",      // borda padrão (white/10)
    muted: "#1f1c1a",        // borda sutil
    accent: "#06b6d4",       // borda foco/ativo (cyan-400)
    warning: "#fbbf24",      // borda warning
    danger: "#f87171",       // borda danger
  },
  brand: {
    cyan: "#06b6d4",
    cyanDark: "#0891b2",
    amber: "#fbbf24",
    amberDark: "#f59e0b",
    orange: "#fb923c",
    orangeDark: "#f97316",
  },
  // Semânticas para componentes
  semantic: {
    primary: {
      bg: "#06b6d4",
      bgHover: "#0891b2",
      text: "#0c0a09",
      border: "#06b6d4",
    },
    secondary: {
      bg: "#1f1c1a",
      bgHover: "#2a2623",
      text: "#f5f3f0",
      border: "#2a2623",
    },
    danger: {
      bg: "#dc2626",
      bgHover: "#b91c1c",
      text: "#fef2f2",
      border: "#dc2626",
    },
    ghost: {
      bg: "transparent",
      bgHover: "#1f1c1a",
      text: "#d4d0cb",
      border: "transparent",
    },
  },
} as const;

// ===== ESPAÇAMENTO =====
export const spacing = {
  0: "0",
  1: "0.25rem",   // 4px
  2: "0.5rem",    // 8px
  3: "0.75rem",   // 12px
  4: "1rem",      // 16px
  5: "1.25rem",   // 20px
  6: "1.5rem",    // 24px
  8: "2rem",      // 32px
  10: "2.5rem",   // 40px
  12: "3rem",     // 48px
  16: "4rem",     // 64px
  20: "5rem",     // 80px
  24: "6rem",     // 96px
} as const;

// ===== TIPOGRAFIA =====
export const typography = {
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "ui-monospace", "monospace"],
    display: ["Inter", "system-ui", "sans-serif"], // mesmo que sans, mas peso maior
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],      // 12px
    sm: ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
    base: ["1rem", { lineHeight: "1.5rem" }],     // 16px
    lg: ["1.125rem", { lineHeight: "1.75rem" }],  // 18px
    xl: ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
    "2xl": ["1.5rem", { lineHeight: "2rem" }],    // 24px
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
    "5xl": ["3rem", { lineHeight: "1" }],         // 48px
    // Tamanhos administrativos (mínimo 11px para a11y)
    "admin-xs": ["0.6875rem", { lineHeight: "1rem" }], // 11px
    "admin-sm": ["0.8125rem", { lineHeight: "1.25rem" }], // 13px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  letterSpacing: {
    tight: "-0.02em",
    normal: "0",
    wide: "0.02em",
    wider: "0.1em",
    uppercase: "0.08em",
  },
} as const;

// ===== BORDAS =====
export const borders = {
  radius: {
    none: "0",
    sm: "0.25rem",    // 4px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    "2xl": "1rem",    // 16px
    full: "9999px",
  },
  width: {
    thin: "1px",
    default: "1px",
    thick: "2px",
  },
  style: "solid",
} as const;

// ===== SOMBRAS =====
export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  // Focus ring (acessibilidade)
  focus: "0 0 0 2px #06b6d4",
  focusInset: "inset 0 0 0 2px #06b6d4",
} as const;

// ===== TRANSIÇÕES =====
export const transitions = {
  fast: "150ms ease",
  default: "200ms ease",
  slow: "300ms ease",
  spring: "300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

// ===== Z-INDEX =====
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const;

// ===== BREAKPOINTS =====
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ===== CONTAINER =====
export const container = {
  maxWidth: "80rem", // 1280px
  padding: {
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
  },
} as const;

// ===== EXPORT AGREGADO =====
export const tokens = {
  colors,
  spacing,
  typography,
  borders,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  container,
} as const;

export type Tokens = typeof tokens;
export type ColorScale = typeof colors;
export type SpacingScale = typeof spacing;