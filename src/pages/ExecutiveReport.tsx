import { useEffect, useRef, useState } from 'react'

export default function ExecutiveReport() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if ((window as any).Chart) {
      setScriptLoaded(true)
      return
    }
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js'
    s.async = true
    s.onload = () => setScriptLoaded(true)
    document.head.appendChild(s)
    return () => {
      try { document.head.removeChild(s) } catch {}
    }
  }, [])

  useEffect(() => {
    if (!scriptLoaded || !canvasRef.current) return
    const Chart = (window as any).Chart
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cavalos', 'Implementos'],
        datasets: [{ data: [65, 35], backgroundColor: ['#2563eb', '#64748b'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    })
  }, [scriptLoaded])

  const fleetData = [
    { id: 'f02', type: 'cavalo', vehicle: 'FROTA 02 (RCP3F78)', model: 'Volvo FH', status: 'critico', km: 621823, target: 572173, balance: -49650, action: 'PARADA IMEDIATA: Troca Óleo Motor/Filtros' },
    { id: 'f03', type: 'cavalo', vehicle: 'FROTA 03 (PES6F45)', model: 'Volvo FH', status: 'critico', km: 1251033, target: 1226842, balance: -24191, action: 'Revisão Geral (Motor + Diferencial)' },
    { id: 'f04', type: 'cavalo', vehicle: 'FROTA 04 (QQN8J78)', model: 'Volvo VM', status: 'critico', km: 700878, target: 695049, balance: -5829, action: 'Troca Óleo Caixa/Diferencial' },
    { id: 'f07', type: 'cavalo', vehicle: 'FROTA 07 (SOC0G05)', model: 'DAF XF', status: 'regular', km: 192241, target: 222241, balance: 30000, action: 'Operação Normal: Monitorar Ruídos' },
    { id: 'f08', type: 'cavalo', vehicle: 'FROTA 08 (BITRUCK)', model: 'Volvo VM', status: 'atencao', km: 656670, target: 660000, balance: 3330, action: 'Aferir Tacógrafo / Checar Níveis' },
    { id: 'c01', type: 'carreta', vehicle: 'KLU1I80 (Tanque Inox)', model: 'Implemento', status: 'critico', km: null as any, target: 3.0, balance: -0.06, isThickness: true, action: 'RISCO ESTRUTURAL: Laudo Caldeiraria' },
    { id: 'c02', type: 'carreta', vehicle: 'REBOQUE GENÉRICO 01', model: 'Randon', status: 'regular', km: 150000, target: 160000, balance: 10000, action: 'Verificar Lonas de Freio / 5ª Roda' }
  ] as any[]

  const formatVal = (item: any) => {
    if (item.isThickness) return item.km === null ? '2,94 mm' : item.km + ' mm'
    return new Intl.NumberFormat('pt-BR').format(item.km) + ' km'
  }
  const formatTarget = (item: any) => {
    if (item.isThickness) return 'Min: ' + new Intl.NumberFormat('pt-BR').format(item.target) + ' mm'
    return new Intl.NumberFormat('pt-BR').format(item.target) + ' km'
  }
  const formatBalance = (item: any) => {
    if (item.isThickness) return item.balance.toFixed(2) + ' mm'
    const prefix = item.balance > 0 ? '+' : ''
    return prefix + new Intl.NumberFormat('pt-BR').format(item.balance) + ' km'
  }
  const badge = (status: string) => {
    if (status === 'critico') return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">CRÍTICO</span>
    if (status === 'atencao') return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700">ATENÇÃO</span>
    return <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700">REGULAR</span>
  }

  const groups: Record<string, { title: string; items: any[] }> = {
    cavalo: { title: 'Cavalos Mecânicos (Trem de Força)', items: [] },
    carreta: { title: 'Implementos Rodoviários (Estrutura/Freios)', items: [] }
  }
  fleetData.forEach(i => groups[i.type].items.push(i))
  Object.values(groups).forEach(g => g.items.sort((a,b) => a.balance - b.balance))

  return (
    <div className="flex flex-col min-h-screen text-slate-800">
      <style>{`
        @media print { .no-print{display:none} body{background-color:#fff} .shadow-lg,.shadow-xl{box-shadow:none!important;border:1px solid #e2e8f0} .break-inside-avoid{page-break-inside:avoid} }
        .kpi-card{background:#fff;border-left:4px solid;transition:transform .2s} .kpi-card:hover{transform:translateY(-2px)}
        .table-header-group{background-color:#f1f5f9;text-transform:uppercase;font-size:.75rem;color:#64748b;font-weight:700;letter-spacing:.05em}
        .group-header{background-color:#e2e8f0;color:#334155;font-weight:800;padding:.75rem 1rem;font-size:.85rem;border-top:2px solid #cbd5e1}
      `}</style>
      <nav className="bg-slate-900 text-white py-3 px-6 no-print flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold opacity-80">Modo Apresentação Executiva</span>
          <span className="bg-blue-600 text-xs px-2 py-0.5 rounded font-bold">v2.0 Revisada</span>
        </div>
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-lg">🖨️ Imprimir Relatório</button>
      </nav>

      <main className="container mx-auto max-w-6xl px-6 py-8">
        <header className="mb-8 border-b pb-6 border-slate-200">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">Relatório de Inteligência de Frota</h1>
              <p className="text-slate-500 mt-2 font-medium">Análise Segmentada: Cavalos Mecânicos vs. Implementos Rodoviários</p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-xs text-slate-400 uppercase font-bold">Data do Relatório</p>
              <p className="text-lg font-bold text-slate-700">11 Dezembro 2025</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="kpi-card border-red-500 rounded-xl p-5 shadow-sm col-span-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Passivo de Risco Global</p>
            <div className="flex items-baseline mt-2 gap-2">
              <span className="text-4xl font-extrabold text-red-600">R$ 148.500</span>
              <span className="text-sm font-semibold text-red-400">Est. Corretiva</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Soma de risco: Motor/Caixa (Cavalos) + Estrutural (Tanques).</p>
          </div>

          <div className="kpi-card border-amber-500 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Veículos Críticos</p>
            <div className="flex items-baseline mt-2 gap-2">
              <span className="text-4xl font-extrabold text-slate-800">4</span>
              <span className="text-sm text-slate-500">Unidades</span>
            </div>
            <p className="text-xs text-amber-600 mt-2 font-medium">66% da frota ativa.</p>
          </div>

          <div className="kpi-card border-purple-600 rounded-xl p-5 shadow-sm bg-purple-50">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Risco Ambiental (Implemento)</p>
            <div className="flex items-center mt-2 gap-3">
              <span className="text-2xl">☣️</span>
              <div>
                <span className="text-base font-bold text-slate-900 block">KLU1I80</span>
                <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded">Espessura &lt; 3mm</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">Colapso de Tanque Inox.</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 break-inside-avoid">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Composição de Risco por Tipo</h3>
            <div className="flex items-center">
              <div className="w-1/2">
                <div className="relative w-full h-[250px]">
                  <canvas ref={canvasRef} />
                </div>
              </div>
              <div className="w-1/2 pl-6 space-y-4 text-sm">
                <div className="border-l-4 border-blue-600 pl-3">
                  <p className="font-bold text-slate-800">Cavalos (Powertrain)</p>
                  <p className="text-xs text-slate-500">Risco: Fundir Motor, Quebra de Caixa/Diferencial.</p>
                </div>
                <div className="border-l-4 border-slate-500 pl-3">
                  <p className="font-bold text-slate-800">Implementos (Rodante)</p>
                  <p className="text-xs text-slate-500">Risco: Freios, Suspensão, 5ª Roda, Tanque.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase">Pesquisa de Mercado (Custo Médio Peças)</h3>
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-400">Fonte: Web (Dez/25)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2">Componente</th>
                    <th className="py-2 px-2">Aplicação</th>
                    <th className="py-2 px-2 text-right">Custo Est. (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="py-2 px-2 font-medium">Kit Filtros (Ar/Óleo/Comb)</td><td className="py-2 px-2 text-slate-500">Volvo FH/VM</td><td className="py-2 px-2 text-right font-mono">R$ 790 - 1.200</td></tr>
                  <tr><td className="py-2 px-2 font-medium">Óleo Motor (35L)</td><td className="py-2 px-2 text-slate-500">Motor 13L / D13</td><td className="py-2 px-2 text-right font-mono">R$ 1.000 - 1.300</td></tr>
                  <tr><td className="py-2 px-2 font-medium">Lona de Freio (Jogo)</td><td className="py-2 px-2 text-slate-500">Carreta Randon/Guerra</td><td className="py-2 px-2 text-right font-mono">R$ 160 - 275</td></tr>
                  <tr><td className="py-2 px-2 font-medium">Reparo 5ª Roda (Jost)</td><td className="py-2 px-2 text-slate-500">Acoplamento</td><td className="py-2 px-2 text-right font-mono">R$ 600 - 900</td></tr>
                  <tr><td className="py-2 px-2 font-medium text-red-600">Retífica Motor (Risco)</td><td className="py-2 px-2 text-slate-500">Corretiva Completa</td><td className="py-2 px-2 text-right font-mono font-bold text-red-600">R$ 45.000+</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="break-inside-avoid">
          <h3 className="text-xl font-bold text-slate-900 mb-4 pl-3 border-l-4 border-blue-600">Status Operacional Detalhado</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="table-header-group">
                <tr>
                  <th className="p-4">Identificação</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">KM / Medição</th>
                  <th className="p-4 text-right">Meta / Limite</th>
                  <th className="p-4 text-right">Divergência</th>
                  <th className="p-4">Ação Técnica Recomendada</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(groups).map(g => (
                  <>
                    <tr><td colSpan={6} className="group-header">{g.title}</td></tr>
                    {g.items.map((item:any) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition border-b border-slate-50 last:border-0">
                        <td className="p-4"><span className="block font-bold text-slate-700">{item.vehicle}</span><span className="text-xs text-slate-400">{item.model}</span></td>
                        <td className="p-4">{badge(item.status)}</td>
                        <td className="p-4 text-right font-mono text-slate-600">{formatVal(item)}</td>
                        <td className="p-4 text-right font-mono text-slate-400 text-xs">{formatTarget(item)}</td>
                        <td className={`p-4 text-right font-mono ${item.balance < 0 ? 'text-red-600 font-bold' : 'text-emerald-600 font-medium'}`}>{formatBalance(item)}</td>
                        <td className="p-4 text-slate-700 text-sm font-medium">{item.action}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 pt-8 pb-12">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-grow">
              <h4 className="font-bold text-slate-800 mb-2">Parecer Técnico Final</h4>
              <p className="text-slate-600 text-sm leading-relaxed mb-2"><strong>1. Cavalos Mecânicos:</strong> Frotas 02 e 03 apresentam risco crítico de motor. A postergação da troca de óleo (passivo de 49k km) degrada bronzinas e anéis. Custo preventivo (~R$ 1.500) é ínfimo comparado à retífica (~R$ 45.000).</p>
              <p className="text-slate-600 text-sm leading-relaxed"><strong>2. Implementos:</strong> A carreta KLU1I80 apresenta espessura de tanque (2,94mm) abaixo da norma de segurança. <strong>Risco ambiental severo.</strong> Recomendamos laudo hidrostático imediato e restrição de carga perigosa.</p>
            </div>
            <div className="min-w-[200px] border-l border-slate-200 pl-6 hidden md:block">
              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Validação</p>
              <div className="h-16 w-full border-b border-slate-300 mb-1"></div>
              <p className="text-sm font-bold text-slate-900">Diretoria Operacional</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

