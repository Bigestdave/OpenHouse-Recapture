import { Clock, Users, MapPin, Wallet, RotateCcw } from "lucide-react";
import { IMAGES } from "../../lib/assets";
import { FrameImage } from "../primitives/FrameImage";

const STATS = [
  { icon: Clock, label: "Duration", value: "00:45" },
  { icon: Users, label: "Characters", value: "2" },
  { icon: MapPin, label: "Location", value: "Kitchen" },
  { icon: Wallet, label: "Est. budget", value: "64/100" },
  { icon: RotateCcw, label: "Retry rate", value: "12%" },
];

const SHOTS = [
  { n: "01", name: "Establishment", desc: "Garden cottage at sunset", time: "00:06", budget: "6/100", img: IMAGES.diningRoom },
  { n: "02", name: "Relationship", desc: "Lumi and Kai at the table", time: "00:05", budget: "7/100", img: IMAGES.kitchen },
  { n: "03", name: "Disruption", desc: "Lumi's locket starts to glow", time: "00:05", budget: "8/100", img: IMAGES.necklace },
  { n: "04", name: "Discovery", desc: "Lumi realizes something", time: "00:06", budget: "8/100", img: IMAGES.lumi, active: true },
  { n: "05", name: "Reaction", desc: "Kai reacts to the secret", time: "00:05", budget: "6/100", img: IMAGES.kai },
  { n: "06", name: "Decision", desc: "She makes the choice", time: "00:06", budget: "7/100", img: IMAGES.lumiAlt },
  { n: "07", name: "Reversal", desc: "The locket dims again", time: "00:05", budget: "7/100", img: IMAGES.necklace },
  { n: "08", name: "Resolution", desc: "A quiet moment remains", time: "00:07", budget: "6/100", img: IMAGES.diningRoom },
];

export function ShowOverview() {
  return (
    <div className="text-ink">
      {/* header */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line px-5 py-4">
        <div>
          <div className="text-[0.62rem] uppercase tracking-[0.18em] text-ink-3">
            Production plan
          </div>
          <div className="text-[0.95rem] font-medium">Fruitful Secrets · Episode 05</div>
        </div>
        <div className="ml-auto flex flex-wrap gap-x-6 gap-y-2">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <s.icon className="h-3.5 w-3.5 text-ink-3" />
              <div className="leading-tight">
                <div className="text-[0.6rem] uppercase tracking-[0.12em] text-ink-3">
                  {s.label}
                </div>
                <div className="text-[0.78rem]">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* shot list */}
      <div className="px-3 py-3">
        <div className="mb-1 grid grid-cols-[28px_44px_1fr_60px_60px] gap-3 px-2 text-[0.6rem] uppercase tracking-[0.14em] text-ink-3">
          <span />
          <span />
          <span>Shot / Beat</span>
          <span className="text-right">Time</span>
          <span className="text-right">Budget</span>
        </div>
        {SHOTS.map((s) => (
          <div
            key={s.n}
            className={`grid grid-cols-[28px_44px_1fr_60px_60px] items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
              s.active
                ? "bg-accent/[0.06] ring-1 ring-inset ring-accent/30"
                : "hover:bg-white/[0.02]"
            }`}
          >
            <span className={`text-[0.72rem] ${s.active ? "text-accent" : "text-ink-3"}`}>
              {s.n}
            </span>
            <FrameImage
              src={s.img}
              alt={`${s.name} shot thumbnail`}
              className="h-8 w-11 rounded-md border border-line"
            />
            <div className="min-w-0">
              <div className={`text-[0.82rem] ${s.active ? "text-accent" : "text-ink"}`}>
                {s.name}
              </div>
              <div className="truncate text-[0.72rem] text-ink-3">{s.desc}</div>
            </div>
            <span className="text-right text-[0.74rem] text-ink-2">{s.time}</span>
            <span className="text-right text-[0.74rem] text-ink-2">{s.budget}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
