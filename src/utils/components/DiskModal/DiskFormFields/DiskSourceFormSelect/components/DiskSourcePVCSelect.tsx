import * as React from 'react';

import { useProjectsAndPVCs } from '../../hooks/useProjectsAndPVCs';

import DiskSourcePVCSelectName from './DiskSourcePVCSelectName';
import DiskSourcePVCSelectNamespace from './DiskSourcePVCSelectNamespace';

type DiskSourcePVCSelectProps = {
  pvcNameSelected: string;
  pvcNamespaceSelected: string;
  selectPVCName: (value: string) => void;
  selectPVCNamespace?: (value: string) => void;
  setDiskSize?: (value: string) => void;
};

const DiskSourcePVCSelect: React.FC<DiskSourcePVCSelectProps> = ({
  pvcNameSelected,
  pvcNamespaceSelected,
  selectPVCName,
  selectPVCNamespace,
  setDiskSize,
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
      const selectedPVC = pvcs?.find((pvc) => pvc.metadata.name === selection);
      const selectedPVCSize = selectedPVC?.spec?.resources?.requests?.storage;
      setDiskSize && setDiskSize(selectedPVCSize);
    },
    [selectPVCName, pvcs, setDiskSize],
  );

  const pvcNames = React.useMemo(() => {
    return pvcs?.map((pvc) => pvc?.metadata?.name); 
  }, [pvcs]);

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
        pvcNames={pvcNames}
        isDisabled={!pvcNamespaceSelected}
        pvcsLoaded={pvcsLoaded}
      />
    </div>
  );
};

export default DiskSourcePVCSelect;
