import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Image as ImageIcon, 
  File, 
  Download, 
  ExternalLink, 
  Trash2, 
  Calendar,
  User,
  Truck,
  X
} from "lucide-react";
import { toast } from "sonner";

interface DocumentMetadata {
  id?: string;
  vehicle_plate?: string;
  document_type: string;
  document_number?: string;
  issue_date?: string;
  expiry_date?: string;
  status?: 'valid' | 'expiring' | 'expired' | 'pending';
  file_name: string;
  file_url: string;
  file_size?: number;
  uploaded_at?: string;
  uploaded_by?: string;
  driver_name?: string;
  notes?: string;
}

interface DocumentPreviewProps {
  document: DocumentMetadata;
  onDelete?: (documentId: string) => void;
  onDownload?: (url: string, filename: string) => void;
  showMetadata?: boolean;
  showActions?: boolean;
}

export function DocumentPreview({
  document,
  onDelete,
  onDownload,
  showMetadata = true,
  showActions = true
}: DocumentPreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fileType = getFileType(document.file_url || document.file_name);
  const isPDF = fileType === 'pdf';
  const isImage = fileType === 'image';
  const isDocument = fileType === 'document';

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document.file_url, document.file_name);
    } else {
      // Default download behavior
      const anchor = window.document.createElement('a');
      anchor.href = document.file_url;
      anchor.download = document.file_name;
      anchor.target = '_blank';
      window.document.body.appendChild(anchor);
      anchor.click();
      window.document.body.removeChild(anchor);
      toast.success('Download iniciado');
    }
  };

  const handleDelete = () => {
    if (document.id && onDelete) {
      if (confirm(`Tem certeza que deseja excluir ${document.file_name}?`)) {
        onDelete(document.id);
      }
    }
  };

  const handleOpenExternal = () => {
    window.open(document.file_url, '_blank');
  };

  const getStatusBadge = (status?: string) => {
    const config = {
      valid: { variant: 'default' as const, label: 'Válido', className: 'bg-green-100 text-green-800' },
      expiring: { variant: 'secondary' as const, label: 'Vencendo', className: 'bg-yellow-100 text-yellow-800' },
      expired: { variant: 'destructive' as const, label: 'Vencido', className: 'bg-red-100 text-red-800' },
      pending: { variant: 'outline' as const, label: 'Pendente', className: 'bg-gray-100 text-gray-800' }
    };

    const cfg = config[status as keyof typeof config] || config.pending;
    return <Badge variant={cfg.variant} className={cfg.className}>{cfg.label}</Badge>;
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      crlv: 'CRLV',
      ipva: 'IPVA',
      seguro: 'Seguro',
      licenca: 'Licença',
      inspecao: 'Inspeção',
      manutencao: 'Manutenção',
      cnh: 'CNH',
      tacografo: 'Tacógrafo',
      antt: 'ANTT',
      outros: 'Outros'
    };
    return types[type] || type;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Tamanho desconhecido';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-1">
                {getFileTypeIcon(fileType, 'h-8 w-8')}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{document.file_name}</CardTitle>
                <CardDescription className="mt-1">
                  {getDocumentTypeLabel(document.document_type)}
                  {document.document_number && ` • ${document.document_number}`}
                </CardDescription>
              </div>
            </div>
            {document.status && (
              <div className="flex-shrink-0 ml-2">
                {getStatusBadge(document.status)}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Preview */}
          <div 
            className="relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors"
            onClick={() => setPreviewOpen(true)}
          >
            {isImage ? (
              <img
                src={document.file_url}
                alt={document.file_name}
                className={`w-full h-full object-contain ${!imageLoaded ? 'hidden' : ''}`}
                onLoad={() => setImageLoaded(true)}
              />
            ) : isPDF ? (
              <div className="flex flex-col items-center justify-center h-full">
                <FileText className="h-16 w-16 text-red-500 mb-2" />
                <p className="text-sm font-medium">PDF Document</p>
                <p className="text-xs text-muted-foreground">Clique para visualizar</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <File className="h-16 w-16 text-gray-500 mb-2" />
                <p className="text-sm font-medium">Document</p>
                <p className="text-xs text-muted-foreground">Clique para baixar</p>
              </div>
            )}
            {!imageLoaded && isImage && (
              <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Metadata */}
          {showMetadata && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {document.vehicle_plate && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Truck className="h-3 w-3" />
                  <span>{document.vehicle_plate}</span>
                </div>
              )}
              {document.driver_name && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="truncate">{document.driver_name}</span>
                </div>
              )}
              {document.expiry_date && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Venc: {new Date(document.expiry_date).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              {document.uploaded_at && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Upload: {new Date(document.uploaded_at).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>
          )}

          {/* File Info */}
          <div className="text-xs text-muted-foreground">
            {formatFileSize(document.file_size)}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Baixar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              {onDelete && document.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="truncate pr-4">{document.file_name}</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-full max-h-[70vh]">
            <div className="space-y-4">
              {/* Full Document Preview */}
              {isImage && (
                <img
                  src={document.file_url}
                  alt={document.file_name}
                  className="w-full h-auto rounded-lg"
                />
              )}
              
              {isPDF && (
                <div className="aspect-[3/4] w-full">
                  <iframe
                    src={document.file_url}
                    className="w-full h-full rounded-lg border"
                    title={document.file_name}
                  />
                </div>
              )}

              {isDocument && (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                  <File className="h-24 w-24 text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">Preview não disponível</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Este tipo de arquivo não pode ser visualizado no navegador
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Arquivo
                  </Button>
                </div>
              )}

              {/* Detailed Metadata */}
              {showMetadata && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações do Documento</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    {document.vehicle_plate && (
                      <div>
                        <p className="text-muted-foreground">Veículo</p>
                        <p className="font-medium">{document.vehicle_plate}</p>
                      </div>
                    )}
                    {document.document_type && (
                      <div>
                        <p className="text-muted-foreground">Tipo</p>
                        <p className="font-medium">{getDocumentTypeLabel(document.document_type)}</p>
                      </div>
                    )}
                    {document.document_number && (
                      <div>
                        <p className="text-muted-foreground">Número</p>
                        <p className="font-medium">{document.document_number}</p>
                      </div>
                    )}
                    {document.issue_date && (
                      <div>
                        <p className="text-muted-foreground">Data de Emissão</p>
                        <p className="font-medium">{new Date(document.issue_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                    {document.expiry_date && (
                      <div>
                        <p className="text-muted-foreground">Data de Vencimento</p>
                        <p className="font-medium">{new Date(document.expiry_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                    {document.status && (
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <div className="mt-1">{getStatusBadge(document.status)}</div>
                      </div>
                    )}
                    {document.driver_name && (
                      <div>
                        <p className="text-muted-foreground">Motorista</p>
                        <p className="font-medium">{document.driver_name}</p>
                      </div>
                    )}
                    {document.uploaded_at && (
                      <div>
                        <p className="text-muted-foreground">Upload em</p>
                        <p className="font-medium">
                          {new Date(document.uploaded_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    )}
                    {document.uploaded_by && (
                      <div>
                        <p className="text-muted-foreground">Enviado por</p>
                        <p className="font-medium">{document.uploaded_by}</p>
                      </div>
                    )}
                    {document.notes && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Observações</p>
                        <p className="font-medium mt-1">{document.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper functions
function getFileType(filename: string): 'image' | 'pdf' | 'document' {
  const ext = filename.toLowerCase().split('.').pop() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
    return 'image';
  }
  
  if (ext === 'pdf') {
    return 'pdf';
  }
  
  return 'document';
}

function getFileTypeIcon(type: string, className: string = 'h-6 w-6') {
  switch (type) {
    case 'image':
      return <ImageIcon className={`${className} text-blue-500`} />;
    case 'pdf':
      return <FileText className={`${className} text-red-500`} />;
    default:
      return <File className={`${className} text-gray-500`} />;
  }
}
