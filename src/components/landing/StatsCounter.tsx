import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import AnimatedCounter from "@/components/animations/AnimatedCounter";

interface StatsCounterProps {
  value: number;
  label: string;
  icon: LucideIcon;
  suffix?: string;
  prefix?: string;
  colorScheme?: "primary" | "secondary" | "accent" | "warning";
  duration?: number;
}

const colorSchemes = {
  primary: {
    gradient: "from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  secondary: {
    gradient: "from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  accent: {
    gradient: "from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400",
    iconColor: "text-green-600 dark:text-green-400",
  },
  warning: {
    gradient: "from-amber-600 to-red-600 dark:from-amber-400 dark:to-red-400",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
};

/**
 * Animated counter with icon and gradient text
 * Uses AnimatedCounter for smooth count-up animation
 */
export function StatsCounter({
  value,
  label,
  icon: Icon,
  suffix = "",
  prefix = "",
  colorScheme = "primary",
  duration = 2,
}: StatsCounterProps) {
  const scheme = colorSchemes[colorScheme];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center p-6"
    >
      {/* Icon */}
      <div className={`mb-4 ${scheme.iconColor}`}>
        <Icon className="w-12 h-12" strokeWidth={1.5} />
      </div>

      {/* Counter */}
      <div className={`text-5xl font-bold mb-2 bg-gradient-to-r ${scheme.gradient} bg-clip-text text-transparent`}>
        {prefix}
        <AnimatedCounter value={value} duration={duration} />
        {suffix}
      </div>

      {/* Label */}
      <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
        {label}
      </p>
    </motion.div>
  );
}
