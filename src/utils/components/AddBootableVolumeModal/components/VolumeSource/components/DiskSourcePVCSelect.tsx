import { type FC, useCallback, useEffect, useMemo } from 'react';

import useAllowedNamespaces from '@kubevirt-utils/hooks/useAllowedNamespaces/useAllowedNamespaces';
import { getSortedNamespaceNames } from '@kubevirt-utils/hooks/useAllowedNamespaces/utils';
import usePVCs from '@kubevirt-utils/hooks/usePVCs';
import { filterResourcesByAllowedPreferences } from '@kubevirt-utils/resources/bootableresources/preferenceLabelFilter';
import { getPVCSize } from '@kubevirt-utils/resources/bootableresources/selectors';
import { getCloneSourceFleetAccessReview } from '@kubevirt-utils/resources/cdi/pvcClonePermission';
import { getName } from '@kubevirt-utils/resources/shared';
import { formatQuantityString } from '@kubevirt-utils/utils/units';
import { type FleetAccessReviewResourceAttributes } from '@stolostron/multicluster-sdk';

import DiskSourcePVCSelectName from './DiskSourcePVCSelectName';
import DiskSourcePVCSelectNamespace from './DiskSourcePVCSelectNamespace';

type DiskSourcePVCSelectProps = {
  allowedPreferenceNames?: string[];
  cluster?: string;
  pvcNameSelected: string;
  pvcNamespaceSelected: string;
  selectPVCName: (value: string) => void;
  selectPVCNamespace?: (value: string) => void;
  setDiskSize?: (value: string) => void;
};

const DiskSourcePVCSelect: FC<DiskSourcePVCSelectProps> = ({
  allowedPreferenceNames,
  cluster,
  pvcNameSelected,
  pvcNamespaceSelected,
  selectPVCName,
  selectPVCNamespace,
  setDiskSize,
}) => {
  const cloneAccessReview = useMemo(
    (): FleetAccessReviewResourceAttributes => getCloneSourceFleetAccessReview(cluster),
    [cluster],
  );

  const { namespaces, namespacesLoaded } = useAllowedNamespaces(cloneAccessReview);
  const [pvcs, pvcsLoaded] = usePVCs(pvcNamespaceSelected, cluster);

  const selectableProjectNames = useMemo(() => getSortedNamespaceNames(namespaces), [namespaces]);

  const filteredPvcs = useMemo(
    () => filterResourcesByAllowedPreferences(pvcs, allowedPreferenceNames),
    [allowedPreferenceNames, pvcs],
  );

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
      const selectedPVC = filteredPvcs?.find((pvc) => getName(pvc) === selection);
      setDiskSize?.(formatQuantityString(getPVCSize(selectedPVC)));
    },
    [selectPVCName, filteredPvcs, setDiskSize],
  );

  const pvcNames = useMemo(
    () =>
      filteredPvcs
        .map((pvc) => getName(pvc))
        .filter((name): name is string => Boolean(name))
        .sort((a, b) => a.localeCompare(b)),
    [filteredPvcs],
  );

  useEffect(() => {
    if (pvcNameSelected && pvcsLoaded && !pvcNames.includes(pvcNameSelected)) {
      selectPVCName(undefined);
    }
  }, [pvcNameSelected, pvcNames, pvcsLoaded, selectPVCName]);

  return (
    <>
      <DiskSourcePVCSelectNamespace
        isDisabled={!selectPVCNamespace}
        onChange={onSelectProject}
        projectNames={selectableProjectNames}
        projectsLoaded={namespacesLoaded}
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
