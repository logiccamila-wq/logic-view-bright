import React from 'react';

const Feature: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="feature-card" role="article" aria-label={title}>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

export default function App() {
  React.useEffect(() => {
    console.log('[App] mounted');
  }, []);

  return (
    <div className="app-root">
      <header className="topbar" role="banner">
        <div className="brand">LogicView</div>
        <nav aria-label="Main navigation">
          <a href="#features">Recursos</a>
          <a href="#how">Como funciona</a>
          <a href="#contact">Contato</a>
        </nav>
        <button className="cta" aria-label="Experimente grátis">Experimente grátis</button>
      </header>

      <main>
        <section className="hero" role="region" aria-label="Hero">
          <div>
            <h1>Transforme dados em decisões — em tempo real</h1>
            <p>UI elegante, execução rápida e integrações inteligentes para times que precisam entregar resultados.</p>
            <div className="hero-cta">
              <button className="primary">Começar agora</button>
              <button className="secondary">Ver demo</button>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="card-visual">📊 Dashboard preview</div>
          </div>
        </section>

        <section id="features" className="features" aria-label="Destaques">
          <h2>Destaques</h2>
          <div className="features-grid">
            <Feature title="Realtime Insights" desc="Alertas e métricas em tempo real para decisões imediatas." />
            <Feature title="Workflows acionáveis" desc="Automatize ações com base em regras de negócio." />
            <Feature title="Segurança de nível enterprise" desc="Roles, permissões e auditoria completas." />
          </div>
        </section>

        <section id="how" className="how" aria-label="Como funciona">
          <h2>Como funciona</h2>
          <ol>
            <li>Conectar fontes de dados</li>
            <li>Configurar painéis e regras de ação</li>
            <li>Executar e escalar</li>
          </ol>
        </section>

        <section id="contact" className="contact" aria-label="Contato">
          <h2>Pronto para encantar a diretoria?</h2>
          <p>Agende uma demo e mostre o que o LogicView faz pelo seu negócio.</p>
          <button className="primary">Agendar demo</button>
        </section>
      </main>

      <footer className="footer" role="contentinfo">
        <div>© {new Date().getFullYear()} LogicView. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}
