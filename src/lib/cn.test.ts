import { describe, it, expect } from "vitest";
import { currencyBRL } from "./cn";

describe("cn.ts - currencyBRL", () => {
  it("formata valores em BRL corretamente", () => {
    expect(currencyBRL(0)).toBe("R$ 0,00");
    expect(currencyBRL(1)).toBe("R$ 1,00");
    expect(currencyBRL(10)).toBe("R$ 10,00");
    expect(currencyBRL(99.9)).toBe("R$ 99,90");
    expect(currencyBRL(100)).toBe("R$ 100,00");
    expect(currencyBRL(1234.56)).toBe("R$ 1.234,56");
    expect(currencyBRL(1000000)).toBe("R$ 1.000.000,00");
  });

  it("arredonda para 2 casas decimais", () => {
    expect(currencyBRL(10.1)).toBe("R$ 10,10");
    expect(currencyBRL(10.123)).toBe("R$ 10,12");
    expect(currencyBRL(10.126)).toBe("R$ 10,13");
  });

  it("lida com números negativos", () => {
    expect(currencyBRL(-50)).toBe("-R$ 50,00");
  });
});