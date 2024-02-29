import React, { FC, useCallback, useMemo } from 'react';

import {
  modelToGroupVersionKind,
  NamespaceModel,
  VolumeSnapshotModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

import InlineFilterSelect from '../FilterSelect/InlineFilterSelect';
import Loading from '../Loading/Loading';

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
