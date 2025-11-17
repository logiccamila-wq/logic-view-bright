import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import EmitirMDFEDialog from "./EmitirMDFEDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MDFE {
  id: string;
  numero_mdfe: string;
  serie: string;
  chave_acesso: string | null;
  status: string;
  data_emissao: string;
  uf_inicio: string;
  uf_fim: string;
  veiculo_tracao_placa: string;
  quantidade_ctes: number;
  peso_total_kg: number;
  valor_total_carga: number;
}

export default function MDFEManagement() {
  const { toast } = useToast();
  const [mdfes, setMdfes] = useState<MDFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [emitirDialogOpen, setEmitirDialogOpen] = useState(false);

  useEffect(() => {
    loadMdfes();
  }, []);

  const loadMdfes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mdfe')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar MDF-es:', error);
      toast({
        title: "Erro ao carregar MDF-es",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMdfes(data || []);
    }
    setLoading(false);
  };

  const handleEncerrar = async (mdfe: MDFE) => {
    if (!confirm(`Confirma o encerramento do MDF-e ${mdfe.numero_mdfe}?`)) return;

    const municipio = prompt('Município de encerramento:');
    if (!municipio) return;

    try {
      const { data, error } = await supabase.functions.invoke('encerrar-mdfe', {
        body: {
          mdfe_id: mdfe.id,
          chave_acesso: mdfe.chave_acesso,
          uf_encerramento: mdfe.uf_fim,
          municipio_encerramento: municipio,
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "MDF-e encerrado com sucesso!",
        });
        loadMdfes();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao encerrar MDF-e",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      autorizado: "default",
      processando: "secondary",
      encerrado: "outline",
      cancelado: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">MDF-e - Manifesto Eletrônico</h2>
        <Button onClick={() => setEmitirDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Emitir MDF-e
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>MDF-es Emitidos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : mdfes.length === 0 ? (
            <p className="text-muted-foreground">Nenhum MDF-e emitido</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Percurso</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>CT-es</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mdfes.map((mdfe) => (
                  <TableRow key={mdfe.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{mdfe.numero_mdfe}/{mdfe.serie}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(mdfe.data_emissao).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(mdfe.status)}</TableCell>
                    <TableCell>
                      {mdfe.uf_inicio} → {mdfe.uf_fim}
                    </TableCell>
                    <TableCell>{mdfe.veiculo_tracao_placa}</TableCell>
                    <TableCell className="text-center">{mdfe.quantidade_ctes}</TableCell>
                    <TableCell>{mdfe.peso_total_kg.toFixed(0)} kg</TableCell>
                    <TableCell>R$ {mdfe.valor_total_carga.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {mdfe.status === 'autorizado' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEncerrar(mdfe)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Encerrar
                          </Button>
                        )}
                        {mdfe.chave_acesso && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(mdfe.chave_acesso!);
                              toast({ title: "Chave copiada!" });
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EmitirMDFEDialog
        open={emitirDialogOpen}
        onOpenChange={setEmitirDialogOpen}
        onSuccess={loadMdfes}
      />
    </div>
  );
}
