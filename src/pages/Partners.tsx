import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, DollarSign, TrendingUp, PieChart } from "lucide-react";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { DistributionDialog } from "@/components/partners/DistributionDialog";
import { PartnerDialog } from "@/components/partners/PartnerDialog";
import { PartnershipChart } from "@/components/partners/PartnershipChart";

export default function Partners() {
  const [showDistributionDialog, setShowDistributionDialog] = useState(false);
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);

  const { data: partners, refetch } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select(`
          *,
          profiles(full_name, email)
        `)
        .eq("status", "ativo")
        .order("participacao_percentual", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: distributions } = useQuery({
    queryKey: ["partner_distributions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_distributions")
        .select(`
          *,
          partner:partners(
            razao_social,
            profiles(full_name)
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const capitalTotal = partners?.reduce((sum, p) => sum + (Number(p.valor_capital_social) || 0), 0) || 0;
  const prolaboreTotal = partners?.reduce((sum, p) => sum + (Number(p.prolabore_mensal) || 0), 0) || 0;
  const distributionsThisYear = distributions?.filter(d => 
    new Date(d.created_at).getFullYear() === new Date().getFullYear()
  ).reduce((sum, d) => sum + Number(d.valor_liquido), 0) || 0;

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Sócios</h1>
            <p className="text-muted-foreground">Controle societário e distribuição de lucros</p>
          </div>
          <Button onClick={() => setShowPartnerDialog(true)}>
            <Users className="mr-2 h-4 w-4" />
            Adicionar Sócio
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Total de Sócios</div>
            </div>
            <div className="text-2xl font-bold mt-2">{partners?.length || 0}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Capital Social</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              {capitalTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Pro-labore Mensal</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              {prolaboreTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Distribuído em {new Date().getFullYear()}</div>
            </div>
            <div className="text-2xl font-bold mt-2">
              {distributionsThisYear.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </Card>
        </div>

        <Tabs defaultValue="socios" className="w-full">
          <TabsList>
            <TabsTrigger value="socios">Sócios</TabsTrigger>
            <TabsTrigger value="distribuicoes">Distribuições</TabsTrigger>
            <TabsTrigger value="grafico">Participação</TabsTrigger>
          </TabsList>

          <TabsContent value="socios" className="space-y-4">
            {partners?.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} onUpdate={refetch} />
            ))}
          </TabsContent>

          <TabsContent value="distribuicoes" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowDistributionDialog(true)}>
                Nova Distribuição
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Sócio</th>
                      <th className="text-left p-4">Tipo</th>
                      <th className="text-left p-4">Período</th>
                      <th className="text-right p-4">Valor Bruto</th>
                      <th className="text-right p-4">Valor Líquido</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributions?.map((dist) => (
                      <tr key={dist.id} className="border-b">
                        <td className="p-4">{dist.partner?.profiles?.full_name || dist.partner?.razao_social}</td>
                        <td className="p-4">{dist.tipo_distribuicao}</td>
                        <td className="p-4">{dist.periodo_mes}/{dist.periodo_ano}</td>
                        <td className="p-4 text-right">
                          {Number(dist.valor_bruto).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-4 text-right">
                          {Number(dist.valor_liquido).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            dist.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {dist.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="grafico">
            <PartnershipChart partners={partners || []} />
          </TabsContent>
        </Tabs>
      </div>

      <PartnerDialog 
        open={showPartnerDialog}
        onOpenChange={setShowPartnerDialog}
        onSuccess={refetch}
      />

      <DistributionDialog
        open={showDistributionDialog}
        onOpenChange={setShowDistributionDialog}
        partners={partners || []}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
