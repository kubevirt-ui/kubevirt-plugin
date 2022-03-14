/**
 * DESCHEDULER_EVICT_LABEL
 * @date 3/14/2022 - 1:01:02 PM
 *
 * @type {"descheduler.alpha.kubernetes.io/evict"}
 */
export const DESCHEDULER_EVICT_LABEL = 'descheduler.alpha.kubernetes.io/evict';
/**
 * FLAVOR_LABEL
 * @date 3/14/2022 - 1:01:02 PM
 *
 * @type {"flavor.template.kubevirt.io"}
 */
export const FLAVOR_LABEL = 'flavor.template.kubevirt.io';

/**
 * Get machine flavor (small,arge, custom, etc..)
 * @date 3/14/2022 - 1:01:02 PM
 *
 * @param {{ [key: string]: string }} labels
 * @returns {string}
 */
export const getFlavor = (labels: { [key: string]: string }): string => {
  const matchedLabel =
    labels && Object.keys(labels)?.find((label: string) => label?.startsWith(FLAVOR_LABEL));

  const flavorLabel =
    matchedLabel && matchedLabel?.split('/')?.[1]?.replace(/^./, (str) => str?.toUpperCase());

  return flavorLabel || 'Custom';
};
