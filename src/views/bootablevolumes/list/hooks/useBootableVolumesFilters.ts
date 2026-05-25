import { useMemo } from 'react';

import { DataSourceModel, PersistentVolumeClaimModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import useClusterFilter from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useClusterFilter';
import useProjectFilter from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useProjectFilter';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ISO } from '@kubevirt-utils/resources/bootableresources/constants';
import {
  isBootableVolumeISO,
  isDeprecated,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';
import useIsACMPage from '@multicluster/useIsACMPage';

import { getPreferenceOSType } from '../../utils/utils';

import { BootableVolumesFilterID, NODATA_ID, NODATA_TITLE } from './constants';

const useBootableVolumesFilters = (bootableVolumes: BootableVolume[]): KubevirtFilter[] => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const clusterFilter = useClusterFilter();
  const projectFilter = useProjectFilter();

  const workloadsArchitectures = useMemo(
    () =>
      Array.from(new Set(bootableVolumes.map((bootableVolume) => getArchitecture(bootableVolume)))),
    [bootableVolumes],
  );

  return useMemo(() => {
    const filters: KubevirtFilter<BootableVolume>[] = [];

    if (isACMPage) {
      filters.push(clusterFilter);
    }

    filters.push(
      projectFilter,
      {
        applyWhenEmpty: true,
        hideCountBadge: true,
        id: BootableVolumesFilterID.SHOW_DEPRECATED_BOOTABLE_VOLUMES,
        match: (obj, selected) => (selected.length === 0 ? !isDeprecated(getName(obj)) : true),
        options: [
          {
            label: t('Show deprecated bootable volumes'),
            value: 'true',
          },
        ],
      },
      {
        categoryLabel: t('Architecture'),
        id: BootableVolumesFilterID.ARCHITECTURE,
        match: (obj, selected) => selected.includes(getArchitecture(obj) ?? NODATA_ID),
        options: workloadsArchitectures.map((arch) => ({
          label: arch ?? NODATA_TITLE,
          value: arch ?? NODATA_ID,
        })),
      },
      {
        categoryLabel: t('Operating system'),
        id: BootableVolumesFilterID.OS,
        match: (obj, selected) => selected.includes(getPreferenceOSType(obj)),
        options: OS_NAMES.map(({ id, title }) => ({ label: title, value: id })),
      },
      {
        categoryLabel: t('Resource'),
        id: BootableVolumesFilterID.RESOURCE_KIND,
        match: (obj, selected) => selected.includes(obj?.kind),
        options: [
          { label: PersistentVolumeClaimModel.abbr, value: PersistentVolumeClaimModel.kind },
          { label: 'DS', value: DataSourceModel.kind },
        ],
      },
      {
        categoryLabel: t('Type'),
        id: BootableVolumesFilterID.TYPE,
        match: (obj) => isBootableVolumeISO(obj),
        options: [{ label: ISO, value: ISO }],
      },
    );

    return filters;
  }, [t, isACMPage, clusterFilter, projectFilter, workloadsArchitectures]);
};

export default useBootableVolumesFilters;
