import { describe, it, expect } from "vitest";
import {
  generateSolutionJsonLd,
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
} from "./jsonld";

describe("jsonld.ts", () => {
  describe("generateSolutionJsonLd", () => {
    it("gera JSON-LD válido do tipo SoftwareApplication", () => {
      const jsonld = generateSolutionJsonLd({
        name: "Pousada Arandis",
        description: "Sistema de reservas para pousadas",
        path: "/solucoes/pousadas/",
        features: ["Calendário", "WhatsApp"],
      });

      expect(jsonld["@context"]).toBe("https://schema.org");
      expect(jsonld["@type"]).toBe("SoftwareApplication");
      expect(jsonld.name).toBe("Pousada Arandis");
      expect(jsonld.description).toContain("pousadas");
      expect(jsonld.url).toContain("/solucoes/pousadas/");
      expect(jsonld.applicationCategory).toBe("BusinessApplication");
      expect(jsonld.operatingSystem).toBe("Cloud");
      expect(jsonld.offers["@type"]).toBe("Offer");
      expect(jsonld.offers.availability).toBe("https://schema.org/InStock");
      expect(jsonld.offers.price).toBe("0");
      expect(jsonld.offers.priceCurrency).toBe("BRL");
      expect(jsonld.featureList).toEqual(["Calendário", "WhatsApp"]);
      expect(jsonld.publisher["@type"]).toBe("Organization");
      expect(jsonld.publisher.name).toBe("Nexis Digital");
      expect(jsonld.aggregateRating["@type"]).toBe("AggregateRating");
      expect(jsonld.aggregateRating.ratingValue).toBe("4.9");
    });

    it("usa demoUrl quando fornecido", () => {
      const jsonld = generateSolutionJsonLd({
        name: "Teste",
        description: "Desc",
        path: "/solucoes/teste/",
        demoUrl: "https://demo.exemplo.com",
      });

      expect(jsonld.offers.url).toBe("https://demo.exemplo.com");
    });

    it("usa URL da página quando demoUrl não fornecido", () => {
      const jsonld = generateSolutionJsonLd({
        name: "Teste",
        description: "Desc",
        path: "/solucoes/teste/",
      });

      expect(jsonld.offers.url).toContain("/solucoes/teste/");
    });

    it("featureList undefined quando array vazio", () => {
      const jsonld = generateSolutionJsonLd({
        name: "Teste",
        description: "Desc",
        path: "/solucoes/teste/",
        features: [],
      });

      expect(jsonld.featureList).toBeUndefined();
    });
  });

  describe("generateOrganizationJsonLd", () => {
    it("gera JSON-LD válido do tipo Organization", () => {
      const jsonld = generateOrganizationJsonLd();

      expect(jsonld["@context"]).toBe("https://schema.org");
      expect(jsonld["@type"]).toBe("Organization");
      expect(jsonld.name).toBe("Nexis Digital");
      expect(jsonld.url).toBeDefined();
      expect(jsonld.logo).toContain("/logo-white.png");
      expect(Array.isArray(jsonld.sameAs)).toBe(true);
      expect(Array.isArray(jsonld.contactPoint)).toBe(true);
      expect(jsonld.contactPoint.length).toBe(2);
      expect(jsonld.contactPoint[0]["@type"]).toBe("ContactPoint");
      expect(jsonld.contactPoint[0].contactType).toBe("customer service");
      expect(jsonld.address["@type"]).toBe("PostalAddress");
      expect(jsonld.address.addressCountry).toBe("BR");
    });
  });

  describe("generateWebSiteJsonLd", () => {
    it("gera JSON-LD válido do tipo WebSite com SearchAction", () => {
      const jsonld = generateWebSiteJsonLd();

      expect(jsonld["@context"]).toBe("https://schema.org");
      expect(jsonld["@type"]).toBe("WebSite");
      expect(jsonld.name).toBe("Nexis Digital");
      expect(jsonld.url).toBeDefined();
      expect(jsonld.potentialAction["@type"]).toBe("SearchAction");
      expect(jsonld.potentialAction.target["@type"]).toBe("EntryPoint");
      expect(jsonld.potentialAction.target.urlTemplate).toContain("/busca?q={search_term_string}");
      expect(jsonld.potentialAction["query-input"]).toBe("required name=search_term_string");
    });
  });
});