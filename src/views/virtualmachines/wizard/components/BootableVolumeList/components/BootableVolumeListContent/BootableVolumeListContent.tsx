import React, { type FC } from 'react';

import {
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type NamespacedResourceMap, type ResourceMap } from '@kubevirt-utils/resources/shared';
import { Skeleton } from '@patternfly/react-core';
import { type ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import {
  type OnSelectBootableVolume,
  type UseBootableVolumesValues,
} from '@virtualmachines/wizard/utils/types';

import { type TableColumnWithOptionalIndex } from '../../types';
import BootableVolumeEmptyState from '../BootableVolumeEmptyState/BootableVolumeEmptyState';
import BootableVolumeTable from '../BootableVolumeTable/BootableVolumeTable';

type BootableVolumeListContentProps = {
  activeColumns: TableColumnWithOptionalIndex<BootableVolume>[];
  bootableVolumesData: UseBootableVolumesValues;
  canCreateVolume: boolean;
  displayVolumes: boolean;
  getSortType: (columnIndex: number) => ThSortType;
  isHeaderStuck: boolean;
  isManualFilterEmpty: boolean;
  isVolumeListEmpty: boolean;
  isVolumesLoaded: boolean;
  loadError?: Error;
  lockedPreference?: PreferenceOption;
  onCreateVolume: (volume: BootableVolume) => void;
  onSelectBootableVolume: OnSelectBootableVolume;
  preferenceName?: string;
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>;
  selectedBootableVolume?: BootableVolume;
  showNoBootSourceHint?: boolean;
  sortedPaginatedData: BootableVolume[];
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>;
  volumeListNamespace: string;
};

const BootableVolumeListContent: FC<BootableVolumeListContentProps> = ({
  activeColumns,
  bootableVolumesData,
  canCreateVolume,
  displayVolumes,
  getSortType,
  isHeaderStuck,
  isManualFilterEmpty,
  isVolumeListEmpty,
  isVolumesLoaded,
  loadError,
  lockedPreference,
  onCreateVolume,
  onSelectBootableVolume,
  preferenceName,
  preferencesMap,
  selectedBootableVolume,
  showNoBootSourceHint,
  sortedPaginatedData,
  userPreferencesMap,
  volumeListNamespace,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {displayVolumes && !isManualFilterEmpty && (
        <BootableVolumeTable
          activeColumns={activeColumns}
          bootableVolumesData={bootableVolumesData}
          getSortType={getSortType}
          isHeaderStuck={isHeaderStuck}
          onSelectBootableVolume={onSelectBootableVolume}
          preferencesMap={preferencesMap}
          selectedBootableVolume={selectedBootableVolume}
          sortedPaginatedData={sortedPaginatedData}
          userPreferencesMap={userPreferencesMap}
          volumeListNamespace={volumeListNamespace}
        />
      )}
      {isVolumesLoaded && isVolumeListEmpty && (
        <BootableVolumeEmptyState
          canCreate={canCreateVolume}
          loadError={loadError}
          lockedPreference={lockedPreference}
          onCreateVolume={onCreateVolume}
          preferenceName={preferenceName}
          showNoBootSourceHint={showNoBootSourceHint}
        />
      )}
      {displayVolumes && isManualFilterEmpty && (
        <div className="pf-v6-u-text-align-center pf-v6-u-py-lg">
          <MutedTextSpan text={t('No results match the current filters')} />
        </div>
      )}
      {!isVolumesLoaded &&
        [1, 2, 3].map((key) => (
          <Skeleton
            className="pf-v6-u-my-md"
            key={key}
            screenreaderText={key === 1 ? t('Loading bootable volumes') : undefined}
          />
        ))}
    </>
  );
};

export default BootableVolumeListContent;
