import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: any;
  documentType?: string;
  onSuccess?: () => void;
}

export function DocumentDialog({ open, onOpenChange, document, documentType, onSuccess }: DocumentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    vehicle_plate: '',
    document_type: documentType || '',
    document_category: '',
    document_number: '',
    issue_date: '',
    expiry_date: '',
    status: 'valid',
    value: '',
    description: '',
    driver_name: '',
    driver_cpf: '',
    cnh_category: '',
    year: new Date().getFullYear(),
    paid: false,
    last_check: '',
    next_check: '',
    notes: ''
  });

  useEffect(() => {
    if (open) {
      loadVehicles();
      if (document) {
        setFormData({
          vehicle_plate: document.vehicle_plate || '',
          document_type: document.document_type || documentType || '',
          document_category: document.document_category || '',
          document_number: document.document_number || '',
          issue_date: document.issue_date ? document.issue_date.split('T')[0] : '',
          expiry_date: document.expiry_date ? document.expiry_date.split('T')[0] : '',
          status: document.status || 'valid',
          value: document.value || '',
          description: document.description || '',
          driver_name: document.driver_name || '',
          driver_cpf: document.driver_cpf || '',
          cnh_category: document.cnh_category || '',
          year: document.year || new Date().getFullYear(),
          paid: document.paid || false,
          last_check: document.last_check ? document.last_check.split('T')[0] : '',
          next_check: document.next_check ? document.next_check.split('T')[0] : '',
          notes: document.notes || ''
        });
      }
    }
  }, [open, document, documentType]);

  const loadVehicles = async () => {
    const { data } = await supabase.from('vehicles').select('plate, model').eq('status', 'ativo').order('plate');
    if (data) setVehicles(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const submitData: any = {
        vehicle_plate: formData.vehicle_plate,
        document_type: formData.document_type,
        status: formData.status,
        notes: formData.notes || null,
        created_by: user?.id
      };

      // Campos específicos por tipo
      if (formData.document_type === 'chemical') {
        submitData.document_category = formData.document_category;
        submitData.expiry_date = formData.expiry_date || null;
      }
      
      if (['civ', 'cipp'].includes(formData.document_type)) {
        submitData.document_number = formData.document_number;
        submitData.expiry_date = formData.expiry_date || null;
      }
      
      if (formData.document_type === 'tachograph') {
        submitData.last_check = formData.last_check || null;
        submitData.next_check = formData.next_check || null;
      }
      
      if (formData.document_type === 'fine') {
        submitData.description = formData.description;
        submitData.value = parseFloat(formData.value) || 0;
        submitData.issue_date = formData.issue_date || null;
        submitData.paid = formData.paid;
      }
      
      if (formData.document_type === 'cnh') {
        submitData.driver_name = formData.driver_name;
        submitData.driver_cpf = formData.driver_cpf;
        submitData.document_number = formData.document_number;
        submitData.cnh_category = formData.cnh_category;
        submitData.expiry_date = formData.expiry_date || null;
      }
      
      if (formData.document_type === 'crlv') {
        submitData.year = formData.year;
        submitData.paid = formData.paid;
      }
      
      if (document) {
        const { error } = await supabase
          .from('vehicle_documents')
          .update(submitData)
          .eq('id', document.id);
        
        if (error) throw error;
        toast.success('Documento atualizado!');
      } else {
        const { error } = await supabase
          .from('vehicle_documents')
          .insert(submitData);
        
        if (error) throw error;
        toast.success('Documento criado!');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro:', error);
      toast.error(error.message || 'Erro ao salvar documento');
    } finally {
      setLoading(false);
    }
  };

  const getFormFields = () => {
    switch (formData.document_type) {
      case 'chemical':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Documento</Label>
                <Input
                  value={formData.document_category}
                  onChange={(e) => setFormData({ ...formData, document_category: e.target.value })}
                  placeholder="Ex: FISPQ, Certificado ONU"
                />
              </div>
              <div>
                <Label>Validade</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      
      case 'civ':
      case 'cipp':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número do Documento *</Label>
                <Input
                  required
                  value={formData.document_number}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  placeholder={`Ex: ${formData.document_type.toUpperCase()}-123456`}
                />
              </div>
              <div>
                <Label>Validade *</Label>
                <Input
                  required
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      
      case 'tachograph':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Última Verificação</Label>
                <Input
                  type="date"
                  value={formData.last_check}
                  onChange={(e) => setFormData({ ...formData, last_check: e.target.value })}
                />
              </div>
              <div>
                <Label>Próxima Verificação</Label>
                <Input
                  type="date"
                  value={formData.next_check}
                  onChange={(e) => setFormData({ ...formData, next_check: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      
      case 'fine':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Descrição da Multa *</Label>
                <Input
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Excesso de Velocidade"
                />
              </div>
              <div>
                <Label>Valor (R$) *</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data da Infração</Label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="paid"
                  checked={formData.paid}
                  onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="paid">Multa Paga</Label>
              </div>
            </div>
          </>
        );
      
      case 'cnh':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Motorista *</Label>
                <Input
                  required
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                />
              </div>
              <div>
                <Label>CPF *</Label>
                <Input
                  required
                  value={formData.driver_cpf}
                  onChange={(e) => setFormData({ ...formData, driver_cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Número CNH *</Label>
                <Input
                  required
                  value={formData.document_number}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                />
              </div>
              <div>
                <Label>Categoria *</Label>
                <Select value={formData.cnh_category} onValueChange={(value) => setFormData({ ...formData, cnh_category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Validade *</Label>
                <Input
                  required
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      
      case 'crlv':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ano *</Label>
                <Input
                  required
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="crlv-paid"
                  checked={formData.paid}
                  onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="crlv-paid">CRLV Pago</Label>
              </div>
            </div>
          </>
        );
      
      case 'fire_extinguisher':
        return (
          <>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Extintor Cabine - Validade</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Observações (Extintores 1 e 2)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: EXT 01: 30/05/2025, EXT 02: NA"
                  rows={3}
                />
              </div>
            </div>
          </>
        );
      
      case 'ibama_ctf':
      case 'ibama_aatipp':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Validade *</Label>
                <Input
                  required
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Número/Certificado</Label>
                <Input
                  value={formData.document_number}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  placeholder="Número do certificado IBAMA"
                />
              </div>
            </div>
          </>
        );
      
      case 'antt':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número ANTT *</Label>
                <Input
                  required
                  value={formData.document_number}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  placeholder="Ex: 054309677"
                />
              </div>
              <div>
                <Label>Data de Validade</Label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      
      case 'opacity_test':
      case 'noise_test':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data do Teste</Label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Validade *</Label>
                <Input
                  required
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document ? 'Editar' : 'Novo'} Documento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Placa do Veículo *</Label>
              <Select 
                required
                value={formData.vehicle_plate} 
                onValueChange={(value) => setFormData({ ...formData, vehicle_plate: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a placa" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.plate} value={vehicle.plate}>
                      {vehicle.plate} - {vehicle.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de Documento *</Label>
              <Select 
                required
                value={formData.document_type} 
                onValueChange={(value) => setFormData({ ...formData, document_type: value })}
                disabled={!!documentType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chemical">Químicos</SelectItem>
                  <SelectItem value="civ">CIV</SelectItem>
                  <SelectItem value="cipp">CIPP</SelectItem>
                  <SelectItem value="tachograph">Tacógrafo</SelectItem>
                  <SelectItem value="fire_extinguisher">Extintor</SelectItem>
                  <SelectItem value="ibama_ctf">IBAMA CTF</SelectItem>
                  <SelectItem value="ibama_aatipp">IBAMA AATIPP</SelectItem>
                  <SelectItem value="antt">ANTT</SelectItem>
                  <SelectItem value="opacity_test">Teste Opacidade</SelectItem>
                  <SelectItem value="noise_test">Teste Ruído</SelectItem>
                  <SelectItem value="fine">Multa</SelectItem>
                  <SelectItem value="cnh">CNH</SelectItem>
                  <SelectItem value="crlv">CRLV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {getFormFields()}

          <div>
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="valid">Válido</SelectItem>
                <SelectItem value="expiring">Vencendo</SelectItem>
                <SelectItem value="expired">Vencido</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {document ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}