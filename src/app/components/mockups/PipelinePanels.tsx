import { Check, Play, ChevronRight, ChevronDown, Video, Sparkles } from "lucide-react";
import { FrameImage } from "../primitives/FrameImage";

// ─── Asset imports ──────────────────────────────────────────────────────────

// Stage 1 – Plan
import plan1 from "../../../imports/stage1_plan/chatgpt_image_jul_17__2026__01_55_29_pm.png_1.png";
import plan2 from "../../../imports/stage1_plan/chatgpt_image_jul_17__2026__01_55_29_pm.png_2.png";
import plan3 from "../../../imports/stage1_plan/chatgpt_image_jul_17__2026__01_55_29_pm.png_3.jpg";
import plan4 from "../../../imports/stage1_plan/chatgpt_image_jul_17__2026__01_55_29_pm.png_4.png";
import plan5 from "../../../imports/stage1_plan/chatgpt_image_jul_17__2026__01_55_29_pm.png_5.png";
import plan6 from "../../../imports/stage1_plan/chatgpt_image_jul_17__2026__01_55_29_pm.png_6.png";
import plan7 from "../../../imports/stage1_plan/chatgpt_image_jul_17__2026__01_55_29_pm.png_7.jpg";
import plan8 from "../../../imports/stage1_plan/chatgpt_image_jul_17__2026__01_55_29_pm.png_8.png";
const PLAN_THUMBS = [plan1, plan2, plan3, plan4, plan5, plan6, plan7, plan8];

// Stage 2 – References
import lumiStillMain from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_1.png";
import lumiThumb1 from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_2.png";
import lumiThumb2 from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_3.png";
import lumiThumb3 from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_4.png";
import lumiThumb4 from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_5.png";
import lumiThumb5 from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_6.png";
import kaiStillMain from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_7.png";
import kaiThumb1 from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_8.png";
import kaiThumb2 from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_9.png";
import kaiThumb3 from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_10.png";
import kaiThumb4 from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_11.png";
import kitchenStillMain from "../../../imports/stage2_locations/container_3.jpg";
import kitchenThumb1 from "../../../imports/stage2_locations/container_1.jpg";
import kitchenThumb2 from "../../../imports/stage2_locations/container_2.jpg";
import kitchenThumb3 from "../../../imports/stage2_locations/container_3.jpg";
import propStillMain from "../../../imports/stage2_references/chatgpt_image_jul_17__2026__01_55_43_pm.png_12.png";

// Stage 3 – Storyboard
import storyboard1 from "../../../imports/stage3_storyboard/container_1.png";
import storyboard2 from "../../../imports/stage3_storyboard/container_2.png";
import storyboard3 from "../../../imports/stage3_storyboard/container_3.png";
import storyboard4 from "../../../imports/stage3_storyboard/container_4.jpg";
import storyboard5 from "../../../imports/stage3_storyboard/container_5.png";
import storyboard6 from "../../../imports/stage3_storyboard/container_6.png";
import storyboard7 from "../../../imports/stage3_storyboard/container_7.png";
import storyboard8 from "../../../imports/stage3_storyboard/container_8.png";
import storyboardSketch from "../../../imports/stage3_storyboard/container_9.jpg";
const STORYBOARD_THUMBS = [storyboard1, storyboard2, storyboard3, storyboard4, storyboard5, storyboard6, storyboard7, storyboard8];

// Stage 4 – Animation
import keyframeStill from "../../../imports/stage4_animation/chatgpt_image_jul_17__2026__01_55_50_pm.png_1.png";
import animationStill from "../../../imports/stage4_animation/chatgpt_image_jul_17__2026__01_55_50_pm.png_2.png";

// Stage 6 – Assembly
import assemblyPreview from "../../../imports/stage6_assembly/chatgpt_image_jul_17__2026__01_56_20_pm.png_1.png";
import asm1 from "../../../imports/stage6_assembly/chatgpt_image_jul_17__2026__01_56_20_pm.png_2.png";
import asm2 from "../../../imports/stage6_assembly/chatgpt_image_jul_17__2026__01_56_20_pm.png_3.png";
import asm3 from "../../../imports/stage6_assembly/chatgpt_image_jul_17__2026__01_56_20_pm.png_4.png";
import asm4 from "../../../imports/stage6_assembly/chatgpt_image_jul_17__2026__01_56_20_pm.png_5.png";
import asm5 from "../../../imports/stage6_assembly/chatgpt_image_jul_17__2026__01_56_20_pm.png_6.png";
import asm6 from "../../../imports/stage6_assembly/chatgpt_image_jul_17__2026__01_56_20_pm.png_7.png";
import asm7 from "../../../imports/stage6_assembly/chatgpt_image_jul_17__2026__01_56_20_pm.png_8.png";
import asm8 from "../../../imports/stage6_assembly/chatgpt_image_jul_17__2026__01_56_20_pm.png_9.png";
import waveform from "../../../imports/stage6_assembly/chatgpt_image_jul_17__2026__01_56_20_pm.png_10.png";

