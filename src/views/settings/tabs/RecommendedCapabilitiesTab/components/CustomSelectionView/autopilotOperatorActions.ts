import { type TFunction } from 'i18next';

import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';

import {
  type CapabilityFeatureOperator,
  ConfigurationStatus,
  type RecommendedCapabilityOperatorDetails,
} from '../../utils/types';

export const getAutopilotOperatorActions = (
  operator: CapabilityFeatureOperator,
  opDetails: RecommendedCapabilityOperatorDetails | undefined,
  effectiveConfigStatus: ConfigurationStatus | undefined,
  onOpenReviewModal: (packageName: string) => void,
  navigate: (path: string) => void,
  t: TFunction,
): ActionDropdownItemType[] => {
  const actions: ActionDropdownItemType[] = [];

  if (effectiveConfigStatus === ConfigurationStatus.Manual) {
    actions.push({
      cta: () => onOpenReviewModal(operator.packageName),
      id: `use-recommended-${operator.packageName}`,
      label: t('Use recommended configuration'),
    });
  }

  const operatorHubURL = opDetails?.operatorHubURL;
  if (operatorHubURL) {
    actions.push({
      cta: () => navigate(operatorHubURL),
      id: `view-details-${operator.packageName}`,
      label: t('View operator details'),
    });
  }

  return actions;
};
