import * as React from 'react';

import { PersistentVolumeClainSelectSkeleton } from './PersistentVolumeClainSelectSkeleton';
import { PersistentVolumeSelectName } from './PersistentVolumeSelectName';
import { PersistentVolumeSelectProject } from './PersistentVolumeSelectProject';
import { useProjectsAndPVCs } from './utils';

import './PersistentVolumeClaimSelect.scss';

type PersistentVolumeClaimSelectProps = {
  pvcNameSelected: string;
  projectSelected: string;
  selectNamespace: (namespace: string) => void;
  selectPVCName: (pvcName: string) => void;
};

export const PersistentVolumeClaimSelect: React.FC<PersistentVolumeClaimSelectProps> = ({
  pvcNameSelected,
  projectSelected,
  selectPVCName,
  selectNamespace,
}) => {
  const { projectsNames, filteredPVCNames, loaded } = useProjectsAndPVCs(projectSelected);

  const onSelectProject = React.useCallback(
    (newProject) => {
      selectNamespace(newProject);
      selectPVCName(undefined);
    },
    [selectNamespace, selectPVCName],
  );

  const onPVCSelected = React.useCallback(
    (selection) => {
      selectPVCName(selection);
    },
    [selectPVCName],
  );

  if (!loaded) return <PersistentVolumeClainSelectSkeleton />;

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
      />
    </div>
  );
};
