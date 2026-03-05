import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

interface DocumentPreview {
  plate: string;
  document_type: string;
  expiry_date: string | null;
  status: string;
  warnings: string[];
}

interface PreviewResult {
  documents: DocumentPreview[];
  warnings: string[];
  totalDocuments: number;
}

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: PreviewResult | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  preview,
  onConfirm,
  isLoading,
}: DocumentPreviewDialogProps) {
  if (!preview) return null;

  const getStatusBadge = (status: string) => {
    const variants = {
      valid: { variant: "default" as const, icon: CheckCircle, label: "Válido", className: "bg-success/10 text-success hover:bg-success/20" },
      expiring: { variant: "secondary" as const, icon: Clock, label: "Vencendo", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      expired: { variant: "destructive" as const, icon: XCircle, label: "Vencido", className: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
      pending: { variant: "outline" as const, icon: AlertTriangle, label: "Pendente", className: "bg-muted/50" },
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const statusCounts = {
    valid: preview.documents.filter(d => d.status === 'valid').length,
    expiring: preview.documents.filter(d => d.status === 'expiring').length,
    expired: preview.documents.filter(d => d.status === 'expired').length,
    pending: preview.documents.filter(d => d.status === 'pending').length,
  };

  const uniquePlates = [...new Set(preview.documents.map(d => d.plate))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview da Importação</DialogTitle>
          <DialogDescription>
            Revise os dados antes de confirmar a importação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground">Veículos</div>
              <div className="text-2xl font-bold">{uniquePlates.length}</div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground">Documentos</div>
              <div className="text-2xl font-bold">{preview.totalDocuments}</div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground">Válidos</div>
              <div className="text-2xl font-bold text-success">{statusCounts.valid}</div>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="text-sm text-muted-foreground">Vencidos</div>
              <div className="text-2xl font-bold text-destructive">{statusCounts.expired}</div>
            </div>
          </div>

          {/* Warnings */}
          {preview.warnings.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Avisos encontrados:</div>
                <ScrollArea className="h-24">
                  <ul className="text-sm space-y-1">
                    {preview.warnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}

          {/* Documents Table */}
          <div className="flex-1 overflow-hidden border rounded-lg">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.documents.map((doc, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono">{doc.plate}</TableCell>
                      <TableCell>{doc.document_type}</TableCell>
                      <TableCell>
                        {doc.expiry_date 
                          ? new Date(doc.expiry_date).toLocaleDateString('pt-BR')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Importando...' : 'Confirmar Importação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
