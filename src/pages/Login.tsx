import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import optilogLogo from "@/assets/optilog-logo.png";
import ejgLogo from "@/assets/ejg-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      // Error is handled in signIn function
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src={optilogLogo} alt="OptiLog" className="h-12 w-auto" />
            <div className="h-12 w-px bg-border" />
            <img src={ejgLogo} alt="EJG Transportes" className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription className="text-muted-foreground">
            Acesse sua conta EJG Evolução em Transporte Ltda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
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
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando..." : "ENTRAR"}
            </Button>
            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              Dados protegidos com criptografia
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
