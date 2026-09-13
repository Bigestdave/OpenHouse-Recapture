import { Check, ArrowRight } from "lucide-react";
import { Section } from "./primitives/Section";
import { MotionReveal } from "./primitives/MotionReveal";
import { FrameImage } from "./primitives/FrameImage";
import { fadeUpSmall } from "../lib/motion";

// Real rendered assets from the Figma design import (read-only source of truth).
import imgLumi from "../../imports/continuity-panels/b15ee6515613c35b1310e6e61db298ac2d7fab0a.png";
import imgKai from "../../imports/continuity-panels/87ef40f063e838b69162d1aaf65960a953fb2681.png";
import imgHouse from "../../imports/continuity-panels/dcb9de54383238ece2f4d303da2ad45baf29ab23.png";
import imgEpisode04 from "../../imports/continuity-panels/00354e1d6fae9ce08f61d23494e951ae4f1f27f3.png";
import imgE01 from "../../imports/continuity-panels/3f1c60e24be682e40743368ca6b76ef2d767a9c8.png";
import imgE02 from "../../imports/continuity-panels/fc9f0dbac42cef72d8363323fb01970c6e12b5f9.png";
import imgE03 from "../../imports/continuity-panels/77755c30d666a555128e645c3d5d5a2f2a96f630.png";
import imgE04 from "../../imports/continuity-panels/8a4c2e3432ad7701d3999f3337e70574d8d2a98e.png";

const META = [
  "Fruitful Secrets",
  "Episodes 01–04",
  "Characters: Lumi and Kai",
  "Continuity v4",
];

const CHARACTERS = [
  { name: "Lumi", note: "Used in 4 episodes", img: imgLumi },
  { name: "Kai", note: "Used in 3 episodes", img: imgKai },
];

const EPISODES = [
  { n: "E01", title: "The Gift", img: imgE01, status: "Complete", active: false },
  { n: "E02", title: "The Message", img: imgE02, status: "Complete", active: false },
  { n: "E03", title: "The Visitor", img: imgE03, status: "Complete", active: false },
  { n: "E04", title: "The Dinner Guest", img: imgE04, status: "Producing · 72%", active: true },
];

const INHERITS = [
  "Lumi and Kai references",
  "Polished 3D style v2",
  "Continuity through Episode 04",
];

