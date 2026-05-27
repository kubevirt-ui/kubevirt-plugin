import React, { FC, useCallback } from 'react';

import useNamespaces from '@kubevirt-utils/hooks/useNamespaces';
import usePVCs from '@kubevirt-utils/hooks/usePVCs';
import { getName } from '@kubevirt-utils/resources/shared';

import { PersistentVolumeClainSelectSkeleton } from './PersistentVolumeClainSelectSkeleton';
import { PersistentVolumeSelectName } from './PersistentVolumeSelectName';
import { PersistentVolumeSelectNamespace } from './PersistentVolumeSelectNamespace';

import './PersistentVolumeClaimSelect.scss';

type PersistentVolumeClaimSelectProps = {
  namespaceSelected: string;
  pvcNameSelected: string;
  selectPVC: (pvcNamespace: string, pvcName?: string) => void;
};

export const PersistentVolumeClaimSelect: FC<PersistentVolumeClaimSelectProps> = ({
  namespaceSelected,
  pvcNameSelected,
  selectPVC,
}) => {
  const [namespaces, namespacesLoaded] = useNamespaces();
  const [pvcs, pvcsLoaded] = usePVCs(namespaceSelected);
  const filteredPVCNames = pvcs?.map(getName);

  const onSelectNamespace = useCallback(
    (newNamespace) => {
      selectPVC(newNamespace);
    },
    [selectPVC],
  );

  const onPVCSelected = useCallback(
    (selection) => {
      selectPVC(namespaceSelected, selection);
    },
    [selectPVC, namespaceSelected],
  );

  if (!namespacesLoaded) return <PersistentVolumeClainSelectSkeleton />;

  return (
    <div>
      <PersistentVolumeSelectNamespace
        onChange={onSelectNamespace}
        namespaces={namespaces}
        selectedNamespace={namespaceSelected}
      />
      <PersistentVolumeSelectName
        isDisabled={!namespaceSelected}
        isLoading={!pvcsLoaded}
        onChange={onPVCSelected}
        pvcNames={filteredPVCNames}
        pvcNameSelected={pvcNameSelected}
      />
    </div>
  );
};
