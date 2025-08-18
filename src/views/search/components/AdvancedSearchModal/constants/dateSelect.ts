import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export enum DateSelectOption {
  Custom = 'Custom',
  Last30Days = 'Last30Days',
  Last7Days = 'Last7Days',
  Last90Days = 'Last90Days',
  Today = 'Today',
  Yesterday = 'Yesterday',
}

export const dateSelectOptions = [
  DateSelectOption.Today,
  DateSelectOption.Yesterday,
  DateSelectOption.Last7Days,
  DateSelectOption.Last30Days,
  DateSelectOption.Last90Days,
  DateSelectOption.Custom,
];

export const dateSelectOptionsInfo = {
  [DateSelectOption.Custom]: {
    label: t('Custom...'),
  },
  [DateSelectOption.Last30Days]: {
    daysBack: 30,
    label: t('Last 30 days'),
  },
  [DateSelectOption.Last7Days]: {
    daysBack: 7,
    label: t('Last 7 days'),
  },
  [DateSelectOption.Last90Days]: {
    daysBack: 90,
    label: t('Last 90 days'),
  },
  [DateSelectOption.Today]: {
    daysBack: 0,
    label: t('Today'),
  },
  [DateSelectOption.Yesterday]: {
    daysBack: 1,
    label: t('Yesterday'),
  },
};
