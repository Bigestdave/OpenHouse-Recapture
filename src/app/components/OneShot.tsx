import { Check, Play, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { FrameImage } from "./primitives/FrameImage";
import imgReference from "../../imports/pipeline-stages/765c725f543c202b42b79dd7e546ea6c5c79541f.png";
import imgStoryboard from "../../imports/pipeline-stages/52d12d5276d3b42869270065920ed6d100eb781e.png";
import imgKeyframe from "../../imports/pipeline-stages/d2972aef9e189d2b6eed389b05c8a4767bcbcf08.png";
import imgAnimation from "../../imports/pipeline-stages/d84dbd9288924262c0f45e150a16028cf74e02e7.png";
import imgLumiCharacter from "../../imports/image-4.png";

type ProductionItem = { label: string; state: "done" | "active" | "todo" };

const PRODUCTION: ProductionItem[] = [
  { label: "Brief", state: "done" },
  { label: "Plan", state: "done" },
  { label: "References", state: "done" },
  { label: "Storyboards", state: "done" },
  { label: "Keyframes", state: "active" },
  { label: "Animation", state: "todo" },
  { label: "Audio", state: "todo" },
  { label: "Assembly", state: "todo" },
  { label: "Final review", state: "todo" },
];

const TABS = [
  { label: "Reference", active: false },
  { label: "Storyboard", active: false },
  { label: "Keyframe", active: true },
  { label: "Animation", active: false },
];

const STAGE_LABELS = [
  { label: "Approved reference", accent: false },
  { label: "Storyboard", accent: false },
  { label: "Keyframe", accent: true },
  { label: "Animated result", accent: false },
];

const PROGRESS = ["done", "done", "active", "todo"] as const;

const THUMBS = [
  { src: imgReference, alt: "Approved reference of Lumi", play: false, active: false },
  { src: imgStoryboard, alt: "Storyboard sketch of the shot", play: false, active: false },
  { src: imgKeyframe, alt: "Keyframe of Lumi in the kitchen", play: false, active: true },
  { src: imgAnimation, alt: "Animated result of the shot", play: true, active: false },
];

function ItemBox({ state }: { state: ProductionItem["state"] }) {
  if (state === "done") {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-lg border border-accent">
        <Check className="size-2.5 text-accent" strokeWidth={3} />
      </span>
    );
  }
  if (state === "active") {
    return <span className="size-4 shrink-0 rounded-lg bg-accent" />;
  }
  return <span className="size-4 shrink-0 rounded-lg border border-ink-4/60" />;
}

