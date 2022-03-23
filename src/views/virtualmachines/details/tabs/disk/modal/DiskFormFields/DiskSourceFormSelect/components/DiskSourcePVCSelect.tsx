import * as React from 'react';

import { useProjectsAndPVCs } from '../../hooks/useProjectsAndPVCs';

import DiskSourcePVCSelectName from './DiskSourcePVCSelectName';
import DiskSourcePVCSelectNamespace from './DiskSourcePVCSelectNamespace';

type DiskSourcePVCSelectProps = {
  pvcNameSelected: string;
  pvcNamespaceSelected: string;
  selectPVCName: (value: string) => void;
  selectPVCNamespace?: (value: string) => void;
  filter?: boolean;
};

const DiskSourcePVCSelect: React.FC<DiskSourcePVCSelectProps> = ({
  pvcNameSelected,
  pvcNamespaceSelected,
  selectPVCName,
  selectPVCNamespace,
}) => {
  const { projectsNames, pvcs, projectsLoaded, pvcsLoaded } =
    useProjectsAndPVCs(pvcNamespaceSelected);

  const onSelectProject = React.useCallback(
    (newProject) => {
      selectPVCNamespace && selectPVCNamespace(newProject);
      selectPVCName(undefined);
    },
    [selectPVCNamespace, selectPVCName],
  );

  const onPVCSelected = React.useCallback(
    (selection) => {
      selectPVCName(selection);
    },
    [selectPVCName],
  );

  return (
    <div>
      <DiskSourcePVCSelectNamespace
        projectsName={projectsNames}
        selectedProject={pvcNamespaceSelected}
        onChange={onSelectProject}
        isDisabled={!selectPVCNamespace}
        projectsLoaded={projectsLoaded}
      />
      <DiskSourcePVCSelectName
        onChange={onPVCSelected}
        pvcNameSelected={pvcNameSelected}
        pvcNames={pvcs?.map((pvc) => pvc.metadata.name)}
        isDisabled={!pvcNamespaceSelected}
        pvcsLoaded={pvcsLoaded}
      />
    </div>
  );
};

export default DiskSourcePVCSelect;
