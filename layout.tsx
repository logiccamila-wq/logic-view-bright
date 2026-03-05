// frontend/app/layout.tsx
import './globals.css'; // ajuste se tiver outro nome

export const metadata = {
  title: 'OptiLog',
  description: 'App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
