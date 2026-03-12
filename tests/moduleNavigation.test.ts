import { mergeUniqueModules, resolveModuleRoute } from "../src/modules/moduleNavigation";

describe("moduleNavigation", () => {
  it("resolves known registry and built-in module routes", () => {
    expect(resolveModuleRoute("drivers-management")).toBe("/drivers-management");
    expect(resolveModuleRoute("driver-app")).toBe("/driver");
  });

  it("falls back to the module details route for unknown modules", () => {
    expect(resolveModuleRoute("unknown-module")).toBe("/module/unknown-module");
  });

  it("keeps the first module when duplicate ids are present", () => {
    expect(
      mergeUniqueModules([
        { id: "tms", name: "Primary TMS" },
        { id: "TMS", name: "Duplicated TMS" },
        { id: "wms", name: "WMS" },
      ]),
    ).toEqual([
      { id: "tms", name: "Primary TMS" },
      { id: "wms", name: "WMS" },
    ]);
  });
});
