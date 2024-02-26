import React, { FC, useCallback } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  ProjectModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FormGroup } from '@patternfly/react-core';

import { useProjectsAndPVCs } from '../useProjectsAndPVCs';
import { getPVCSource } from '../utils';

import './PersistentVolumeClaimSelect.scss';

type PersistentVolumeClaimSelectProps = {
  currentSize: string;
  'data-test-id': string;
  onSourceChange: (customSource: V1beta1DataVolumeSpec) => void;
  projectSelected: string;
  pvcNameSelected: string;
};

export const PersistentVolumeClaimSelect: FC<PersistentVolumeClaimSelectProps> = ({
  currentSize,
  'data-test-id': testId,
  onSourceChange,
  projectSelected,
  pvcNameSelected,
}) => {
  const { t } = useKubevirtTranslation();
  const { filteredPVCNames, projectsLoaded, projectsNames, pvcMapper, pvcsLoaded } =
    useProjectsAndPVCs(projectSelected);

  const onSelectProject = useCallback(
    (newProject: string) => {
      onSourceChange(getPVCSource(undefined, newProject, currentSize));
    },
    [currentSize, onSourceChange],
  );

  const onPVCSelected = useCallback(
    (selection: string) => {
      const size = pvcMapper?.[projectSelected]?.[selection]?.spec?.resources?.requests?.storage;
      onSourceChange(getPVCSource(selection, projectSelected, size));
    },
    [onSourceChange, projectSelected, pvcMapper],
  );

  return (
    <div>
      {projectsLoaded ? (
        <FormGroup
          className="pvc-selection-formgroup"
          fieldId={`${testId}-project-select`}
          isRequired
          label={t('PVC project')}
        >
          <InlineFilterSelect
            options={projectsNames.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(ProjectModel),
              value: name,
            }))}
            toggleProps={{
              placeholder: t('--- Select PVC project ---'),
            }}
            selected={projectSelected}
            setSelected={onSelectProject}
          />
        </FormGroup>
      ) : (
        <Loading />
      )}

      {pvcsLoaded ? (
        <FormGroup
          className="pvc-selection-formgroup"
          fieldId={`${testId}-pvc-name-select`}
          isRequired
          label={t('PVC name')}
        >
          <InlineFilterSelect
            options={filteredPVCNames.map((name) => ({
              children: name,
              groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
              value: name,
            }))}
            toggleProps={{
              placeholder: t('--- Select PVC name ---'),
            }}
            selected={pvcNameSelected}
            setSelected={onPVCSelected}
          />
        </FormGroup>
      ) : (
        <Loading />
      )}
    </div>
  );
};
