import { describe, it, expect } from "vitest";
import { nextId } from "./id";

describe("id.ts - nextId", () => {
  it("gera IDs com prefixo fornecido", () => {
    const id = nextId("test");
    expect(id).toMatch(/^test_[a-z0-9]+$/);
  });

  it("gera IDs únicos em chamadas consecutivas", () => {
    const ids = Array.from({ length: 100 }, () => nextId("u"));
    const unique = new Set(ids);
    expect(unique.size).toBe(100);
  });

  it("usa prefixo padrão quando não fornecido", () => {
    const id = nextId();
    expect(id).toMatch(/^id_[a-z0-9]+$/);
  });

  it("IDs têm comprimento razoável", () => {
    const id = nextId("prefixo_longo");
    expect(id.length).toBeLessThan(50);
    expect(id.length).toBeGreaterThan(10);
  });
});