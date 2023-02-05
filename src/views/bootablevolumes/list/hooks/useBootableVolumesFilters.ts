import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import { getItemNameWithOther, includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getPreferenceOSType } from '../../utils/utils';

const useBootableVolumesFilters = (): RowFilter<V1beta1DataSource>[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      filterGroupName: t('Operating system'),
      type: 'osName',
      reducer: (obj) => getItemNameWithOther(getPreferenceOSType(obj), OS_NAMES),
      filter: (availableOsNames, obj) =>
        includeFilter(availableOsNames, OS_NAMES, getPreferenceOSType(obj)),
      items: OS_NAMES,
    },
  ];
};

export default useBootableVolumesFilters;
