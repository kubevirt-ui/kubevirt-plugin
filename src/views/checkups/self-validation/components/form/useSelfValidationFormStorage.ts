// Extracted from CheckupsSelfValidationForm.tsx
// Root: src/views/checkups/self-validation/components/form/CheckupsSelfValidationForm.tsx

import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';

import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getDefaultStorageClass } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { calculatePVCStorageSize } from '../../utils/selfValidationJob/resourceTemplates';
import useStorageProfileCapabilitiesSync from './useStorageProfileCapabilitiesSync';

type UseSelfValidationFormStorage = {
  claimPropertySetsLength: number;
  effectiveStorageClass: string;
  pvcSize: string;
  setPvcSize: (size: string) => void;
  setStorageCapabilities: Dispatch<SetStateAction<string[]>>;
  setStorageClass: (storageClass: string) => void;
  storageCapabilities: string[];
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageClassesLoaded: boolean;
  storageProfileError: boolean;
  storageProfileLoaded: boolean;
};

const useSelfValidationFormStorage = (
  selectedTestSuites: string[],
  cluster: string | undefined,
): UseSelfValidationFormStorage => {
  const [storageClass, setStorageClass] = useState<string>('');
  const [storageCapabilities, setStorageCapabilities] = useState<string[]>([]);
  const defaultPvcSize = useMemo(
    (): string => calculatePVCStorageSize(selectedTestSuites),
    [selectedTestSuites],
  );
  const [pvcSize, setPvcSize] = useState<string>(defaultPvcSize);

  useEffect(() => {
    setPvcSize(defaultPvcSize);
  }, [defaultPvcSize]);

  const [storageClasses, storageClassesLoaded] = useK8sWatchData<IoK8sApiStorageV1StorageClass[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const defaultSC = useMemo(() => getDefaultStorageClass(storageClasses), [storageClasses]);
  const effectiveStorageClass = storageClass || (getName(defaultSC) ?? '');

  const {
    claimPropertySets,
    error: storageProfileError,
    loaded: storageProfileLoaded,
  } = useStorageProfileClaimPropertySets(effectiveStorageClass, cluster);

  useStorageProfileCapabilitiesSync(
    effectiveStorageClass,
    claimPropertySets,
    storageProfileLoaded,
    setStorageCapabilities,
  );

  useEffect(() => {
    if (!storageClass && storageClassesLoaded && !isEmpty(defaultSC)) {
      setStorageClass(getName(defaultSC) ?? '');
    }
  }, [defaultSC, storageClass, storageClassesLoaded]);

  return {
    claimPropertySetsLength: claimPropertySets?.length ?? 0,
    effectiveStorageClass,
    pvcSize,
    setPvcSize,
    setStorageCapabilities,
    setStorageClass,
    storageCapabilities,
    storageClasses,
    storageClassesLoaded,
    storageProfileError: Boolean(storageProfileError),
    storageProfileLoaded,
  };
};

export default useSelfValidationFormStorage;
