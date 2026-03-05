import React from 'react';
import { useTranslation } from 'react-i18next';
import ResponsiveNavigation from '@/components/layout/ResponsiveNavigation';
import AnimatedCounter from '@/components/animations/AnimatedCounter';
import LoadingSpinner from '@/components/animations/LoadingSpinner';
import HoverCard from '@/components/animations/HoverCard';
import TextReveal from '@/components/animations/TextReveal';
import ParticleBackground from '@/components/animations/ParticleBackground';

const Demo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground 
          particleCount={30}
          colors={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B']}
          speed={0.3}
          size={1.5}
          interactive={true}
        />
      </div>

      {/* Navigation */}
      <div className="relative z-10">
        <ResponsiveNavigation />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <TextReveal
            text="OptiLog Design System Demo"
            className="text-4xl md:text-6xl font-bold text-text mb-6"
            type="word"
            animation="fadeInUp"
          />
          <TextReveal
            text="Experience the power of modern logistics UX design"
            className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto"
            type="char"
            animation="fadeInUp"
            delay={0.5}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HoverCard className="p-6 text-center">
              <div className="text-blue-500 mb-4">
                <div className="text-4xl font-bold mb-2">
                  <AnimatedCounter value={12547} duration={2} />
                </div>
                <div className="text-text-secondary">Active Users</div>
              </div>
            </HoverCard>

            <HoverCard className="p-6 text-center">
              <div className="text-green-500 mb-4">
                <div className="text-4xl font-bold mb-2">
                  <AnimatedCounter value={89234} duration={2} />
                </div>
                <div className="text-text-secondary">Deliveries</div>
              </div>
            </HoverCard>

            <HoverCard className="p-6 text-center">
              <div className="text-purple-500 mb-4">
                <div className="text-4xl font-bold mb-2">
                  <AnimatedCounter value={156789} duration={2} />
                </div>
                <div className="text-text-secondary">Packages</div>
              </div>
            </HoverCard>

            <HoverCard className="p-6 text-center">
              <div className="text-orange-500 mb-4">
                <div className="text-4xl font-bold mb-2">
                  <AnimatedCounter value={98.7} decimals={1} suffix="%" duration={2} />
                </div>
                <div className="text-text-secondary">Efficiency</div>
              </div>
            </HoverCard>
          </div>
        </div>
      </section>

      {/* Animation Demos */}
      <section className="relative z-10 py-16 px-6 bg-surface/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-text text-center mb-12">
            Animation Components
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Loading Animations */}
            <div className="bg-surface rounded-xl p-6 border border-border">
              <h3 className="text-xl font-bold text-text mb-4">Loading Animations</h3>
              <div className="flex justify-around items-center p-8">
                <LoadingSpinner variant="spinner" size="lg" />
                <LoadingSpinner variant="dots" size="lg" />
                <LoadingSpinner variant="pulse" size="lg" />
                <LoadingSpinner variant="bars" size="lg" />
              </div>
            </div>

            {/* Text Reveal */}
            <div className="bg-surface rounded-xl p-6 border border-border">
              <h3 className="text-xl font-bold text-text mb-4">Text Reveal Animation</h3>
              <div className="p-4 bg-background rounded-lg">
                <TextReveal
                  text="The quick brown fox jumps over the lazy dog"
                  className="text-lg text-text"
                  type="char"
                  animation="fadeInUp"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-surface border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-text mb-4">
            Ready to Transform Your Logistics?
          </h3>
          <p className="text-text-secondary mb-8">
            Experience the future of logistics management with OptiLog
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Demo;