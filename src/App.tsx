import React from 'react';

function App() {
  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">LogicFlow</div>
          <nav className="nav">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Welcome to LogicFlow</h1>
          <p className="hero-subtitle">
            Modern logistics management platform for your business needs
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Our Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Fleet Management</h3>
              <p>Track and manage your fleet in real-time with advanced analytics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics Dashboard</h3>
              <p>Get insights with comprehensive data visualization and reporting</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Maintenance Tracking</h3>
              <p>Schedule and track vehicle maintenance to keep your fleet running</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Access</h3>
              <p>Access your data anywhere, anytime on any device</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your account in minutes</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Configure</h3>
              <p>Set up your fleet and preferences</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Manage</h3>
              <p>Start managing your logistics efficiently</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>LogicFlow</h4>
              <p>Modern logistics management solution</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>info@logicflow.com</p>
              <p>© 2024 LogicFlow. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
