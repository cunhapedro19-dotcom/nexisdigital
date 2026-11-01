/**
 * Registra o Service Worker no cliente.
 * Chame isso uma vez no layout raiz ou em um componente que monte cedo.
 */
export function registerSW() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  // Só registra em produção (evita cache durante dev)
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Verifica updates periodicamente
        let refreshing = false;
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Novo SW instalado - avisa usuário para recarregar
              if (!refreshing) {
                refreshing = true;
                if (confirm("Nova versão disponível. Recarregar?")) {
                  window.location.reload();
                }
              }
            }
          });
        });
      })
      .catch((err) => {
        console.warn("SW registration failed:", err);
      });
  });
}