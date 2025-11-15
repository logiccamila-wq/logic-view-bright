import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Key, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportCTEDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ImportCTEDialog({ open, onOpenChange, onSuccess }: ImportCTEDialogProps) {
  const [tipo, setTipo] = useState<'periodo' | 'chave'>('periodo');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [chaveAcesso, setChaveAcesso] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    try {
      const body: any = { tipo };

      if (tipo === 'periodo') {
        if (!dataInicial || !dataFinal) {
          toast.error('Preencha as datas inicial e final');
          return;
        }
        body.dataInicial = dataInicial;
        body.dataFinal = dataFinal;
      } else {
        if (!chaveAcesso) {
          toast.error('Informe a chave de acesso do CT-e');
          return;
        }
        body.chaveAcesso = chaveAcesso.replace(/\s/g, '');
      }

      const { data, error } = await supabase.functions.invoke('import-cte-brasilnfe', {
        body
      });

      if (error) throw error;

      if (data.errors && data.errors.length > 0) {
        toast.warning(data.message, {
          description: `${data.errors.length} erro(s) encontrado(s)`
        });
      } else {
        toast.success(data.message);
      }

      onSuccess();
      onOpenChange(false);
      
      // Limpar campos
      setDataInicial('');
      setDataFinal('');
      setChaveAcesso('');
      
    } catch (error) {
      console.error('Erro ao importar CT-e:', error);
      toast.error('Erro ao importar CT-e da BrasilNFe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar CT-e da BrasilNFe</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <RadioGroup value={tipo} onValueChange={(value) => setTipo(value as 'periodo' | 'chave')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="periodo" id="periodo" />
              <Label htmlFor="periodo" className="flex items-center gap-2 cursor-pointer">
                <Calendar className="h-4 w-4" />
                Importar por período
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="chave" id="chave" />
              <Label htmlFor="chave" className="flex items-center gap-2 cursor-pointer">
                <Key className="h-4 w-4" />
                Importar por chave de acesso
              </Label>
            </div>
          </RadioGroup>

          {tipo === 'periodo' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicial">Data Inicial</Label>
                <Input
                  id="dataInicial"
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFinal">Data Final</Label>
                <Input
                  id="dataFinal"
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="chaveAcesso">Chave de Acesso</Label>
              <Input
                id="chaveAcesso"
                placeholder="Digite a chave de 44 dígitos"
                value={chaveAcesso}
                onChange={(e) => setChaveAcesso(e.target.value)}
                maxLength={44}
              />
              <p className="text-xs text-muted-foreground">
                44 dígitos sem espaços ou formatação
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleImport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                'Importar'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
