import { type TFunction } from 'i18next';

import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';

import { type RecommendedCapabilityOperatorDetails } from '../../utils/types';
import { isInstalled } from '../../utils/utils';

export const getManualOperatorActions = (
  details: RecommendedCapabilityOperatorDetails | undefined,
  navigate: (path: string) => void,
  t: TFunction,
): ActionDropdownItemType[] => {
  const operatorHubURL = details?.operatorHubURL;
  if (!operatorHubURL) return [];

  const label =
    details && isInstalled(details.installState)
      ? t('Manage in OperatorHub')
      : t('Install in OperatorHub');

  return [{ cta: () => navigate(operatorHubURL), id: 'operatorhub-action', label }];
};
