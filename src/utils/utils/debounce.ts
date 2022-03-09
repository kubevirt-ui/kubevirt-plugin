export type Debounce = {
  func: (any) => any;
  wait: number;
  immediate: boolean;
};

/**
 * @param func Function to debounce
 * @param wait Number of milliseconds to wait before invoking the function again
 * @param immediate If set to true, func is invoked immediately and will be invoked
 *    on the leading edge of the timeout. If set to false, func will be invoked on
 *    the trailing edge of the timeout.
 */
export function debounce(func: (any) => any, wait = 0, immediate = false) {
  let timeout = null;
  return function (...args) {
    // skipcq: JS-0332
    const context = this; // eslint-disable-line @typescript-eslint/no-this-alias
    if (immediate && !timeout) func.apply(context, args);
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
  };
}
