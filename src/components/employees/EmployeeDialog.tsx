import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee } from "@/hooks/useEmployees";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (employee: any) => void;
  isSaving?: boolean;
}

export function EmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSave,
  isSaving,
}: EmployeeDialogProps) {
  const [formData, setFormData] = useState<Partial<Employee>>({
    nome: "",
    cpf: "",
    rg: "",
    cargo: "",
    tipo_vinculo: "CLT",
    data_admissao: "",
    salario: 0,
    telefone: "",
    email: "",
    cidade: "",
    endereco: "",
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        nome: "",
        cpf: "",
        rg: "",
        cargo: "",
        tipo_vinculo: "CLT",
        data_admissao: "",
        salario: 0,
        telefone: "",
        email: "",
        cidade: "",
        endereco: "",
      });
    }
  }, [employee, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg || ""}
                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cargo">Cargo *</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo_vinculo">Tipo de Vínculo *</Label>
              <Select
                value={formData.tipo_vinculo}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, tipo_vinculo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLT">CLT</SelectItem>
                  <SelectItem value="SOCIO">Sócio</SelectItem>
                  <SelectItem value="CONSULTOR">Consultor</SelectItem>
                  <SelectItem value="PRESTADOR">Prestador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_admissao">Data de Admissão *</Label>
              <Input
                id="data_admissao"
                type="date"
                value={formData.data_admissao}
                onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="salario">Salário</Label>
              <Input
                id="salario"
                type="number"
                step="0.01"
                value={formData.salario || ""}
                onChange={(e) =>
                  setFormData({ ...formData, salario: parseFloat(e.target.value) })
                }
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone || ""}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade || ""}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco || ""}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
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
