import React, { FC, useCallback, useEffect, useMemo } from 'react';

import {
  modelToGroupVersionKind,
  NamespaceModel,
  VolumeSnapshotModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { Content, FormGroup } from '@patternfly/react-core';

import { initialBootableVolumeState } from '../AddBootableVolumeModal/utils/constants';
import InlineFilterSelect from '../FilterSelect/InlineFilterSelect';
import Loading from '../Loading/Loading';

import useSnapshots from './useSnapshots';

import './select-snapshot.scss';

type SelectSnapshotProps = {
  cluster?: string;
  selectSnapshotName: (value: string) => void;
  selectSnapshotNamespace?: (value: string) => void;
  setDiskSize?: (size: string) => void;
  snapshotNameSelected: string;
  snapshotNamespaceSelected: string;
};

const SelectSnapshot: FC<SelectSnapshotProps> = ({
  cluster,
  selectSnapshotName,
  selectSnapshotNamespace,
  setDiskSize,
  snapshotNameSelected,
  snapshotNamespaceSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const { projectsLoaded, projectsWithSnapshots, snapshots, snapshotsLoaded } = useSnapshots(
    snapshotNamespaceSelected,
    cluster,
  );

  const onSelectProject = useCallback(
    (newProject) => {
      selectSnapshotNamespace && selectSnapshotNamespace(newProject);
      selectSnapshotName(undefined);
      setDiskSize?.(initialBootableVolumeState.size);
    },
    [selectSnapshotNamespace, selectSnapshotName, setDiskSize],
  );

  const getSnapshotSize = useCallback(
    (snapshotName: string) =>
      snapshots?.find((snapshot) => getName(snapshot) === snapshotName)?.status?.restoreSize,
    [snapshots],
  );

  useEffect(() => {
    if (snapshotNameSelected && snapshotsLoaded) {
      setDiskSize?.(getSnapshotSize(snapshotNameSelected));
    }
  }, [snapshotNameSelected, snapshotsLoaded, getSnapshotSize, setDiskSize]);

  const snapshotNames = useMemo(
    () => snapshots?.map((snapshot) => getName(snapshot))?.sort((a, b) => a?.localeCompare(b)),
    [snapshots],
  );

  return (
    <div>
      {!projectsLoaded && <Loading />}
      {projectsLoaded && projectsWithSnapshots.length === 0 && (
        <Content component="p">{t('No VolumeSnapshots found in the cluster.')}</Content>
      )}
      {projectsLoaded && projectsWithSnapshots.length > 0 && (
        <FormGroup
          className="snapshot-selection-formgroup"
          fieldId="snapshot-project-select"
          isRequired
          label={t('VolumeSnapshot project')}
        >
          <InlineFilterSelect
            options={projectsWithSnapshots.map(({ count, name }) => ({
              children: `${name} (${count})`,
              groupVersionKind: modelToGroupVersionKind(NamespaceModel),
              label: `${name} (${count})`,
              value: name,
              valueForFilter: `${name} (${count})`,
            }))}
            toggleProps={{
              isDisabled: !selectSnapshotNamespace,
              isFullWidth: true,
            }}
            placeholder={t('Select VolumeSnapshot project')}
            selected={snapshotNamespaceSelected}
            setSelected={onSelectProject}
          />
        </FormGroup>
      )}

      {snapshotsLoaded ? (
        <FormGroup fieldId="snapshot-name-select" isRequired label={t('VolumeSnapshot name')}>
          <InlineFilterSelect
            options={snapshotNames.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
              value: name,
            }))}
            toggleProps={{
              isDisabled: !snapshotNamespaceSelected,
              isFullWidth: true,
            }}
            placeholder={t('Select VolumeSnapshot name')}
            selected={snapshotNameSelected}
            setSelected={selectSnapshotName}
          />
        </FormGroup>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default SelectSnapshot;
