import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EJGChatbot } from "@/components/EJGChatbot";
import { useAuth } from "@/contexts/AuthContext";

const SuperGestor = () => {
  const { roles } = useAuth();
  const canAccess = roles.includes("super_consultant") || roles.includes("admin");

  if (!canAccess) {
    return (
      <Layout>
        <div className="p-6">
          <Card><CardContent className="p-6">Acesso restrito.</CardContent></Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">SuperGestor</h1>
          <Button variant="modern">Executar Auditoria</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardContent className="p-4">KPIs consolidados da empresa</CardContent></Card>
          <Card><CardContent className="p-4">Insights de finanças e operações</CardContent></Card>
        </div>
        <EJGChatbot />
      </div>
    </Layout>
  );
};

export default SuperGestor;

