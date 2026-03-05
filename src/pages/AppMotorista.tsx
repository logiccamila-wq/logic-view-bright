import { useState } from 'react';
import { Smartphone, Navigation, Camera, CheckCircle, MapPin, FileText, AlertCircle, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export default function AppMotoristaPage() {
  const [viagemAtiva, setViagemAtiva] = useState({
    numero: 'V-2025-001234',
    origem: 'Belo Horizonte, MG',
    destino: 'Vitória, ES',
    carga: 'Minério de Ferro - 35t',
    cliente: 'Mineração Vale do Rio',
    veiculo: 'ABC-1234',
    distanciaTotal: 524,
    distanciaPercorrida: 287,
    progresso: 55,
    eta: '14:30'
  });

  const [checklist, setChecklist] = useState({
    items: [
      { id: 'pneus', label: 'Pneus em bom estado', checked: false, critical: true },
      { id: 'oleo', label: 'Nível de óleo OK', checked: false, critical: true },
      { id: 'agua', label: 'Nível de água OK', checked: false, critical: true },
      { id: 'freios', label: 'Freios funcionando', checked: false, critical: true },
      { id: 'luzes', label: 'Luzes funcionando', checked: false, critical: true },
      { id: 'espelhos', label: 'Retrovisores OK', checked: false, critical: false },
      { id: 'docs', label: 'Documentação em dia', checked: false, critical: true },
      { id: 'extintor', label: 'Extintor de incêndio', checked: false, critical: true },
      { id: 'triangulo', label: 'Triângulo', checked: false, critical: false },
      { id: 'estepe', label: 'Estepe em bom estado', checked: false, critical: true },
      { id: 'amarracao', label: 'Carga bem amarrada', checked: false, critical: true },
      { id: 'lona', label: 'Lona em bom estado', checked: false, critical: false }
    ],
    observacoes: ''
  });

  const [checkinEtapa, setCheckinEtapa] = useState<'coleta' | 'transito' | 'entrega'>('coleta');
  const [checkinFotos, setCheckinFotos] = useState({
    carga: null as File | null,
    lacre: null as File | null,
    nf: null as File | null,
    assinatura: null as File | null
  });
  const [localizacaoCapturada, setLocalizacaoCapturada] = useState(false);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const handleFotoChange = (tipo: keyof typeof checkinFotos, file: File | null) => {
    setCheckinFotos(prev => ({ ...prev, [tipo]: file }));
  };

  const capturarLocalizacao = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {
        setLocalizacaoCapturada(true);
      });
    }
  };

  const checklistCompleto = checklist.items.filter(i => i.critical).every(i => i.checked);
  const itensVerificados = checklist.items.filter(i => i.checked).length;

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24, background: '#0f172a', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Smartphone size={56} color="#3b82f6" />
        <div>
          <h1 style={{ margin: 0, fontSize: 36, color: '#e5e7eb' }}>
            📱 Super App Motorista
          </h1>
          <p style={{ margin: '8px 0 0', color: '#9aa3b0', fontSize: 18 }}>
            Check-in Inteligente + POD Digital + Checklist MOPP + Navegação
          </p>
        </div>
      </div>

      {/* Viagem Ativa */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 32,
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
          <div>
            <Badge style={{ background: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>
              VIAGEM ATIVA
            </Badge>
            <h2 style={{ margin: 0, fontSize: 28 }}>
              {viagemAtiva.numero}
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 16, opacity: 0.9 }}>
              {viagemAtiva.cliente}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, opacity: 0.9 }}>ETA</div>
            <div style={{ fontSize: 32, fontWeight: 'bold' }}>{viagemAtiva.eta}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <Navigation size={24} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
              {viagemAtiva.origem} → {viagemAtiva.destino}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                background: 'white',
                height: '100%',
                width: `${viagemAtiva.progresso}%`,
                transition: 'width 0.3s'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 14 }}>
              <span>{viagemAtiva.distanciaPercorrida} km percorridos</span>
              <span>{viagemAtiva.distanciaTotal} km total</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, fontSize: 14 }}>
          <div>
            <div style={{ opacity: 0.9, marginBottom: 4 }}>Carga:</div>
            <div style={{ fontWeight: 'bold' }}>{viagemAtiva.carga}</div>
          </div>
          <div>
            <div style={{ opacity: 0.9, marginBottom: 4 }}>Veículo:</div>
            <div style={{ fontWeight: 'bold' }}>{viagemAtiva.veiculo}</div>
          </div>
          <div>
            <div style={{ opacity: 0.9, marginBottom: 4 }}>Progresso:</div>
            <div style={{ fontWeight: 'bold' }}>{viagemAtiva.progresso}%</div>
          </div>
        </div>
      </div>

      {/* Tabs Principais */}
      <Tabs defaultValue="checkin" className="w-full">
        <TabsList style={{ background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 12, marginBottom: 24 }}>
          <TabsTrigger value="checkin">📦 Check-in</TabsTrigger>
          <TabsTrigger value="checklist">✅ Checklist</TabsTrigger>
          <TabsTrigger value="pod">📸 POD Digital</TabsTrigger>
          <TabsTrigger value="stats">📊 Estatísticas</TabsTrigger>
        </TabsList>

        {/* CHECK-IN */}
        <TabsContent value="checkin">
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 32
          }}>
            <h3 style={{ margin: '0 0 24px', color: '#e5e7eb', fontSize: 24 }}>
              📦 Check-in de Carga
            </h3>

            {/* Seletor de Etapa */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
              {(['coleta', 'transito', 'entrega'] as const).map(etapa => (
                <button
                  key={etapa}
                  onClick={() => setCheckinEtapa(etapa)}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    background: checkinEtapa === etapa 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: 12,
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {etapa}
                </button>
              ))}
            </div>

            {/* Localização */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#e5e7eb', marginBottom: 12, fontSize: 16, fontWeight: 'bold' }}>
                <MapPin size={20} style={{ display: 'inline', marginRight: 8 }} />
                Localização GPS
              </label>
              <Button
                onClick={capturarLocalizacao}
                style={{
                  background: localizacaoCapturada 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 8
                }}
              >
                {localizacaoCapturada ? '✓ Localização Capturada' : 'Capturar Localização'}
              </Button>
              {localizacaoCapturada && (
                <div style={{ color: '#10b981', fontSize: 13, marginTop: 8 }}>
                  ✓ GPS: -19.9167, -43.9345 (Belo Horizonte)
                </div>
              )}
            </div>

            {/* Fotos por Etapa */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ color: '#e5e7eb', marginBottom: 16 }}>
                📸 Fotos Obrigatórias - {checkinEtapa.toUpperCase()}
              </h4>

              {checkinEtapa === 'coleta' && (
                <div style={{ display: 'grid', gap: 16 }}>
                  {[
                    { key: 'carga', label: 'Foto da Carga', required: true },
                    { key: 'lacre', label: 'Foto do Lacre/Selo', required: true },
                    { key: 'nf', label: 'Foto da Nota Fiscal', required: true }
                  ].map(({ key, label, required }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#9aa3b0' }}>
                        <Camera size={16} style={{ display: 'inline', marginRight: 6 }} />
                        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>
                      <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFotoChange(key as keyof typeof checkinFotos, e.target.files?.[0] || null)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '2px dashed rgba(255,255,255,0.2)',
                          borderRadius: 8,
                          padding: 12,
                          color: '#e5e7eb'
                        }}
                      />
                      {checkinFotos[key as keyof typeof checkinFotos] && (
                        <div style={{ color: '#10b981', fontSize: 13, marginTop: 4 }}>
                          ✓ {checkinFotos[key as keyof typeof checkinFotos]!.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {checkinEtapa === 'entrega' && (
                <div style={{ display: 'grid', gap: 16 }}>
                  {[
                    { key: 'carga', label: 'Foto da Carga Entregue', required: true },
                    { key: 'assinatura', label: 'Foto da Assinatura/Canho', required: true }
                  ].map(({ key, label, required }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#9aa3b0' }}>
                        <Camera size={16} style={{ display: 'inline', marginRight: 6 }} />
                        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>
                      <Input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handleFotoChange(key as keyof typeof checkinFotos, e.target.files?.[0] || null)}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '2px dashed rgba(255,255,255,0.2)',
                          borderRadius: 8,
                          padding: 12,
                          color: '#e5e7eb'
                        }}
                      />
                      {checkinFotos[key as keyof typeof checkinFotos] && (
                        <div style={{ color: '#10b981', fontSize: 13, marginTop: 4 }}>
                          ✓ {checkinFotos[key as keyof typeof checkinFotos]!.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                padding: '16px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 'bold'
              }}
            >
              ✓ Enviar Check-in + Gerar Protocolo WhatsApp
            </Button>
          </div>
        </TabsContent>

        {/* CHECKLIST */}
        <TabsContent value="checklist">
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 32
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, color: '#e5e7eb', fontSize: 24 }}>
                ✅ Checklist Digital MOPP
              </h3>
              <div style={{
                background: checklistCompleto 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                padding: '8px 16px',
                borderRadius: 8,
                color: 'white',
                fontWeight: 'bold'
              }}>
                {itensVerificados} / {checklist.items.length}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              {checklist.items.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 16,
                    background: item.checked 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(255,255,255,0.05)',
                    border: item.critical 
                      ? `2px solid ${item.checked ? '#10b981' : '#ef4444'}`
                      : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: item.checked ? '#10b981' : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {item.checked && <CheckCircle size={20} color="white" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#e5e7eb', fontSize: 15, fontWeight: item.checked ? 'bold' : 'normal' }}>
                      {item.label}
                    </div>
                    {item.critical && (
                      <div style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>
                        ⚠️ Item crítico - obrigatório
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#e5e7eb', marginBottom: 8, fontSize: 14, fontWeight: 'bold' }}>
                Observações:
              </label>
              <textarea
                value={checklist.observacoes}
                onChange={(e) => setChecklist(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Registre aqui qualquer problema encontrado..."
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#e5e7eb',
                  fontSize: 14,
                  resize: 'vertical',
                  minHeight: 100
                }}
              />
            </div>

            <Button
              disabled={!checklistCompleto}
              style={{
                width: '100%',
                background: checklistCompleto 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'rgba(255,255,255,0.1)',
                border: 'none',
                padding: '16px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 'bold',
                cursor: checklistCompleto ? 'pointer' : 'not-allowed'
              }}
            >
              {checklistCompleto ? '✓ Finalizar Checklist' : '⚠️ Complete todos os itens críticos'}
            </Button>
          </div>
        </TabsContent>

        {/* POD DIGITAL */}
        <TabsContent value="pod">
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 32
          }}>
            <h3 style={{ margin: '0 0 24px', color: '#e5e7eb', fontSize: 24 }}>
              📸 Prova de Entrega Digital (POD)
            </h3>

            <div style={{ display: 'grid', gap: 24 }}>
              <div>
                <h4 style={{ color: '#e5e7eb', marginBottom: 16 }}>1. Foto da Mercadoria Entregue</h4>
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px dashed rgba(255,255,255,0.2)',
                    borderRadius: 8,
                    padding: 12,
                    color: '#e5e7eb'
                  }}
                />
              </div>

              <div>
                <h4 style={{ color: '#e5e7eb', marginBottom: 16 }}>2. Assinatura Digital do Recebedor</h4>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px dashed rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  padding: 40,
                  textAlign: 'center',
                  cursor: 'pointer'
                }}>
                  <FileText size={48} color="#6b7280" style={{ margin: '0 auto' }} />
                  <p style={{ color: '#9aa3b0', marginTop: 16 }}>
                    Toque para capturar assinatura
                  </p>
                </div>
              </div>

              <div>
                <h4 style={{ color: '#e5e7eb', marginBottom: 16 }}>3. Dados do Recebedor</h4>
                <div style={{ display: 'grid', gap: 12 }}>
                  <Input
                    placeholder="Nome completo"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      padding: 12,
                      color: '#e5e7eb'
                    }}
                  />
                  <Input
                    placeholder="CPF/CNPJ"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      padding: 12,
                      color: '#e5e7eb'
                    }}
                  />
                  <Input
                    placeholder="Hora da entrega (HH:MM)"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      padding: 12,
                      color: '#e5e7eb'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 12,
              padding: 16,
              marginTop: 24,
              marginBottom: 24
            }}>
              <p style={{ margin: 0, color: '#93c5fd', fontSize: 14, lineHeight: 1.6 }}>
                <strong>🔒 Blockchain Garantido:</strong><br />
                • POD gravado imutavelmente em blockchain<br />
                • Hash criptográfico gerado automaticamente<br />
                • Auditoria disponível 24/7<br />
                • Impossível de alterar após criação
              </p>
            </div>

            <Button
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                padding: '16px',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 'bold'
              }}
            >
              🔒 Finalizar POD + Gravar em Blockchain
            </Button>
          </div>
        </TabsContent>

        {/* ESTATÍSTICAS */}
        <TabsContent value="stats">
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 32
          }}>
            <h3 style={{ margin: '0 0 24px', color: '#e5e7eb', fontSize: 24 }}>
              📊 Seus KPIs de Desempenho
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
              {[
                { label: 'Entregas no Prazo', valor: '98%', meta: '95%', cor: '#10b981' },
                { label: 'Consumo Médio', valor: '3.2 km/L', meta: '3.0 km/L', cor: '#3b82f6' },
                { label: 'Avaliação Clientes', valor: '4.9/5', meta: '4.5/5', cor: '#f59e0b' }
              ].map((kpi, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `2px solid ${kpi.cor}`,
                    borderRadius: 12,
                    padding: 20,
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: 14, color: '#9aa3b0', marginBottom: 8 }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 'bold', color: kpi.cor, marginBottom: 8 }}>
                    {kpi.valor}
                  </div>
                  <div style={{ fontSize: 12, color: '#9aa3b0' }}>
                    Meta: {kpi.meta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
