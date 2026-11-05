import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário para combinar classes Tailwind com clsx + twMerge.
 * Resolve conflitos de classes (última vence) e mantere DX do clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}