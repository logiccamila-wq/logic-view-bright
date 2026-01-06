import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Check, Truck, Shield, Zap, ShoppingBag, Users, Globe, 
  PlayCircle, TrendingUp, DollarSign, Package, MapPin, Clock, 
  Star, Sparkles, Rocket, Target, Award, ChevronRight, Menu, X, 
  BarChart3, Settings, Headphones, Smartphone, Mail, Phone
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition, FadeInUp, StaggerContainer, StaggerItem, HoverScale } from "@/components/animations";

export default function ModernLandingPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Form states
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCompany, setLeadCompany] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      });
      if (error) throw error;
      toast.success("Cadastro recebido!", {
        description: "Nossa equipe entrará em contato em breve.",
      });
      setLeadName("");
      setLeadEmail("");
      setLeadPhone("");
      setLeadCompany("");
    } catch (err) {
      toast.error("Erro ao cadastrar", {
        description: "Tente novamente mais tarde.",
      });
    }
  };

  const features = [
    { icon: Truck, title: "Gestão de Frota", desc: "Controle total de veículos, motoristas e viagens em tempo real" },
    { icon: BarChart3, title: "Analytics Avançado", desc: "KPIs e relatórios inteligentes para decisões estratégicas" },
    { icon: ShoppingBag, title: "Marketplace", desc: "Compre e venda fretes, peças e serviços no ecossistema" },
    { icon: DollarSign, title: "Financeiro 360°", desc: "DRE, fluxo de caixa e contas a pagar/receber integrados" },
    { icon: Package, title: "WMS Integrado", desc: "Gestão completa de estoque e armazém em um só lugar" },
    { icon: Shield, title: "Compliance Total", desc: "Documentos fiscais, CTe e MDFe automatizados" },
  ];

  const stats = [
    { value: "2.5k+", label: "Empresas Ativas" },
    { value: "98%", label: "Satisfação" },
    { value: "24/7", label: "Suporte" },
    { value: "45M+", label: "Viagens Gerenciadas" },
  ];

  const testimonials = [
    { name: "Carlos Silva", company: "TransLog Expressa", role: "CEO", text: "Reduzimos custos em 35% no primeiro trimestre. A plataforma é completa!" },
    { name: "Ana Santos", company: "Rodomax Transportes", role: "Gerente Operacional", text: "A automação de documentos fiscais economizou 20h/semana da nossa equipe." },
    { name: "Roberto Lima", company: "Cargo Fast", role: "Diretor Financeiro", text: "O DRE em tempo real transformou nossa gestão financeira completamente." },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "497",
      period: "/mês",
      description: "Para pequenas transportadoras",
      features: [
        "Até 10 veículos",
        "20 usuários",
        "Gestão de frota básica",
        "CTe/MDFe inclusos",
        "Suporte por email"
      ],
      cta: "Começar Teste Grátis",
      popular: false
    },
    {
      name: "Professional",
      price: "997",
      period: "/mês",
      description: "Ideal para médias empresas",
      features: [
        "Até 50 veículos",
        "Usuários ilimitados",
        "Marketplace incluído",
        "Analytics avançado",
        "WMS + TMS completo",
        "IA preditiva",
        "Suporte prioritário 24/7"
      ],
      cta: "Começar Agora",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Para grandes operações",
      features: [
        "Veículos ilimitados",
        "White-label disponível",
        "API dedicada",
        "Personalização total",
        "Treinamento incluso",
        "Gerente de conta dedicado",
        "SLA garantido"
      ],
      cta: "Falar com Vendas",
      popular: false
    }
  ];

  return (
    <PageTransition className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-lg border-b shadow-sm' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Zap className="h-8 w-8 text-primary" fill="currentColor" />
                <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              <span className="font-black text-2xl bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                XYZLogicFlow
              </span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Recursos</a>
              <a href="#marketplace" className="text-sm font-medium hover:text-primary transition-colors">Marketplace</a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Planos</a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Cases</a>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Entrar
              </Button>
              <Button onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })} className="gap-2">
                Teste Grátis <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium">Recursos</a>
              <a href="#marketplace" className="text-sm font-medium">Marketplace</a>
              <a href="#pricing" className="text-sm font-medium">Planos</a>
              <a href="#testimonials" className="text-sm font-medium">Cases</a>
              <Button variant="ghost" onClick={() => navigate('/login')} className="justify-start">Entrar</Button>
              <Button onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}>Teste Grátis</Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-background -z-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 -z-10" />

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeInUp className="space-y-8 text-center lg:text-left">
              <Badge className="inline-flex gap-2 px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4" />
                Lançamento: Marketplace de Logística
              </Badge>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                A Revolução da{" "}
                <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Logística
                </span>{" "}
                Começa Aqui
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Plataforma all-in-one para transportadoras modernas: gestão de frota, TMS, WMS, marketplace e muito mais. Tudo integrado e em tempo real.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <HoverScale>
                  <Button size="lg" className="h-14 px-8 text-lg gap-2 shadow-xl shadow-primary/20" onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}>
                    <Rocket className="h-5 w-5" />
                    Começar Grátis por 14 Dias
                  </Button>
                </HoverScale>
                <HoverScale>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Ver Demo ao Vivo
                  </Button>
                </HoverScale>
              </div>

              {/* Stats */}
              <StaggerContainer className="grid grid-cols-4 gap-4 pt-8 border-t">
                {stats.map((stat, idx) => (
                  <StaggerItem key={idx} className="text-center lg:text-left">
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </FadeInUp>

            {/* Hero Image/Dashboard Preview */}
            <div className="relative">
              <div className="relative rounded-2xl border-2 bg-background shadow-2xl p-2 transform hover:scale-105 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                  alt="XYZLogicFlow Dashboard" 
                  className="rounded-xl w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl flex items-end p-6">
                  <p className="text-white font-semibold text-lg">Interface moderna e intuitiva</p>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-4 top-20 bg-background p-4 rounded-lg shadow-xl border animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Receita</p>
                    <p className="text-xs text-muted-foreground">+35% este mês</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-20 bg-background p-4 rounded-lg shadow-xl border animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Viagens Ativas</p>
                    <p className="text-xs text-muted-foreground">147 em rota</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeInUp className="text-center mb-16">
            <Badge className="mb-4">Recursos</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Tudo que você precisa em um só lugar</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ferramentas completas para otimizar cada aspecto da sua operação logística
            </p>
          </FadeInUp>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <StaggerItem key={idx}>
                <HoverScale>
                  <Card className="p-6 hover:shadow-xl transition-shadow cursor-pointer group h-full">
                    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
                <ChevronRight className="h-5 w-5 text-primary mt-4 group-hover:translate-x-2 transition-transform" />
                  </Card>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge>Marketplace</Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Conecte. Compre. Venda.<br/>
                <span className="text-primary">Lucre Mais.</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                O maior marketplace de logística do Brasil. Encontre fretes disponíveis, compre peças com desconto e venda seus serviços para milhares de empresas.
              </p>
              <ul className="space-y-4">
                {[
                  "Milhares de fretes disponíveis diariamente",
                  "Peças e componentes com até 40% de desconto",
                  "Pagamento seguro e garantido",
                  "Avaliações e reputação verificada"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-1">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="gap-2">
                Explorar Marketplace <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 space-y-4">
                <ShoppingBag className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-3xl font-bold">15k+</p>
                  <p className="text-sm text-muted-foreground">Produtos Ativos</p>
                </div>
              </Card>
              <Card className="p-6 space-y-4">
                <Users className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-3xl font-bold">3.2k</p>
                  <p className="text-sm text-muted-foreground">Fornecedores</p>
                </div>
              </Card>
              <Card className="p-6 space-y-4">
                <DollarSign className="h-10 w-10 text-primary" />
                <div>
                  <p className="text-3xl font-bold">R$ 45M</p>
                  <p className="text-sm text-muted-foreground">Transacionado/mês</p>
                </div>
              </Card>
              <Card className="p-6 space-y-4">
                <Star className="h-10 w-10 text-primary fill-primary" />
                <div>
                  <p className="text-3xl font-bold">4.8/5</p>
                  <p className="text-sm text-muted-foreground">Avaliação Média</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Depoimentos</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Amado por transportadoras</h2>
            <p className="text-xl text-muted-foreground">Veja o que nossos clientes dizem</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                <div className="pt-4 border-t">
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.company}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Planos</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Escolha o plano ideal</h2>
            <p className="text-xl text-muted-foreground">14 dias grátis • Cancele quando quiser</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <Card key={idx} className={`p-8 relative ${plan.popular ? 'border-primary border-2 shadow-xl' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Mais Popular</Badge>
                )}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">
                      {plan.price === "Custom" ? "Custom" : `R$ ${plan.price}`}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                  <ul className="space-y-3 pt-4 border-t">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 bg-gradient-to-br from-primary via-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Comece sua transformação digital hoje
                </h2>
                <p className="text-xl text-white/90">
                  Junte-se a mais de 2.500 transportadoras que já otimizaram suas operações com o XYZLogicFlow.
                </p>
                <div className="flex items-center gap-4 justify-center lg:justify-start">
                  <Award className="h-8 w-8" />
                  <div className="text-left">
                    <p className="font-bold">Garantia de 14 dias</p>
                    <p className="text-sm text-white/80">100% do seu dinheiro de volta</p>
                  </div>
                </div>
              </div>

              <Card className="p-8">
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Teste grátis por 14 dias</h3>
                    <p className="text-sm text-muted-foreground">Sem cartão de crédito necessário</p>
                  </div>
                  <Input 
                    placeholder="Nome completo" 
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    required
                  />
                  <Input 
                    type="email" 
                    placeholder="Email corporativo" 
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    required
                  />
                  <Input 
                    placeholder="Telefone" 
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    required
                  />
                  <Input 
                    placeholder="Nome da empresa" 
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                    required
                  />
                  <Button type="submit" size="lg" className="w-full gap-2">
                    <Rocket className="h-5 w-5" />
                    Começar Teste Grátis
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Ao criar sua conta, você concorda com nossos Termos de Uso e Política de Privacidade
                  </p>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-6 w-6 text-primary" fill="currentColor" />
                <span className="font-bold text-lg">XYZLogicFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A plataforma definitiva para gestão logística moderna.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary">Recursos</a></li>
                <li><a href="#marketplace" className="hover:text-primary">Marketplace</a></li>
                <li><a href="#pricing" className="hover:text-primary">Planos</a></li>
                <li><a href="#" className="hover:text-primary">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Sobre</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Carreiras</a></li>
                <li><a href="#" className="hover:text-primary">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  contato@xyzlogicflow.tech
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  (11) 9999-9999
                </li>
                <li className="flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  Suporte 24/7
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 XYZLogicFlow. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary">Termos</a>
              <a href="#" className="hover:text-primary">Privacidade</a>
              <a href="#" className="hover:text-primary">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </PageTransition>
  );
}
