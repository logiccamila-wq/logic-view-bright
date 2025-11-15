import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: any[];
  onSuccess: () => void;
}

export function ImportDialog({ open, onOpenChange, accounts, onSuccess }: ImportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !accountId) {
      toast.error("Selecione uma conta e um arquivo");
      return;
    }

    setLoading(true);

    try {
      // Detectar formato do arquivo
      const formato = file.name.toLowerCase().endsWith('.ofx') ? 'OFX' :
                      file.name.toLowerCase().endsWith('.cnab') ? 'CNAB240' : 'CSV';

      // Ler arquivo
      const fileText = await file.text();

      // Criar registro de importação
      const { data: importRecord, error: importError } = await supabase
        .from("bank_imports")
        .insert({
          bank_account_id: accountId,
          arquivo_nome: file.name,
          formato,
          status: 'processando',
        })
        .select()
        .single();

      if (importError) throw importError;

      // Chamar Edge Function para processar
      const { data, error: functionError } = await supabase.functions.invoke('import-bank-statement', {
        body: {
          importId: importRecord.id,
          accountId,
          formato,
          fileContent: fileText,
        },
      });

      if (functionError) throw functionError;

      toast.success(`Importação concluída! ${data.transacoesImportadas} transações processadas.`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Erro ao importar arquivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Extrato Bancário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Conta Bancária</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.nome_conta} - {account.banco_nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Arquivo (OFX, CNAB ou CSV)</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".ofx,.cnab,.csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {file ? file.name : "Clique para selecionar arquivo"}
                </span>
              </label>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Formatos suportados:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• OFX (Open Financial Exchange)</li>
              <li>• CNAB 240 e 400</li>
              <li>• CSV (Comma-Separated Values)</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !file || !accountId}>
              {loading ? "Importando..." : "Importar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
