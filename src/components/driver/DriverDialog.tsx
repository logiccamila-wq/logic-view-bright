import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface DriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: Driver | null;
  onSuccess: () => void;
}

interface Driver {
  id: string;
  full_name: string;
  cpf: string;
  email: string;
  telefone: string;
  cidade: string;
  tipo_vinculo: string;
}

export const DriverDialog = ({ open, onOpenChange, driver, onSuccess }: DriverDialogProps) => {
  const [formData, setFormData] = useState<Partial<Driver>>({});

  useEffect(() => {
    if (driver) {
      setFormData(driver);
    } else {
      setFormData({});
    }
  }, [driver]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (driver) {
        // Update
        const { error } = await (supabase as any)
          .from("profiles")
          .update(formData)
          .eq("id", driver.id);
        if (error) throw error;
        toast.success("Motorista atualizado com sucesso!");
      } else {
        // Create
        const { error } = await (supabase as any).from("profiles").insert([formData]);
        if (error) throw error;
        toast.success("Motorista cadastrado com sucesso!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar motorista:", error);
      toast.error("Erro ao salvar motorista");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{driver ? "Editar Motorista" : "Novo Motorista"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input id="full_name" name="full_name" value={formData.full_name || ""} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" name="cpf" value={formData.cpf || ""} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" value={formData.telefone || ""} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" name="cidade" value={formData.cidade || ""} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_vinculo">Tipo de Vínculo</Label>
              <Input id="tipo_vinculo" name="tipo_vinculo" value={formData.tipo_vinculo || ""} onChange={handleChange} required />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
