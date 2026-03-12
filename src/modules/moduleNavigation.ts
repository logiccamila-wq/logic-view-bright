import { modules as registry } from "@/modules/registry";

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

export function resolveModuleRoute(moduleId: string): string {
  const normalizedModuleId = moduleId.trim().toLowerCase();
  const registryModule = registry.find((module) => module.slug === normalizedModuleId);

  return registryModule?.route || moduleRouteAliases[normalizedModuleId] || `/module/${normalizedModuleId}`;
}

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
