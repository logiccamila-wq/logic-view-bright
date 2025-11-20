import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { VehicleSelect } from '@/components/VehicleSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload } from 'lucide-react';

interface CTEDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId?: string;
  onSuccess?: () => void;
}

export function CTEDialog({ open, onOpenChange, tripId, onSuccess }: CTEDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    numero_cte: '',
    serie: '1',
    tipo_cte: 'normal',
    tipo_servico: 'normal',
    trip_id: tripId || '',
    
    // Remetente
    remetente_nome: '',
    remetente_cnpj: '',
    remetente_endereco: '',
    remetente_cidade: '',
    remetente_uf: '',
    remetente_cep: '',
    
    // Destinatário
    destinatario_nome: '',
    destinatario_cnpj: '',
    destinatario_endereco: '',
    destinatario_cidade: '',
    destinatario_uf: '',
    destinatario_cep: '',
    
    // Tomador
    tomador_tipo: 'remetente' as const,
    tomador_nome: '',
    tomador_cnpj: '',
    
    // Carga
    produto_predominante: '',
    peso_bruto: '',
    peso_cubado: '',
    quantidade_volumes: '',
    valor_mercadoria: '',
    
    // Frete
    modal: 'rodoviario',
    valor_frete: '',
    valor_pedagio: '',
    valor_total: '',
    tipo_frete: 'cif',
    
    // Transporte
    placa_veiculo: '',
    placa_carreta: '',
    uf_veiculo: '',
    rntrc: '',
    
    observacoes: ''
  });

  useEffect(() => {
    if (open) {
      loadApprovedTrips();
      // Gerar número CTe automaticamente
      generateCTENumber();
    }
  }, [open]);

  useEffect(() => {
    // Auto-preencher placa do veículo da viagem selecionada
    if (formData.trip_id) {
      const selectedTrip = trips.find(t => t.id === formData.trip_id);
      if (selectedTrip) {
        setFormData(prev => ({
          ...prev,
          placa_veiculo: selectedTrip.vehicle_plate || ''
        }));
      }
    }
  }, [formData.trip_id, trips]);

  useEffect(() => {
    // Calcular valor total
    const frete = parseFloat(formData.valor_frete) || 0;
    const pedagio = parseFloat(formData.valor_pedagio) || 0;
    const total = frete + pedagio;
    
    if (total > 0 && formData.valor_total !== total.toFixed(2)) {
      setFormData(prev => ({
        ...prev,
        valor_total: total.toFixed(2)
      }));
    }
  }, [formData.valor_frete, formData.valor_pedagio]);

  const generateCTENumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const cteNumber = `${timestamp}${random}`.slice(-9);
    setFormData(prev => ({ ...prev, numero_cte: cteNumber }));
  };

  const loadApprovedTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .in('status', ['aprovada', 'em_andamento'])
      .order('created_at', { ascending: false });
    
    if (data) {
      setTrips(data);
    }
  };

  const handleImportXML = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error('Selecione um arquivo');
      return;
    }

    const file = fileInputRef.current.files[0];
    const fileName = file.name.toLowerCase();
    
    if (!fileName.endsWith('.xml') && !fileName.endsWith('.zip')) {
      toast.error('Por favor, selecione um arquivo XML ou ZIP');
      return;
    }

    setImporting(true);

    try {
      if (fileName.endsWith('.zip')) {
        // Importação em lote de ZIP
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        
        const xmlFiles: string[] = [];
        
        // Extrair todos os XMLs do ZIP
        for (const [filename, fileData] of Object.entries(zipContent.files)) {
          if (!fileData.dir && filename.toLowerCase().endsWith('.xml')) {
            const content = await fileData.async('text');
            xmlFiles.push(content);
          }
        }

        if (xmlFiles.length === 0) {
          toast.error('Nenhum arquivo XML encontrado no ZIP');
          return;
        }

        toast.info(`Processando ${xmlFiles.length} CT-es...`);

        const { data, error } = await supabase.functions.invoke('import-cte-batch', {
          body: { xml_files: xmlFiles }
        });

        if (error) throw error;

        const results = data as {
          success: string[];
          errors: Array<{ numero_cte: string; error: string }>;
          clients_created: number;
          vehicles_created: number;
          ctes_created: number;
        };

        if (results.errors.length > 0) {
          console.warn('Erros na importação:', results.errors);
          toast.warning(
            `${results.ctes_created} CT-es importados com sucesso. ${results.errors.length} falharam.`,
            { duration: 5000 }
          );
        } else {
          const messages = [
            `✓ ${results.ctes_created} CT-es importados`,
            `✓ ${results.clients_created} novos clientes cadastrados`,
          ];
          
          if (results.vehicles_created > 0) {
            messages.push(`✓ ${results.vehicles_created} veículos auto-cadastrados`);
          }
          
          messages.push('✓ Contas a receber criadas', '✓ Indicadores atualizados');
          
          toast.success(
            messages.join('\n'),
            { duration: 6000 }
          );
        }

      } else {
        // Importação individual de XML
        const xmlContent = await file.text();
        
        const { data, error } = await supabase.functions.invoke('import-cte-xml', {
          body: { xml_content: xmlContent }
        });

        if (error) throw error;

        toast.success('CT-e importado com sucesso!');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao importar:', error);
      toast.error(error.message || 'Erro ao importar CT-e');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.trip_id || !formData.remetente_nome || !formData.destinatario_nome) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      // Validar se a placa existe na tabela vehicles
      const { data: vehicleExists } = await supabase
        .from('vehicles')
        .select('placa')
        .eq('placa', formData.placa_veiculo.toUpperCase())
        .maybeSingle();

      if (!vehicleExists) {
        toast.error(`Placa ${formData.placa_veiculo} não encontrada. Importe os veículos primeiro.`);
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('cte')
        .insert({
          ...formData,
          placa_veiculo: formData.placa_veiculo.toUpperCase(),
          peso_bruto: parseFloat(formData.peso_bruto),
          peso_cubado: formData.peso_cubado ? parseFloat(formData.peso_cubado) : null,
          quantidade_volumes: parseInt(formData.quantidade_volumes),
          valor_mercadoria: parseFloat(formData.valor_mercadoria),
          valor_frete: parseFloat(formData.valor_frete),
          valor_pedagio: parseFloat(formData.valor_pedagio),
          valor_total: parseFloat(formData.valor_total),
          created_by: user?.id,
          status: 'emitido'
        });

      if (error) throw error;

      toast.success('CT-e criado com sucesso! Disponível no app do motorista.');
      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        numero_cte: '',
        serie: '1',
        tipo_cte: 'normal',
        tipo_servico: 'normal',
        trip_id: '',
        remetente_nome: '',
        remetente_cnpj: '',
        remetente_endereco: '',
        remetente_cidade: '',
        remetente_uf: '',
        remetente_cep: '',
        destinatario_nome: '',
        destinatario_cnpj: '',
        destinatario_endereco: '',
        destinatario_cidade: '',
        destinatario_uf: '',
        destinatario_cep: '',
        tomador_tipo: 'remetente',
        tomador_nome: '',
        tomador_cnpj: '',
        produto_predominante: '',
        peso_bruto: '',
        peso_cubado: '',
        quantidade_volumes: '',
        valor_mercadoria: '',
        modal: 'rodoviario',
        valor_frete: '',
        valor_pedagio: '',
        valor_total: '',
        tipo_frete: 'cif',
        placa_veiculo: '',
        placa_carreta: '',
        uf_veiculo: '',
        rntrc: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao criar CT-e:', error);
      toast.error('Erro ao criar CT-e');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emitir CT-e (Conhecimento de Transporte Eletrônico)</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basicos" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="xml">Importar XML</TabsTrigger>
            <TabsTrigger value="basicos">Básicos</TabsTrigger>
            <TabsTrigger value="remetente">Remetente</TabsTrigger>
            <TabsTrigger value="destinatario">Destinatário</TabsTrigger>
            <TabsTrigger value="carga">Carga</TabsTrigger>
            <TabsTrigger value="transporte">Transporte</TabsTrigger>
          </TabsList>

          <TabsContent value="xml" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Importar CT-e via XML ou ZIP</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Faça upload de um XML individual ou um arquivo ZIP contendo múltiplos XMLs
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml,.zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    toast.info('Arquivo selecionado: ' + e.target.files[0].name);
                  }
                }}
              />
              
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Selecionar XML ou ZIP
                </Button>
                
                <Button
                  type="button"
                  onClick={handleImportXML}
                  disabled={importing}
                >
                  {importing ? 'Importando...' : 'Importar'}
                </Button>
              </div>
              
              <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
                <p className="text-xs text-muted-foreground font-semibold">
                  ⚠️ Importação sem placa:
                </p>
                <p className="text-xs text-muted-foreground ml-4">
                  • Se o XML não trouxer placa válida, será usado 'SEM-PLACA' e você define a placa no Manifesto depois
                </p>
                
                <p className="text-xs text-success font-semibold mt-4">
                  ✓ O sistema fará automaticamente:
                </p>
                <p className="text-xs text-success ml-4">
                  • Cadastro de clientes (se não existirem)
                </p>
                <p className="text-xs text-success ml-4">
                  • Criação de contas a receber
                </p>
                <p className="text-xs text-success ml-4">
                  • Criação automática do veículo "SEM-PLACA" quando necessário
                </p>
                <p className="text-xs text-success ml-4">
                  • Atualização de indicadores financeiros
                </p>
                <p className="text-xs text-success ml-4">
                  • Cálculo de análises por cliente
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="basicos" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número CT-e *</Label>
                <Input
                  value={formData.numero_cte}
                  onChange={e => setFormData({ ...formData, numero_cte: e.target.value })}
                  placeholder="Auto-gerado"
                />
              </div>
              <div>
                <Label>Série</Label>
                <Input
                  value={formData.serie}
                  onChange={e => setFormData({ ...formData, serie: e.target.value })}
                />
              </div>
              <div>
                <Label>Viagem *</Label>
                <Select value={formData.trip_id} onValueChange={value => setFormData({ ...formData, trip_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a viagem" />
                  </SelectTrigger>
                  <SelectContent>
                    {trips.map(trip => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.origin} → {trip.destination} ({trip.vehicle_plate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo CT-e</Label>
                <Select value={formData.tipo_cte} onValueChange={value => setFormData({ ...formData, tipo_cte: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="complementar">Complementar</SelectItem>
                    <SelectItem value="anulacao">Anulação</SelectItem>
                    <SelectItem value="substituto">Substituto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo Serviço</Label>
                <Select value={formData.tipo_servico} onValueChange={value => setFormData({ ...formData, tipo_servico: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="subcontratacao">Subcontratação</SelectItem>
                    <SelectItem value="redespacho">Redespacho</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo Frete</Label>
                <Select value={formData.tipo_frete} onValueChange={value => setFormData({ ...formData, tipo_frete: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cif">CIF (Pago pelo Remetente)</SelectItem>
                    <SelectItem value="fob">FOB (Pago pelo Destinatário)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="remetente" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome/Razão Social *</Label>
                <Input
                  value={formData.remetente_nome}
                  onChange={e => setFormData({ ...formData, remetente_nome: e.target.value })}
                />
              </div>
              <div>
                <Label>CNPJ *</Label>
                <Input
                  value={formData.remetente_cnpj}
                  onChange={e => setFormData({ ...formData, remetente_cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <Label>CEP *</Label>
                <Input
                  value={formData.remetente_cep}
                  onChange={e => setFormData({ ...formData, remetente_cep: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
              <div className="col-span-2">
                <Label>Endereço *</Label>
                <Input
                  value={formData.remetente_endereco}
                  onChange={e => setFormData({ ...formData, remetente_endereco: e.target.value })}
                />
              </div>
              <div>
                <Label>Cidade *</Label>
                <Input
                  value={formData.remetente_cidade}
                  onChange={e => setFormData({ ...formData, remetente_cidade: e.target.value })}
                />
              </div>
              <div>
                <Label>UF *</Label>
                <Input
                  value={formData.remetente_uf}
                  onChange={e => setFormData({ ...formData, remetente_uf: e.target.value })}
                  maxLength={2}
                  placeholder="SP"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="destinatario" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome/Razão Social *</Label>
                <Input
                  value={formData.destinatario_nome}
                  onChange={e => setFormData({ ...formData, destinatario_nome: e.target.value })}
                />
              </div>
              <div>
                <Label>CNPJ *</Label>
                <Input
                  value={formData.destinatario_cnpj}
                  onChange={e => setFormData({ ...formData, destinatario_cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <Label>CEP *</Label>
                <Input
                  value={formData.destinatario_cep}
                  onChange={e => setFormData({ ...formData, destinatario_cep: e.target.value })}
                  placeholder="00000-000"
                />
              </div>
              <div className="col-span-2">
                <Label>Endereço *</Label>
                <Input
                  value={formData.destinatario_endereco}
                  onChange={e => setFormData({ ...formData, destinatario_endereco: e.target.value })}
                />
              </div>
              <div>
                <Label>Cidade *</Label>
                <Input
                  value={formData.destinatario_cidade}
                  onChange={e => setFormData({ ...formData, destinatario_cidade: e.target.value })}
                />
              </div>
              <div>
                <Label>UF *</Label>
                <Input
                  value={formData.destinatario_uf}
                  onChange={e => setFormData({ ...formData, destinatario_uf: e.target.value })}
                  maxLength={2}
                  placeholder="RJ"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="carga" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Produto Predominante *</Label>
                <Input
                  value={formData.produto_predominante}
                  onChange={e => setFormData({ ...formData, produto_predominante: e.target.value })}
                  placeholder="Ex: Produtos Diversos"
                />
              </div>
              <div>
                <Label>Peso Bruto (kg) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.peso_bruto}
                  onChange={e => setFormData({ ...formData, peso_bruto: e.target.value })}
                />
              </div>
              <div>
                <Label>Peso Cubado (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.peso_cubado}
                  onChange={e => setFormData({ ...formData, peso_cubado: e.target.value })}
                />
              </div>
              <div>
                <Label>Quantidade Volumes *</Label>
                <Input
                  type="number"
                  value={formData.quantidade_volumes}
                  onChange={e => setFormData({ ...formData, quantidade_volumes: e.target.value })}
                />
              </div>
              <div>
                <Label>Valor Mercadoria (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_mercadoria}
                  onChange={e => setFormData({ ...formData, valor_mercadoria: e.target.value })}
                />
              </div>
              <div>
                <Label>Valor Frete (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_frete}
                  onChange={e => setFormData({ ...formData, valor_frete: e.target.value })}
                />
              </div>
              <div>
                <Label>Valor Pedágio (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_pedagio}
                  onChange={e => setFormData({ ...formData, valor_pedagio: e.target.value })}
                />
              </div>
              <div>
                <Label>Valor Total (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor_total}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transporte" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Modal</Label>
                <Select value={formData.modal} onValueChange={value => setFormData({ ...formData, modal: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rodoviario">Rodoviário</SelectItem>
                    <SelectItem value="aereo">Aéreo</SelectItem>
                    <SelectItem value="aquaviario">Aquaviário</SelectItem>
                    <SelectItem value="ferroviario">Ferroviário</SelectItem>
                    <SelectItem value="dutoviario">Dutoviário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>UF Veículo *</Label>
                <Input
                  value={formData.uf_veiculo}
                  onChange={e => setFormData({ ...formData, uf_veiculo: e.target.value })}
                  maxLength={2}
                  placeholder="SP"
                />
              </div>
              <div>
                <Label>Placa Veículo *</Label>
            <VehicleSelect
  value={formData.placa_veiculo}
  onChange={e => setFormData({ ...formData, placa_veiculo: e.target.value })}
/>
              </div>
              <div>
                <Label>Placa Carreta</Label>
                <Input
                  value={formData.placa_carreta}
                  onChange={e => setFormData({ ...formData, placa_carreta: e.target.value })}
                  placeholder="DEF-5678"
                />
              </div>
              <div className="col-span-2">
                <Label>RNTRC (Transportador Autônomo)</Label>
                <Input
                  value={formData.rntrc}
                  onChange={e => setFormData({ ...formData, rntrc: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Emitindo...' : 'Emitir CT-e'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
