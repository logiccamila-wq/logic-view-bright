#!/bin/bash
# Script para remover Layouts duplicados das páginas
# Como o App.tsx já envolve todas as rotas com <Layout>, as páginas não devem ter seu próprio Layout

echo "🔧 Removendo Layouts duplicados das páginas..."

# Lista de arquivos para corrigir
FILES=(
  "src/pages/Approvals.tsx"
  "src/pages/Employees.tsx"
  "src/pages/ESG.tsx"
  "src/pages/Routing.tsx"
  "src/pages/ControlTowerRedesign.tsx"
  "src/pages/BankReconciliation.tsx"
  "src/pages/DRE.tsx"
  "src/pages/Admin.tsx"
  "src/pages/SCM.tsx"
  "src/pages/ControlTower.tsx"
  "src/pages/EHS.tsx"
  "src/pages/DriverApp.tsx"
  "src/pages/OMS.tsx"
  "src/pages/EIP.tsx"
  "src/pages/ExecutiveDashboard.tsx"
  "src/pages/Fleet.tsx"
  "src/pages/Settings.tsx"
  "src/pages/Mechanic.tsx"
  "src/pages/DriverJourney.tsx"
  "src/pages/MaintenanceLibrary.tsx"
  "src/pages/SuperGestor.tsx"
  "src/pages/AnalyticsDashboard.tsx"
  "src/pages/CentrosCusto.tsx"
  "src/pages/FolhaPagamento.tsx"
  "src/pages/AccountsPayable.tsx"
  "src/pages/Dashboard.tsx"
  "src/pages/PredictiveMaintenance.tsx"
  "src/pages/ImportVehicles.tsx"
  "src/pages/Documents.tsx"
  "src/pages/LiveTracking.tsx"
  "src/pages/Driver.tsx"
  "src/pages/ERP.tsx"
  "src/pages/DriverMacros.tsx"
  "src/pages/IoT.tsx"
  "src/pages/Users.tsx"
  "src/pages/PlanoContas.tsx"
  "src/pages/Partners.tsx"
  "src/pages/Permissions.tsx"
  "src/pages/JourneyManagement.tsx"
  "src/pages/Reports.tsx"
  "src/pages/MaintenanceChecklist.tsx"
  "src/pages/DriverPayroll.tsx"
  "src/pages/CRM.tsx"
  "src/pages/InnovationLab.tsx"
  "src/pages/Insurance.tsx"
  "src/pages/Lancamentos.tsx"
  "src/pages/WMS.tsx"
  "src/pages/AccountsReceivable.tsx"
  "src/pages/Developer.tsx"
  "src/pages/TMS.tsx"
  "src/pages/Gate.tsx"
  "src/pages/DriversManagement.tsx"
  "src/pages/LogisticsKPI.tsx"
  "src/pages/Inventory.tsx"
  "src/pages/CostMonitoring.tsx"
  "src/pages/PayrollManagement.tsx"
  "src/pages/ExecutiveReport.tsx"
)

count=0

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Processando: $file"
    
    # Remove import do Layout
    sed -i '/^import.*Layout.*from.*@\/components\/Layout/d' "$file"
    sed -i '/^import.*Layout.*from.*@\/components\/layout\/Layout/d' "$file"
    sed -i '/^import.*Layout.*from.*\.\.\/components\/Layout/d' "$file"
    
    # Salva em arquivo temporário removendo tags <Layout> e </Layout>
    # mas mantendo o conteúdo interno
    awk '
      /<Layout>/ { 
        layout_open = 1
        next 
      }
      /<\/Layout>/ { 
        layout_open = 0
        next 
      }
      { print }
    ' "$file" > "$file.tmp"
    
    mv "$file.tmp" "$file"
    
    ((count++))
  fi
done

echo "✅ Processados $count arquivos"
echo "🎯 Layouts duplicados removidos com sucesso!"
