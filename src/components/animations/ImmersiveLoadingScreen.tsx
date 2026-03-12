import { motion } from "framer-motion";
import { BarChart3, Globe2, Palette, Truck } from "lucide-react";

interface ImmersiveLoadingScreenProps {
  title?: string;
  subtitle?: string;
}

const signalBars = [40, 72, 55, 88, 63];

export default function ImmersiveLoadingScreen({
  title = "Carregando cockpit logístico",
  subtitle = "Preparando a experiência premium com vidro 3D, cores personalizadas e painéis dinâmicos.",
}: ImmersiveLoadingScreenProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.35),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.18),transparent_22%),linear-gradient(160deg,#020617_0%,#0f172a_48%,#111c38_100%)]" />

      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl"
        animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl"
          >
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-4">
                <Truck className="h-8 w-8 text-blue-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-200/80">Pilot Blue</p>
                <h1 className="mt-2 text-3xl font-black">{title}</h1>
              </div>
            </div>

            <p className="max-w-xl text-base text-slate-300">{subtitle}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Globe2, label: "Idiomas", value: "4 opções" },
                { icon: Palette, label: "Paletas", value: "3 estilos" },
                { icon: BarChart3, label: "Painéis", value: "Glass 3D" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <item.icon className="h-5 w-5 text-cyan-300" />
                  <div className="mt-3 text-xl font-bold text-white">{item.value}</div>
                  <div className="text-sm text-slate-400">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="relative"
          >
            <div className="absolute left-10 top-10 right-6 bottom-0 rounded-[2rem] border border-cyan-300/10 bg-cyan-400/5 blur-sm" />
            <div className="absolute left-6 top-6 right-10 bottom-4 rounded-[2rem] border border-blue-300/10 bg-blue-400/5 blur-sm" />

            <div className="relative rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Realtime preview</p>
                  <h2 className="mt-2 text-2xl font-bold">Montando gráficos, camadas e microanimações</h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  99.9% uptime
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-end gap-3">
                  {signalBars.map((bar, index) => (
                    <motion.div
                      key={index}
                      className="flex-1 rounded-full bg-gradient-to-t from-blue-600 via-sky-400 to-cyan-200"
                      style={{ height: `${bar}%`, minHeight: "2.5rem" }}
                      animate={{ opacity: [0.45, 1, 0.45] }}
                      transition={{ duration: 1.8, delay: index * 0.16, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  "Sincronizando idioma e branding",
                  "Aplicando profundidade em vidro",
                  "Destacando KPIs por cor",
                  "Ativando transições didáticas",
                ].map((step, index) => (
                  <motion.div
                    key={step}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                    animate={{ y: [0, index % 2 === 0 ? -4 : 4, 0] }}
                    transition={{ duration: 3 + index * 0.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
