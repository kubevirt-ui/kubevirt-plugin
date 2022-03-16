/**
 * Get node selectors presentation
 * @date 3/14/2022 - 1:02:01 PM
 *
 * @param {({ [key: string]: string } | null)} nodes
 * @returns {string}
 */
export const getNodeSelector = (nodes: { [key: string]: string } | null): string =>
  nodes &&
  Object.entries(nodes)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
