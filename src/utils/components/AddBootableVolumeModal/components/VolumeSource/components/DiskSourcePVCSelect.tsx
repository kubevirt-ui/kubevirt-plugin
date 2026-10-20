import { type FC, useCallback, useMemo } from 'react';

import useAllowedNamespaces from '@kubevirt-utils/hooks/useAllowedNamespaces/useAllowedNamespaces';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import usePVCs from '@kubevirt-utils/hooks/usePVCs';
import { getPVCSize } from '@kubevirt-utils/resources/bootableresources/selectors';
import { getCloneSourceFleetAccessReview } from '@kubevirt-utils/resources/cdi/pvcClonePermission';
import { formatQuantityString } from '@kubevirt-utils/utils/units';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

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

  const cloneAccessReview = useMemo(
    (): FleetAccessReviewResourceAttributes => getCloneSourceFleetAccessReview(cluster),
    [cluster],
  );

  const {
    allowedNamespaces,
    filterByAllowedNamespaces,
    loaded: cloneNamespacesLoaded,
  } = useAllowedNamespaces(cloneAccessReview);
  const [pvcs, pvcsLoaded] = usePVCs(pvcNamespaceSelected, cluster);

  const selectableProjectNames = useMemo(() => {
    if (!filterByAllowedNamespaces) {
      return projectsNames;
    }
    const allowedSet = new Set(allowedNamespaces);
    return projectsNames.filter((name) => allowedSet.has(name));
  }, [allowedNamespaces, filterByAllowedNamespaces, projectsNames]);

  const onSelectProject = useCallback(
    (newProject) => {
      selectPVCNamespace?.(newProject);
      selectPVCName(undefined);
    },
    [selectPVCNamespace, selectPVCName],
  );

  const onPVCSelected = useCallback(
    (selection) => {
      selectPVCName(selection);
      const selectedPVC = pvcs?.find((pvc) => pvc?.metadata?.name === selection);
      setDiskSize?.(formatQuantityString(getPVCSize(selectedPVC)));
    },
    [selectPVCName, pvcs, setDiskSize],
  );

  const pvcNames = useMemo(
    () =>
      pvcs
        ?.map((pvc) => pvc?.metadata?.name)
        ?.filter((name): name is string => Boolean(name))
        ?.sort((a, b) => a.localeCompare(b)),
    [pvcs],
  );

  return (
    <>
      <DiskSourcePVCSelectNamespace
        isDisabled={!selectPVCNamespace}
        onChange={onSelectProject}
        projectNames={selectableProjectNames}
        projectsLoaded={projectNamesLoaded && cloneNamespacesLoaded}
        selectedProject={pvcNamespaceSelected}
      />
      <DiskSourcePVCSelectName
        isDisabled={!pvcNamespaceSelected}
        onChange={onPVCSelected}
        pvcNames={pvcNames}
        pvcNameSelected={pvcNameSelected}
        pvcsLoaded={pvcsLoaded}
      />
    </>
  );
};

export default DiskSourcePVCSelect;
