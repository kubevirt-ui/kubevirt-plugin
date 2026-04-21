import React, { FC, useCallback } from 'react';

import useProjects from '@kubevirt-utils/hooks/useProjects';
import usePVCs from '@kubevirt-utils/hooks/usePVCs';
import { getName } from '@kubevirt-utils/resources/shared';

import { PersistentVolumeClainSelectSkeleton } from './PersistentVolumeClainSelectSkeleton';
import { PersistentVolumeSelectName } from './PersistentVolumeSelectName';
import { PersistentVolumeSelectProject } from './PersistentVolumeSelectProject';

import './PersistentVolumeClaimSelect.scss';

type PersistentVolumeClaimSelectProps = {
  projectSelected: string;
  pvcNameSelected: string;
  selectPVC: (pvcNamespace: string, pvcName?: string) => void;
};

export const PersistentVolumeClaimSelect: FC<PersistentVolumeClaimSelectProps> = ({
  projectSelected,
  pvcNameSelected,
  selectPVC,
}) => {
  const [projectsNames, projectsLoaded] = useProjects();
  const [pvcs, pvcsLoaded] = usePVCs(projectSelected);
  const filteredPVCNames = pvcs?.map(getName);

  const onSelectProject = useCallback(
    (newProject) => {
      selectPVC(newProject);
    },
    [selectPVC],
  );

  const onPVCSelected = useCallback(
    (selection) => {
      selectPVC(projectSelected, selection);
    },
    [selectPVC, projectSelected],
  );

  if (!projectsLoaded) return <PersistentVolumeClainSelectSkeleton />;

  return (
    <div>
      <PersistentVolumeSelectProject
        onChange={onSelectProject}
        projectsName={projectsNames}
        selectedProject={projectSelected}
      />
      <PersistentVolumeSelectName
        isDisabled={!projectSelected}
        isLoading={!pvcsLoaded}
        onChange={onPVCSelected}
        pvcNames={filteredPVCNames}
        pvcNameSelected={pvcNameSelected}
      />
    </div>
  );
};
