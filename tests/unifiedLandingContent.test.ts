import {
  landingPalettes,
  landingTranslations,
  resolveLandingLanguage,
  resolveLandingPalette,
} from "../src/pages/unifiedLandingContent";

describe("unifiedLandingContent", () => {
  it("falls back to pt-BR for unsupported languages", () => {
    expect(resolveLandingLanguage("de-DE")).toBe("pt-BR");
    expect(resolveLandingLanguage(undefined)).toBe("pt-BR");
  });

  it("resolves known languages without changing them", () => {
    for (const language of Object.keys(landingTranslations)) {
      expect(resolveLandingLanguage(language)).toBe(language);
    }
  });

  it("returns the default palette when the id is unknown", () => {
    expect(resolveLandingPalette("missing-palette")).toEqual(landingPalettes[0]);
  });

  it("returns a selected palette when the id exists", () => {
    const palette = landingPalettes[1];
    expect(resolveLandingPalette(palette.id)).toEqual(palette);
  });
});
