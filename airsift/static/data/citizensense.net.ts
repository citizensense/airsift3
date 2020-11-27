export const parseTimestamp = (timestamp: number | string) => {
  if (timestamp === 'never') {
    return new Date('never')
  }
  return new Date(parseInt(String(timestamp)))
}
