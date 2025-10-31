import React, { FC, useCallback, useMemo } from 'react';

import useProjects from '@kubevirt-utils/hooks/useProjects';
import usePVCs from '@kubevirt-utils/hooks/usePVCs';
import { getPVCSize } from '@kubevirt-utils/resources/bootableresources/selectors';
import { formatQuantityString } from '@kubevirt-utils/utils/units';

import DiskSourcePVCSelectName from './DiskSourcePVCSelectName';
import DiskSourcePVCSelectNamespace from './DiskSourcePVCSelectNamespace';

type DiskSourcePVCSelectProps = {
  cluster?: string;
  pvcNameSelected: string;
  pvcNamespaceSelected: string;
  selectPVCName: (value: string) => void;
  selectPVCNamespace?: (value: string) => void;
  setDiskSize?: (value: string) => void;
};

const DiskSourcePVCSelect: FC<DiskSourcePVCSelectProps> = ({
  cluster,
  pvcNameSelected,
  pvcNamespaceSelected,
  selectPVCName,
  selectPVCNamespace,
  setDiskSize,
}) => {
  const [projectsNames, projectNamesLoaded] = useProjects(cluster);
  const [pvcs, pvcsLoaded] = usePVCs(pvcNamespaceSelected, cluster);

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
      setDiskSize && setDiskSize(formatQuantityString(getPVCSize(selectedPVC)));
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
        projectNames={projectsNames}
        projectsLoaded={projectNamesLoaded}
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
