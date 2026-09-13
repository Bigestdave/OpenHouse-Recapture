export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]) {
  return inputs
    .flatMap((input) => {
      if (!input) return []
      if (typeof input === 'string') return [input]
      if (typeof input === 'object') {
        return Object.entries(input)
          .filter(([_, val]) => Boolean(val))
          .map(([key]) => key)
      }
      return []
    })
    .join(' ')
}
