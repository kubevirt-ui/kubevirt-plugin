import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import { getItemNameWithOther, includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { BootableResource } from '../../utils/types';
import { getPreferenceOSType } from '../../utils/utils';

const useBootableVolumesFilters = (): RowFilter<BootableResource>[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      filter: (availableOsNames, obj) =>
        includeFilter(availableOsNames, OS_NAMES, getPreferenceOSType(obj)),
      filterGroupName: t('Operating system'),
      items: OS_NAMES,
      reducer: (obj) => getItemNameWithOther(getPreferenceOSType(obj), OS_NAMES),
      type: 'osName',
    },
  ];
};

export default useBootableVolumesFilters;
