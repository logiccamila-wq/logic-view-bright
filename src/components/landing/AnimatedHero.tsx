import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, Zap, Shield, TrendingUp } from "lucide-react";

interface HeroMetric {
  value: string;
  label: string;
  delta?: string;
}

interface HeroPalette {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  border: string;
  glow: string;
}

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
    icon: ReactNode;
    text: string;
  }>;
  palette?: HeroPalette;
  featurePills?: readonly string[];
  quickStats?: readonly HeroMetric[];
  visualTitle?: string;
  visualCaption?: string;
  visualHighlights?: readonly HeroMetric[];
  visualSteps?: readonly string[];
  controls?: ReactNode;
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
  palette = {
    primary: "#2563EB",
    secondary: "#38BDF8",
    accent: "#8B5CF6",
    surface: "rgba(15, 23, 42, 0.86)",
    border: "rgba(148, 163, 184, 0.22)",
    glow: "rgba(37, 99, 235, 0.35)",
  },
  featurePills = [],
  quickStats = [],
  visualTitle = "Command center",
  visualCaption = "Real-time visibility with guided insights for smarter operations.",
  visualHighlights = [],
  visualSteps = [],
  controls,
}: AnimatedHeroProps) {
  const particles = Array.from({ length: 16 }, (_, index) => ({
    left: `${(index * 17) % 100}%`,
    top: `${(index * 29) % 100}%`,
    duration: 12 + (index % 5) * 2,
    offset: 16 + (index % 4) * 10,
  }));

  const chartBars = [56, 82, 64, 93, 74, 88];

  return (
    <section className="relative min-h-[calc(100vh-7rem)] flex items-center overflow-hidden rounded-[2rem] border border-white/10">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at top left, ${palette.glow} 0%, transparent 32%),
            radial-gradient(circle at 80% 20%, ${palette.secondary}33 0%, transparent 24%),
            linear-gradient(145deg, rgba(2, 6, 23, 0.96) 0%, rgba(15, 23, 42, 0.92) 46%, rgba(8, 15, 34, 0.98) 100%)
          `,
        }}
      />

      <div className="absolute inset-0 opacity-60">
        {particles.map((particle, index) => (
          <motion.div
            key={index}
            className="absolute h-2 w-2 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
              backgroundColor: index % 3 === 0 ? palette.secondary : palette.primary,
              boxShadow: `0 0 20px ${palette.glow}`,
            }}
            animate={{
              y: [0, particle.offset, 0],
              opacity: [0.15, 0.75, 0.15],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          {controls && (
            <motion.div
              initial={{ opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-8"
            >
              {controls}
            </motion.div>
          )}

          {badge && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex"
            >
              <Badge
                variant="secondary"
                className="rounded-full border px-4 py-2 text-sm font-medium text-white shadow-lg"
                style={{
                  backgroundColor: `${palette.secondary}22`,
                  borderColor: `${palette.secondary}55`,
                  boxShadow: `0 20px 45px -30px ${palette.glow}`,
                }}
              >
                {badge}
              </Badge>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mb-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 0%, ${palette.secondary} 45%, ${palette.accent} 100%)`,
              }}
            >
              {headline}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mb-8 max-w-3xl text-lg text-slate-300 sm:text-xl"
          >
            {subheadline}
          </motion.p>

          {featurePills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.22 }}
              className="mb-8 flex flex-wrap gap-3"
            >
              {featurePills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-xl"
                  style={{
                    backgroundColor: `${palette.primary}1e`,
                    borderColor: `${palette.border}`,
                  }}
                >
                  {pill}
                </span>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mb-10 flex flex-col gap-4 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={primaryCTA.onClick}
              className="group h-12 rounded-2xl px-8 text-base font-semibold text-white shadow-2xl"
              style={{
                backgroundImage: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.accent} 100%)`,
                boxShadow: `0 25px 45px -20px ${palette.glow}`,
              }}
            >
              {primaryCTA.text}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            {secondaryCTA && (
              <Button
                size="lg"
                variant="outline"
                onClick={secondaryCTA.onClick}
                className="h-12 rounded-2xl border text-white backdrop-blur-xl"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderColor: palette.border,
                }}
              >
                {secondaryCTA.text}
              </Button>
            )}
          </motion.div>

          {quickStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.34 }}
              className="mb-10 grid gap-4 sm:grid-cols-3"
            >
              {quickStats.map((stat) => (
                <div
                  key={`${stat.value}-${stat.label}`}
                  className="rounded-3xl border p-4 backdrop-blur-2xl"
                  style={{
                    backgroundColor: `${palette.surface}`,
                    borderColor: palette.border,
                    boxShadow: `0 18px 45px -35px ${palette.glow}`,
                  }}
                >
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-300">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-slate-200 backdrop-blur-xl"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderColor: palette.border,
                }}
              >
                <div style={{ color: palette.secondary }}>{badge.icon}</div>
                <span>{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
          className="relative flex items-center justify-center"
        >
          <div
            className="absolute inset-8 rounded-[2rem] blur-3xl"
            style={{
              background: `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)`,
            }}
          />

          <div className="relative w-full max-w-xl">
            <motion.div
              animate={{ y: [0, -10, 0], rotateX: [0, 2, 0], rotateY: [0, -1.5, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-[2rem] border p-6 shadow-2xl"
              style={{
                background: `linear-gradient(160deg, ${palette.surface} 0%, rgba(15, 23, 42, 0.68) 100%)`,
                borderColor: palette.border,
                boxShadow: `0 28px 80px -45px ${palette.glow}`,
              }}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">
                    {visualTitle}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-white">{visualCaption}</h3>
                </div>
                <div
                  className="rounded-2xl border p-3"
                  style={{
                    backgroundColor: `${palette.primary}22`,
                    borderColor: palette.border,
                  }}
                >
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>

              <div
                className="mb-6 rounded-[1.6rem] border p-5"
                style={{
                  backgroundColor: "rgba(2, 6, 23, 0.44)",
                  borderColor: palette.border,
                }}
              >
                <div className="mb-4 flex items-end gap-3">
                  {chartBars.map((height, index) => (
                    <motion.div
                      key={index}
                      className="flex-1 rounded-full"
                      style={{
                        minHeight: "2.5rem",
                        height: `${height}%`,
                        background: `linear-gradient(180deg, ${palette.secondary} 0%, ${palette.primary} 100%)`,
                      }}
                      animate={{ opacity: [0.55, 1, 0.55] }}
                      transition={{ duration: 2.4, delay: index * 0.15, repeat: Infinity }}
                    />
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {visualHighlights.map((highlight) => (
                    <div
                      key={`${highlight.value}-${highlight.label}`}
                      className="rounded-2xl border p-3"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderColor: palette.border,
                      }}
                    >
                      <div className="text-xl font-black text-white">{highlight.value}</div>
                      <div className="mt-1 text-sm text-slate-300">{highlight.label}</div>
                      {highlight.delta && (
                        <div className="mt-2 text-xs font-semibold" style={{ color: palette.secondary }}>
                          {highlight.delta}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {visualSteps.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {visualSteps.map((step, index) => (
                    <div
                      key={step}
                      className="rounded-full border px-4 py-2 text-sm text-slate-200"
                      style={{
                        backgroundColor: index === 1 ? `${palette.accent}22` : "rgba(255,255,255,0.06)",
                        borderColor: palette.border,
                      }}
                    >
                      {step}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              aria-hidden
              animate={{ y: [0, 10, 0], x: [0, 6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 top-10 hidden rounded-3xl border px-5 py-4 shadow-xl lg:block"
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                borderColor: palette.border,
                backdropFilter: "blur(18px)",
              }}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300">AI Assist</div>
              <div className="mt-2 text-sm text-white">Sugestões automáticas de rota e custo</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
