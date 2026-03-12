import { modules as registry } from "./registry";

const moduleRouteAliases: Record<string, string> = {
  dashboard: "/dashboard",
  tms: "/tms",
  wms: "/wms",
  oms: "/oms",
  crm: "/crm",
  erp: "/erp",
  "driver-app": "/driver",
  "mechanic-hub": "/mechanic",
  "control-tower": "/control-tower",
};

const registryRoutes = new Map(
  registry
    .filter((module): module is typeof module & { route: string } => Boolean(module.route))
    .map((module) => [module.slug, module.route]),
);

/**
 * Resolves a module destination by trying the registry route first, then a
 * small alias map for legacy marketplace ids, and finally the generic
 * `/module/:slug` fallback with a normalized lowercase slug when no direct
 * page is registered.
 */
export function resolveModuleRoute(moduleId: string): string {
  const normalizedModuleId = moduleId.trim().toLowerCase();
  if (!normalizedModuleId) {
    return "/marketplace";
  }
  return registryRoutes.get(normalizedModuleId) || moduleRouteAliases[normalizedModuleId] || `/module/${normalizedModuleId}`;
}

/**
 * Deduplicates modules by a normalized id (trimmed and case-insensitive) while
 * preserving the first occurrence so curated marketplace entries win over
 * repeated registry/database records.
 */
export function mergeUniqueModules<T extends { id: string }>(modules: T[]): T[] {
  const seen = new Set<string>();

  return modules.filter((module) => {
    const normalizedModuleId = module.id.trim().toLowerCase();
    if (seen.has(normalizedModuleId)) {
      return false;
    }

    seen.add(normalizedModuleId);
    return true;
  });
}
