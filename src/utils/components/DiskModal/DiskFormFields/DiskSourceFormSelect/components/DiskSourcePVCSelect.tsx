import React, { FC, useCallback, useMemo } from 'react';

import { bytesFromQuantity } from '@catalog/utils/quantity';

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

const DiskSourcePVCSelect: FC<DiskSourcePVCSelectProps> = ({
  pvcNameSelected,
  pvcNamespaceSelected,
  selectPVCName,
  selectPVCNamespace,
  setDiskSize,
}) => {
  const { projectsNames, pvcs, projectsLoaded, pvcsLoaded } =
    useProjectsAndPVCs(pvcNamespaceSelected);

  const onSelectProject = useCallback(
    (newProject) => {
      selectPVCNamespace && selectPVCNamespace(newProject);
      selectPVCName(undefined);
    },
    [selectPVCNamespace, selectPVCName],
  );

  const onPVCSelected = useCallback(
    (selection) => {
      selectPVCName(selection);
      const selectedPVC = pvcs?.find((pvc) => pvc?.metadata?.name === selection);
      const selectedPVCSize = selectedPVC?.spec?.resources?.requests?.storage;
      setDiskSize && setDiskSize(bytesFromQuantity(selectedPVCSize)?.join(''));
    },
    [selectPVCName, pvcs, setDiskSize],
  );

  const pvcNames = useMemo(
    () => pvcs?.map((pvc) => pvc?.metadata?.name)?.sort((a, b) => a?.localeCompare(b)),
    [pvcs],
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
        pvcNames={pvcNames}
        isDisabled={!pvcNamespaceSelected}
        pvcsLoaded={pvcsLoaded}
      />
    </div>
  );
};

export default DiskSourcePVCSelect;
