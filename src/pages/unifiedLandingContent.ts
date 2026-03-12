export type LandingLanguageCode = "pt-BR" | "en-US" | "es-ES" | "fr-FR";

export interface LandingPalette {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  glow: string;
}

export const landingPalettes: LandingPalette[] = [
  {
    id: "pilot-blue",
    name: "Pilot Blue",
    description: "Azul escuro premium",
    primary: "#2563EB",
    secondary: "#38BDF8",
    accent: "#8B5CF6",
    background: "#020817",
    surface: "rgba(15, 23, 42, 0.86)",
    border: "rgba(148, 163, 184, 0.22)",
    glow: "rgba(37, 99, 235, 0.35)",
  },
  {
    id: "aurora-violet",
    name: "Aurora",
    description: "Roxo futurista",
    primary: "#7C3AED",
    secondary: "#A855F7",
    accent: "#06B6D4",
    background: "#0F172A",
    surface: "rgba(30, 41, 59, 0.86)",
    border: "rgba(192, 132, 252, 0.24)",
    glow: "rgba(124, 58, 237, 0.34)",
  },
  {
    id: "emerald-pulse",
    name: "Emerald",
    description: "Verde operacional",
    primary: "#0F766E",
    secondary: "#10B981",
    accent: "#22D3EE",
    background: "#022C22",
    surface: "rgba(6, 78, 59, 0.84)",
    border: "rgba(45, 212, 191, 0.24)",
    glow: "rgba(16, 185, 129, 0.34)",
  },
];

