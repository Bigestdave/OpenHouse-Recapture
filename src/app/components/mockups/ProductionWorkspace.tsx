import { Pause, ArrowLeft, MoreHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { IMAGES } from "../../lib/assets";
import { FrameImage } from "../primitives/FrameImage";
import { ProgressLine } from "./ProgressLine";

const SIDEBAR = [
  { name: "Brief", checked: true },
  { name: "Plan", checked: true },
  { name: "References", checked: true },
  { name: "Storyboards", checked: true },
];

const METRICS = [
  { label: "Character identity", value: 95 },
  { label: "Style consistency", value: 92 },
  { label: "Composition", value: 87 },
];

/**
 * The hero production workspace — the app's editor UI as a photographed product.
 */
export function ProductionWorkspace() {
  return (
    <div className="text-ink flex flex-col h-full bg-[#0a0a0a] select-none">
      {/* Top progress line with glowing dot */}
      <div className="relative h-[2.5px] w-full bg-[#1b1b1b]">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent"
          style={{
            boxShadow: "0 0 10px rgba(163, 230, 53, 0.7)",
          }}
          initial={{ width: 0 }}
          whileInView={{ width: "55%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Glowing dot */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#a3e635] border border-white"
            style={{
              boxShadow: "0 0 8px 2px rgba(163, 230, 53, 0.9)",
            }}
          />
        </motion.div>
      </div>

      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 md:px-5 text-[0.72rem]">
        {/* Logo */}
        <span className="text-[0.8rem] font-semibold tracking-[-0.02em] text-ink mr-2">
          Cre<span className="text-accent">8</span>Motion
        </span>

        {/* Back arrow button */}
        <button className="flex h-5 w-5 items-center justify-center rounded border border-line bg-white/[0.02] text-ink-3 hover:text-ink transition-colors cursor-pointer">
          <ArrowLeft className="h-3 w-3" />
        </button>

        {/* Path */}
        <span className="text-ink-2 font-medium">
          Fruitful Secrets <span className="text-ink-4 mx-1">/</span> Episode 04
        </span>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 ml-4">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-medium text-ink-2">Producing</span>
        </div>

        {/* Saved just now */}
        <span className="text-ink-4 hidden sm:inline ml-2">Saved just now</span>

        {/* Right tools */}
        <div className="ml-auto flex items-center gap-4 text-ink-3">
          <span className="hidden sm:inline">
            Budget <span className="text-accent font-medium">64/100</span>
          </span>
          <span className="hidden md:inline">18:42 elapsed</span>
          
          <button className="flex items-center gap-1.5 rounded border border-line bg-white/[0.02] px-2.5 py-1 text-ink-2 transition-colors hover:text-ink hover:bg-white/[0.05] cursor-pointer">
            <Pause className="h-3 w-3 fill-ink-2 text-ink-2" /> Pause
          </button>
          
          <button className="flex h-6 w-6 items-center justify-center rounded border border-line bg-white/[0.02] text-ink-2 transition-colors hover:text-ink hover:bg-white/[0.05] cursor-pointer">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_240px] flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden flex-col gap-3 border-r border-line p-4 md:flex">
          <span className="mb-1 text-[0.62rem] uppercase tracking-[0.18em] text-ink-4 font-bold">
            Production
          </span>
          {SIDEBAR.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2.5 rounded py-0.5 text-[0.72rem] text-ink-2 font-medium"
            >
              <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-accent">
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        {/* Center canvas */}
        <div className="p-4 md:p-5 flex flex-col gap-3 justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[0.78rem] font-semibold text-ink">
              Shot 06 <span className="text-ink-4 mx-1.5">•</span> Decision
            </span>
          </div>
          <FrameImage
            src={IMAGES.lumi}
            alt="Rendered animation still of the character Lumi in an evening kitchen"
            className="mx-auto w-[180px] rounded-lg border border-line aspect-[3/4] object-cover"
          />
        </div>

        {/* Right quality panel */}
        <div className="border-t border-line p-4 md:border-l md:border-t-0 md:p-5 flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-5 border-b border-line pb-2.5 text-[0.72rem]">
            <span className="text-ink-4 hover:text-ink-2 cursor-pointer transition-colors">Details</span>
            <span className="relative -mb-3 pb-3 text-accent font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-accent">
              Quality
            </span>
            <span className="text-ink-4 hover:text-ink-2 cursor-pointer transition-colors">History</span>
          </div>

          {/* AI review score */}
          <div>
            <div className="mb-2.5 flex items-end justify-between">
              <span className="text-[0.72rem] text-ink-3 font-medium">AI review</span>
              <span className="text-[2.2rem] font-bold leading-none tracking-[-0.03em] text-accent">
                89
              </span>
            </div>
            <ProgressLine value={89} height="h-[3px]" />
          </div>

          {/* Metrics list */}
          <div className="mt-2 flex flex-col gap-4">
            {METRICS.map((m) => (
              <div key={m.label} className="flex items-center justify-between text-[0.72rem]">
                <span className="text-ink-2 font-medium">{m.label}</span>
                <div className="flex items-center gap-3 w-32">
                  <ProgressLine value={m.value} height="h-[2px]" className="flex-1" />
                  <span className="text-accent text-[0.72rem] font-semibold w-5 text-right">{m.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
