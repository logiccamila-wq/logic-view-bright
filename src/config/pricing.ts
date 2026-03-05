/**
 * Shared pricing configuration
 * Maintains consistency across LeadForm and UnifiedLandingPage
 */

export const PRICING = {
  starter: {
    monthly: 497,
    annual: 397 * 12, // 20% discount
    label: "Starter",
  },
  professional: {
    monthly: 997,
    annual: 797 * 12, // 20% discount
    label: "Professional",
  },
  enterprise: {
    monthly: 9999,
    annual: 99999,
    label: "Enterprise",
  },
} as const;

/**
 * Format price for display in forms
 */
export function formatPlanLabel(
  plan: keyof typeof PRICING,
  billingPeriod: "monthly" | "annual" = "monthly"
): string {
  const { label, monthly, annual } = PRICING[plan];
  const price = billingPeriod === "monthly" ? monthly : annual;
  
  // Format with thousands separator
  const formattedPrice = price.toLocaleString("pt-BR");
  
  return `${label} - R$ ${formattedPrice}/mês`;
}

/**
 * Get plan options for form select
 */
export function getPlanOptions(billingPeriod: "monthly" | "annual" = "monthly") {
  return [
    { value: "starter", label: formatPlanLabel("starter", billingPeriod) },
    { value: "professional", label: formatPlanLabel("professional", billingPeriod) },
    { value: "enterprise", label: formatPlanLabel("enterprise", billingPeriod) },
  ];
}
