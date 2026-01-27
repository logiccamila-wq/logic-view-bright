import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingCardProps {
  planName: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: string[];
  popular?: boolean;
  ctaText?: string;
  onCTAClick: () => void;
  billingPeriod?: "monthly" | "annual";
  description?: string;
}

/**
 * Pricing card with plan details, features, and CTA
 * Supports monthly/annual pricing and "Most Popular" badge
 */
export function PricingCard({
  planName,
  price,
  features,
  popular = false,
  ctaText = "Começar Agora",
  onCTAClick,
  billingPeriod = "monthly",
  description,
}: PricingCardProps) {
  const currentPrice = billingPeriod === "monthly" ? price.monthly : price.annual;
  const savings = billingPeriod === "annual" ? Math.round(((price.monthly * 12 - price.annual) / (price.monthly * 12)) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className={`relative ${
        popular
          ? "bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border-2 border-indigo-500/50"
          : "bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10"
      } backdrop-blur-lg rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300`}
    >
      {/* Popular Badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 shadow-lg">
            Mais Popular
          </Badge>
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        {planName}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
          {description}
        </p>
      )}

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            R$ {currentPrice}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            /{billingPeriod === "monthly" ? "mês" : "ano"}
          </span>
        </div>
        {savings > 0 && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            Economize {savings}% no plano anual
          </p>
        )}
      </div>

      {/* CTA Button */}
      <Button
        onClick={onCTAClick}
        className={`w-full mb-6 ${
          popular
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            : "bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/20"
        } transition-all duration-300`}
        size="lg"
      >
        {ctaText}
      </Button>

      {/* Features List */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Inclui:
        </p>
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mt-0.5">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* Gradient Accent */}
      {popular && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-cyan-600/5 pointer-events-none" />
      )}
    </motion.div>
  );
}
