/** Step size giving at most five ticks between 0 and max. */
export function tickStep(max: number): number {
  for (const step of [1, 2, 5, 10, 20, 50]) {
    if (max / step <= 5) return step;
  }
  return 100;
}
