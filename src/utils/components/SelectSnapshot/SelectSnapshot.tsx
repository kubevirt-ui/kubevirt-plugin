import React, { FC, useCallback, useEffect, useMemo } from 'react';

import {
  modelToGroupVersionKind,
  NamespaceModel,
  VolumeSnapshotModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { FormGroup } from '@patternfly/react-core';

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
  const { projectsLoaded, projectsNames, snapshots, snapshotsLoaded } = useSnapshots(
    snapshotNamespaceSelected,
    cluster,
  );

  const onSelectProject = useCallback(
    (newProject) => {
      selectSnapshotNamespace && selectSnapshotNamespace(newProject);
      selectSnapshotName(undefined);
      setDiskSize(initialBootableVolumeState.size);
    },
    [selectSnapshotNamespace, selectSnapshotName],
  );

  const getSnapshotSize = (snapshotName: string) =>
    snapshots?.find((snapshot) => getName(snapshot) === snapshotName)?.status?.restoreSize;

  useEffect(() => {
    if (snapshotNameSelected && snapshotsLoaded) {
      setDiskSize(getSnapshotSize(snapshotNameSelected));
    }
  }, [snapshotNameSelected, snapshotsLoaded]);

  const snapshotNames = useMemo(
    () => snapshots?.map((snapshot) => getName(snapshot))?.sort((a, b) => a?.localeCompare(b)),
    [snapshots],
  );

  return (
    <div>
      {projectsLoaded ? (
        <FormGroup
          className="snapshot-selection-formgroup"
          fieldId="snapshot-project-select"
          isRequired
          label={t('VolumeSnapshot project')}
        >
          <InlineFilterSelect
            options={projectsNames.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(NamespaceModel),
              value: name,
            }))}
            toggleProps={{
              isDisabled: !selectSnapshotNamespace,
              isFullWidth: true,
              placeholder: t('--- Select VolumeSnapshot project ---'),
            }}
            selected={snapshotNamespaceSelected}
            setSelected={onSelectProject}
          />
        </FormGroup>
      ) : (
        <Loading />
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
              placeholder: t('--- Select VolumeSnapshot name ---'),
            }}
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
