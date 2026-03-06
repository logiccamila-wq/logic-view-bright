import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

interface AnimatedHeroProps {
  badge?: string;
  headline: string;
  subheadline: string;
  primaryCTA: {
    text: string;
    onClick: () => void;
  };
  secondaryCTA?: {
    text: string;
    onClick: () => void;
  };
  trustBadges?: Array<{
    icon: React.ReactNode;
    text: string;
  }>;
}

const defaultTrustBadges = [
  { icon: <Zap className="w-4 h-4" />, text: "Tempo real" },
  { icon: <Shield className="w-4 h-4" />, text: "100% Seguro" },
  { icon: <TrendingUp className="w-4 h-4" />, text: "+85% Eficiência" },
];

/**
 * Modern hero section with gradient background and animations
 * Features badge, headline, CTAs, and trust indicators
 */
export function AnimatedHero({
  badge,
  headline,
  subheadline,
  primaryCTA,
  secondaryCTA,
  trustBadges = defaultTrustBadges,
}: AnimatedHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 opacity-10 dark:opacity-20" />
      
      {/* Particles handled by parent */}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 flex justify-center"
            >
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-colors"
              >
                {badge}
              </Badge>
            </motion.div>
          )}

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            {headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            {subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              size="lg"
              onClick={primaryCTA.onClick}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {primaryCTA.text}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {secondaryCTA && (
              <Button
                size="lg"
                variant="outline"
                onClick={secondaryCTA.onClick}
                className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20"
              >
                {secondaryCTA.text}
              </Button>
            )}
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-gray-400"
              >
                <div className="text-indigo-400">
                  {badge.icon}
                </div>
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
