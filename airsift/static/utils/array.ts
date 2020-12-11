export const firstOf = <T>(obj: T, keys: Array<keyof T>, fallbackToAny?: boolean) => {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key]
  }
  if (fallbackToAny) {
    return Object.values(obj)[0]
  }
}

export const ensureArray = <T>(x: T): T[] => {
  if (Array.isArray(x)) return x
  return [x]
}