export const landingTranslations = {
  "pt-BR": {
    seoTitle: "XYZLogicFlow - Plataforma logística premium com IA",
    seoDescription:
      "Uma landing page premium em azul escuro, multilíngue e personalizável para transformar a operação logística com IA, dashboards e automações.",
    navigation: {
      solutions: "Soluções",
      plans: "Planos",
      resources: "Recursos",
      contact: "Contato",
      login: "Login",
      marketplace: "Marketplace",
      start: "Começar grátis",
    },
    controls: {
      language: "Idioma da experiência",
      palette: "Personalize as cores",
      paletteHint: "Escolha a identidade visual da sua operação em segundos.",
    },
    hero: {
      badge: "🚀 Plataforma premium de gestão logística com IA",
      headline: "Pilot Blue: design moderno, vidro 3D e performance para sua logística",
      subheadline:
        "Uma experiência premium com painel escuro, glassmorphism, gráficos didáticos, animações suaves e controle instantâneo de idioma e paleta.",
      primaryCta: "Teste grátis por 14 dias",
      secondaryCta: "Entrar no marketplace",
      featurePills: ["TMS + WMS + ERP", "Painéis 3D", "Fluxos guiados", "IA operacional"],
      trustBadges: ["LGPD Ready", "ISO 27001", "99,9% uptime"],
      quickStats: [
        { value: "40%", label: "mais produtividade" },
        { value: "3 idiomas+", label: "seleção imediata" },
        { value: "24/7", label: "suporte especialista" },
      ],
      visualTitle: "Control tower em tempo real",
      visualCaption:
        "Visão executiva com camadas em vidro, indicadores dinâmicos e leitura didática para gestores, operação e financeiro.",
      visualHighlights: [
        { value: "126", label: "veículos online", delta: "+12 hoje" },
        { value: "98,4%", label: "entregas no prazo", delta: "+4,2%" },
        { value: "-31%", label: "custo por rota", delta: "IA otimizada" },
      ],
      visualSteps: ["Mapa ao vivo", "KPIs por cor", "Insights automáticos"],
    },
    sections: {
      featuresBadge: "Experiência redesenhada",
      featuresTitle: "Layout premium com foco em clareza e conversão",
      featuresSubtitle:
        "Componentes com contraste alto, profundidade em vidro e narrativa visual mais moderna para apresentar a plataforma.",
      modulesBadge: "Operação modular",
      modulesTitle: "Explore módulos com uma identidade visual unificada",
      modulesSubtitle:
        "O mesmo padrão visual acompanha frota, financeiro, manutenção e torre de controle.",
    },
  },
  "en-US": {
    seoTitle: "XYZLogicFlow - Premium logistics platform with AI",
    seoDescription:
      "A premium dark-blue landing page with multilingual controls, glassmorphism, animated charts, and modern logistics storytelling.",
    navigation: {
      solutions: "Solutions",
      plans: "Plans",
      resources: "Resources",
      contact: "Contact",
      login: "Login",
      marketplace: "Marketplace",
      start: "Start free",
    },
    controls: {
      language: "Experience language",
      palette: "Personalize colors",
      paletteHint: "Switch the visual identity of your operation in seconds.",
    },
    hero: {
      badge: "🚀 Premium AI logistics platform",
      headline: "Pilot Blue: modern dark design, 3D glass, and performance for logistics",
      subheadline:
        "A premium experience with a dark command center, glassmorphism, didactic charts, smooth motion, and instant language and palette controls.",
      primaryCta: "Start a 14-day free trial",
      secondaryCta: "Open marketplace",
      featurePills: ["TMS + WMS + ERP", "3D dashboards", "Guided flows", "Operational AI"],
      trustBadges: ["LGPD ready", "ISO 27001", "99.9% uptime"],
      quickStats: [
        { value: "40%", label: "more productivity" },
        { value: "3+ languages", label: "instant switch" },
        { value: "24/7", label: "expert support" },
      ],
      visualTitle: "Real-time control tower",
      visualCaption:
        "Executive visibility with layered glass surfaces, dynamic indicators, and didactic reading for leaders, operations, and finance.",
      visualHighlights: [
        { value: "126", label: "vehicles online", delta: "+12 today" },
        { value: "98.4%", label: "on-time deliveries", delta: "+4.2%" },
        { value: "-31%", label: "cost per route", delta: "AI optimized" },
      ],
      visualSteps: ["Live map", "Color KPIs", "Automatic insights"],
    },
    sections: {
      featuresBadge: "Experience redesigned",
      featuresTitle: "Premium layout built for clarity and conversion",
      featuresSubtitle:
        "High-contrast components, glass depth, and a more modern visual story to present the platform.",
      modulesBadge: "Modular operations",
      modulesTitle: "Explore modules with one unified visual language",
      modulesSubtitle:
        "The same visual standard now supports fleet, finance, maintenance, and the control tower.",
    },
  },
  "es-ES": {
    seoTitle: "XYZLogicFlow - Plataforma logística premium con IA",
    seoDescription:
      "Una landing premium en azul oscuro con controles multilingües, glassmorphism, gráficos animados y narrativa moderna para logística.",
    navigation: {
      solutions: "Soluciones",
      plans: "Planes",
      resources: "Recursos",
      contact: "Contacto",
      login: "Acceso",
      marketplace: "Marketplace",
      start: "Comenzar gratis",
    },
    controls: {
      language: "Idioma de la experiencia",
      palette: "Personaliza los colores",
      paletteHint: "Cambia la identidad visual de tu operación en segundos.",
    },
    hero: {
      badge: "🚀 Plataforma premium de logística con IA",
      headline: "Pilot Blue: diseño oscuro moderno, vidrio 3D y rendimiento para logística",
      subheadline:
        "Una experiencia premium con centro de mando oscuro, glassmorphism, gráficos didácticos, animaciones suaves y control inmediato de idioma y paleta.",
      primaryCta: "Prueba gratis por 14 días",
      secondaryCta: "Entrar al marketplace",
      featurePills: ["TMS + WMS + ERP", "Paneles 3D", "Flujos guiados", "IA operacional"],
      trustBadges: ["LGPD listo", "ISO 27001", "99,9% uptime"],
      quickStats: [
        { value: "40%", label: "más productividad" },
        { value: "3+ idiomas", label: "cambio inmediato" },
        { value: "24/7", label: "soporte experto" },
      ],
      visualTitle: "Control tower en tiempo real",
      visualCaption:
        "Visión ejecutiva con capas de vidrio, indicadores dinámicos y lectura didáctica para dirección, operaciones y finanzas.",
      visualHighlights: [
        { value: "126", label: "vehículos en línea", delta: "+12 hoy" },
        { value: "98,4%", label: "entregas a tiempo", delta: "+4,2%" },
        { value: "-31%", label: "costo por ruta", delta: "IA optimizada" },
      ],
      visualSteps: ["Mapa en vivo", "KPIs por color", "Insights automáticos"],
    },
    sections: {
      featuresBadge: "Experiencia rediseñada",
      featuresTitle: "Layout premium pensado para claridad y conversión",
      featuresSubtitle:
        "Componentes de alto contraste, profundidad en vidrio y una narrativa visual más moderna para presentar la plataforma.",
      modulesBadge: "Operación modular",
      modulesTitle: "Explora módulos con una identidad visual unificada",
      modulesSubtitle:
        "El mismo estándar visual acompaña flota, finanzas, mantenimiento y torre de control.",
    },
  },
  "fr-FR": {
    seoTitle: "XYZLogicFlow - Plateforme logistique premium avec IA",
    seoDescription:
      "Une landing page premium bleu nuit avec contrôles multilingues, glassmorphism, graphiques animés et narration moderne pour la logistique.",
    navigation: {
      solutions: "Solutions",
      plans: "Offres",
      resources: "Ressources",
      contact: "Contact",
      login: "Connexion",
      marketplace: "Marketplace",
      start: "Essayer gratuitement",
    },
    controls: {
      language: "Langue de l'expérience",
      palette: "Personnaliser les couleurs",
      paletteHint: "Changez l'identité visuelle de votre opération en quelques secondes.",
    },
    hero: {
      badge: "🚀 Plateforme logistique premium avec IA",
      headline: "Pilot Blue : design sombre moderne, verre 3D et performance logistique",
      subheadline:
        "Une expérience premium avec cockpit sombre, glassmorphism, graphiques pédagogiques, animations fluides et contrôle immédiat de la langue et de la palette.",
      primaryCta: "Essai gratuit 14 jours",
      secondaryCta: "Accéder au marketplace",
      featurePills: ["TMS + WMS + ERP", "Dashboards 3D", "Parcours guidés", "IA opérationnelle"],
      trustBadges: ["Conforme LGPD", "ISO 27001", "99,9 % uptime"],
      quickStats: [
        { value: "40%", label: "de productivité en plus" },
        { value: "3+ langues", label: "changement instantané" },
        { value: "24/7", label: "support expert" },
      ],
      visualTitle: "Tour de contrôle en temps réel",
      visualCaption:
        "Une vue exécutive avec couches en verre, indicateurs dynamiques et lecture pédagogique pour direction, opérations et finance.",
      visualHighlights: [
        { value: "126", label: "véhicules en ligne", delta: "+12 aujourd'hui" },
        { value: "98,4%", label: "livraisons à l'heure", delta: "+4,2 %" },
        { value: "-31%", label: "coût par route", delta: "IA optimisée" },
      ],
      visualSteps: ["Carte en direct", "KPI par couleur", "Insights automatiques"],
    },
    sections: {
      featuresBadge: "Expérience repensée",
      featuresTitle: "Un layout premium pensé pour la clarté et la conversion",
      featuresSubtitle:
        "Des composants à fort contraste, une profondeur en verre et un récit visuel plus moderne pour présenter la plateforme.",
      modulesBadge: "Opérations modulaires",
      modulesTitle: "Explorez les modules avec une identité visuelle unifiée",
      modulesSubtitle:
        "Le même langage visuel accompagne flotte, finance, maintenance et tour de contrôle.",
    },
  },
} as const;

export function resolveLandingLanguage(language?: string): LandingLanguageCode {
  if (language && language in landingTranslations) {
    return language as LandingLanguageCode;
  }

  return "pt-BR";
}

export function resolveLandingPalette(paletteId?: string): LandingPalette {
  return landingPalettes.find((palette) => palette.id === paletteId) ?? landingPalettes[0];
}
