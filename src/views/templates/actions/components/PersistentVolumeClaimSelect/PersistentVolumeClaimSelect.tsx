import * as React from 'react';

import { PersistentVolumeClainSelectSkeleton } from './PersistentVolumeClainSelectSkeleton';
import { PersistentVolumeSelectName } from './PersistentVolumeSelectName';
import { PersistentVolumeSelectProject } from './PersistentVolumeSelectProject';
import { useProjectsAndPVCs } from './utils';

import './PersistentVolumeClaimSelect.scss';

type PersistentVolumeClaimSelectProps = {
  pvcNameSelected: string;
  projectSelected: string;
  selectPVC: (pvcNamespace: string, pvcName?: string) => void;
};

export const PersistentVolumeClaimSelect: React.FC<PersistentVolumeClaimSelectProps> = ({
  pvcNameSelected,
  projectSelected,
  selectPVC,
}) => {
  const { projectsNames, filteredPVCNames, projectsLoaded, pvcsLoaded } =
    useProjectsAndPVCs(projectSelected);

  const onSelectProject = React.useCallback(
    (newProject) => {
      selectPVC(newProject);
    },
    [selectPVC],
  );

  const onPVCSelected = React.useCallback(
    (selection) => {
      selectPVC(projectSelected, selection);
    },
    [selectPVC, projectSelected],
  );

  if (!projectsLoaded) return <PersistentVolumeClainSelectSkeleton />;

  return (
    <div>
      <PersistentVolumeSelectProject
        projectsName={projectsNames}
        selectedProject={projectSelected}
        onChange={onSelectProject}
      />
      <PersistentVolumeSelectName
        onChange={onPVCSelected}
        pvcNameSelected={pvcNameSelected}
        pvcNames={filteredPVCNames}
        isDisabled={!projectSelected}
        isLoading={!pvcsLoaded}
      />
    </div>
  );
};
