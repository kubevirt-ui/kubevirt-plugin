import type { TFunction } from 'i18next';

export const getFamilyAvailabilityHelpText = (
  t: TFunction,
  showClusterSelector: boolean,
): string =>
  showClusterSelector
    ? t(
        'Hide instance type families that the selected cluster cannot run. VM creators will not see unavailable families in pickers.',
      )
    : t(
        'Hide instance type families that this cluster cannot run. VM creators will not see unavailable families in pickers.',
      );

export const getFamilyAvailabilityPermissionDeniedMessage = (
  t: TFunction,
  cluster: string | undefined,
): string =>
  t(
    'You do not have permission to change instance type family availability on cluster {{cluster}}.',
    { cluster },
  );

type SummaryBadgeTextArgs = {
  availableCount: number;
  cluster: string | undefined;
  showClusterSelector: boolean;
  totalFamilies: number;
};

export const getFamilyAvailabilitySummaryBadgeText = (
  t: TFunction,
  { availableCount, cluster, showClusterSelector, totalFamilies }: SummaryBadgeTextArgs,
): string => {
  if (showClusterSelector && cluster) {
    return t('{{available}} / {{total}} available on {{cluster}}', {
      available: availableCount,
      cluster,
      total: totalFamilies,
    });
  }

  return t('{{available}} / {{total}} available', {
    available: availableCount,
    total: totalFamilies,
  });
};
