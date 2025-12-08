import { useParams, useNavigate, Link } from "react-router-dom";
import { modules } from "@/modules/registry";

export default function ModulePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const mod = modules.find(m => m.slug === slug);

  if (!mod) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Módulo não encontrado</h2>
        <div className="mt-4">
          <button className="px-3 py-2 rounded bg-primary text-white" onClick={() => navigate(-1)}>Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{mod.name}</h1>
          <p className="text-muted-foreground">{mod.description}</p>
        </div>
        {mod.route && (
          <Link to={mod.route} className="px-3 py-2 rounded bg-primary text-white">Abrir</Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Atalhos</h3>
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded bg-secondary text-secondary-foreground">Novo</button>
            <button className="px-3 py-2 rounded bg-secondary text-secondary-foreground">Listar</button>
            <button className="px-3 py-2 rounded bg-secondary text-secondary-foreground">Configurar</button>
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Estado</h3>
          <div className="mt-3 text-sm text-muted-foreground">Em preparação</div>
        </div>
      </div>
    </div>
  );
}

