import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VehicleSelect } from "@/components/VehicleSelect";
import { Upload, FileText, Image, File, X, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DocumentFile {
  file: File;
  preview?: string;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface DocumentImporterProps {
  vehiclePlate?: string;
  documentType?: string;
  onSuccess?: (uploadedFiles: string[]) => void;
  onCancel?: () => void;
  multiple?: boolean;
  acceptedTypes?: string[];
}

export function DocumentImporter({
  vehiclePlate: initialPlate,
  documentType: initialType,
  onSuccess,
  onCancel,
  multiple = true,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx']
}: DocumentImporterProps) {
  const [vehiclePlate, setVehiclePlate] = useState(initialPlate || '');
  const [documentType, setDocumentType] = useState(initialType || '');
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: 'crlv', label: 'CRLV - Certificado de Registro' },
    { value: 'ipva', label: 'IPVA - Comprovante de Pagamento' },
    { value: 'seguro', label: 'Seguro do Veículo' },
    { value: 'licenca', label: 'Licença/Alvará' },
    { value: 'inspecao', label: 'Inspeção Veicular' },
    { value: 'manutencao', label: 'Ordem de Serviço/Manutenção' },
    { value: 'cnh', label: 'CNH - Carteira de Habilitação' },
    { value: 'tacografo', label: 'Disco Tacógrafo' },
    { value: 'antt', label: 'ANTT - Registro' },
    { value: 'outros', label: 'Outros Documentos' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (!multiple && selectedFiles.length > 1) {
      toast.error('Selecione apenas um arquivo');
      return;
    }

    const newFiles: DocumentFile[] = selectedFiles.map(file => {
      const fileType = file.type.startsWith('image/') ? 'image' : 
                      file.type === 'application/pdf' ? 'pdf' : 'document';
      
      const preview = fileType === 'image' ? URL.createObjectURL(file) : undefined;
      
      return {
        file,
        preview,
        type: fileType,
        status: 'pending'
      };
    });

    setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (!vehiclePlate) {
      toast.error('Selecione um veículo');
      return;
    }

    if (!documentType) {
      toast.error('Selecione o tipo de documento');
      return;
    }

    if (files.length === 0) {
      toast.error('Selecione pelo menos um arquivo');
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        
        // Update status to uploading
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'uploading' };
          return newFiles;
        });

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedPlate = vehiclePlate.replace(/[^a-zA-Z0-9]/g, '_');
        const fileExt = fileItem.file.name.split('.').pop();
        const fileName = `${sanitizedPlate}/${documentType}/${timestamp}_${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('vehicle-documents')
          .upload(fileName, fileItem.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('vehicle-documents')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);

        // Update status to success
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'success' };
          return newFiles;
        });

        // Create document record in database (cast as any to avoid type issues with dynamic document_type)
        await supabase.from('vehicle_documents').insert({
          vehicle_plate: vehiclePlate,
          document_type: documentType,
          file_url: publicUrl,
          notes: `Arquivo: ${fileItem.file.name}`,
          status: 'pending'
        } as any);
      }

      toast.success(`${files.length} arquivo(s) enviado(s) com sucesso!`);
      
      if (onSuccess) {
        onSuccess(uploadedUrls);
      }

      // Reset form
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Erro ao fazer upload dos arquivos');
      
      // Mark files as error
      setFiles(prev => prev.map(f => ({ ...f, status: 'error', error: error.message })));
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />;
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'uploading':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Importar Documentos
        </CardTitle>
        <CardDescription>
          Faça upload de documentos do veículo para o Supabase Storage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vehicle Selection */}
        <div className="space-y-2">
          <Label htmlFor="vehicle">Veículo *</Label>
          <VehicleSelect
            value={vehiclePlate}
            onChange={setVehiclePlate}
            placeholder="Selecione o veículo"
          />
        </div>

        {/* Document Type */}
        <div className="space-y-2">
          <Label htmlFor="docType">Tipo de Documento *</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="files">Arquivos *</Label>
          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              id="files"
              type="file"
              multiple={multiple}
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Selecionar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Formatos aceitos: PDF, Imagens (JPG, PNG), Word, Excel
          </p>
        </div>

        {/* Files Preview */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Arquivos Selecionados ({files.length})</Label>
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {files.map((fileItem, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {fileItem.preview ? (
                      <img
                        src={fileItem.preview}
                        alt={fileItem.file.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      getFileIcon(fileItem.type)
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileItem.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(fileItem.file.size / 1024).toFixed(1)} KB
                    </p>
                    {fileItem.error && (
                      <p className="text-xs text-red-500 mt-1">{fileItem.error}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(fileItem.status)}
                  </div>

                  {/* Remove Button */}
                  {!uploading && fileItem.status !== 'success' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Alert */}
        {vehiclePlate && documentType && (
          <Alert>
            <AlertDescription>
              Os arquivos serão salvos em: <strong>vehicle-documents/{vehiclePlate}/{documentType}/</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={uploadFiles}
            disabled={uploading || files.length === 0 || !vehiclePlate || !documentType}
            className="flex-1"
          >
            {uploading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar {files.length > 0 && `(${files.length})`}
              </>
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={uploading}
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
