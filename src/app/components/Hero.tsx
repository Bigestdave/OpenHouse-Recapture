import { motion, useReducedMotion } from "motion/react";
import { Play } from "lucide-react";
import { CTAButton } from "./primitives/CTAButton";
import { ProductFrame } from "./primitives/ProductFrame";
import { ProductionWorkspace } from "./mockups/ProductionWorkspace";
import { FrameImage } from "./primitives/FrameImage";
import { IMAGES } from "../lib/assets";
import { EASE_OUT } from "../lib/motion";

export function Hero() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
  };
  const item = {
    hidden: reduce ? {} : { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
  };

  return (
    <section className="relative">
      {/* Hero band — rendered character bleeds off the right edge behind the text */}
      <div className="relative overflow-hidden">
        {/* Character still, anchored right, fading into the canvas on its left */}
        <motion.div
          aria-hidden
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: EASE_OUT }}
          className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[72%] lg:w-[56%]"
        >
          <FrameImage
            src={IMAGES.lumiHero}
            alt="Rendered animation still of the character Lumi kneeling in an evening kitchen"
            className="h-full w-full"
            imgClassName="object-cover object-[62%_center]"
          />
          {/* left→right fade into the canvas, plus a soft bottom fade */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #050505 0%, rgba(5,5,5,0.85) 22%, rgba(5,5,5,0.35) 48%, rgba(5,5,5,0) 70%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-32"
            style={{ background: "linear-gradient(0deg, #050505 0%, rgba(5,5,5,0) 100%)" }}
          />
        </motion.div>

        <div className="relative mx-auto w-full max-w-[1280px] px-6 pb-24 pt-40 md:px-10 md:pb-32 md:pt-52">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            <motion.div variants={item} className="mb-8 flex items-center gap-4">
              <span className="h-px w-10 bg-accent" />
              <span className="text-[0.9rem] text-accent">Your AI showrunner is ready.</span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-[clamp(2.75rem,6.5vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-ink"
            >
              From story to
              <br />
              finished episode.
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-7 max-w-md text-[1.05rem] leading-[1.6] text-ink-2"
            >
              Cre8Motion plans, storyboards, animates, reviews, and assembles consistent
              animated episodes—while preserving your characters, world, and visual style.
            </motion.p>

            <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-3">
              <CTAButton size="lg" href="#/shows">
                Start creating
              </CTAButton>
              <CTAButton variant="secondary" size="lg">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/[0.04]">
                  <Play className="h-2.5 w-2.5 fill-current text-ink" />
                </span>
                Watch an episode
              </CTAButton>
            </motion.div>

            <motion.p variants={item} className="mt-8 text-[0.9rem] text-ink-2">
              Built with <span className="text-accent">Qwen Cloud</span> · Designed for episodic animation
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Production dashboard reveals below the hero */}
      <div className="mx-auto w-full max-w-[1280px] px-6 pb-8 md:px-10">
        <ProductFrame fadeBottom={true} maxHeight="h-[360px] md:h-[400px]">
          <ProductionWorkspace />
        </ProductFrame>
      </div>
    </section>
  );
}
