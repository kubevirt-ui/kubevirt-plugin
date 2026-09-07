import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';

import useDefaultStorageClass from '@kubevirt-utils/hooks/useDefaultStorage/useDefaultStorageClass';
import { getPreferredDefaultStorageClass } from '@kubevirt-utils/hooks/useDefaultStorage/utils';
import useReadyStorageClasses from '@kubevirt-utils/hooks/useReadyStorageClasses/useReadyStorageClasses';
import { getName } from '@kubevirt-utils/resources/shared';

type UseMigrationStorageClassResult = {
  defaultStorageClassName: string;
  destinationStorageClass: string;
  scLoaded: boolean;
  setSelectedStorageClass: Dispatch<SetStateAction<string>>;
  sortedStorageClasses: string[] | undefined;
};

const useMigrationStorageClass = (cluster: string | undefined): UseMigrationStorageClassResult => {
  const [selectedStorageClass, setSelectedStorageClass] = useState('');

  const [defaultStorageClasses, defaultSCLoaded] = useDefaultStorageClass(cluster);
  const [{ sortedStorageClasses }, readySCLoaded] = useReadyStorageClasses(cluster);

  const scLoaded = defaultSCLoaded && readySCLoaded;

  const defaultStorageClassName = useMemo(
    () => getName(getPreferredDefaultStorageClass(defaultStorageClasses)),
    [defaultStorageClasses],
  );

  const destinationStorageClass = useMemo(
    () => selectedStorageClass || defaultStorageClassName,
    [defaultStorageClassName, selectedStorageClass],
  );

  return {
    defaultStorageClassName,
    destinationStorageClass,
    scLoaded,
    setSelectedStorageClass,
    sortedStorageClasses,
  };
};

export default useMigrationStorageClass;
