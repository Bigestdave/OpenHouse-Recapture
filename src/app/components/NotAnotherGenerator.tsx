import { Section } from "./primitives/Section";
import { EditorialHeading } from "./primitives/EditorialHeading";
import { MotionReveal } from "./primitives/MotionReveal";
import { FrameImage } from "./primitives/FrameImage";
import { fadeUpSmall } from "../lib/motion";
import { Clock, Clapperboard, DollarSign, RefreshCw, ArrowRight } from "lucide-react";

import shotEstablishment from "../../imports/generator-panels/738ae77c2295c36eb99725313975441c1f770313.png";
import shotRelationship from "../../imports/generator-panels/2953d60ec6d5149763d235afd4e49553e5c1ad12.png";
import shotDisruption from "../../imports/generator-panels/1a8d788074b442e28828acdadfc3aadb88373ca8.png";
import shotDiscovery from "../../imports/generator-panels/2096c642193be1b7fcbafc8f7434fe14c60fd8c1.png";
import shotReaction from "../../imports/generator-panels/11e147be23db9b1c57ccedef686a173fa27ce1ac.png";
import shotDecision from "../../imports/generator-panels/14ce52f7103a112bef03796d918d2c749423c03b.png";
import shotReversal from "../../imports/generator-panels/20f163baa09836b5cffe0b8dd4f6db35e2ef9b86.png";
import shotResolution from "../../imports/generator-panels/58835f8b9d87ab1272caaf22bebb2db4568f60c0.png";

interface Shot {
  n: string;
  title: string;
  thumb: string;
  desc: string;
  time: string;
  budget: string;
  active?: boolean;
}

const SHOTS: Shot[] = [
  { n: "01", title: "Establishment", thumb: shotEstablishment, desc: "Garden cottage at sunset. Peaceful and warm.", time: "00:04", budget: "6/100" },
  { n: "02", title: "Relationship", thumb: shotRelationship, desc: "Lumi at the table. Thinking about the locket.", time: "00:05", budget: "7/100" },
  { n: "03", title: "Disruption", thumb: shotDisruption, desc: "Lumi's locket starts to glow.", time: "00:05", budget: "8/100" },
  { n: "04", title: "Discovery", thumb: shotDiscovery, desc: "Broken window. Lumi hears something.", time: "00:06", budget: "8/100", active: true },
  { n: "05", title: "Reaction", thumb: shotReaction, desc: "Lumi reacts to the sound.", time: "00:05", budget: "6/100" },
  { n: "06", title: "Decision", thumb: shotDecision, desc: "She decides to investigate.", time: "00:05", budget: "7/100" },
  { n: "07", title: "Reversal", thumb: shotReversal, desc: "She opens the door— it's the wind.", time: "00:07", budget: "8/100" },
  { n: "08", title: "Resolution", thumb: shotResolution, desc: "Lumi and Kai share a quiet moment.", time: "00:07", budget: "8/100" },
];

const STATS = [
  { icon: Clock, label: "Duration", value: "00:45" },
  { icon: Clapperboard, label: "Shots", value: "8" },
  { icon: DollarSign, label: "Estimated budget", value: "64 / 100" },
  { icon: RefreshCw, label: "Retry reserve", value: "12%" },
];

const STEPS = ["Plan", "References", "Storyboard", "Keyframes", "Animate", "Assembly"];

function DiscoveryPopover() {
  const rows = [
    ["Camera", "Medium shot"],
    ["Angle", "Window side"],
    ["Movement", "Slow push in"],
  ];
  return (
    <div className="rounded-xl border border-line bg-raised px-6 py-5">
      <div className="flex items-center justify-between">
        <span className="text-[0.95rem] text-ink">Shot 04 · Discovery</span>
        <span className="flex items-center gap-1.5 text-[0.85rem] text-accent">
          <span className="size-[7px] rounded-full bg-accent" />
          Planned
        </span>
      </div>
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-start justify-between pt-2 text-[0.9rem]">
          <span className="text-ink-3">{k}</span>
          <span className="text-ink-2">{v}</span>
        </div>
      ))}
      <p className="pt-3 text-[0.9rem] text-ink-3">Notes</p>
      <p className="text-[0.9rem] leading-[1.4] text-ink-2">
        Environmental story beat. Shift to curiosity.
      </p>
    </div>
  );
}

