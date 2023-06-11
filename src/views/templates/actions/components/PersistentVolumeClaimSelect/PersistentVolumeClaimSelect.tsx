import * as React from 'react';

import { PersistentVolumeClainSelectSkeleton } from './PersistentVolumeClainSelectSkeleton';
import { PersistentVolumeSelectName } from './PersistentVolumeSelectName';
import { PersistentVolumeSelectProject } from './PersistentVolumeSelectProject';
import { useProjectsAndPVCs } from './utils';

import './PersistentVolumeClaimSelect.scss';

type PersistentVolumeClaimSelectProps = {
  projectSelected: string;
  pvcNameSelected: string;
  selectPVC: (pvcNamespace: string, pvcName?: string) => void;
};

export const PersistentVolumeClaimSelect: React.FC<PersistentVolumeClaimSelectProps> = ({
  projectSelected,
  pvcNameSelected,
  selectPVC,
}) => {
  const { filteredPVCNames, projectsLoaded, projectsNames, pvcsLoaded } =
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
