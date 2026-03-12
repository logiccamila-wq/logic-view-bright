import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Route, MapPin, Truck, Calendar } from "lucide-react";
import { runtimeClient } from "@/integrations/azure/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RouteOptimizer } from "@/components/tms/RouteOptimizer";

interface RouteEntry {
  id: string;
  descricao: string;
  origem: string;
  destino: string;
  distancia_km: number;
  tempo_estimado_h: number;
  status: "ativa" | "inativa" | "em_revisao";
  motorista?: string;
  veiculo?: string;
  data_prevista?: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  ativa: "Ativa",
  inativa: "Inativa",
  em_revisao: "Em Revisão",
};

const STATUS_COLORS: Record<string, string> = {
  ativa: "bg-green-100 text-green-800",
  inativa: "bg-gray-100 text-gray-800",
  em_revisao: "bg-yellow-100 text-yellow-800",
};

const EMPTY_FORM: Omit<RouteEntry, "id" | "created_at"> = {
  descricao: "",
  origem: "",
  destino: "",
  distancia_km: 0,
  tempo_estimado_h: 0,
  status: "ativa",
  motorista: "",
  veiculo: "",
  data_prevista: "",
};

const Routing = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteEntry | null>(null);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<RouteEntry, "id" | "created_at">>(EMPTY_FORM);

  const { data: routes = [], isLoading } = useQuery<RouteEntry[]>({
    queryKey: ["routes", searchTerm],
    queryFn: async () => {
      let query = (runtimeClient as any)
        .from("routes")
        .select("*")
        .order("created_at", { ascending: false });
      if (searchTerm) {
        query = query.or(`descricao.ilike.%${searchTerm}%,origem.ilike.%${searchTerm}%,destino.ilike.%${searchTerm}%`);
      }
      const { data, error } = await query;
      if (error) {
        if (error.code === "PGRST205" || String(error.message).includes("routes")) {
          return [];
        }
        throw error;
      }
      return data || [];
    },
  });

  const createRoute = useMutation({
    mutationFn: async (values: Omit<RouteEntry, "id" | "created_at">) => {
      const { error } = await (runtimeClient as any).from("routes").insert([values]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("Rota criada com sucesso!");
      setDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Erro ao criar rota"),
  });

  const updateRoute = useMutation({
    mutationFn: async ({ id, ...values }: Partial<RouteEntry> & { id: string }) => {
      const { error } = await (runtimeClient as any).from("routes").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("Rota atualizada com sucesso!");
      setDialogOpen(false);
      setSelectedRoute(null);
    },
    onError: (error: any) => toast.error(error.message || "Erro ao atualizar rota"),
  });

  const deleteRoute = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (runtimeClient as any).from("routes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("Rota removida com sucesso!");
    },
    onError: (error: any) => toast.error(error.message || "Erro ao remover rota"),
  });

  const handleOpenCreate = () => {
    setSelectedRoute(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  };

  const handleOpenEdit = (route: RouteEntry) => {
    setSelectedRoute(route);
    setFormData({
      descricao: route.descricao,
      origem: route.origem,
      destino: route.destino,
      distancia_km: route.distancia_km,
      tempo_estimado_h: route.tempo_estimado_h,
      status: route.status,
      motorista: route.motorista || "",
      veiculo: route.veiculo || "",
      data_prevista: route.data_prevista || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoute) {
      updateRoute.mutate({ id: selectedRoute.id, ...formData });
    } else {
      createRoute.mutate(formData);
    }
  };

  const handleDeleteRoute = (id: string) => {
    setRouteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (routeToDelete) {
      deleteRoute.mutate(routeToDelete);
    }
    setDeleteDialogOpen(false);
    setRouteToDelete(null);
  };

  const activeRoutes = routes.filter((r) => r.status === "ativa").length;
  const isSaving = createRoute.isPending || updateRoute.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roteirização</h1>
          <p className="text-muted-foreground">Gerencie rotas, planejamento e otimização de percursos</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Rota
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Route className="w-4 h-4" /> Total de Rotas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{routes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Rotas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeRoutes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Truck className="w-4 h-4" /> Distância Total (km)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {routes.reduce((sum, r) => sum + (Number(r.distancia_km) || 0), 0).toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por descrição, origem ou destino..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Routes Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead className="text-right">Distância (km)</TableHead>
                <TableHead className="text-right">Tempo (h)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Carregando...</TableCell>
                </TableRow>
              ) : routes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma rota cadastrada. Clique em "Nova Rota" para começar.
                  </TableCell>
                </TableRow>
              ) : (
                routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell className="font-medium">{route.descricao}</TableCell>
                    <TableCell>{route.origem}</TableCell>
                    <TableCell>{route.destino}</TableCell>
                    <TableCell className="text-right">{Number(route.distancia_km).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-right">{Number(route.tempo_estimado_h).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[route.status] || "bg-gray-100 text-gray-800"}>
                        {STATUS_LABELS[route.status] || route.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(route)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteRoute(route.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Route Optimizer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Otimizador de Rotas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RouteOptimizer />
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>{selectedRoute ? "Editar Rota" : "Nova Rota"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData((f) => ({ ...f, descricao: e.target.value }))}
                placeholder="Ex: Rota SP → RJ"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origem">Origem</Label>
                <Input
                  id="origem"
                  value={formData.origem}
                  onChange={(e) => setFormData((f) => ({ ...f, origem: e.target.value }))}
                  placeholder="Cidade de origem"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destino">Destino</Label>
                <Input
                  id="destino"
                  value={formData.destino}
                  onChange={(e) => setFormData((f) => ({ ...f, destino: e.target.value }))}
                  placeholder="Cidade de destino"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distancia_km">Distância (km)</Label>
                <Input
                  id="distancia_km"
                  type="number"
                  min={0}
                  value={formData.distancia_km}
                  onChange={(e) => setFormData((f) => ({ ...f, distancia_km: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempo_estimado_h">Tempo estimado (h)</Label>
                <Input
                  id="tempo_estimado_h"
                  type="number"
                  min={0}
                  step={0.5}
                  value={formData.tempo_estimado_h}
                  onChange={(e) => setFormData((f) => ({ ...f, tempo_estimado_h: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motorista">Motorista</Label>
                <Input
                  id="motorista"
                  value={formData.motorista}
                  onChange={(e) => setFormData((f) => ({ ...f, motorista: e.target.value }))}
                  placeholder="Nome do motorista"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="veiculo">Veículo</Label>
                <Input
                  id="veiculo"
                  value={formData.veiculo}
                  onChange={(e) => setFormData((f) => ({ ...f, veiculo: e.target.value }))}
                  placeholder="Placa ou identificação"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_prevista">Data Prevista</Label>
                <Input
                  id="data_prevista"
                  type="date"
                  value={formData.data_prevista}
                  onChange={(e) => setFormData((f) => ({ ...f, data_prevista: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData((f) => ({ ...f, status: v as RouteEntry["status"] }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
                    <SelectItem value="em_revisao">Em Revisão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Salvando..." : selectedRoute ? "Atualizar" : "Criar Rota"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Rota</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta rota? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Routing;


