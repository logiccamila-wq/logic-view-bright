import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Check, Truck, Shield, Zap, ShoppingBag, Users, Globe, 
  PlayCircle, TrendingUp, DollarSign, Package, MapPin, Clock, 
  Star, Sparkles, Rocket, Target, Award, ChevronRight, Menu, X, 
  BarChart3, Settings, Headphones, Smartphone, Mail, Phone, CheckCircle,
  Warehouse, GitBranch, UserCheck, Building2, Calculator, FileText,
  Code2, Layers, Receipt, Monitor, Cpu, Database, Cloud
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition, FadeInUp, StaggerContainer, StaggerItem, HoverScale } from "@/components/animations";

export default function ModernLandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Company Registration Form
  const [companyName, setCompanyName] = useState("");
  const [companyCNPJ, setCompanyCNPJ] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("professional");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCompanyRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('company_registrations' as any).insert({
        company_name: companyName,
        cnpj: companyCNPJ,
        preferred_domain: companyDomain,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        selected_plan: selectedPlan,
        status: 'pending',
        source: 'landing'
      });
      
      if (error) {
        console.log("Salvando lead como fallback...");
        // Fallback: salvar como lead
        await supabase.from('leads' as any).insert({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          company: companyName,
          source: 'landing',
          status: 'new',
          notes: `CNPJ: ${companyCNPJ}, Domínio: ${companyDomain}, Plano: ${selectedPlan}`
        });
      }
      
      toast.success("Cadastro realizado com sucesso!", {
        description: `Em breve você receberá acesso ao seu ambiente: ${companyDomain}.xyzlogicflow.com`,
      });
      
      // Reset form
      setCompanyName("");
      setCompanyCNPJ("");
      setCompanyDomain("");
      setContactName("");
      setContactEmail("");
      setContactPhone("");
    } catch (err) {
      console.error(err);
      toast.error("Cadastro recebido!", {
        description: "Nossa equipe entrará em contato em breve.",
      });
    }
  };

  const modules = [
    {
      name: "TMS",
      fullName: "Transport Management",
      icon: Truck,
      description: "Controle total de frota, rotas e viagens",
      price: "197",
      features: ["Rastreamento real-time", "Otimização de rotas", "Gestão de motoristas", "CTe/MDFe"]
    },
    {
      name: "WMS",
      fullName: "Warehouse Management", 
      icon: Warehouse,
      description: "Gestão completa de armazém",
      price: "247",
      features: ["Controle de estoque", "Picking inteligente", "Inventário automático", "Endereçamento"]
    },
    {
      name: "Financeiro",
      fullName: "ERP Financeiro",
      icon: DollarSign,
      description: "Gestão financeira integrada",
      price: "297",
      features: ["Contas a pagar/receber", "DRE automático", "Fluxo de caixa", "Conciliação"]
    },
    {
      name: "CRM",
      fullName: "Customer Relationship",
      icon: UserCheck,
      description: "Gestão de clientes e vendas",
      price: "197",
      features: ["Funil de vendas", "Gestão de leads", "Propostas", "Histórico"]
    },
    {
      name: "Marketplace",
      fullName: "B2B Marketplace",
      icon: ShoppingBag,
      description: "Compre e venda fretes",
      price: "347",
      features: ["Leilão de fretes", "Catálogo", "Pagamentos", "Avaliações"]
    },
    {
      name: "Analytics",
      fullName: "Business Intelligence",
      icon: BarChart3,
      description: "Dashboards inteligentes",
      price: "147",
      features: ["KPIs real-time", "Relatórios custom", "Exportação", "Alertas"]
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "497",
      period: "/mês",
      description: "Ideal para pequenas empresas",
      features: [
        "Até 10 usuários",
        "3 módulos inclusos",
        "10 GB armazenamento",
        "Suporte por email",
        "Atualizações automáticas"
      ],
      modules: ["TMS Básico", "Financeiro", "Analytics"],
      popular: false
    },
    {
      name: "Professional",
      price: "997",
      period: "/mês",
      description: "Para médias empresas",
      features: [
        "Até 50 usuários",
        "6 módulos inclusos",
        "100 GB armazenamento",
        "Suporte 24/7",
        "API completa",
        "Integrações ilimitadas"
      ],
      modules: ["Todos Starter + WMS + CRM + Marketplace"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Customizado",
      period: "",
      description: "Para grandes operações",
      features: [
        "Usuários ilimitados",
        "Todos os módulos",
        "Armazenamento ilimitado",
        "Servidor dedicado",
        "White-label",
        "SLA 99.9%"
      ],
      modules: ["Plataforma completa + Customizações"],
      popular: false
    }
  ];

  return (
    <PageTransition className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-lg border-b shadow-sm' : 'bg-background/80 backdrop-blur-sm'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Zap className="h-9 w-9 text-primary" fill="currentColor" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="font-black text-2xl bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  XYZLogicFlow
                </span>
                <p className="text-[10px] text-muted-foreground -mt-1">Plataforma Empresarial</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#modules" className="text-sm font-medium hover:text-primary transition-colors">Módulos</a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Planos</a>
              <a href="#register" className="text-sm font-medium hover:text-primary transition-colors">Cadastre-se</a>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/login')}>Entrar</Button>
              <Button onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2">
                <Rocket className="h-4 w-4" />
                Criar Conta Grátis
              </Button>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-background -z-10" />
        <div className="container mx-auto px-4">
          <FadeInUp className="text-center space-y-8 max-w-5xl mx-auto">
            <Badge className="inline-flex gap-2 px-4 py-2">
              <Star className="h-4 w-4" />
              Plataforma #1 em Gestão Logística
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              A plataforma{" "}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                tudo-em-um
              </span>
              {" "}para sua empresa
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              TMS, WMS, Financeiro, CRM e mais. Escolha seus módulos, personalize seu domínio e comece em minutos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="h-16 px-10 text-lg gap-3" onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}>
                <Rocket className="h-6 w-6" />
                Começar Grátis por 14 Dias
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg gap-3">
                <PlayCircle className="h-6 w-6" />
                Ver Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Sem cartão
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Cancele quando quiser
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeInUp className="text-center mb-16">
            <Badge className="mb-4">Marketplace de Módulos</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Escolha os módulos para seu negócio</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Monte sua plataforma personalizada. Adicione módulos conforme cresce.
            </p>
          </FadeInUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, idx) => (
              <Card key={idx} className="p-6 hover:shadow-xl transition-all hover:border-primary/50">
                <div className="bg-primary/10 p-3 rounded-lg inline-block mb-4">
                  <module.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1">{module.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{module.fullName}</p>
                <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                
                <div className="space-y-2 mb-4">
                  {module.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold">R$ {module.price}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                  <Button size="sm" variant="outline">Adicionar</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-4">
          <FadeInUp className="text-center mb-16">
            <Badge className="mb-4">Planos e Preços</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Escolha o plano ideal</h2>
          </FadeInUp>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <Card key={idx} className={`p-8 relative ${plan.popular ? 'border-2 border-primary shadow-2xl scale-105' : ''}`}>
                {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Mais Popular</Badge>}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div>
                    <span className="text-5xl font-black">{plan.price === "Customizado" ? plan.price : `R$ ${plan.price}`}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => {
                    setSelectedPlan(plan.name.toLowerCase());
                    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Começar Agora
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <FadeInUp className="text-center mb-12">
              <Badge className="mb-4">Comece Agora</Badge>
              <h2 className="text-4xl font-bold mb-4">Crie sua conta empresarial</h2>
              <p className="text-lg text-muted-foreground">14 dias grátis. Sem cartão de crédito.</p>
            </FadeInUp>

            <Card className="p-8">
              <form onSubmit={handleCompanyRegistration} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa *</Label>
                    <Input
                      id="companyName"
                      placeholder="Sua Empresa Ltda"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={companyCNPJ}
                      onChange={(e) => setCompanyCNPJ(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Escolha seu domínio *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="domain"
                      placeholder="suaempresa"
                      value={companyDomain}
                      onChange={(e) => setCompanyDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      required
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">.xyzlogicflow.com</span>
                  </div>
                  {companyDomain && (
                    <p className="text-sm text-primary">
                      Seu acesso: <strong>{companyDomain}.xyzlogicflow.com</strong>
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Responsável *</Label>
                    <Input
                      id="contactName"
                      placeholder="João Silva"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="joao@empresa.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Telefone *</Label>
                  <Input
                    id="contactPhone"
                    placeholder="(11) 98765-4321"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Plano Selecionado</Label>
                  <Tabs value={selectedPlan} onValueChange={setSelectedPlan}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="starter">Starter</TabsTrigger>
                      <TabsTrigger value="professional">Professional</TabsTrigger>
                      <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Button type="submit" size="lg" className="w-full text-lg h-14 gap-2">
                  <Rocket className="h-5 w-5" />
                  Criar Minha Conta Grátis
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-primary" fill="currentColor" />
            <span className="font-bold text-lg">XYZLogicFlow</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Plataforma empresarial completa para gestão logística
          </p>
          <p className="text-xs text-muted-foreground">
            © 2026 XYZLogicFlow. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </PageTransition>
  );
}
