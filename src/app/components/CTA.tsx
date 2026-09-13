import { Play, Activity, Eye, RefreshCw } from "lucide-react";
import { Section } from "./primitives/Section";
import { EditorialHeading } from "./primitives/EditorialHeading";
import { MotionReveal } from "./primitives/MotionReveal";
import { CTAButton } from "./primitives/CTAButton";
import { FrameImage } from "./primitives/FrameImage";
import { fadeUpSmall, fadeUp, stagger } from "../lib/motion";
import { motion, useReducedMotion } from "motion/react";
import filmStrip from "../../imports/cta-panels/600c309842e02bfdb92ab332e6d34c61afa23aee.png";
import svgPaths from "../../imports/cta-panels/svg-u3nrh017qp";

/** The real Qwen Cloud hackathon logo mark, reused from the imported design. */
function QwenLogo({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 34.8132 36">
      <g clipPath="url(#clip0_13_1268)">
        <path d={svgPaths.p3713ce00} fill="#FEFEFE" />
        <path d={svgPaths.p29bec280} fill="#6551DE" />
        <path d={svgPaths.p12e9ab80} fill="#FEFEFE" />
        <path d={svgPaths.pc2bb580} fill="#A8ABFE" />
        <path d={svgPaths.p18fd200} fill="#C4C4FF" />
        <path d={svgPaths.p1c6f1c80} fill="url(#paint0_linear_13_1268)" />
        <path d={svgPaths.p34dee600} fill="#FEFEFE" />
        <path d={svgPaths.p27b33780} fill="#6551DE" />
        <path d={svgPaths.p3e3c3400} fill="#736DDE" />
        <path d={svgPaths.p2c550800} fill="#60619E" />
        <path d={svgPaths.p2d692f00} fill="#736DDE" />
        <path d={svgPaths.p28eba300} fill="#6551DE" />
        <path d={svgPaths.p3033dd00} fill="#9796B5" />
        <path d={svgPaths.p2428e100} fill="#60619E" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_13_1268" x1="23.9826" x2="34.7046" y1="14.8117" y2="21.9716">
          <stop stopColor="#CAC8E9" />
          <stop offset="1" stopColor="#F6FBFC" />
        </linearGradient>
        <clipPath id="clip0_13_1268">
          <rect fill="white" height="36" width="34.8132" />
        </clipPath>
      </defs>
    </svg>
  );
}

const FEATURES = [
  {
    n: "01",
    icon: Activity,
    title: "Real-time stages",
    desc: "See each production stage as it happens.",
  },
  {
    n: "02",
    icon: Eye,
    title: "Multimodal review",
    desc: "AI reviews video, image, audio, and continuity together.",
  },
  {
    n: "03",
    icon: RefreshCw,
    title: "Budget-aware retries",
    desc: "Retries are targeted, controlled, and cost-efficient.",
  },
];

export function CTA() {
  const reduce = useReducedMotion();
  return (
    <Section spacing="none" className="pt-14 md:pt-18 pb-36 md:pb-48">
      {/* Hero: full film strip fills the right of the band, copy at the lower-left */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Film strip storyboard — fills the full height of the band, runs to the right edge */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[85%] sm:w-[70%] md:w-[62%] lg:w-[58%]">
          <FrameImage
            src={filmStrip}
            alt="Animated film strip storyboard from a Cre8Motion episode"
            className="h-full w-full"
            imgClassName="object-cover object-right"
          />
          {/* left→right fade so the strip melts into the canvas behind the copy */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #050505 0%, rgba(5,5,5,0.75) 20%, rgba(5,5,5,0.12) 46%, rgba(5,5,5,0) 72%)",
            }}
          />
        </div>

        <div className="relative max-w-[38rem] py-24 md:py-32">
          <MotionReveal>
            <EditorialHeading as="h2" size="section" className="[&>h2]:text-[clamp(2.25rem,5vw,4.25rem)]">
              Your next episode
              <br />
              starts with an idea.
            </EditorialHeading>
          </MotionReveal>
          <MotionReveal variants={fadeUpSmall} delay={0.05}>
            <p className="mt-7 max-w-md text-[1rem] leading-[1.65] text-ink-2">
              Give Cre8Motion the story.
              <br />
              Let your AI showrunner handle the production.
            </p>
          </MotionReveal>
          <MotionReveal variants={fadeUpSmall} delay={0.1}>
            <div className="mt-9 flex flex-wrap gap-3">
              <CTAButton size="lg" href="#/shows">Create your first show</CTAButton>
              <CTAButton variant="secondary" size="lg">
                <Play className="h-3.5 w-3.5" /> Watch an example
              </CTAButton>
            </div>
          </MotionReveal>
        </div>
      </div>

      {/* Feature triplet with left dividers */}
      <motion.div
        variants={stagger(0.1)}
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, amount: 0.3 }}
        className="mt-20 grid grid-cols-1 gap-10 border-t border-line pt-14 md:grid-cols-3 md:gap-0"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.n}
            variants={reduce ? undefined : fadeUp}
            className="md:px-8 md:not-first:border-l md:not-first:border-line md:first:pl-0"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[1.1rem] tabular-nums text-accent">{f.n}</span>
              <f.icon className="h-5 w-5 text-accent" />
            </div>
            <div className="text-[1.05rem] font-medium text-ink">{f.title}</div>
            <p className="mt-2 max-w-[16rem] text-[0.9rem] leading-[1.6] text-ink-2">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

const FOOTER_COLS: Array<{ title: string; links: Array<{ label: string; href?: string; scrollTo?: string }> }> = [
  {
    title: "Product",
    links: [
      { label: "How it works", scrollTo: "how-it-works" },
      { label: "Examples", scrollTo: "examples" },
      { label: "Technology", scrollTo: "technology" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "https://github.com/Bigestdave/cre8motion#readme" },
      { label: "Qwen Cloud", href: "https://qwen.ai" },
      { label: "GitHub", href: "https://github.com/Bigestdave/cre8motion" },
    ],
  },
  {
    title: "App",
    links: [
      { label: "Open the studio", href: "#/shows" },
      { label: "Create a show", href: "#/create-show" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-10">
        <div>
          <div className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
            Cre<span className="text-accent">8</span>Motion
          </div>
          <p className="mt-4 max-w-[16rem] text-[0.9rem] leading-[1.6] text-ink-3">
            The AI showrunner for animated microdramas.
          </p>
          <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
            <QwenLogo className="h-9 w-[34px] shrink-0" />
            <span className="text-[0.8rem] leading-[1.25] text-ink-2">
              Built for the
              <br />
              Qwen Cloud Global
              <br />
              AI Hackathon
            </span>
          </div>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <div className="mb-5 text-[0.72rem] uppercase tracking-[0.18em] text-ink-3">
              {col.title}
            </div>
            <ul className="flex flex-col gap-4">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.scrollTo ? (
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById(l.scrollTo!)?.scrollIntoView({ behavior: "smooth", block: "start" })
                      }
                      className="text-[0.95rem] text-ink-2 transition-colors duration-150 hover:text-ink"
                    >
                      {l.label}
                    </button>
                  ) : (
                    <a
                      href={l.href}
                      {...(l.href?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="text-[0.95rem] text-ink-2 transition-colors duration-150 hover:text-ink"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto w-full max-w-[1280px] px-6 py-6 text-[0.85rem] text-ink-4 md:px-10">
          © 2026 Cre8Motion
        </div>
      </div>
    </footer>
  );
}
