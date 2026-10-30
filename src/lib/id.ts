/**
 * Gerador de identificadores únicos por sessão.
 *
 * Usar aqui (e não Date.now()/Math.random() espalhados) porque funções
 * de componente não devem chamar APIs impuras diretamente — o React
 * Compiler as sinaliza — e centralizar facilita trocar por UUID real
 * quando houver backend.
 */
let counter = 0;

export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}${counter.toString(36)}${Date.now().toString(36).slice(-4)}`;
}
