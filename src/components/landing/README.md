# Landing Page Components

Modern, reusable React components for creating stunning landing pages with glassmorphism, gradients, and smooth animations.

## Components

### 1. AnimatedHero
Hero section with gradient background, animated particles, and dual CTAs.

```tsx
<AnimatedHero
  badge="🚀 Plataforma #1"
  headline="Transform Your Business"
  subheadline="Modern solutions for modern problems"
  primaryCTA={{ text: "Get Started", onClick: () => {} }}
  secondaryCTA={{ text: "Learn More", onClick: () => {} }}
/>
```

**Props:**
- `badge?`: Optional badge text (e.g., "🚀 New Release")
- `headline`: Main heading text
- `subheadline`: Supporting text
- `primaryCTA`: { text, onClick } for main button
- `secondaryCTA?`: Optional secondary button
- `trustBadges?`: Array of { icon, text } for trust indicators

---

### 2. FeatureCard
Glassmorphism card for showcasing features with icons.

```tsx
<FeatureCard
  icon={Truck}
  title="Fleet Management"
  description="Complete control over your fleet"
  colorScheme="primary"
  gradient
  link={{ text: "Learn more", onClick: () => {} }}
/>
```

**Props:**
- `icon`: Lucide icon component
- `title`: Feature title
- `description`: Feature description
- `link?`: Optional { text, onClick }
- `colorScheme?`: "primary" | "secondary" | "accent" | "warning"
- `gradient?`: Enable gradient background

---

### 3. PricingCard
Pricing card with features list and CTA.

```tsx
<PricingCard
  planName="Professional"
  price={{ monthly: 99, annual: 990 }}
  features={["Feature 1", "Feature 2", "Feature 3"]}
  popular
  onCTAClick={() => {}}
  billingPeriod="monthly"
/>
```

**Props:**
- `planName`: Plan name
- `price`: { monthly, annual } prices
- `features`: Array of feature strings
- `popular?`: Show "Most Popular" badge
- `ctaText?`: CTA button text (default: "Começar Agora")
- `onCTAClick`: Click handler
- `billingPeriod?`: "monthly" | "annual"
- `description?`: Plan description

---

### 4. StatsCounter
Animated counter with gradient text.

```tsx
<StatsCounter
  value={500}
  suffix="+"
  label="Active Users"
  icon={Users}
  colorScheme="primary"
/>
```

**Props:**
- `value`: Number to count to
- `label`: Label text
- `icon`: Lucide icon component
- `suffix?`: Suffix (e.g., "+", "%")
- `prefix?`: Prefix (e.g., "$", "~")
- `colorScheme?`: "primary" | "secondary" | "accent" | "warning"
- `duration?`: Animation duration in seconds

---

### 5. ModuleTabs
Interactive tabs for showcasing product modules.

```tsx
<ModuleTabs
  categories={[
    {
      id: "logistics",
      label: "Logistics",
      modules: [
        { name: "TMS", description: "Transport management", icon: <Truck /> }
      ]
    }
  ]}
/>
```

**Props:**
- `categories?`: Array of tab categories with modules (uses defaults if not provided)

---

### 6. LeadForm
Lead capture form with Supabase integration.

```tsx
<LeadForm
  onSuccess={() => console.log("Lead captured!")}
  plans={[
    { value: "starter", label: "Starter - $99/mo" }
  ]}
/>
```

**Props:**
- `onSuccess?`: Callback after successful submission
- `plans?`: Array of { value, label } for plan selector

**Features:**
- Name, email, phone, company fields
- Domain preview (subdomain.xyzlogicflow.com)
- Plan selector
- LGPD checkbox
- Loading states
- Toast notifications
- Supabase integration

---

### 7. TestimonialCarousel
Auto-rotating testimonials carousel.

```tsx
<TestimonialCarousel
  testimonials={[
    {
      id: 1,
      name: "John Doe",
      role: "CEO",
      company: "Acme Corp",
      quote: "Amazing product!",
      rating: 5,
      photo: "/avatar.jpg" // optional
    }
  ]}
  autoRotate
  rotateInterval={5000}
/>
```

**Props:**
- `testimonials`: Array of testimonial objects
- `autoRotate?`: Enable auto-rotation (default: true)
- `rotateInterval?`: Rotation interval in ms (default: 5000)

---

### 8. FAQAccordion
FAQ section with accordion UI.

```tsx
<FAQAccordion
  items={[
    { question: "How does it work?", answer: "It's simple..." }
  ]}
/>
```

**Props:**
- `items?`: Array of { question, answer } (uses defaults if not provided)

---

### 9. IntegrationGrid
Partner/integration logos grid.

```tsx
<IntegrationGrid
  integrations={[
    { name: "Stripe", icon: <CreditCard />, category: "Payments" }
  ]}
  columns={5}
/>
```

**Props:**
- `integrations?`: Array of { name, icon, category }
- `columns?`: 3 | 4 | 5 grid columns

---

## Design System

### Color Schemes
```typescript
const colors = {
  primary: { from: '#6366f1', to: '#8b5cf6' }, // indigo → purple
  secondary: { from: '#3b82f6', to: '#06b6d4' }, // blue → cyan
  accent: { from: '#10b981', to: '#14b8a6' }, // green → teal
  warning: { from: '#f59e0b', to: '#ef4444' } // amber → red
}
```

### Glassmorphism Style
```tsx
className="bg-white/10 dark:bg-black/10 backdrop-blur-lg border border-white/20 rounded-2xl"
```

### Gradient Text
```tsx
className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
```

## Usage Example

See `LandingExample.tsx` for a complete working example of all components.

## Dependencies

- React 18
- TypeScript
- Framer Motion (animations)
- shadcn/ui components
- lucide-react (icons)
- TailwindCSS
- Supabase client (LeadForm only)
- sonner (toast notifications)

## Accessibility

All components include:
- Semantic HTML
- ARIA labels
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

## Responsive Design

All components are mobile-first and fully responsive:
- Mobile: Single column layouts
- Tablet: 2-column grids
- Desktop: 3-5 column grids

## Dark Mode

All components support dark mode via Tailwind's `dark:` variant classes.
