import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Users as UsersIcon } from "lucide-react";
import { UserFormDialog } from "@/components/UserFormDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserData {
  id: string;
  full_name: string;
  email: string;
  roles: string[];
  status: "ativo" | "inativo";
  nome?: string;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  driver: "Motorista",
  finance: "Financeiro",
  operations: "Operações",
  commercial: "Comercial",
  fleet_maintenance: "Manutenção de Frota",
  maintenance_assistant: "Auxiliar de Manutenção",
  logistics_manager: "Gerente de Logística",
  maintenance_manager: "Gerente de Manutenção",
};

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const userIds = (profiles || []).map((p: any) => p.id);
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      const rolesMap = new Map<string, string[]>();
      (rolesData || []).forEach((r: any) => {
        if (!rolesMap.has(r.user_id)) rolesMap.set(r.user_id, []);
        rolesMap.get(r.user_id)!.push(r.role);
      });

      const enrichedUsers: UserData[] = (profiles || []).map((profile: any) => ({
        id: profile.id,
        full_name: profile.full_name || profile.email,
        nome: profile.full_name || profile.email,
        email: profile.email,
        roles: rolesMap.get(profile.id) || [],
        status: 'ativo',
      }));

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (user: UserData) => {
    setSelectedUser(user);
    setEditName(user.full_name);
    setEditRole(user.roles[0] || "");
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    if (!editRole) {
      toast.error("Selecione um perfil de acesso para o usuário");
      return;
    }
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: editName } as any)
        .eq('id', selectedUser.id);
      if (profileError) throw profileError;

      // Remove existing roles and add new one
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{ user_id: selectedUser.id, role: editRole }] as any);
      if (insertError) throw insertError;

      toast.success("Usuário atualizado com sucesso!");
      setEditDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error(error.message || "Erro ao atualizar usuário");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inativo' } as any)
        .eq('id', userToDelete);
      if (error) throw error;
      toast.success("Usuário desativado com sucesso!");
      loadUsers();
    } catch (error: any) {
      console.error("Erro ao desativar usuário:", error);
      toast.error(error.message || "Erro ao desativar usuário");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(u =>
    ((u.nome || u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (roles: string[]) => {
    return roles.map(role => (
      <Badge key={role} className="bg-blue-500/20 text-blue-600 mr-1">
        {roleLabels[role] || role}
      </Badge>
    ));
  };

  const driverCount = users.filter(u => u.roles.includes("driver")).length;
  const maintenanceCount = users.filter(u => u.roles.includes("fleet_maintenance") || u.roles.includes("maintenance_assistant") || u.roles.includes("maintenance_manager")).length;
  const managerCount = users.filter(u => u.roles.includes("admin") || u.roles.includes("logistics_manager") || u.roles.includes("maintenance_manager")).length;

  return (
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
          onSuccess={loadUsers}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total de Usuários" value={String(users.length)} icon={UsersIcon} />
          <StatCard title="Motoristas" value={String(driverCount)} icon={User} />
          <StatCard title="Equipe de Manutenção" value={String(maintenanceCount)} icon={User} />
          <StatCard title="Gestores" value={String(managerCount)} icon={User} />
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
          {loading ? (
            <div>Carregando usuários...</div>
          ) : filteredUsers.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">Nenhum usuário encontrado.</CardContent></Card>
          ) : filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{user.full_name || user.nome}</h3>
                        {getRoleBadge(user.roles)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nome do usuário"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Perfil de Acesso</Label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Desativar Usuário</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja desativar este usuário? O acesso ao sistema será revogado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Desativar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default Users;
