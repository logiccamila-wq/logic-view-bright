import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { estimateRouteCost } from "@/utils/costEstimator";

export function CostEstimator() {
  const [form, setForm] = useState({ distanceKm: "", avgConsumptionKmPerLiter: "3.5", fuelPricePerLiter: "6.00", tolls: "0", variableCostPerKm: "0.50", fixedCost: "0" });
  const calc = estimateRouteCost({
    distanceKm: parseFloat(form.distanceKm || "0"),
    avgConsumptionKmPerLiter: parseFloat(form.avgConsumptionKmPerLiter || "0"),
    fuelPricePerLiter: parseFloat(form.fuelPricePerLiter || "0"),
    tolls: parseFloat(form.tolls || "0"),
    variableCostPerKm: parseFloat(form.variableCostPerKm || "0"),
    fixedCost: parseFloat(form.fixedCost || "0"),
  });

  return (
    <Card className="p-4 space-y-3">
      <div className="font-semibold">Estimativa de Custo da Rota</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Input placeholder="Distância (km)" value={form.distanceKm} onChange={(e)=>setForm({...form, distanceKm: e.target.value})} />
        <Input placeholder="KM/L" value={form.avgConsumptionKmPerLiter} onChange={(e)=>setForm({...form, avgConsumptionKmPerLiter: e.target.value})} />
        <Input placeholder="Preço/L (R$)" value={form.fuelPricePerLiter} onChange={(e)=>setForm({...form, fuelPricePerLiter: e.target.value})} />
        <Input placeholder="Pedágios (R$)" value={form.tolls} onChange={(e)=>setForm({...form, tolls: e.target.value})} />
        <Input placeholder="Var R$/km" value={form.variableCostPerKm} onChange={(e)=>setForm({...form, variableCostPerKm: e.target.value})} />
        <Input placeholder="Fixo (R$)" value={form.fixedCost} onChange={(e)=>setForm({...form, fixedCost: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        <div>Combustível: R$ {calc.fuelCost.toFixed(2)} • {calc.liters.toFixed(1)} L</div>
        <div>Pedágios: R$ {calc.tolls.toFixed(2)}</div>
        <div>Variável: R$ {calc.variableCost.toFixed(2)}</div>
        <div className="font-bold">Total: R$ {calc.total.toFixed(2)}</div>
      </div>
      <div className="flex justify-end">
        <Button variant="modern">Aplicar na Viagem</Button>
      </div>
    </Card>
  );
}

