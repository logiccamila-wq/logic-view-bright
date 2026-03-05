import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Request {
  id: string;
  item_id: string;
  quantity: number;
  status: string;
  reason: string;
  created_at: string;
  requester_id: string;
  warehouse_type: string;
  workshop_inventory: {
    part_name: string;
    part_code: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface InventoryRequestsTableProps {
  requests: Request[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  userRole: string;
}

export function InventoryRequestsTable({ requests, onApprove, onReject, userRole }: InventoryRequestsTableProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleRejectClick = (id: string) => {
    setSelectedRequestId(id);
    setRejectionReason("");
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (selectedRequestId && rejectionReason.trim()) {
      onReject(selectedRequestId, rejectionReason);
      setRejectDialogOpen(false);
      setSelectedRequestId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'fulfilled':
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary" className="flex gap-1 items-center"><Clock className="w-3 h-3" /> Pendente</Badge>;
    }
  };

  const canManage = ['admin', 'logistics_manager', 'maintenance_manager'].includes(userRole);

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nenhuma solicitação encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="text-sm">
                  {format(new Date(req.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{req.profiles?.full_name || 'Usuário'}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{req.workshop_inventory?.part_name || 'Item removido'}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.workshop_inventory?.part_code}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{req.warehouse_type === 'workshop' ? 'Oficina' : 'Empresa'}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {req.quantity}
                </TableCell>
                <TableCell className="text-sm max-w-[200px] truncate" title={req.reason}>
                  {req.reason}
                </TableCell>
                <TableCell>{getStatusBadge(req.status)}</TableCell>
                <TableCell className="text-right">
                  {req.status === 'pending' && canManage && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                        onClick={() => onApprove(req.id)}
                        title="Aprovar"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRejectClick(req.id)}
                        title="Rejeitar"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Solicitação</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Motivo da Rejeição</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason.trim()}>
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
