import { TFunction } from 'react-i18next';

export const tooltipForOtherRecommended = (priority: number, t: TFunction): string => {
  switch (priority) {
    case 1:
      return t('The 2nd most suggested option in StorageProfile.');
    case 2:
      return t('The 3rd most suggested option in StorageProfile.');
    default:
      return t('The {{priority}}th most suggested option in StorageProfile.', {
        priority: priority + 1,
      });
  }
};

export const fromPriorityToLabels = (
  priority: number,
  recommendationCount: number,
  t: TFunction,
): { className?: string; label: string; tooltip: string } => {
  if (priority === 0) {
    return {
      className: 'pf-m-green',
      label: t('Highly recommended'),
      tooltip: t('The most suggested StorageProfile option.'),
    };
  }

  if (priority > 0 && priority < recommendationCount) {
    return {
      label: t('Recommended'),
      tooltip: tooltipForOtherRecommended(priority, t),
    };
  }

  return {
    className: 'pf-m-orange',
    label: t('Not recommended'),
    tooltip: t('We suggest using another option.'),
  };
};
