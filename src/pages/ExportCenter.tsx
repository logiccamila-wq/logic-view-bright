import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Table, FileSpreadsheet, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ExportCenter() {
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState<string>("cte");
  const [format, setFormat] = useState<string>("csv");

  const exportData = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      let filename = "";

      switch (exportType) {
        case "cte":
          const { data: cteData } = await supabase.from("cte").select("*").order("created_at", { ascending: false });
          data = cteData || [];
          filename = `cte_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case "vehicles":
          const { data: vehiclesData } = await supabase.from("vehicles").select("*").order("placa");
          data = vehiclesData || [];
          filename = `veiculos_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case "drivers":
          const { data: driversData } = await supabase
            .from("drivers")
            .select("*, employee:employees(nome, cpf, email)")
            .order("created_at", { ascending: false });
          data = driversData || [];
          filename = `motoristas_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case "employees":
          const { data: empData } = await supabase.from("employees").select("*").order("nome");
          data = empData || [];
          filename = `funcionarios_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case "trips":
          const { data: tripsData } = await supabase.from("trips").select("*").order("created_at", { ascending: false });
          data = tripsData || [];
          filename = `viagens_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case "refuelings":
          const { data: refData } = await supabase.from("refuelings").select("*").order("data", { ascending: false });
          data = refData || [];
          filename = `abastecimentos_export_${new Date().toISOString().split('T')[0]}`;
          break;

        case "service_orders":
          const { data: soData } = await supabase.from("service_orders").select("*").order("created_at", { ascending: false });
          data = soData || [];
          filename = `ordens_servico_export_${new Date().toISOString().split('T')[0]}`;
          break;

        default:
          throw new Error("Tipo de exportação não suportado");
      }

      if (data.length === 0) {
        toast.warning("Nenhum dado encontrado para exportar");
        return;
      }

      if (format === "csv") {
        exportToCSV(data, filename);
      } else if (format === "json") {
        exportToJSON(data, filename);
      } else if (format === "xlsx") {
        toast.info("Exportação XLSX será implementada em breve");
      }

      toast.success(`${data.length} registros exportados com sucesso!`);
    } catch (error: any) {
      console.error("Erro ao exportar:", error);
      toast.error(error.message || "Erro ao exportar dados");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    // Extrair headers
    const headers = Object.keys(data[0]);
    
    // Criar conteúdo CSV
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escapar valores com vírgula ou aspas
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      )
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToJSON = (data: any[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  };

  const exportOptions = [
    { value: "cte", label: "CTe (Conhecimentos de Transporte)", icon: FileText },
    { value: "vehicles", label: "Veículos e Placas", icon: Package },
    { value: "drivers", label: "Motoristas", icon: FileText },
    { value: "employees", label: "Funcionários", icon: FileText },
    { value: "trips", label: "Viagens", icon: FileText },
    { value: "refuelings", label: "Abastecimentos", icon: FileText },
    { value: "service_orders", label: "Ordens de Serviço", icon: FileText },
  ];

  const formatOptions = [
    { value: "csv", label: "CSV", icon: Table },
    { value: "json", label: "JSON", icon: FileText },
    { value: "xlsx", label: "Excel (Em breve)", icon: FileSpreadsheet, disabled: true },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Central de Exportações</h1>
        <p className="text-muted-foreground">
          Exporte dados do sistema em diversos formatos
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Dados
            </CardTitle>
            <CardDescription>
              Selecione o tipo de dados e formato para exportação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Dados</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                      <div className="flex items-center gap-2">
                        <opt.icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={exportData} 
              disabled={loading} 
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? "Exportando..." : "Exportar"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exportações Rápidas</CardTitle>
            <CardDescription>
              Atalhos para exportações mais comuns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                setExportType("cte");
                setFormat("csv");
                setTimeout(() => exportData(), 100);
              }}
            >
              <FileText className="h-4 w-4" />
              Exportar CTes (CSV)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                setExportType("vehicles");
                setFormat("csv");
                setTimeout(() => exportData(), 100);
              }}
            >
              <Package className="h-4 w-4" />
              Exportar Veículos (CSV)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                setExportType("employees");
                setFormat("csv");
                setTimeout(() => exportData(), 100);
              }}
            >
              <FileText className="h-4 w-4" />
              Exportar Funcionários (CSV)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
