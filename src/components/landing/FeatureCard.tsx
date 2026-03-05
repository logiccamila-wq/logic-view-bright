import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  link?: {
    text: string;
    onClick: () => void;
  };
  colorScheme?: "primary" | "secondary" | "accent" | "warning";
  gradient?: boolean;
}

const colorSchemes = {
  primary: {
    iconBg: "from-indigo-500 to-purple-600",
    iconColor: "text-white",
    hoverBorder: "hover:border-indigo-500/50",
  },
  secondary: {
    iconBg: "from-blue-500 to-cyan-600",
    iconColor: "text-white",
    hoverBorder: "hover:border-blue-500/50",
  },
  accent: {
    iconBg: "from-green-500 to-teal-600",
    iconColor: "text-white",
    hoverBorder: "hover:border-green-500/50",
  },
  warning: {
    iconBg: "from-amber-500 to-red-600",
    iconColor: "text-white",
    hoverBorder: "hover:border-amber-500/50",
  },
};

/**
 * Glassmorphism feature card with icon, title, description
 * Supports gradient backgrounds and hover effects
 */
export function FeatureCard({
  icon: Icon,
  title,
  description,
  link,
  colorScheme = "primary",
  gradient = false,
}: FeatureCardProps) {
  const scheme = colorSchemes[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
      className={`group relative ${
        gradient
          ? "bg-gradient-to-br from-white/10 to-white/5 dark:from-black/20 dark:to-black/10"
          : "bg-white/10 dark:bg-black/10"
      } backdrop-blur-lg border border-white/20 dark:border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl ${scheme.hoverBorder} transition-all duration-300`}
    >
      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${scheme.iconBg} ${scheme.iconColor} mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
        {description}
      </p>

      {/* Learn More Link */}
      {link && (
        <button
          onClick={link.onClick}
          className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group/link transition-colors"
        >
          {link.text}
          <ArrowRight className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
        </button>
      )}

      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}
