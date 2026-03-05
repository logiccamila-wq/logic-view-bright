import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Driver } from "@/hooks/useDrivers";

interface DriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: Driver | null;
  employeeId: string;
  onSave: (driver: any) => void;
  isSaving?: boolean;
}

export function DriverDialog({
  open,
  onOpenChange,
  driver,
  employeeId,
  onSave,
  isSaving,
}: DriverDialogProps) {
  const [formData, setFormData] = useState<Partial<Driver>>({
    employee_id: employeeId,
    categoria_cnh: "",
    validade_cnh: "",
    treinamento_mopp: false,
    aptidao_medica: false,
    status_operacional: "ATIVO",
  });

  useEffect(() => {
    if (driver) {
      setFormData(driver);
    } else {
      setFormData({
        employee_id: employeeId,
        categoria_cnh: "",
        validade_cnh: "",
        treinamento_mopp: false,
        aptidao_medica: false,
        status_operacional: "ATIVO",
      });
    }
  }, [driver, employeeId, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {driver ? "Editar Dados do Motorista" : "Cadastrar como Motorista"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="categoria_cnh">Categoria CNH *</Label>
            <Select
              value={formData.categoria_cnh}
              onValueChange={(value) =>
                setFormData({ ...formData, categoria_cnh: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="E">E</SelectItem>
                <SelectItem value="AB">AB</SelectItem>
                <SelectItem value="AC">AC</SelectItem>
                <SelectItem value="AD">AD</SelectItem>
                <SelectItem value="AE">AE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="validade_cnh">Validade CNH *</Label>
            <Input
              id="validade_cnh"
              type="date"
              value={formData.validade_cnh}
              onChange={(e) =>
                setFormData({ ...formData, validade_cnh: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="status_operacional">Status Operacional</Label>
            <Select
              value={formData.status_operacional}
              onValueChange={(value: any) =>
                setFormData({ ...formData, status_operacional: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="FERIAS">Férias</SelectItem>
                <SelectItem value="AFASTADO">Afastado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="treinamento_mopp">Treinamento MOPP</Label>
            <Switch
              id="treinamento_mopp"
              checked={formData.treinamento_mopp}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, treinamento_mopp: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="aptidao_medica">Aptidão Médica</Label>
            <Switch
              id="aptidao_medica"
              checked={formData.aptidao_medica}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, aptidao_medica: checked })
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
