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

interface UserData {
  id: string;
  full_name: string;
  email: string;
  roles: string[];
  status: "ativo" | "inativo";
  nome?: string;
}

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

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

      const userIds = profiles.map(p => p.id);
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      const rolesMap = new Map();
      rolesData.forEach(r => {
        if (!rolesMap.has(r.user_id)) rolesMap.set(r.user_id, []);
        rolesMap.get(r.user_id).push(r.role);
      });

      const enrichedUsers: UserData[] = profiles.map(profile => ({
        id: profile.id,
        full_name: profile.full_name || profile.email,
        nome: profile.full_name || profile.email,
        email: profile.email,
        roles: rolesMap.get(profile.id) || [],
        status: 'ativo'
      }));

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    ((u.nome || u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (roles: string[]) => {
    return roles.map(role => (
      <Badge key={role} className="bg-blue-500/20 text-blue-600 mr-1">
        {role}
      </Badge>
    ));
  };

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
          {loading ? (
            <div>Carregando usuários...</div>
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
  );
};

export default Users;
