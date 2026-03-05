import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Package, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { VehicleSelect } from "@/components/VehicleSelect";
import { useAuth } from "@/contexts/AuthContext";

interface Part {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export function PartsRequestTab() {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [parts, setParts] = useState<Part[]>([]);
  const [newPart, setNewPart] = useState({ name: "", quantity: 1, unit: "unidade" });
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [notes, setNotes] = useState("");

  const isManager = hasRole('admin') || hasRole('maintenance_manager') || hasRole('logistics_manager');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["parts-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parts_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Fail gracefully if table doesn't exist yet
        if (error.code === 'PGRST205') return [];
        throw error;
      }
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string, status: string, reason?: string }) => {
      const { error } = await supabase
        .from("parts_requests")
        .update({ 
          status, 
          approved_by: status === 'aprovado' ? user?.id : null,
          approved_at: status === 'aprovado' ? new Date().toISOString() : null,
          rejection_reason: reason 
        })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["parts-requests"] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  });

  const createRequest = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");
      if (parts.length === 0) throw new Error("Adicione pelo menos uma peça");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { data, error } = await supabase
        .from("parts_requests")
        .insert([{
          mechanic_id: user.id,
          mechanic_name: profile?.full_name || user.email || "Mecânico",
          vehicle_plate: vehiclePlate || null,
          parts_list: parts as any,
          urgency,
          notes: notes || null,
          status: "pendente",
        }])
        .select()
        .single();

      if (error) throw error;

      // Buscar gestores para notificar
      const { data: managers } = await supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["admin", "logistics_manager", "maintenance_manager"]);

      // Criar notificações
      if (managers) {
        const notifications = managers.map((manager) => ({
          user_id: manager.user_id,
          title: "Novo Pedido de Peças",
          message: `${profile?.full_name || "Mecânico"} solicitou ${parts.length} peça(s)${vehiclePlate ? ` para ${vehiclePlate}` : ""}. Urgência: ${urgency === "urgent" ? "URGENTE" : "Normal"}`,
          type: (urgency === "urgent" ? "warning" : "info") as "warning" | "info",
          module: "maintenance",
        }));

        await supabase.from("notifications").insert(notifications);
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Pedido enviado com sucesso!");
      setParts([]);
      setVehiclePlate("");
      setUrgency("normal");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["parts-requests"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const addPart = () => {
    if (!newPart.name.trim()) {
      toast.error("Digite o nome da peça");
      return;
    }

    setParts([
      ...parts,
      {
        id: crypto.randomUUID(),
        ...newPart,
      },
    ]);

    setNewPart({ name: "", quantity: 1, unit: "unidade" });
  };

  const removePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />Pendente</Badge>;
      case "aprovado":
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" />Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urg: string) => {
    return urg === "urgent" ? (
      <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" />Urgente</Badge>
    ) : (
      <Badge variant="outline">Normal</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Novo Pedido de Peças
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Placa do Veículo (opcional)</Label>
              <VehicleSelect
                value={vehiclePlate}
                onChange={setVehiclePlate}
                placeholder="Selecione a placa"
              />
            </div>

            <div className="space-y-2">
              <Label>Urgência</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Adicionar Peças</Label>
            <div className="grid grid-cols-12 gap-2">
              <Input
                placeholder="Nome da peça"
                className="col-span-6"
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && addPart()}
              />
              <Input
                type="number"
                min="1"
                placeholder="Qtd"
                className="col-span-2"
                value={newPart.quantity}
                onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
              />
              <Select
                value={newPart.unit}
                onValueChange={(value) => setNewPart({ ...newPart, unit: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidade">Unidade</SelectItem>
                  <SelectItem value="litro">Litro</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="metro">Metro</SelectItem>
                  <SelectItem value="jogo">Jogo</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addPart} size="icon" className="col-span-1">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {parts.length > 0 && (
              <div className="space-y-2 p-3 bg-muted rounded-lg">
                {parts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between bg-background p-2 rounded">
                    <span className="font-medium">{part.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {part.quantity} {part.unit}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePart(part.id)}
                        className="h-7 w-7"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Informações adicionais sobre o pedido..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={() => createRequest.mutate()}
            disabled={parts.length === 0 || createRequest.isPending}
            className="w-full"
          >
            {createRequest.isPending ? "Enviando..." : "Enviar Pedido para Gestor"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meus Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando pedidos...</p>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground">Nenhum pedido realizado ainda.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((request: any) => (
                <Card key={request.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                          {getUrgencyBadge(request.urgency)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      {request.vehicle_plate && (
                        <Badge variant="outline">{request.vehicle_plate}</Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="font-semibold">Peças Solicitadas:</p>
                      <ul className="space-y-1 text-sm">
                        {request.parts_list.map((part: Part, idx: number) => (
                          <li key={idx} className="flex justify-between">
                            <span>{part.name}</span>
                            <span className="text-muted-foreground">
                              {part.quantity} {part.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {request.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">{request.notes}</p>
                      </div>
                    )}

                    {isManager && request.status === 'pendente' && (
                      <div className="flex gap-2 mt-4 pt-3 border-t justify-end">
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => {
                            const reason = prompt("Motivo da rejeição:");
                            if (reason) updateStatus.mutate({ id: request.id, status: 'rejeitado', reason });
                          }}
                          disabled={updateStatus.isPending}
                        >
                          Rejeitar
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateStatus.mutate({ id: request.id, status: 'aprovado' })}
                          disabled={updateStatus.isPending}
                        >
                          Aprovar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
