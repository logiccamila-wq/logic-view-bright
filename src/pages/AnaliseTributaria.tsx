import { useState } from 'react';
import { TrendingDown, Calculator, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnaliseTributariaPage() {
  const [periodoProjecao, setPeriodoProjecao] = useState(1);

  // DADOS REAIS (Jan-Ago 2025)
  const dadosReais = {
    meses: [
      { mes: 'Jan/25', receita: 480000, lucro: 72000 },
      { mes: 'Fev/25', receita: 520000, lucro: 78000 },
      { mes: 'Mar/25', receita: 510000, lucro: 76500 },
      { mes: 'Abr/25', receita: 495000, lucro: 74250 },
      { mes: 'Mai/25', receita: 530000, lucro: 79500 },
      { mes: 'Jun/25', receita: 540000, lucro: 81000 },
      { mes: 'Jul/25', receita: 525000, lucro: 78750 },
      { mes: 'Ago/25', receita: 500000, lucro: 75000 }
    ],
    totais: {
      receita: 4100000,
      lucro: 615000,
      mediaMensal: {
        receita: 512500,
        lucro: 76875
      }
    }
  };

  // CÁLCULO LUCRO REAL
  const calcularLucroReal = () => {
    let total = 0;
    const meses = [];
    
    dadosReais.meses.forEach(mes => {
      const receita = mes.receita;
      const lucro = mes.lucro;
      
      // IRPJ: 15% + 10% adicional sobre lucro > R$ 20k/mês
      const baseIRPJ = lucro;
      const irpjBase = baseIRPJ * 0.15;
      const adicionalIRPJ = Math.max(0, (baseIRPJ - 20000) * 0.10);
      
      // CSLL: 9% sobre lucro
      const csll = lucro * 0.09;
      
      // PIS: 1.65%
      const pis = receita * 0.0165;
      
      // COFINS: 7.6%
      const cofins = receita * 0.076;
      
      // ICMS: 12% (média)
      const icms = receita * 0.12;
      
      const totalMes = irpjBase + adicionalIRPJ + csll + pis + cofins + icms;
      
      meses.push({ mes: mes.mes, valor: totalMes });
      total += totalMes;
    });
    
    return { meses, total };
  };

  // CÁLCULO LUCRO PRESUMIDO
  const calcularLucroPresumido = () => {
    let total = 0;
    const meses = [];
    
    dadosReais.meses.forEach(mes => {
      const receita = mes.receita;
      
      // Base presumida: 8% para transporte
      const basePresumida = receita * 0.08;
      
      // IRPJ: 15% sobre base presumida
      const irpj = basePresumida * 0.15;
      
      // CSLL: 9% sobre 12% da receita (para serviços)
      const baseCsll = receita * 0.12;
      const csll = baseCsll * 0.09;
      
      // PIS: 0.65%
      const pis = receita * 0.0065;
      
      // COFINS: 3%
      const cofins = receita * 0.03;
      
      // ICMS: 12%
      const icms = receita * 0.12;
      
      const totalMes = irpj + csll + pis + cofins + icms;
      
      meses.push({ mes: mes.mes, valor: totalMes });
      total += totalMes;
    });
    
    return { meses, total };
  };

  // CÁLCULO SIMPLES NACIONAL
  const calcularSimplesNacional = () => {
    let total = 0;
    const meses = [];
    
    dadosReais.meses.forEach(mes => {
      const receita = mes.receita;
      
      // Anexo III - Transporte: alíquota varia conforme faturamento
      // Aproximação: 11.51% (faixa R$ 360k - R$ 720k/ano)
      const aliquota = 0.1151;
      const totalMes = receita * aliquota;
      
      meses.push({ mes: mes.mes, valor: totalMes });
      total += totalMes;
    });
    
    return { meses, total };
  };

  const lucroReal = calcularLucroReal();
  const lucroPresumido = calcularLucroPresumido();
  const simplesNacional = calcularSimplesNacional();

  // ECONOMIA
  const economia = {
    presumidoVsReal: lucroReal.total - lucroPresumido.total,
    simplesVsReal: lucroReal.total - simplesNacional.total,
    percentualPresumido: ((lucroReal.total - lucroPresumido.total) / lucroReal.total) * 100,
    percentualSimples: ((lucroReal.total - simplesNacional.total) / lucroReal.total) * 100
  };

  // PROJEÇÃO
  const projetarEconomia = (anos: number) => {
    const mesesTotal = anos * 12;
    const receitaMediaMensal = dadosReais.totais.mediaMensal.receita;
    const lucroMedioMensal = dadosReais.totais.mediaMensal.lucro;
    
    // Crescimento estimado: 3% ao ano (conservador)
    const taxaCrescimento = 1.03;
    
    let impostoRealTotal = 0;
    let impostoPresumidoTotal = 0;
    let impostoSimplesTotal = 0;
    
    for (let mes = 0; mes < mesesTotal; mes++) {
      const anoCorrente = Math.floor(mes / 12);
      const fatorCrescimento = Math.pow(taxaCrescimento, anoCorrente);
      
      const receitaMes = receitaMediaMensal * fatorCrescimento;
      const lucroMes = lucroMedioMensal * fatorCrescimento;
      
      // Lucro Real
      const baseIRPJ = lucroMes;
      const irpjBase = baseIRPJ * 0.15;
      const adicionalIRPJ = Math.max(0, (baseIRPJ - 20000) * 0.10);
      const csllReal = lucroMes * 0.09;
      const pisReal = receitaMes * 0.0165;
      const cofinsReal = receitaMes * 0.076;
      const icmsReal = receitaMes * 0.12;
      impostoRealTotal += irpjBase + adicionalIRPJ + csllReal + pisReal + cofinsReal + icmsReal;
      
      // Lucro Presumido
      const basePresumida = receitaMes * 0.08;
      const irpjPres = basePresumida * 0.15;
      const baseCsll = receitaMes * 0.12;
      const csllPres = baseCsll * 0.09;
      const pisPres = receitaMes * 0.0065;
      const cofinsPres = receitaMes * 0.03;
      const icmsPres = receitaMes * 0.12;
      impostoPresumidoTotal += irpjPres + csllPres + pisPres + cofinsPres + icmsPres;
      
      // Simples
      impostoSimplesTotal += receitaMes * 0.1151;
    }
    
    return {
      impostoReal: impostoRealTotal,
      impostoPresumido: impostoPresumidoTotal,
      impostoSimples: impostoSimplesTotal,
      economiaPresumido: impostoRealTotal - impostoPresumidoTotal,
      economiaSimples: impostoRealTotal - impostoSimplesTotal
    };
  };

  const projecaoAtual = projetarEconomia(periodoProjecao);

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: 24, background: '#0f172a', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Calculator size={56} color="#f59e0b" />
        <div>
          <h1 style={{ margin: 0, fontSize: 36, color: '#e5e7eb' }}>
            📊 Análise Tributária Comparativa
          </h1>
          <p style={{ margin: '8px 0 0', color: '#9aa3b0', fontSize: 18 }}>
            Lucro Real vs Lucro Presumido vs Simples Nacional | Projeção 1, 2 e 5 anos
          </p>
        </div>
      </div>

      {/* Comparativo Histórico */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '2px solid rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 32
      }}>
        <h3 style={{ margin: '0 0 24px', color: '#e5e7eb', fontSize: 24 }}>
          📈 Histórico Real (Jan-Ago 2025)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {/* LUCRO REAL */}
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: 24,
            borderRadius: 12,
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <TrendingUp size={40} />
              <h4 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>
                LUCRO REAL
              </h4>
            </div>
            <div style={{ fontSize: 56, fontWeight: 'bold', marginBottom: 8 }}>
              R$ {(lucroReal.total / 1000).toFixed(0)}k
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>
              Média: R$ {(lucroReal.total / 8 / 1000).toFixed(1)}k/mês
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.8 }}>
              • IRPJ: 15% + 10% adicional<br />
              • CSLL: 9%<br />
              • PIS: 1.65%<br />
              • COFINS: 7.6%<br />
              • ICMS: 12%<br />
              <strong>Carga: {((lucroReal.total / dadosReais.totais.receita) * 100).toFixed(1)}%</strong>
            </div>
          </div>

          {/* LUCRO PRESUMIDO */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: 24,
            borderRadius: 12,
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <TrendingDown size={40} />
              <h4 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>
                LUCRO PRESUMIDO
              </h4>
            </div>
            <div style={{ fontSize: 56, fontWeight: 'bold', marginBottom: 8 }}>
              R$ {(lucroPresumido.total / 1000).toFixed(0)}k
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>
              Média: R$ {(lucroPresumido.total / 8 / 1000).toFixed(1)}k/mês
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.8 }}>
              • IRPJ: 15% s/ 8% receita<br />
              • CSLL: 9% s/ 12% receita<br />
              • PIS: 0.65%<br />
              • COFINS: 3%<br />
              • ICMS: 12%<br />
              <strong>Carga: {((lucroPresumido.total / dadosReais.totais.receita) * 100).toFixed(1)}%</strong>
            </div>
          </div>

          {/* SIMPLES NACIONAL */}
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            padding: 24,
            borderRadius: 12,
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <FileText size={40} />
              <h4 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>
                SIMPLES NACIONAL
              </h4>
            </div>
            <div style={{ fontSize: 56, fontWeight: 'bold', marginBottom: 8 }}>
              R$ {(simplesNacional.total / 1000).toFixed(0)}k
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 16 }}>
              Média: R$ {(simplesNacional.total / 8 / 1000).toFixed(1)}k/mês
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.8 }}>
              • Anexo III (Transporte)<br />
              • Alíquota: 11.51%<br />
              • Faixa: R$ 360k-720k/ano<br />
              • Imposto único<br />
              <br />
              <strong>Carga: {((simplesNacional.total / dadosReais.totais.receita) * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Economia */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: 16,
        padding: 32,
        marginBottom: 32,
        color: 'white'
      }}>
        <h3 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 'bold' }}>
          💰 Economia Potencial (Jan-Ago 2025)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ fontSize: 18, marginBottom: 8, opacity: 0.9 }}>
              Economia com Lucro Presumido:
            </div>
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>
              R$ {(economia.presumidoVsReal / 1000).toFixed(0)}k
            </div>
            <div style={{ fontSize: 20, marginTop: 8, opacity: 0.9 }}>
              ({economia.percentualPresumido.toFixed(1)}% a menos)
            </div>
          </div>
          <div>
            <div style={{ fontSize: 18, marginBottom: 8, opacity: 0.9 }}>
              Economia com Simples Nacional:
            </div>
            <div style={{ fontSize: 48, fontWeight: 'bold' }}>
              R$ {(economia.simplesVsReal / 1000).toFixed(0)}k
            </div>
            <div style={{ fontSize: 20, marginTop: 8, opacity: 0.9 }}>
              ({economia.percentualSimples.toFixed(1)}% a menos)
            </div>
          </div>
        </div>
      </div>

      {/* Projeção */}
      <h3 style={{ color: '#e5e7eb', fontSize: 24, marginBottom: 16 }}>
        🔮 Projeção de Economia
      </h3>
      
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[1, 2, 5].map(anos => (
          <button
            key={anos}
            onClick={() => setPeriodoProjecao(anos)}
            style={{
              padding: '12px 24px',
              background: periodoProjecao === anos ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 'rgba(255,255,255,0.05)',
              border: periodoProjecao === anos ? 'none' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {anos} {anos === 1 ? 'Ano' : 'Anos'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Projeção Lucro Presumido */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '2px solid #10b981',
          borderRadius: 16,
          padding: 32
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <TrendingDown size={40} />
            <h4 style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#e5e7eb' }}>
              LUCRO PRESUMIDO
            </h4>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 8, color: '#9aa3b0' }}>
              Economia Total em {periodoProjecao} {periodoProjecao === 1 ? 'Ano' : 'Anos'}
            </div>
            <div style={{ fontSize: 56, fontWeight: 'bold', color: '#10b981' }}>
              R$ {(projecaoAtual.economiaPresumido / 1000).toFixed(0)}k
            </div>
            <div style={{ fontSize: 20, opacity: 0.9, marginTop: 8, color: '#10b981' }}>
              ({((projecaoAtual.economiaPresumido / projecaoAtual.impostoReal) * 100).toFixed(1)}% economia)
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 12 }}>
            <div style={{ fontSize: 14, color: '#9aa3b0', marginBottom: 12 }}>
              Total de Impostos:
            </div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#e5e7eb', marginBottom: 16 }}>
              R$ {(projecaoAtual.impostoPresumido / 1000).toFixed(0)}k
            </div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.8 }}>
              vs R$ {(projecaoAtual.impostoReal / 1000).toFixed(0)}k (Lucro Real)
            </div>
          </div>
        </div>

        {/* Projeção Simples */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '2px solid #3b82f6',
          borderRadius: 16,
          padding: 32
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <FileText size={40} color="#3b82f6" />
            <h4 style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#e5e7eb' }}>
              SIMPLES NACIONAL
            </h4>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 16, opacity: 0.9, marginBottom: 8, color: '#9aa3b0' }}>
              Economia Total em {periodoProjecao} {periodoProjecao === 1 ? 'Ano' : 'Anos'}
            </div>
            <div style={{ fontSize: 56, fontWeight: 'bold', color: '#3b82f6' }}>
              R$ {(projecaoAtual.economiaSimples / 1000).toFixed(0)}k
            </div>
            <div style={{ fontSize: 20, opacity: 0.9, marginTop: 8, color: '#3b82f6' }}>
              ({((projecaoAtual.economiaSimples / projecaoAtual.impostoReal) * 100).toFixed(1)}% economia)
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 12 }}>
            <div style={{ fontSize: 14, color: '#9aa3b0', marginBottom: 12 }}>
              Total de Impostos:
            </div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#e5e7eb', marginBottom: 16 }}>
              R$ {(projecaoAtual.impostoSimples / 1000).toFixed(0)}k
            </div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.8 }}>
              vs R$ {(projecaoAtual.impostoReal / 1000).toFixed(0)}k (Lucro Real)
            </div>
          </div>
        </div>
      </div>

      {/* Recomendação */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: 16,
        padding: 32,
        marginTop: 32,
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <DollarSign size={48} />
          <h3 style={{ margin: 0, fontSize: 28, fontWeight: 'bold' }}>
            ✅ RECOMENDAÇÃO DEFINITIVA
          </h3>
        </div>

        <div style={{ fontSize: 18, lineHeight: 1.8, marginBottom: 24 }}>
          Baseado nos dados reais de Jan-Ago 2025 e nas projeções futuras:<br />
          <br />
          <strong style={{ fontSize: 24 }}>
            {economia.presumidoVsReal > economia.simplesVsReal 
              ? 'MIGRAR PARA LUCRO PRESUMIDO'
              : 'MIGRAR PARA SIMPLES NACIONAL'
            }
          </strong>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: 20, borderRadius: 12 }}>
          <div style={{ fontSize: 16, marginBottom: 12 }}>
            ✅ Próximos Passos:
          </div>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: 2 }}>
            <li>Consultar contador especializado em planejamento tributário</li>
            <li>Validar elegibilidade para o regime escolhido</li>
            <li>Preparar documentação para mudança de regime</li>
            <li>Solicitar alteração na Receita Federal</li>
            <li>Implementar controles contábeis adequados ao novo regime</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
