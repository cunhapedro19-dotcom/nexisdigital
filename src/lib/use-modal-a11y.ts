"use client";

import { useEffect, useRef } from "react";

/**
 * Pilha global de modais abertos. Com modais aninhados (ex.: painel
 * administrativo abrindo um editor), o Escape deve fechar apenas o
 * modal do topo da pilha — não todos de uma vez.
 */
const modalStack: object[] = [];

/**
 * Acessibilidade de modais/drawers:
 * - fecha com a tecla Escape (apenas o modal do topo, quando aninhados);
 * - trava o scroll do body enquanto aberto;
 * - devolve a referência para o container que recebe foco ao abrir.
 *
 * Uso:
 *   const ref = useModalA11y(open, onClose);
 *   <div ref={ref} role="dialog" aria-modal="true" aria-label="...">
 */
export function useModalA11y(
  open: boolean,
  onClose: () => void,
): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);
  const prevFocused = useRef<Element | null>(null);
  const stackId = useRef<object>({});

  // Guarda o onClose numa ref (padrão latest-ref): o efeito abaixo
  // depende só de `open`. Assim, re-renders do componente pai (que
  // recriam a função onClose) não re-executam o efeito — o que
  // devolveria o foco ao container no meio da interação do usuário.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const id = stackId.current;
    modalStack.push(id);

    // Guarda o foco atual para devolver ao fechar.
    prevFocused.current = document.activeElement;

    // Foca o container do modal (com tabIndex -1).
    const container = ref.current;
    if (container) {
      container.tabIndex = -1;
      container.focus({ preventScroll: true });
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        // Fecha somente se este for o modal do topo da pilha.
        if (modalStack[modalStack.length - 1] !== id) return;
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      // Trap de foco simplificado: mantém Tab dentro do modal.
      if (e.key === "Tab" && container) {
        const focusables = container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function onScrollLock() {
      const { overflow } = document.body.style;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = overflow;
      };
    }

    const unlock = onScrollLock();
    document.addEventListener("keydown", onKey, true);

    return () => {
      const idx = modalStack.indexOf(id);
      if (idx !== -1) modalStack.splice(idx, 1);
      unlock();
      document.removeEventListener("keydown", onKey, true);
      // Devolve o foco ao elemento que abriu o modal.
      if (prevFocused.current instanceof HTMLElement) {
        prevFocused.current.focus({ preventScroll: true });
      }
    };
  }, [open]);

  return ref;
}
