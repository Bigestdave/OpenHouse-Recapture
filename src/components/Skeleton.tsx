// Skeleton loading placeholders — shimmering blocks matching the card layouts.

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-raised-2 ${className}`} />
}

/** Placeholder for a show card in the Shows grid. */
export function SkeletonShowCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-line-soft bg-surface">
      <SkeletonBlock className="aspect-[16/10] w-full rounded-none" />
      <div className="p-4">
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonBlock className="mt-2.5 h-3.5 w-1/3" />
        <SkeletonBlock className="mt-3 h-3.5 w-1/2" />
      </div>
    </div>
  )
}

/** Placeholder for the hero "continue production" banner. */
export function SkeletonHero() {
  return (
    <div className="grid grid-cols-[1fr_380px] overflow-hidden rounded-xl border border-line-soft bg-surface">
      <SkeletonBlock className="h-[248px] w-full rounded-none" />
      <div className="flex flex-col justify-center px-8 py-6">
        <SkeletonBlock className="h-6 w-3/4" />
        <SkeletonBlock className="mt-3 h-4 w-1/2" />
        <SkeletonBlock className="mt-6 h-[5px] w-full" />
        <SkeletonBlock className="mt-6 h-10 w-28" />
      </div>
    </div>
  )
}

/** Placeholder for a production table row. */
export function SkeletonTableRow() {
  return (
    <div className="grid grid-cols-[minmax(350px,2.5fr)_minmax(200px,1.5fr)_minmax(100px,1fr)_minmax(100px,1fr)_120px] items-center gap-4 border-b border-line-soft bg-surface px-5 py-4 last:border-none">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-[56px] w-[84px] shrink-0" />
        <div className="flex-1">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="mt-2 h-3 w-44" />
        </div>
      </div>
      <SkeletonBlock className="h-[5px] w-full" />
      <SkeletonBlock className="h-4 w-14" />
      <SkeletonBlock className="h-4 w-16" />
      <div className="flex justify-end">
        <SkeletonBlock className="h-8 w-20" />
      </div>
    </div>
  )
}

/** Placeholder for the show overview header. */
export function SkeletonShowHeader() {
  return (
    <div className="flex items-start gap-6">
      <SkeletonBlock className="h-[150px] w-[210px] shrink-0 rounded-xl" />
      <div className="flex-1 pt-2">
        <SkeletonBlock className="h-8 w-1/2" />
        <SkeletonBlock className="mt-3 h-4 w-3/4" />
        <SkeletonBlock className="mt-4 h-4 w-1/3" />
      </div>
      <SkeletonBlock className="mt-3 h-10 w-36" />
    </div>
  )
}

/** Placeholder for an episode row on the show overview. */
export function SkeletonEpisodeRow() {
  return (
    <div className="flex items-center gap-5 overflow-hidden rounded-xl border border-line-soft bg-surface">
      <SkeletonBlock className="h-[110px] w-[190px] shrink-0 rounded-none" />
      <div className="flex-1 py-4">
        <SkeletonBlock className="h-5 w-1/2" />
        <SkeletonBlock className="mt-2.5 h-4 w-24" />
      </div>
      <SkeletonBlock className="mr-6 h-10 w-32 shrink-0" />
    </div>
  )
}
