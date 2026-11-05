/**
 * @nexis/ui — Design System & Component Library
 * Tech Minimal: flat, 1px borders, Inter ≥11px, cyan/amber/orange accents
 */

// Design Tokens (fonte única de verdade)
export * from "./tokens/index.js";

// AdminKit — Componentes para painéis administrativos
export * from "./admin/index.js";

// DemoArt — Ilustrações SVG próprias (zero deps, escaláveis)
export * from "./demo-art/index.js";

// Utilitários
export { cn } from "./utils/cn.js";