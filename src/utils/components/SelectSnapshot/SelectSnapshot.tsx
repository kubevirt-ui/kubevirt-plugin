import React, { FC, useCallback, useMemo } from 'react';

import {
  modelToGroupVersionKind,
  NamespaceModel,
  VolumeSnapshotModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import SelectResourceByName from '../SelectResourceByName/SelectResourceByName';

import useSnapshots from './useSnapshots';

import './select-snapshot.scss';

type SelectSnapshotProps = {
  selectSnapshotName: (value: string) => void;
  selectSnapshotNamespace?: (value: string) => void;
  snapshotNameSelected: string;
  snapshotNamespaceSelected: string;
};

const SelectSnapshot: FC<SelectSnapshotProps> = ({
  selectSnapshotName,
  selectSnapshotNamespace,
  snapshotNameSelected,
  snapshotNamespaceSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const { projectsLoaded, projectsNames, snapshots, snapshotsLoaded } =
    useSnapshots(snapshotNamespaceSelected);

  const onSelectProject = useCallback(
    (newProject) => {
      selectSnapshotNamespace && selectSnapshotNamespace(newProject);
      selectSnapshotName(undefined);
    },
    [selectSnapshotNamespace, selectSnapshotName],
  );

  const snapshotNames = useMemo(
    () =>
      snapshots?.map((snapshot) => snapshot?.metadata?.name)?.sort((a, b) => a?.localeCompare(b)),
    [snapshots],
  );

  return (
    <div>
      <SelectResourceByName
        className="snapshot-selection-formgroup"
        fieldId="snapshot-project-select"
        isDisabled={!selectSnapshotNamespace}
        label={t('VolumeSnapshot project')}
        nameSelected={snapshotNamespaceSelected}
        onChange={onSelectProject}
        placeholder={t('--- Select VolumeSnapshot project ---')}
        resourceGroupVersionKind={modelToGroupVersionKind(NamespaceModel)}
        resourceNames={projectsNames}
        resourcesLoaded={projectsLoaded}
      />

      <SelectResourceByName
        fieldId="snapshot-name-select"
        isDisabled={!snapshotNamespaceSelected}
        label={t('VolumeSnapshot name')}
        nameSelected={snapshotNameSelected}
        onChange={selectSnapshotName}
        placeholder={t('--- Select VolumeSnapshot name ---')}
        resourceGroupVersionKind={modelToGroupVersionKind(VolumeSnapshotModel)}
        resourceNames={snapshotNames}
        resourcesLoaded={snapshotsLoaded}
      />
    </div>
  );
};

export default SelectSnapshot;