export function Continuity() {
  return (
    <Section spacing="none" className="pt-28 md:pt-36 pb-14 md:pb-18">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
        {/* ── Left column: editorial ─────────────────────────────── */}
        <div>
          <MotionReveal>
            <div className="text-[0.8rem] uppercase tracking-[0.14em] text-accent">
              A show that remembers
            </div>
          </MotionReveal>

          <MotionReveal variants={fadeUpSmall} delay={0.05}>
            <h2 className="mt-4 text-[clamp(2.5rem,4.5vw,3.9rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
              Every episode remembers the last.
            </h2>
          </MotionReveal>

          <MotionReveal variants={fadeUpSmall} delay={0.1}>
            <p className="mt-6 max-w-md text-[1.06rem] leading-[1.6] text-ink-2">
              Characters, locations, visual style, and continuity live at the show
              level—so every new episode begins with what Cre8Motion has already
              established.
            </p>
          </MotionReveal>

          <MotionReveal variants={fadeUpSmall} delay={0.15}>
            <ul className="mt-8 flex flex-col gap-2.5">
              {META.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[1.05rem] text-ink-2">
                  <Check className="h-5 w-5 shrink-0 text-accent" strokeWidth={2.25} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </MotionReveal>

          <MotionReveal variants={fadeUpSmall} delay={0.2}>
            <div className="mt-8 grid grid-cols-2 gap-5">
              {CHARACTERS.map((c) => (
                <div
                  key={c.name}
                  className="overflow-hidden rounded-xl border border-line bg-raised"
                >
                  <FrameImage
                    src={c.img}
                    alt={`${c.name} character still`}
                    className="h-[190px] w-full"
                  />
                  <div className="flex items-center justify-between px-3.5 py-3">
                    <div>
                      <div className="text-[0.95rem] text-ink">{c.name}</div>
                      <div className="text-[0.72rem] text-ink-3">{c.note}</div>
                    </div>
                    <Check className="h-[18px] w-[18px] shrink-0 text-accent" strokeWidth={2.5} />
                  </div>
                </div>
              ))}
            </div>
          </MotionReveal>
        </div>

        {/* ── Right column: production card ───────────────────────── */}
        <MotionReveal variants={fadeUpSmall} delay={0.1}>
          <div className="rounded-2xl border border-line bg-surface p-6 md:p-7">
            {/* Header */}
            <div className="flex flex-col gap-5 border-b border-line pb-5 sm:flex-row sm:items-start">
              <FrameImage
                src={imgHouse}
                alt="Fruitful Secrets establishing shot"
                className="h-[150px] w-full shrink-0 rounded-xl sm:h-[130px] sm:w-[220px]"
              />
              <div>
                <h3 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.02em] text-ink">
                  Fruitful Secrets
                </h3>
                <div className="mt-1 text-[1rem] text-ink-2">
                  Dialogue-free animated microdrama
                </div>
                <div className="mt-2 text-[0.85rem] text-ink-3">
                  4 episodes · Polished 3D · 45-second default
                </div>
                <div className="mt-2 flex items-center gap-2 text-[0.85rem] text-ink-2">
                  <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                  <span>Continuity through Episode 04</span>
                </div>
              </div>
            </div>

            {/* Active production */}
            <div className="pt-5">
              <div className="text-[0.7rem] uppercase tracking-[0.14em] text-accent">
                Active production
              </div>
              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-stretch">
                <FrameImage
                  src={imgEpisode04}
                  alt="Episode 04 · The Dinner Guest still"
                  className="h-[150px] w-full shrink-0 rounded-xl sm:w-[250px]"
                />
                <div className="flex flex-1 flex-col justify-center">
                  <div className="text-[1.25rem] text-ink">Episode 04 · The Dinner Guest</div>
                  <div className="mt-1 text-[0.85rem] text-ink-3">Animating shot 6 of 8</div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-[2rem] font-semibold leading-none text-accent">72%</div>
                      <div className="mt-3.5 h-[5px] w-full overflow-hidden rounded-full bg-raised-2">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: "72%" }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-raised px-4 py-3 text-[0.88rem] text-ink transition-colors hover:border-raised-2"
                    >
                      Open production
                      <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Episode sequence */}
            <div className="mt-6 border-t border-line pt-5">
              <div className="text-[0.7rem] uppercase tracking-[0.14em] text-accent">
                Episode sequence
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {EPISODES.map((e) => (
                  <div
                    key={e.n}
                    className={`overflow-hidden rounded-xl border bg-raised ${
                      e.active ? "border-accent" : "border-line"
                    }`}
                  >
                    <FrameImage
                      src={e.img}
                      alt={`${e.n} ${e.title}`}
                      className="h-[120px] w-full"
                    />
                    <div className="flex flex-col gap-1.5 px-3.5 py-3">
                      <div className="text-[0.9rem] text-ink-2">
                        {e.n} · {e.title}
                      </div>
                      <div className="flex items-center gap-1.5 text-[0.8rem] text-ink-3">
                        {e.active ? (
                          <span className="h-2 w-2 shrink-0 rounded-sm bg-accent" />
                        ) : (
                          <Check className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={2.5} />
                        )}
                        <span>{e.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer: inherits */}
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-raised px-6 py-5 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex items-center gap-3 text-[1rem] text-ink">
                <Check className="h-6 w-6 shrink-0 text-accent" strokeWidth={2.25} />
                <span>Episode 05 will inherit:</span>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {INHERITS.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[0.9rem] text-ink-2">
                    <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MotionReveal>
      </div>

      {/* ── Closing line ─────────────────────────────────────────── */}
      <MotionReveal variants={fadeUpSmall}>
        <p className="mt-20 text-center text-[clamp(1.75rem,3.4vw,3.25rem)] font-semibold tracking-[-0.02em]">
          <span className="text-ink">The story moves forward. </span>
          <span className="text-ink-4">The visual truth stays intact.</span>
        </p>
      </MotionReveal>
    </Section>
  );
}
