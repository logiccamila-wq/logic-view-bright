export function estimateRouteCost(params: { distanceKm: number; avgConsumptionKmPerLiter: number; fuelPricePerLiter: number; tolls?: number; variableCostPerKm?: number; fixedCost?: number }) {
  const distanceKm = Math.max(0, params.distanceKm || 0);
  const kmpl = Math.max(0.1, params.avgConsumptionKmPerLiter || 3);
  const fuelPrice = Math.max(0, params.fuelPricePerLiter || 5);
  const tolls = Math.max(0, params.tolls || 0);
  const varPerKm = Math.max(0, params.variableCostPerKm || 0.5);
  const fixedCost = Math.max(0, params.fixedCost || 0);
  const liters = distanceKm / kmpl;
  const fuelCost = liters * fuelPrice;
  const variableCost = varPerKm * distanceKm;
  const total = fixedCost + fuelCost + tolls + variableCost;
  return { total, fuelCost, tolls, variableCost, liters };
}

