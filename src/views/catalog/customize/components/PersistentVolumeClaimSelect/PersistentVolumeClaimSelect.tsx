import * as React from 'react';

import { PersistentVolumeSelectName } from './PersistentVolumeSelectName';
import { PersistentVolumeSelectProject } from './PersistentVolumeSelectProject';
import { useProjectsAndPVCs } from './utils';

import './PersistentVolumeClaimSelect.scss';

type PersistentVolumeClaimSelectProps = {
  pvcNameSelected: string;
  projectSelected: string;
  selectNamespace: (namespace: string) => void;
  selectPVCName: (pvcName: string) => void;
  'data-test-id': string;
};

export const PersistentVolumeClaimSelect: React.FC<PersistentVolumeClaimSelectProps> = ({
  pvcNameSelected,
  projectSelected,
  selectPVCName,
  selectNamespace,
  'data-test-id': testId,
}) => {
  const { projectsNames, filteredPVCNames, projectsLoaded, pvcsLoaded } =
    useProjectsAndPVCs(projectSelected);

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

  return (
    <div>
      <PersistentVolumeSelectProject
        projectsName={projectsNames}
        selectedProject={projectSelected}
        onChange={onSelectProject}
        data-test-id={`${testId}-project-select`}
        loaded={projectsLoaded}
      />
      <PersistentVolumeSelectName
        onChange={onPVCSelected}
        pvcNameSelected={pvcNameSelected}
        pvcNames={filteredPVCNames}
        isDisabled={!projectSelected}
        data-test-id={`${testId}-pvc-name-select`}
        loaded={pvcsLoaded}
      />
    </div>
  );
};
