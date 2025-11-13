import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Users as UsersIcon } from "lucide-react";
import { UserFormDialog } from "@/components/UserFormDialog";

interface UserData {
  id: string;
  nome: string;
  email: string;
  role: "admin" | "motorista" | "mecanico" | "gestor";
  status: "ativo" | "inativo";
}

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const mockUsers: UserData[] = [
    { id: "1", nome: "João Silva", email: "joao@optilog.com", role: "motorista", status: "ativo" },
    { id: "2", nome: "Maria Santos", email: "maria@optilog.com", role: "mecanico", status: "ativo" },
    { id: "3", nome: "Pedro Costa", email: "pedro@optilog.com", role: "gestor", status: "ativo" },
    { id: "4", nome: "Ana Lima", email: "ana@optilog.com", role: "admin", status: "ativo" },
  ];

  const filteredUsers = mockUsers.filter(u =>
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: UserData["role"]) => {
    const variants = {
      admin: { label: "Admin", className: "bg-purple-500/20 text-purple-600" },
      motorista: { label: "Motorista", className: "bg-blue-500/20 text-blue-600" },
      mecanico: { label: "Mecânico", className: "bg-orange-500/20 text-orange-600" },
      gestor: { label: "Gestor", className: "bg-green-500/20 text-green-600" },
    };
    return variants[role];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Adicionar Usuário
          </Button>
        </div>

        <UserFormDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
          onSuccess={() => {
            // Reload users list here in future
          }}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total de Usuários" value="48" icon={UsersIcon} />
          <StatCard title="Motoristas" value="28" icon={User} />
          <StatCard title="Mecânicos" value="12" icon={User} />
          <StatCard title="Gestores" value="8" icon={User} />
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* User List */}
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{user.nome}</h3>
                        <Badge className={getRoleBadge(user.role).className}>
                          {getRoleBadge(user.role).label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Users;
