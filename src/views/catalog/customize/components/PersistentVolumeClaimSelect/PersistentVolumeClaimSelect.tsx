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
  setVolumeQuantity: (size: string) => void;
};

export const PersistentVolumeClaimSelect: React.FC<PersistentVolumeClaimSelectProps> = ({
  'data-test-id': testId,
  projectSelected,
  pvcNameSelected,
  selectNamespace,
  selectPVCName,
  setVolumeQuantity,
}) => {
  const { filteredPVCNames, projectsLoaded, projectsNames, pvcMapper, pvcsLoaded } =
    useProjectsAndPVCs(projectSelected);

  const onSelectProject = React.useCallback(
    (newProject: string) => {
      selectNamespace(newProject);
      selectPVCName(undefined);
    },
    [selectNamespace, selectPVCName],
  );

  const onPVCSelected = React.useCallback(
    (selection: string) => {
      selectPVCName(selection);
      const size = pvcMapper?.[projectSelected]?.[selection]?.spec?.resources?.requests?.storage;
      setVolumeQuantity(size);
    },
    [projectSelected, pvcMapper, selectPVCName, setVolumeQuantity],
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