export function NotAnotherGenerator() {
  return (
    <Section spacing="none" className="pt-16 pb-28 md:pt-20 md:pb-36">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        {/* Editorial column */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <MotionReveal>
            <EditorialHeading eyebrow="A complete production system" size="section">
              Not another
              <br />
              prompt-to-video
              <br />
              generator.
            </EditorialHeading>
          </MotionReveal>
          <MotionReveal variants={fadeUpSmall} delay={0.05}>
            <p className="mt-8 max-w-md text-[1rem] leading-[1.65] text-ink-2">
              Cre8Motion plans the episode, establishes visual truth, reviews every result,
              and selectively repairs what fails.
            </p>
          </MotionReveal>

          <MotionReveal variants={fadeUpSmall} delay={0.1}>
            <div className="mt-12 flex flex-wrap items-center gap-x-2 gap-y-3 text-[0.9rem]">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  {i === 0 ? (
                    <span className="flex items-center gap-2 text-accent">
                      <span className="size-[9px] rounded-sm bg-accent" />
                      {step}
                    </span>
                  ) : (
                    <span className="text-ink-3">{step}</span>
                  )}
                  {i < STEPS.length - 1 && <ArrowRight className="size-3.5 text-ink-4" />}
                </div>
              ))}
            </div>
          </MotionReveal>
        </div>

        {/* Production plan card */}
        <MotionReveal variants={fadeUpSmall} delay={0.05}>
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <p className="text-[0.8rem] uppercase tracking-[0.18em] text-accent">
              Production plan
            </p>
            <h3 className="mt-3 text-[clamp(1.4rem,2.5vw,2rem)] tracking-[-0.01em] text-ink">
              Fruitful Secrets · Episode 05
            </h3>

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-2 divide-line rounded-xl border border-line sm:grid-cols-4 sm:divide-x">
              {STATS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-4">
                  <Icon className="size-5 shrink-0 text-ink-3" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <p className="truncate text-[0.8rem] text-ink-3">{label}</p>
                    <p className="text-[1rem] text-ink">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Shot table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line text-[0.8rem] text-ink-3">
                    <th className="px-2 py-2.5 font-normal">#</th>
                    <th className="px-2 py-2.5 font-normal">Shot</th>
                    <th className="px-2 py-2.5 font-normal">Description</th>
                    <th className="px-2 py-2.5 font-normal">Est. time</th>
                    <th className="px-2 py-2.5 font-normal">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {SHOTS.map((shot) => (
                    <tr
                      key={shot.n}
                      className={`border-b border-line-soft ${
                        shot.active ? "bg-accent-soft" : ""
                      }`}
                    >
                      <td
                        className={`px-2 py-4 align-middle text-[1rem] ${
                          shot.active ? "text-accent" : "text-ink-2"
                        }`}
                      >
                        {shot.n}
                      </td>
                      <td className="px-2 py-3 align-middle">
                        <FrameImage
                          src={shot.thumb}
                          alt={shot.title}
                          className="h-14 w-24 rounded-md"
                        />
                      </td>
                      <td className="px-2 py-4 align-middle">
                        <p
                          className={`text-[0.95rem] ${
                            shot.active ? "text-accent" : "text-ink"
                          }`}
                        >
                          {shot.title}
                        </p>
                        <p className="mt-0.5 text-[0.85rem] leading-[1.35] text-ink-3">
                          {shot.desc}
                        </p>
                      </td>
                      <td className="px-2 py-4 align-middle text-[0.95rem] text-ink-2">
                        {shot.time}
                      </td>
                      <td className="px-2 py-4 align-middle text-[0.95rem] text-ink-2">
                        {shot.budget}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 max-w-sm">
              <DiscoveryPopover />
            </div>
          </div>
        </MotionReveal>
      </div>
    </Section>
  );
}
