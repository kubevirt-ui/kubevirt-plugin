import React, { FC, useCallback } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  ProjectModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SelectResourceByName from '@kubevirt-utils/components/SelectResourceByName/SelectResourceByName';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

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
      <SelectResourceByName
        className="pvc-selection-formgroup"
        fieldId={`${testId}-project-select`}
        label={t('PVC project')}
        nameSelected={projectSelected}
        onChange={onSelectProject}
        placeholder={t('--- Select PVC project ---')}
        resourceGroupVersionKind={modelToGroupVersionKind(ProjectModel)}
        resourceNames={projectsNames}
        resourcesLoaded={projectsLoaded}
      />
      <SelectResourceByName
        className="pvc-selection-formgroup"
        fieldId={`${testId}-pvc-name-select`}
        label={t('PVC name')}
        nameSelected={pvcNameSelected}
        onChange={onPVCSelected}
        placeholder={t('--- Select PVC name ---')}
        resourceGroupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
        resourceNames={filteredPVCNames}
        resourcesLoaded={pvcsLoaded}
      />
    </div>
  );
};
