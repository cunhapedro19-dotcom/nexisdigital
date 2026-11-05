import type { Metadata } from "next";
import { getPluginRegistryServer } from "@nexis/plugin/registry";

export const metadata: Metadata = { title: "Plugins" };

/**
 * Catálogo de plugins disponíveis na plataforma.
 * Lê o registry core (manifests registrados no @nexis/core).
 */
export default function PluginsPage() {
  let plugins: ReturnType<ReturnType<typeof getPluginRegistryServer>["getAvailablePlugins"]> = [];
  let error: string | null = null;

  try {
    plugins = getPluginRegistryServer().getAvailablePlugins();
  } catch (e) {
    error = e instanceof Error ? e.message : "Registry indisponível";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Plugins</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Módulos instaláveis pelos tenants.
      </p>

      {error ? (
        <div className="rounded-xl border border-[var(--border-warning)] bg-[var(--bg-secondary)] p-6">
          <p className="text-sm text-[var(--text-secondary)]">
            Não foi possível carregar o registry: {error}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plugins.map((p) => (
            <div
              key={p.key}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-[var(--text-primary)]">{p.name}</h2>
                <span className="rounded-full border border-[var(--border-default)] px-2 py-0.5 text-xs font-mono text-[var(--text-muted)]">
                  v{p.version}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                {p.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--semantic-secondary-bg)] px-2 py-0.5 text-xs text-[var(--text-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
