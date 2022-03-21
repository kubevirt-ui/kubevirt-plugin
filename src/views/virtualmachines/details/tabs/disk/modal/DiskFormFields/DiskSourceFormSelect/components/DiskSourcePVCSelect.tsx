import * as React from 'react';

import { useProjectsAndPVCs } from '../../hooks/useProjectsAndPVCs';

import DiskSourcePVCSelectName from './DiskSourcePVCSelectName';
import DiskSourcePVCSelectNamespace from './DiskSourcePVCSelectNamespace';
import DiskSourcePVCSelectSkeleton from './DiskSourcePVCSelectSkeleton';

type DiskSourcePVCSelectProps = {
  pvcNameSelected: string;
  pvcNamespaceSelected: string;
  selectPVCName: React.Dispatch<React.SetStateAction<string>>;
  selectNamespace?: React.Dispatch<React.SetStateAction<string>>;
};

const DiskSourcePVCSelect: React.FC<DiskSourcePVCSelectProps> = ({
  pvcNameSelected,
  pvcNamespaceSelected,
  selectPVCName,
  selectNamespace,
}) => {
  const { projectsNames, filteredPVCNames, loaded } = useProjectsAndPVCs(pvcNamespaceSelected);

  const onSelectProject = React.useCallback(
    (newProject) => {
      selectNamespace && selectNamespace(newProject);
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

  if (!loaded) return <DiskSourcePVCSelectSkeleton />;

  return (
    <div>
      <DiskSourcePVCSelectNamespace
        projectsName={projectsNames}
        selectedProject={pvcNamespaceSelected}
        onChange={onSelectProject}
        isDisabled={!selectNamespace}
      />
      <DiskSourcePVCSelectName
        onChange={onPVCSelected}
        pvcNameSelected={pvcNameSelected}
        pvcNames={filteredPVCNames}
        isDisabled={!pvcNamespaceSelected}
      />
    </div>
  );
};

export default DiskSourcePVCSelect;
