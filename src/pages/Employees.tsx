import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { DriverDialog } from "@/components/drivers/DriverDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const pageSize = 10;
  const { employees, totalCount, totalPages, isLoading, createEmployee, updateEmployee, deleteEmployee } =
    useEmployees(searchTerm, currentPage, pageSize);

  const handleOpenEmployeeDialog = (employee?: any) => {
    setSelectedEmployee(employee || null);
    setEmployeeDialogOpen(true);
  };

  const handleOpenDriverDialog = (employee: any) => {
    setSelectedEmployee(employee);
    setDriverDialogOpen(true);
  };

  const handleSaveEmployee = async (employeeData: any) => {
    if (selectedEmployee?.id) {
      await updateEmployee.mutateAsync({ id: selectedEmployee.id, ...employeeData });
    } else {
      await createEmployee.mutateAsync(employeeData);
    }
    setEmployeeDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleDeleteClick = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      await deleteEmployee.mutateAsync(employeeToDelete);
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const getTipoVinculoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      CLT: "bg-blue-500/20 text-blue-600",
      SOCIO: "bg-purple-500/20 text-purple-600",
      CONSULTOR: "bg-green-500/20 text-green-600",
      PRESTADOR: "bg-orange-500/20 text-orange-600",
    };
    return colors[tipo] || "bg-gray-500/20 text-gray-600";
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestão de Funcionários</h1>
          <Button className="gap-2" onClick={() => handleOpenEmployeeDialog()}>
            <Plus className="w-4 h-4" />
            Adicionar Funcionário
          </Button>
        </div>

        <EmployeeDialog
          open={employeeDialogOpen}
          onOpenChange={setEmployeeDialogOpen}
          employee={selectedEmployee}
          onSave={handleSaveEmployee}
          isSaving={createEmployee.isPending || updateEmployee.isPending}
        />

        <DriverDialog
          open={driverDialogOpen}
          onOpenChange={setDriverDialogOpen}
          driver={null}
          employeeId={selectedEmployee?.id || ""}
          onSave={async (driverData) => {
            // Implementar lógica de salvamento do motorista
            setDriverDialogOpen(false);
          }}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total de Funcionários" value={totalCount.toString()} icon={User} />
          <StatCard
            title="Motoristas"
            value={employees.filter((e) => e.cargo === "MOTORISTA").length.toString()}
            icon={Briefcase}
          />
          <StatCard
            title="CLT"
            value={employees.filter((e) => e.tipo_vinculo === "CLT").length.toString()}
            icon={User}
          />
          <StatCard
            title="Sócios"
            value={employees.filter((e) => e.tipo_vinculo === "SOCIO").length.toString()}
            icon={User}
          />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, CPF ou email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold">{employee.nome}</h3>
                          <Badge className={getTipoVinculoBadge(employee.tipo_vinculo)}>
                            {employee.tipo_vinculo}
                          </Badge>
                          <Badge variant="outline">{employee.cargo}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          CPF: {employee.cpf} {employee.email && `• ${employee.email}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Admitido em: {new Date(employee.data_admissao).toLocaleDateString("pt-BR")}
                          {employee.salario && ` • Salário: R$ ${employee.salario.toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {employee.cargo === "MOTORISTA" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDriverDialog(employee)}
                        >
                          Dados de Motorista
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEmployeeDialog(employee)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(employee.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
  );
};

export default Employees;
