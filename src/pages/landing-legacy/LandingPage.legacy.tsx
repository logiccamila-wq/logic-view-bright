import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Check, BarChart3, Truck, Shield, Zap, ShoppingBag, Users, Globe, 
  PlayCircle, Mail, Phone, TrendingUp, DollarSign, Package, MapPin, Clock, 
  Star, Sparkles, Rocket, Target, Award, ChevronRight, Menu, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function LandingPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Lead Gen State
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [utm, setUtm] = useState<{ source?: string; medium?: string; campaign?: string; term?: string; content?: string; referrer?: string }>({});

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setUtm({
      source: p.get('utm_source') || undefined,
      medium: p.get('utm_medium') || undefined,
      campaign: p.get('utm_campaign') || undefined,
      term: p.get('utm_term') || undefined,
      content: p.get('utm_content') || undefined,
      referrer: document.referrer || undefined,
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Erro ao fazer login", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('leads' as any).insert({
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        company: leadCompany,
        source: 'landing',
        status: 'new'
        , utm_source: utm.source, utm_medium: utm.medium, utm_campaign: utm.campaign, utm_term: utm.term, utm_content: utm.content, referrer: utm.referrer
      });
      if (error) throw error;
      toast.success("Cadastro recebido com sucesso!", {
        description: "Nossa equipe entrará em contato em breve para liberar seu teste grátis.",
      });
      setLeadName("");
      setLeadEmail("");
      setLeadPhone("");
      setLeadCompany("");
    } catch (err: any) {
      toast.error("Não foi possível registrar seu cadastro", {
        description: err?.message || 'Tente novamente mais tarde',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header Top Bar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-20 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 font-extrabold text-3xl tracking-tighter text-primary">
            <Zap className="h-8 w-8 fill-primary text-primary-foreground" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">XYZLogicFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#marketplace" className="text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"><ShoppingBag className="w-4 h-4" /> Marketplace</a>
            <a href="#solutions" className="text-foreground/80 hover:text-primary transition-colors">Soluções</a>
            <a href="#pricing" className="text-foreground/80 hover:text-primary transition-colors">Planos</a>
            <a href="#contact" className="text-foreground/80 hover:text-primary transition-colors">Contato</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden sm:flex" onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}>
              Teste Grátis
            </Button>
            <Button onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Área do Cliente
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section with Marketplace Focus */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background -z-10" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10" />
          
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-700">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-lg">
                  Novo Marketplace Disponível
                </div>
                <h1 className="text-5xl font-black tracking-tight lg:text-7xl text-foreground leading-tight">
                  O Marketplace da <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Logística Global</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                  Conecte-se a fornecedores, gerencie sua frota e expanda seus negócios. A plataforma definitiva para o setor de transporte e logística.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="gap-2 h-12 px-8 text-lg shadow-xl shadow-primary/20" onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}>
                    Começar Agora <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="secondary" className="h-12 px-8 text-lg" onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}>
                    <PlayCircle className="mr-2 h-5 w-5" /> Ver Demo
                  </Button>
                </div>
                
                <div className="pt-8 border-t flex items-center gap-8">
                  <div>
                    <p className="text-3xl font-bold text-foreground">2.5k+</p>
                    <p className="text-sm text-muted-foreground">Empresas Ativas</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">98%</p>
                    <p className="text-sm text-muted-foreground">Satisfação</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">24/7</p>
                    <p className="text-sm text-muted-foreground">Suporte Real</p>
                  </div>
                </div>
              </div>

              {/* Marketplace Preview / Hero Image */}
              <div className="relative lg:ml-auto animate-in fade-in slide-in-from-right-10 duration-700 delay-200">
                <div className="relative rounded-xl border bg-background shadow-2xl p-2">
                  <div className="rounded-lg overflow-hidden bg-muted/50 aspect-video flex items-center justify-center relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                      <h3 className="text-white text-2xl font-bold mb-2">Ecossistema Integrado</h3>
                      <p className="text-white/80">Acesse peças, serviços e fretes em um só lugar.</p>
                    </div>
                    <img 
                      src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop" 
                      alt="Logistics Dashboard" 
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
                {/* Floating Badges */}
                <div className="absolute -left-8 top-20 bg-background p-4 rounded-lg shadow-xl border flex items-center gap-3 animate-bounce duration-3000">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Frete Disponível</p>
                    <p className="text-xs text-muted-foreground">R$ 4.500,00 - SP/RJ</p>
                  </div>
                </div>
                <div className="absolute -right-8 bottom-20 bg-background p-4 rounded-lg shadow-xl border flex items-center gap-3 animate-bounce duration-3000 delay-1000">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Nova Venda</p>
                    <p className="text-xs text-muted-foreground">Kit Pneus x4</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace Section */}
        <section id="marketplace" className="py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4 text-foreground">Marketplace de Oportunidades</h2>
              <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
                Tudo o que sua transportadora precisa para operar, crescer e lucrar.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group hover:shadow-xl transition-all duration-300 border-primary/10 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <ShoppingBag className="w-16 h-16 text-primary/40" />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Peças & Pneus</CardTitle>
                  <CardDescription>Compre com descontos exclusivos da rede</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Pneus com 15% OFF</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Peças originais</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Entrega expressa</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Acessar Loja</Button>
                </CardFooter>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-primary/10 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <Globe className="w-16 h-16 text-green-600/40" />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Balcão de Fretes</CardTitle>
                  <CardDescription>Encontre cargas para retorno e rotas lucrativas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Cargas verificadas</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Pagamento garantido</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Rotas otimizadas</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Ver Cargas</Button>
                </CardFooter>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-primary/10 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                  <Users className="w-16 h-16 text-orange-600/40" />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Rede de Parceiros</CardTitle>
                  <CardDescription>Conecte-se com oficinas e postos credenciados</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Oficinas 24h</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Postos com cashback</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Seguradoras</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Encontrar Parceiros</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Split Section: Lead Gen & Login */}
        <section id="login-section" className="py-24 bg-background relative">
          <div className="container px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              
              {/* Lead Gen Form */}
              <div id="lead-form" className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Comece Grátis Hoje</h2>
                  <p className="text-muted-foreground text-lg">
                    Junte-se a milhares de empresas que transformaram sua logística com o XYZLogicFlow.
                    Teste todas as funcionalidades por 14 dias, sem compromisso.
                  </p>
                </div>

                <Card className="border-l-4 border-l-primary shadow-lg">
                  <CardHeader>
                    <CardTitle>Cadastro Rápido</CardTitle>
                    <CardDescription>Preencha para liberar seu acesso de teste.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLeadSubmit} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input 
                          id="name" 
                          placeholder="Seu nome" 
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lead-email">Email Corporativo</Label>
                        <Input 
                          id="lead-email" 
                          type="email" 
                          placeholder="voce@empresa.com" 
                          value={leadEmail}
                          onChange={(e) => setLeadEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                        <Input 
                          id="phone" 
                          placeholder="(11) 99999-9999" 
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full text-lg h-12 bg-primary hover:bg-primary/90">
                        Solicitar Acesso Grátis
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="bg-muted/20 text-xs text-muted-foreground p-4">
                    Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
                  </CardFooter>
                </Card>

                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail className="w-5 h-5 text-primary" />
                      <span>contato@xyzlogicflow.com</span>
                   </div>
                   <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone className="w-5 h-5 text-primary" />
                      <span>0800 123 4567</span>
                   </div>
                </div>
              </div>

              {/* Client Portal Login */}
              <div className="space-y-8 lg:pl-12 lg:border-l">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Portal do Cliente</h2>
                  <p className="text-muted-foreground text-lg">
                    Acesso exclusivo para clientes e parceiros.
                  </p>
                </div>

                <Card className="shadow-2xl border-t-4 border-t-blue-600">
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Acesso Seguro</CardTitle>
                    <CardDescription>Entre com suas credenciais</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="ejg" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="ejg">EJG Logística</TabsTrigger>
                        <TabsTrigger value="albuquerque">Albuquerque</TabsTrigger>
                        <TabsTrigger value="parceiro">Parceiros</TabsTrigger>
                      </TabsList>
                      <TabsContent value="ejg">
                        <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md text-xs border border-blue-100 flex items-center gap-2">
                           <Shield className="w-3 h-3" /> Acesso Corporativo EJG
                        </div>
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email-ejg">Email Corporativo</Label>
                            <Input 
                              id="email-ejg" 
                              type="email" 
                              placeholder="usuario@ejg.com.br" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="password-ejg">Senha</Label>
                              <a href="/reset-password" className="text-sm text-primary hover:underline">Esqueceu?</a>
                            </div>
                            <Input 
                              id="password-ejg" 
                              type="password" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required 
                            />
                          </div>
                          <Button type="submit" className="w-full h-10" disabled={loading}>
                            {loading ? "Autenticando..." : "Acessar Sistema EJG"}
                          </Button>
                        </form>
                      </TabsContent>
                      <TabsContent value="albuquerque">
                        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md text-xs border border-green-100 flex items-center gap-2">
                           <Shield className="w-3 h-3" /> Portal Albuquerque Química
                        </div>
                         <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="email-alb">Email Corporativo</Label>
                            <Input 
                              id="email-alb" 
                              type="email" 
                              placeholder="usuario@albuquerque.com" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required 
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="password-alb">Senha</Label>
                              <a href="/reset-password" className="text-sm text-primary hover:underline">Esqueceu?</a>
                            </div>
                            <Input 
                              id="password-alb" 
                              type="password" 
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required 
                            />
                          </div>
                          <Button type="submit" className="w-full h-10 bg-green-600 hover:bg-green-700" disabled={loading}>
                            {loading ? "Autenticando..." : "Acessar Albuquerque"}
                          </Button>
                        </form>
                      </TabsContent>
                      <TabsContent value="parceiro">
                        <div className="text-center py-8 space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Acesso para fornecedores e parceiros comerciais (Marketplace).
                          </p>
                          <Button variant="outline" className="w-full">
                            Acessar Portal de Parceiros
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="justify-center border-t p-4 bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Ambiente seguro e monitorado.
                    </p>
                  </CardFooter>
                </Card>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800 flex gap-2">
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    <strong>Nota:</strong> O acesso ao sistema EJG e outras empresas é segregado. Certifique-se de usar o email corporativo correto.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl">
                <Zap className="h-5 w-5" />
                <span>XYZLogicFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transformando a logística com tecnologia e inteligência.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Marketplace</a></li>
                <li><a href="#" className="hover:text-foreground">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-foreground">Preços</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-foreground">Carreiras</a></li>
                <li><a href="#" className="hover:text-foreground">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 XYZLogicFlow. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
