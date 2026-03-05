export function costPerKm(totalFixed: number, totalVariable: number, totalKm: number) {
  if (totalKm <= 0) return 0;
  return (totalFixed + totalVariable) / totalKm;
}

export function avgFuelKmPerLiter(totalKm: number, totalLiters: number) {
  if (totalLiters <= 0) return 0;
  return totalKm / totalLiters;
}

export function unavailabilityIndex(daysInactive: number, daysTotal: number) {
  if (daysTotal <= 0) return 0;
  return (daysInactive / daysTotal) * 100;
}

export function idleCost(dailyRevenueLost: number, daysStopped: number) {
  return dailyRevenueLost * daysStopped;
}

export function emptyMileagePercent(emptyKm: number, totalKm: number) {
  if (totalKm <= 0) return 0;
  return (emptyKm / totalKm) * 100;
}

export function operationalSpeed(distanceKm: number, movingHours: number) {
  if (movingHours <= 0) return 0;
  return distanceKm / movingHours;
}

