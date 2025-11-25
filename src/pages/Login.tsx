import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import optilogLogo from "@/assets/optilog-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, roles, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Redirecionar usuário autenticado conforme o papel
  useEffect(() => {
    if (!user || authLoading) return;

    const onlyMechanic = roles.length > 0 && roles.every((r) =>
      r === "fleet_maintenance" || r === "maintenance_assistant"
    );

    const onlyDriver = roles.length === 1 && roles[0] === "driver";

    if (onlyMechanic) {
      navigate("/mechanic");
    } else if (onlyDriver) {
      navigate("/driver");
    } else {
      navigate("/dashboard");
    }
  }, [user, roles, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação obrigatória
    if (!email.trim()) {
      toast.error('Por favor, informe o email');
      return;
    }
    
    if (!password) {
      toast.error('Por favor, informe a senha');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      // Error is handled in signIn function
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast.success("Email enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar email de redefinição");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center mb-4">
            <img src={optilogLogo} alt="LogicFlow AI" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl">
            {resetMode ? "Redefinir Senha" : "Entrar"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {resetMode
              ? "Digite seu e-mail para receber as instruções"
              : "Acesse sua conta Optilog"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetSent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Um e-mail com as instruções foi enviado para <strong>{email}</strong>
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setResetSent(false);
                  setResetMode(false);
                }}
              >
                Voltar ao Login
              </Button>
            </div>
          ) : (
            <form onSubmit={resetMode ? handleResetPassword : handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {!resetMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (resetMode ? "Enviando..." : "Entrando...") : (resetMode ? "ENVIAR E-MAIL" : "ENTRAR")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setResetMode(!resetMode)}
                disabled={loading}
              >
                {resetMode ? "Voltar ao Login" : "Esqueci minha senha"}
              </Button>
              <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Lock className="w-3 h-3" />
                Seus dados estão protegidos por criptografia de ponta a ponta.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
