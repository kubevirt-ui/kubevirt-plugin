export function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  wait = 0,
  immediate = false,
): (...args: Args) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Args): void => {
    if (immediate && !timeout) {
      func(...args);
    }
    clearTimeout(timeout);
    timeout = setTimeout((): void => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    }, wait);
  };
}
