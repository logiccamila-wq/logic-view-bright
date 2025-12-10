import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VehicleSelect } from "@/components/VehicleSelect";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Gate() {
  const [plate, setPlate] = useState("");
  const [driver, setDriver] = useState("");
  const [kind, setKind] = useState<"entry"|"exit">("entry");
  const [odometer, setOdometer] = useState("");
  const [reason, setReason] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");
  const [isVisitor, setIsVisitor] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!plate) {
      toast.error("Informe a placa");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('gate_events').insert({
        vehicle_plate: plate,
        driver_name: driver,
        direction: kind,
        odometer: odometer ? parseInt(odometer) : null,
        reason: reason,
        authorized_by: authorizedBy,
        is_visitor: isVisitor
      } as any);

      if (error) throw error;
      toast.success("Evento registrado com sucesso");
      
      // Reset form
      setPlate(""); 
      setDriver(""); 
      setKind("entry");
      setOdometer("");
      setReason("");
      setAuthorizedBy("");
      setIsVisitor(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portaria</h1>
          <p className="text-muted-foreground">Entrada/Saída de veículos e custo operacional</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registro de Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="visitor" checked={isVisitor} onCheckedChange={setIsVisitor} />
              <Label htmlFor="visitor">Visitante / Veículo Externo</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Placa do Veículo</Label>
                {isVisitor ? (
                  <Input 
                    placeholder="Digite a placa" 
                    value={plate} 
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  />
                ) : (
                  <VehicleSelect 
                    value={plate} 
                    onChange={setPlate}
                    placeholder="Selecione a placa"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Tipo de Movimento</Label>
                <Select value={kind} onValueChange={(v: any) => setKind(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entrada</SelectItem>
                    <SelectItem value="exit">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Motorista</Label>
                <Input 
                  placeholder="Nome do motorista" 
                  value={driver} 
                  onChange={(e) => setDriver(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Hodômetro (km)</Label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={odometer} 
                  onChange={(e) => setOdometer(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <Label>Quem Autorizou</Label>
                <Input 
                  placeholder="Nome do autorizador" 
                  value={authorizedBy} 
                  onChange={(e) => setAuthorizedBy(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivo / Observações</Label>
              <Textarea 
                placeholder="Motivo da entrada/saída" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
              />
            </div>

            <Button onClick={submit} disabled={loading} className="w-full md:w-auto">
              {loading ? "Registrando..." : "Registrar Evento"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
