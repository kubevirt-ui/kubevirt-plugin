import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import { createRunAction } from './self-validation/components/actions/CheckupsSelfValidationSharedActionFactory';
import { CHECKUP_URLS } from './utils/constants';
import { trimLastHistoryPath } from './utils/utils';

type CheckupsRunButtonActionFactoryParams = {
  hasRunningSelfValidationJobs: boolean;
  isCreateNetworkPermitted: boolean;
  isCreateSelfValidationPermitted: boolean;
  isCreateStoragePermitted: boolean;
  locationPath: string;
  navigate: (path: string) => void;
  runningSelfValidationJobs?: IoK8sApiBatchV1Job[];
};

export const CheckupsRunButtonActionFactory = {
  network: ({
    isCreateNetworkPermitted,
    locationPath,
    navigate,
  }: CheckupsRunButtonActionFactoryParams): ActionDropdownItemType => {
    return {
      cta: () => {
        if (isCreateNetworkPermitted) {
          navigate(createURL(`${CHECKUP_URLS.NETWORK}/form`, trimLastHistoryPath(locationPath)));
        }
      },
      disabled: !isCreateNetworkPermitted,
      id: 'checkup-run-network',
      label: t('Network'),
    };
  },
  selfValidation: ({
    isCreateSelfValidationPermitted,
    locationPath,
    navigate,
    runningSelfValidationJobs = [],
  }: CheckupsRunButtonActionFactoryParams): ActionDropdownItemType => {
    return createRunAction({
      isCreateSelfValidationPermitted,
      locationPath,
      navigate,
      runningSelfValidationJobs,
      t,
    });
  },
  storage: ({
    isCreateStoragePermitted,
    locationPath,
    navigate,
  }: CheckupsRunButtonActionFactoryParams): ActionDropdownItemType => {
    return {
      cta: () => {
        if (isCreateStoragePermitted) {
          navigate(createURL(`${CHECKUP_URLS.STORAGE}/form`, trimLastHistoryPath(locationPath)));
        }
      },
      disabled: !isCreateStoragePermitted,
      id: 'checkup-run-storage',
      label: t('Storage'),
    };
  },
};
