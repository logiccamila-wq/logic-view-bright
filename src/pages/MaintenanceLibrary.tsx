import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const sample = {
  maintenance_library: [
    {
      manufacturer: "Scania",
      model_family: "Series R",
      engine_type: "DC13",
      application: "Rodoviário Pesado",
      maintenance_plans: [
        { plan_type: "S", description: "Lubrificação e verificações", intervals: { kilometers: 20000, months: 6 }, tasks: [{ code: "ENG-01", item: "Óleo do Motor", action: "Trocar", part_spec: "LDF-3" }] },
        { plan_type: "M", description: "Revisão Intermediária", intervals: { kilometers: 60000 }, tasks: [] }
      ]
    }
  ]
};

const MaintenanceLibrary = () => {
  const [json, setJson] = useState(JSON.stringify(sample, null, 2));
  const addVolvo = () => {
    const data = JSON.parse(json);
    data.maintenance_library.push({
      manufacturer: "Volvo",
      model_family: "FH/FM",
      engine_type: "D13",
      application: "Rodoviário Pesado",
      maintenance_plans: [
        { plan_type: "Básica", description: "VDS-4.5", intervals: { kilometers: 40000, months: 12 }, tasks: [{ code: "ENG-02", item: "Óleo do Motor", action: "Trocar", part_spec: "VDS-4.5" }] }
      ]
    });
    setJson(JSON.stringify(data, null, 2));
  };
  const addMercedes = () => {
    const data = JSON.parse(json);
    data.maintenance_library.push({
      manufacturer: "Mercedes-Benz",
      model_family: "Actros/Atego",
      engine_type: "OM",
      application: "Rodoviário",
      maintenance_plans: [
        { plan_type: "Serviço", description: "Assyst", intervals: { kilometers: 30000, months: 12 }, tasks: [] }
      ]
    });
    setJson(JSON.stringify(data, null, 2));
  };

  const save = async () => {
    const payload = JSON.parse(json);
    await supabase.from("integration_settings" as any).upsert({ key: "maintenance_library", value: payload }, { onConflict: "key" });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Biblioteca OEM de Manutenção</h1>
        <Card className="p-4">
          <Textarea rows={20} value={json} onChange={(e)=>setJson(e.target.value)} />
          <div className="flex justify-between mt-3">
            <div className="flex gap-2">
              <Button variant="outline" onClick={addVolvo}>Adicionar Volvo</Button>
              <Button variant="outline" onClick={addMercedes}>Adicionar Mercedes</Button>
            </div>
            <Button onClick={save}>Salvar</Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default MaintenanceLibrary;