export function OneShot() {
  const reduce = useReducedMotion();

  const reveal = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section className="bg-app">
      <div className="mx-auto w-full max-w-[1536px] px-6 pb-10 pt-14 md:px-10 md:pt-16">
        <motion.div {...reveal} className="flex flex-col gap-5">
          <p className="text-[14px] uppercase tracking-[1.5px] text-accent">
            Watch the showrunner work
          </p>
          <h2 className="text-[clamp(40px,6vw,74px)] font-semibold leading-[1.02] tracking-[-1.5px] text-ink">
            One shot.
            <br />
            Every stage of production.
          </h2>
          <p className="max-w-[560px] text-[20px] leading-[1.4] text-ink-3">
            Follow the same character and scene from approved reference to finished
            animation.
          </p>
        </motion.div>

        {/* Product card */}
        <motion.div
          {...reveal}
          className="relative mt-12 overflow-hidden rounded-2xl border border-line bg-surface"
        >
          {/* Top bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line px-7 py-5 lg:pr-[40%]">
            <div className="flex items-center gap-3.5 text-[16px]">
              <span className="text-ink-2">Fruitful Secrets</span>
              <span className="text-ink-5">/</span>
              <span className="text-ink-2">Episode 05</span>
            </div>
            <div className="flex items-center gap-2.5 text-[15px]">
              <span className="size-2.5 rounded-full bg-accent" />
              <span className="text-ink">Ready for review</span>
              <span className="text-ink-5">|</span>
              <span className="text-ink-4">Saved just now</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-stretch lg:pr-[38%]">
            {/* Left rail */}
            <div className="border-b border-line px-7 py-6 lg:w-[190px] lg:shrink-0 lg:border-b-0 lg:border-r">
              <p className="text-[12px] uppercase tracking-[1px] text-ink-4">
                Production
              </p>
              <ul className="mt-3 flex flex-col">
                {PRODUCTION.map((item) => (
                  <li key={item.label} className="flex items-center gap-3 py-2.5">
                    <ItemBox state={item.state} />
                    <span
                      className={`text-[15px] ${
                        item.state === "active" ? "text-ink" : "text-ink-3"
                      }`}
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Center */}
            <div className="min-w-0 flex-1 px-8 py-7">
              <div className="flex flex-col gap-2.5">
                <p className="text-[26px] text-ink">
                  Shot 06 <span className="text-ink-4">·</span>{" "}
                  <span className="text-[20px] text-ink-2">Decision</span>
                </p>
                <p className="text-[15px] text-ink-3">
                  Character: <span className="text-accent">Lumi</span> · Scene:
                  Kitchen – Evening
                </p>

                {/* Tab pills */}
                <div className="mt-2 flex w-fit gap-1.5 rounded-[10px] bg-raised-2/40 p-1.5">
                  {TABS.map((tab) => (
                    <span
                      key={tab.label}
                      className={`rounded-[7px] px-5 py-2 text-[15px] ${
                        tab.active
                          ? "border-b-2 border-accent text-ink"
                          : "text-ink-3"
                      }`}
                    >
                      {tab.label}
                    </span>
                  ))}
                </div>

                {/* Stage progress dotted line */}
                <div className="mt-4 flex max-w-[740px] items-center">
                  {PROGRESS.map((state, i) => (
                    <div key={i} className="flex flex-1 items-center last:flex-none">
                      <span
                        className={`size-3.5 shrink-0 rounded-[7px] ${
                          state === "active" ? "bg-accent" : "bg-raised-2"
                        }`}
                      />
                      {i < PROGRESS.length - 1 && (
                        <span className="h-0.5 flex-1 bg-raised-2/70" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Stage labels */}
                <div className="mt-1 flex max-w-[740px] items-center justify-between text-[14px]">
                  {STAGE_LABELS.map((s, i) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span className={s.accent ? "text-accent" : "text-ink-4"}>
                        {s.label}
                      </span>
                      {i < STAGE_LABELS.length - 1 && (
                        <ArrowRight className="size-3.5 text-ink-5" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Thumbnails */}
                <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {THUMBS.map((t) => (
                    <div key={t.alt} className="relative">
                      <FrameImage
                        src={t.src}
                        alt={t.alt}
                        className={`aspect-[4/3] w-full rounded-[10px] border ${
                          t.active ? "border-2 border-accent" : "border-line"
                        }`}
                        imgClassName="object-cover"
                      />
                      {t.play && (
                        <span className="absolute bottom-2.5 left-2.5 flex size-[30px] items-center justify-center rounded-full border border-ink-4/70 bg-black/50">
                          <Play className="size-3 text-ink" fill="currentColor" />
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lumi character (mobile) — stacked band below the details */}
            <div className="relative h-[300px] w-full overflow-hidden border-t border-line lg:hidden">
              <FrameImage
                src={imgLumiCharacter}
                alt="Rendered animation still of the character Lumi in an evening kitchen"
                className="absolute inset-0 size-full"
                imgClassName="object-cover object-top"
              />
            </div>
          </div>

          {/* Lumi character (desktop) — spans the full card height so the top-bar
              divider line crosses behind her, with the head sitting above the line */}
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] overflow-hidden lg:block">
            <FrameImage
              src={imgLumiCharacter}
              alt="Rendered animation still of the character Lumi in an evening kitchen"
              className="absolute inset-0 size-full"
              imgClassName="object-cover object-top"
            />
            {/* subtle left fade so the seam with the center content is soft */}
            <div className="absolute inset-0 bg-gradient-to-r from-surface/70 via-transparent to-transparent" />
          </div>
        </motion.div>

        <motion.p
          {...reveal}
          className="mt-8 text-center text-[16px] text-ink-4"
        >
          Cre8Motion preserves the approved character, world, and visual direction at
          every stage.
        </motion.p>
      </div>
    </section>
  );
}
