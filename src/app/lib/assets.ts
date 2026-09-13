// Centralized imagery used throughout the Cre8Motion landing page.
// The hero + shot stills are the real rendered character assets from the
// imported Figma design; the rest stand in for additional scene references.
import lumiHero from "../../imports/brand-frames/7bb472cd1b19edeb4265883537bc1ab7b5a19341.png";
import shotPreview from "../../imports/brand-frames/a04c56745d71afe6accca0ebe3748824a6c25546.png";

export const IMAGES = {
  // Rendered character still (Lumi kneeling in the evening kitchen) — hero art.
  lumiHero,
  // Cropped "Shot 06 · Decision" keyframe used in the production dashboard.
  shotPreview,
  // The real character crop stands in for the primary "Lumi" still everywhere.
  lumi: shotPreview,
  lumiAlt: lumiHero,
  kai: "https://images.unsplash.com/photo-1610533289180-9d90161eba40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  kitchen:
    "https://images.unsplash.com/photo-1761662826410-3218852da3bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  diningRoom:
    "https://images.unsplash.com/photo-1650303657889-9453f4593268?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  necklace:
    "https://images.unsplash.com/photo-1721807551235-4072be6913c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
} as const;
