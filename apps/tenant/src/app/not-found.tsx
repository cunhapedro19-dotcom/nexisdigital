export default function GlobalNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-accent)] mb-4">404</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
          Site não encontrado
        </h1>
        <p className="text-[var(--text-secondary)]">
          Verifique o endereço digitado ou entre em contato com o responsável.
        </p>
      </div>
    </main>
  );
}
