import React, { FC, useCallback, useMemo } from 'react';

import { bytesToDiskSize } from '@catalog/utils/quantity';
import { removeByteSuffix } from '@kubevirt-utils/components/CapacityInput/utils';

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
  const { projectsLoaded, projectsNames, pvcs, pvcsLoaded } =
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
      setDiskSize && setDiskSize(removeByteSuffix(bytesToDiskSize(selectedPVCSize)));
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
        isDisabled={!selectPVCNamespace}
        onChange={onSelectProject}
        projectsLoaded={projectsLoaded}
        projectsName={projectsNames}
        selectedProject={pvcNamespaceSelected}
      />
      <DiskSourcePVCSelectName
        isDisabled={!pvcNamespaceSelected}
        onChange={onPVCSelected}
        pvcNames={pvcNames}
        pvcNameSelected={pvcNameSelected}
        pvcsLoaded={pvcsLoaded}
      />
    </div>
  );
};

export default DiskSourcePVCSelect;
