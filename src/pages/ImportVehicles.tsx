import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileCheck, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { useImportVehicles } from '@/hooks/useImportVehicles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ImportVehicles() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { 
    isProcessing, 
    extractedVehicles, 
    processZipFile, 
    confirmImport,
    clearVehicles,
  } = useImportVehicles();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        alert('Por favor, selecione um arquivo ZIP');
        return;
      }
      setSelectedFile(file);
      clearVehicles();
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;
    await processZipFile(selectedFile);
  };

  const handleConfirmImport = async () => {
    const success = await confirmImport();
    if (success) {
      setTimeout(() => navigate('/fleet'), 1500);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Truck className="w-8 h-8 text-primary" />
              Importação de Veículos - CRLV
            </h1>
            <p className="text-muted-foreground mt-1">
              Importe veículos em lote através de arquivos CRLV
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/fleet')}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Voltar para Frota
          </Button>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload de Arquivo ZIP
            </CardTitle>
            <CardDescription>
              Selecione um arquivo ZIP contendo os arquivos TXT dos CRLVs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  className="cursor-pointer"
                />
              </div>
              <Button
                onClick={handleProcessFile}
                disabled={!selectedFile || isProcessing || extractedVehicles.length > 0}
                className="min-w-[150px]"
              >
                {isProcessing ? (
                  <>Processando...</>
                ) : (
                  <>
                    <FileCheck className="mr-2 w-4 h-4" />
                    Processar Arquivos
                  </>
                )}
              </Button>
            </div>

            {selectedFile && (
              <Alert>
                <FileCheck className="h-4 w-4" />
                <AlertDescription>
                  Arquivo selecionado: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Preview Section */}
        {extractedVehicles.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Veículos Detectados
                  </CardTitle>
                  <CardDescription>
                    {extractedVehicles.length} veículo(s) pronto(s) para importação
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {extractedVehicles.length} veículos
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" className="bg-yellow-50 border-yellow-300">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>ATENÇÃO:</strong> Ao confirmar, todos os veículos existentes serão substituídos pelos novos dados!
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Placa</TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Ano</TableHead>
                      <TableHead>Renavam</TableHead>
                      <TableHead>Chassi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extractedVehicles.map((vehicle, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono font-bold">{vehicle.placa}</TableCell>
                        <TableCell>{vehicle.modelo || '-'}</TableCell>
                        <TableCell>{vehicle.ano || '-'}</TableCell>
                        <TableCell className="font-mono">{vehicle.renavam || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">{vehicle.chassi || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={clearVehicles}
                  disabled={isProcessing}
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={isProcessing}
                  className="min-w-[200px]"
                  size="lg"
                >
                  {isProcessing ? (
                    <>Importando...</>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 w-5 h-5" />
                      Confirmar Importação
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Prepare um arquivo ZIP contendo os arquivos TXT dos CRLVs</p>
            <p>2. Cada arquivo TXT deve conter os dados do CRLV (placa, renavam, modelo, ano, chassi)</p>
            <p>3. Clique em "Processar Arquivos" para extrair os dados</p>
            <p>4. Revise a lista de veículos detectados</p>
            <p>5. Clique em "Confirmar Importação" para substituir todos os veículos do sistema</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}