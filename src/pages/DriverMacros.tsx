import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const MACROS = ["INICIO_VIAGEM", "CHEGADA_CLIENTE", "INICIO_DESCARREGO", "PAUSA", "FIM_VIAGEM", "ANOMALIA"];

const DriverMacros = () => {
  const { user } = useAuth();
  const [tripId, setTripId] = useState("");
  const [macro, setMacro] = useState(MACROS[0]);
  const [notes, setNotes] = useState("");

  const send = async () => {
    const { error } = await supabase.from("trip_macros" as any).insert({
      driver_id: user!.id,
      trip_id: tripId || null,
      macro_type: macro,
      notes,
      timestamp: new Date().toISOString(),
    } as any);
    if (!error) {
      setNotes("");
    }
  };

  return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Mobilização Manual do Motorista</h1>
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Trip ID (opcional)" value={tripId} onChange={(e) => setTripId(e.target.value)} />
            <Select value={macro} onValueChange={setMacro}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MACROS.map((m) => (<SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input placeholder="Notas" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end mt-3">
            <Button variant="modern" onClick={send}>Enviar Macro</Button>
          </div>
        </Card>
      </div>
  );
};

export default DriverMacros;
