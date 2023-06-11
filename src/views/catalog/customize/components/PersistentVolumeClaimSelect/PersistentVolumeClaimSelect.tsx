import * as React from 'react';

import { PersistentVolumeSelectName } from './PersistentVolumeSelectName';
import { PersistentVolumeSelectProject } from './PersistentVolumeSelectProject';
import { useProjectsAndPVCs } from './utils';

import './PersistentVolumeClaimSelect.scss';

type PersistentVolumeClaimSelectProps = {
  'data-test-id': string;
  projectSelected: string;
  pvcNameSelected: string;
  selectNamespace: (namespace: string) => void;
  selectPVCName: (pvcName: string) => void;
};

export const PersistentVolumeClaimSelect: React.FC<PersistentVolumeClaimSelectProps> = ({
  'data-test-id': testId,
  projectSelected,
  pvcNameSelected,
  selectNamespace,
  selectPVCName,
}) => {
  const { filteredPVCNames, projectsLoaded, projectsNames, pvcsLoaded } =
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
        data-test-id={`${testId}-project-select`}
        loaded={projectsLoaded}
        onChange={onSelectProject}
        projectsName={projectsNames}
        selectedProject={projectSelected}
      />
      <PersistentVolumeSelectName
        data-test-id={`${testId}-pvc-name-select`}
        isDisabled={!projectSelected}
        loaded={pvcsLoaded}
        onChange={onPVCSelected}
        pvcNames={filteredPVCNames}
        pvcNameSelected={pvcNameSelected}
      />
    </div>
  );
};