// ─── Shared shell ───────────────────────────────────────────────────────────

function PanelShell({
  kicker,
  title,
  rightContent,
  children,
}: {
  kicker: string;
  title: string;
  rightContent?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col text-ink bg-[#0a0a0a] select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div>
          <div className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-accent">{kicker}</div>
          <div className="mt-1 text-[1.05rem] font-semibold tracking-[-0.01em] text-ink">{title}</div>
        </div>
        {rightContent && <div>{rightContent}</div>}
      </div>
      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-5 md:p-6 flex flex-col gap-5">
        {children}
      </div>
    </div>
  );
}

// Small accent pill used in headers
function StatusPill({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "live" }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/8 px-2.5 py-1 text-[0.65rem] font-semibold text-accent">
      {variant === "live" && <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
      {children}
    </span>
  );
}

// ─── 01 · Plan ──────────────────────────────────────────────────────────────

export function PlanPanel() {
  const stats = [
    { label: "Duration", value: "00:45" },
    { label: "Shots", value: "8" },
    { label: "Characters", value: "2" },
    { label: "Location", value: "Kitchen" },
    { label: "Budget", value: "64/100" },
    { label: "Retry", value: "12%" },
  ];
  const rows = [
    { n: "01", name: "Establishment", desc: "Garden cottage at sunset", time: "4s", budget: "6" },
    { n: "02", name: "Relationship", desc: "Lumi at the table", time: "5s", budget: "7" },
    { n: "03", name: "Disruption", desc: "Lumi's locket starts to glow", time: "5s", budget: "8" },
    { n: "04", name: "Discovery", desc: "Broken window, Lumi hears something", time: "6s", budget: "8" },
    { n: "05", name: "Reaction", desc: "Lumi reacts to the sound", time: "5s", budget: "6" },
    { n: "06", name: "Decision", desc: "She decides to investigate", time: "5s", budget: "7" },
    { n: "07", name: "Reversal", desc: "She opens the door — it's the wind", time: "7s", budget: "8" },
    { n: "08", name: "Resolution", desc: "Lumi and Kai share a quiet moment", time: "7s", budget: "8" },
  ];
  return (
    <PanelShell kicker="PLAN" title="Fruitful Secrets · Episode 05" rightContent={<StatusPill>Planned</StatusPill>}>
      {/* Stats row */}
      <div className="grid grid-cols-6 gap-px overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.03]">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col bg-[#0a0a0a] px-3 py-2.5">
            <span className="text-[0.58rem] text-white/40 uppercase font-semibold tracking-wider">{s.label}</span>
            <span className="text-[0.82rem] text-ink font-medium mt-0.5">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Shot list */}
      <div className="flex flex-col gap-1">
        <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/30 font-bold mb-1">Shot plan</span>
        {/* Header */}
        <div className="grid grid-cols-[24px_44px_80px_1fr_36px_36px] gap-2 px-3 py-1.5 text-[0.58rem] text-white/30 uppercase font-bold tracking-wider">
          <span>#</span>
          <span className="col-span-2">Shot</span>
          <span>Description</span>
          <span>Time</span>
          <span>Cost</span>
        </div>
        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={row.n}
            className={`grid grid-cols-[24px_44px_80px_1fr_36px_36px] gap-2 items-center rounded-lg px-3 py-2 transition-all ${
              i === 3
                ? "bg-accent/8 border border-accent/30"
                : "border border-transparent hover:bg-white/[0.02]"
            }`}
          >
            <span className={`text-[0.7rem] font-semibold tabular-nums ${i === 3 ? "text-accent" : "text-white/25"}`}>{row.n}</span>
            <FrameImage src={PLAN_THUMBS[i]} alt={row.name} className="h-7 w-11 shrink-0 rounded-md" />
            <span className={`text-[0.72rem] font-semibold truncate ${i === 3 ? "text-accent" : "text-ink"}`}>{row.name}</span>
            <span className={`text-[0.68rem] truncate ${i === 3 ? "text-accent/70" : "text-white/35"}`}>{row.desc}</span>
            <span className={`text-[0.68rem] tabular-nums ${i === 3 ? "text-accent" : "text-white/30"}`}>{row.time}</span>
            <span className={`text-[0.68rem] tabular-nums ${i === 3 ? "text-accent" : "text-white/30"}`}>{row.budget}</span>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

// ─── 02 · Lock references ───────────────────────────────────────────────────

export function ReferencesPanel() {
  const chars = [
    { name: "Lumi", note: "6 references · Ready", img: lumiStillMain, active: true, thumbs: [lumiThumb1, lumiThumb2, lumiThumb3, lumiThumb4, lumiThumb5] },
    { name: "Kai", note: "5 references · Ready", img: kaiStillMain, active: false, thumbs: [kaiThumb1, kaiThumb2, kaiThumb3, kaiThumb4] },
  ];
  return (
    <PanelShell
      kicker="REFERENCES"
      title="Fruitful Secrets · Episode 05"
      rightContent={
        <div className="flex items-center gap-3 w-44">
          <span className="text-white/40 text-[0.65rem] font-medium whitespace-nowrap">11 of 12 ready</span>
          <div className="relative w-full h-[3px] rounded-full bg-white/8 overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-accent rounded-full" style={{ width: "91%" }} />
          </div>
        </div>
      }
    >
      {/* Characters */}
      <div className="flex flex-col gap-2">
        <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/30 font-bold">Characters</span>
        <div className="grid grid-cols-2 gap-3">
          {chars.map((c) => (
            <div key={c.name} className={`flex flex-col rounded-xl border p-2.5 bg-white/[0.02] ${c.active ? "border-accent/40" : "border-white/[0.06]"}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-[0.82rem] font-semibold text-ink">{c.name}</span>
                  <p className="text-[0.62rem] text-white/35 mt-0.5">{c.note}</p>
                </div>
                <ChevronRight className="h-3 w-3 text-white/20" />
              </div>
              <FrameImage src={c.img} alt={c.name} className="aspect-[4/3] w-full rounded-lg" />
              <div className="flex gap-1.5 mt-2 pt-2 border-t border-white/[0.06] mt-auto overflow-x-auto no-scrollbar">
                {c.thumbs.map((t, j) => (
                  <div key={j} className="h-9 w-11 rounded-md shrink-0 overflow-hidden">
                    <FrameImage src={t} alt="Thumbnail reference" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Locations + Props */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/30 font-bold">Locations</span>
          <div className="rounded-xl border border-white/[0.06] p-2.5 bg-white/[0.02]">
            <div className="mb-2">
              <span className="text-[0.78rem] font-semibold text-ink">Kitchen</span>
              <p className="text-[0.62rem] text-accent mt-0.5">3 angles · Ready</p>
            </div>
            <FrameImage src={kitchenStillMain} alt="Kitchen" className="aspect-[16/9] w-full rounded-lg" />
            <div className="flex gap-1.5 mt-2 pt-2 border-t border-white/[0.06] no-scrollbar">
              {[kitchenThumb1, kitchenThumb2, kitchenThumb3].map((t, j) => (
                <div key={j} className="h-7 w-12 rounded-md shrink-0 overflow-hidden">
                  <FrameImage src={t} alt="Kitchen thumbnail" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/30 font-bold">Props</span>
          <div className="rounded-xl border border-white/[0.06] p-2.5 bg-white/[0.02] flex flex-col h-full justify-between">
            <div>
              <span className="text-[0.78rem] font-semibold text-ink">Moon necklace</span>
              <p className="text-[0.62rem] text-accent mt-0.5">Ready</p>
            </div>
            <FrameImage src={propStillMain} alt="Moon necklace" className="aspect-[16/9] w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Generating indicator */}
      <div className="flex items-center gap-3 rounded-xl border border-accent/15 bg-accent/5 p-3.5">
        <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10">
          <div className="h-3 w-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
        <div className="flex-1">
          <div className="text-[0.76rem] font-medium text-ink">Preparing evening view</div>
          <div className="text-[0.65rem] text-white/35">Kitchen · Evening lighting</div>
        </div>
        <span className="text-[0.65rem] text-accent font-semibold animate-pulse">Generating…</span>
      </div>
    </PanelShell>
  );
}

// ─── 03 · Storyboard ────────────────────────────────────────────────────────

export function StoryboardPanel() {
  const list = [
    { n: "01", name: "Establishment", sec: "4 sec", status: "Approved" as const },
    { n: "02", name: "Relationship", sec: "5 sec", status: "Approved" as const },
    { n: "03", name: "Disruption", sec: "5 sec", status: "Approved" as const },
    { n: "04", name: "Discovery", sec: "6 sec", status: "Approved" as const, active: true },
    { n: "05", name: "Reaction", sec: "5 sec", status: "Approved" as const },
    { n: "06", name: "Decision", sec: "5 sec", status: "Approved" as const },
    { n: "07", name: "Reversal", sec: "7 sec", status: "Reviewing" as const },
    { n: "08", name: "Resolution", sec: "8 sec", status: "Pending" as const },
  ];
  return (
    <PanelShell
      kicker="STORYBOARDS"
      title="Fruitful Secrets · Episode 05"
      rightContent={
        <div className="flex items-center gap-2 text-[0.65rem]">
          <span className="text-accent font-semibold">6 Approved</span>
          <span className="text-[#f0b45d] font-semibold">· 1 Reviewing</span>
          <span className="text-white/30 font-semibold">· 1 Pending</span>
        </div>
      }
    >
      {/* Cards grid */}
      <div className="grid grid-cols-4 gap-2">
        {list.map((s, i) => {
          const border = s.active ? "border-accent/50" : s.status === "Reviewing" ? "border-[#f0b45d]/40" : "border-white/[0.06]";
          const statusColor = s.status === "Approved" ? "text-accent" : s.status === "Reviewing" ? "text-[#f0b45d]" : "text-white/30";
          return (
            <div key={s.n} className={`rounded-xl border bg-white/[0.02] p-1.5 flex flex-col gap-1.5 ${border}`}>
              <FrameImage src={STORYBOARD_THUMBS[i]} alt={s.name} className="aspect-[16/10] w-full rounded-lg" />
              <div className="px-0.5">
                <div className="text-[0.65rem] font-semibold text-ink truncate">{s.n} · {s.name}</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[0.58rem] text-white/30">{s.sec}</span>
                  <div className="flex items-center gap-1">
                    {s.status === "Approved" ? (
                      <div className="flex h-3 w-3 items-center justify-center rounded-full bg-accent text-[#0a0a0a]">
                        <Check className="h-2 w-2" strokeWidth={3} />
                      </div>
                    ) : s.status === "Reviewing" ? (
                      <div className="h-3 w-3 rounded-full border-[1.5px] border-[#f0b45d]" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border-[1.5px] border-white/20" />
                    )}
                    <span className={`text-[0.58rem] font-semibold ${statusColor}`}>{s.status}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail card */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-5">
        <FrameImage src={storyboardSketch} alt="Shot 04 sketch" className="w-[160px] shrink-0 aspect-[4/3] rounded-lg" />
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-[0.85rem] font-semibold text-ink pb-2 border-b border-white/[0.06]">Shot 04 · Discovery</div>
          <div className="grid grid-cols-[76px_1fr] gap-y-2 text-[0.7rem]">
            <span className="text-white/30">Characters</span>
            <span className="text-ink font-medium">Lumi</span>
            <span className="text-white/30">Background</span>
            <span className="text-ink font-medium">Kitchen · Evening</span>
            <span className="text-white/30">Props</span>
            <span className="text-ink font-medium">Moon necklace<br />Broken window</span>
            <span className="text-white/30">Composition</span>
            <span className="text-ink font-medium">Wide frame · Character left</span>
            <span className="text-white/30 self-center">Continuity</span>
            <div className="flex items-center gap-2.5">
              <span className="text-accent font-bold text-[0.78rem]">91</span>
              <div className="relative flex-1 h-[3px] rounded-full bg-white/8 overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-accent rounded-full" style={{ width: "91%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

// ─── 04 · Animate ───────────────────────────────────────────────────────────

export function AnimatePanel() {
  return (
    <PanelShell
      kicker="ANIMATION"
      title="Shot 06 · Decision"
      rightContent={<StatusPill variant="live">Generating animation</StatusPill>}
    >
      {/* Side-by-side keyframe → clip */}
      <div className="grid grid-cols-[1fr_auto_1.5fr] items-center gap-5 py-2">
        {/* Keyframe */}
        <div className="flex flex-col gap-2">
          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/30 font-bold">Approved keyframe</span>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <FrameImage src={keyframeStill} alt="Approved keyframe" className="aspect-[3/4] w-full" />
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <span className="text-[1.8rem] font-light text-accent/60 select-none">→</span>
        </div>

        {/* Animated clip */}
        <div className="flex flex-col gap-2">
          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-accent font-bold">Animated clip</span>
          <div className="relative rounded-xl border border-accent/40 bg-white/[0.02] overflow-hidden">
            <FrameImage src={animationStill} alt="Animated clip" className="aspect-[4/3] w-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/15">
                <Play className="h-4 w-4 fill-current text-white ml-0.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motion instruction */}
      <div className="flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-accent">
          <Video className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-[0.58rem] uppercase tracking-[0.12em] text-white/30 font-bold">Motion instruction</div>
          <div className="text-[0.76rem] text-white/60 leading-relaxed mt-1">Lumi lowers the necklace and steps backward as the camera slowly moves closer.</div>
        </div>
      </div>
    </PanelShell>
  );
}

// ─── 05 · Review & repair ───────────────────────────────────────────────────

export function ReviewPanel() {
  return (
    <PanelShell kicker="QUALITY REVIEW" title="Shot 06 · Decision">
      {/* Attempt 1 vs Reference — two label+card columns */}
      <div className="grid grid-cols-[1fr_1fr] gap-5">
        {/* Attempt 1 */}
        <div className="flex flex-col gap-2">
          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/30 font-bold">Attempt 1</span>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <FrameImage src={keyframeStill} alt="Attempt 1" className="aspect-[4/3] w-full" />
          </div>
          <div className="flex items-baseline justify-between px-1">
            <div>
              <div className="text-[0.58rem] text-white/30 uppercase font-semibold">Quality</div>
              <div className="text-[1.6rem] font-bold leading-none text-[#f27474] mt-1">71</div>
            </div>
            <div className="text-right">
              <div className="text-[0.65rem] text-[#f27474] font-bold uppercase">Failed</div>
              <p className="text-[0.62rem] text-white/35 mt-0.5">Hand movement missing</p>
            </div>
          </div>
          <div className="relative w-full h-[3px] rounded-full bg-white/8 overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-[#f27474] rounded-full" style={{ width: "71%" }} />
          </div>
        </div>

        {/* Approved Reference */}
        <div className="flex flex-col gap-2">
          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/30 font-bold">Approved reference</span>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            <FrameImage src={lumiStillMain} alt="Reference" className="aspect-[4/3] w-full" />
          </div>
          <div className="flex items-baseline justify-between px-1">
            <div>
              <div className="text-[0.58rem] text-white/30 uppercase font-semibold">Quality</div>
              <div className="text-[1.6rem] font-bold leading-none text-accent mt-1">94</div>
            </div>
            <div className="text-right">
              <div className="text-[0.65rem] text-accent font-bold uppercase">Reference</div>
              <p className="text-[0.62rem] text-white/35 mt-0.5">Intended hand movement visible</p>
            </div>
          </div>
          <div className="relative w-full h-[3px] rounded-full bg-white/8 overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-accent rounded-full" style={{ width: "94%" }} />
          </div>
        </div>
      </div>

      {/* Down chevron */}
      <div className="flex justify-center -my-2">
        <ChevronDown className="h-5 w-5 text-accent/50" />
      </div>

      {/* Attempt 2 */}
      <div className="flex flex-col gap-2">
        <span className="text-[0.6rem] uppercase tracking-[0.15em] text-white/30 font-bold">Attempt 2</span>
        <div className="grid grid-cols-[1.6fr_1fr] gap-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden relative">
            <FrameImage src={animationStill} alt="Attempt 2" className="aspect-[16/10] w-full" />
          </div>
          <div className="rounded-xl border border-accent/40 bg-white/[0.02] p-4 flex flex-col justify-between">
            <div>
              <div className="text-[0.58rem] text-white/30 uppercase font-semibold">Quality</div>
              <div className="text-[2rem] font-bold leading-none text-accent mt-1.5">89</div>
              <div className="relative w-full h-[3px] rounded-full bg-white/8 overflow-hidden mt-3">
                <div className="absolute inset-y-0 left-0 bg-accent rounded-full" style={{ width: "89%" }} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[#0a0a0a]">
                <Check className="h-3 w-3" strokeWidth={3} />
              </div>
              <span className="text-[0.78rem] font-bold text-ink">Approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <Sparkles className="h-4 w-4 text-accent shrink-0" />
        <div>
          <span className="text-[0.58rem] uppercase tracking-[0.12em] text-white/30 font-bold">Cre8Motion recommends</span>
          <p className="text-[0.76rem] text-white/60 font-medium mt-1">Preserve identity and lighting. Simplify the hand movement.</p>
        </div>
      </div>
    </PanelShell>
  );
}

// ─── 06 · Assembly ──────────────────────────────────────────────────────────

export function AssemblyPanel() {
  const shots = [
    { img: asm1, n: "S01", name: "Establishment", sec: "4 sec" },
    { img: asm2, n: "S02", name: "Relationship", sec: "5 sec" },
    { img: asm3, n: "S03", name: "Disruption", sec: "5 sec" },
    { img: asm4, n: "S04", name: "Discovery", sec: "6 sec" },
    { img: asm5, n: "S05", name: "Reaction", sec: "5 sec" },
    { img: asm6, n: "S06", name: "Decision", sec: "5 sec" },
    { img: asm7, n: "S07", name: "Reversal", sec: "7 sec" },
    { img: asm8, n: "S08", name: "Resolution", sec: "8 sec" },
  ];
  return (
    <PanelShell
      kicker="ASSEMBLY"
      title="Fruitful Secrets · Episode 05"
      rightContent={
        <div className="flex items-center gap-3">
          <StatusPill>All shots approved</StatusPill>
          <span className="text-white/30 text-[0.62rem]">00:45 · Vertical (9:16) · Ready for review</span>
        </div>
      }
    >
      <div className="grid grid-cols-[1.1fr_1fr] gap-5 flex-1">
        {/* Video player */}
        <div className="flex flex-col">
          <div className="relative w-full aspect-[9/16] rounded-xl border border-white/[0.06] overflow-hidden bg-black">
            <FrameImage src={assemblyPreview} alt="Episode preview" className="h-full w-full object-cover" />
            {/* Controls overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3.5 flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shrink-0">
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </button>
                <span className="text-[0.62rem] text-white/80 font-medium tabular-nums shrink-0">00:28 / 00:45</span>
                <div className="relative flex-1 h-[3px] bg-white/20 rounded-full">
                  <div className="absolute inset-y-0 left-0 bg-accent rounded-full" style={{ width: "62%" }} />
                  <div className="absolute left-[62%] top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-white rounded-full shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex flex-col">
          <span className="text-[0.78rem] font-semibold text-ink">Episode assembly</span>
          <span className="text-[0.62rem] text-white/35 mt-0.5">8 approved shots · 1 master audio mix</span>

          <div className="relative flex-1 mt-3 flex flex-col gap-1.5 pl-4 border-l border-white/[0.06]">
            {shots.map((s) => (
              <div key={s.n} className="relative flex items-center gap-2.5 rounded-lg bg-white/[0.02] p-1.5 border border-white/[0.06]">
                <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-accent" />
                <FrameImage src={s.img} alt={s.name} className="h-7 w-11 shrink-0 rounded-md" />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.68rem] font-medium text-ink truncate">{s.n} · {s.name}</p>
                </div>
                <span className="text-[0.58rem] text-white/30 tabular-nums shrink-0">{s.sec}</span>
                <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-accent text-[#0a0a0a]">
                  <Check className="h-2 w-2" strokeWidth={3} />
                </div>
              </div>
            ))}
          </div>

          {/* Master audio */}
          <div className="mt-3 flex flex-col gap-1.5 border-t border-white/[0.06] pt-3">
            <div className="flex justify-between items-center">
              <span className="text-[0.68rem] font-semibold text-ink">Master audio mix</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[0.62rem] text-white/40 font-medium">00:45</span>
                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[#0a0a0a]">
                  <Check className="h-2 w-2" strokeWidth={3} />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-1.5 h-8">
              <FrameImage src={waveform} alt="Audio mix" className="h-full w-full" imgClassName="object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Episode ready footer */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-accent/15 bg-accent/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[#0a0a0a]">
            <Check className="h-4 w-4" strokeWidth={3} />
          </div>
          <div>
            <span className="text-[0.78rem] font-bold text-ink">Episode ready</span>
            <p className="text-[0.65rem] text-white/40 mt-0.5">Review the final episode or export for distribution.</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] px-4 py-2 text-[0.72rem] text-ink font-semibold transition-colors cursor-pointer">
          Review final episode <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </PanelShell>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────

export const PIPELINE_PANELS = [
  PlanPanel,
  ReferencesPanel,
  StoryboardPanel,
  AnimatePanel,
  ReviewPanel,
  AssemblyPanel,
];
