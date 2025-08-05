import { useMemo } from 'react';

import usePVCs from '@kubevirt-utils/hooks/usePVCs';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

type ISOOption = {
  children: string;
  value: string;
};

export const useISOOptions = (namespace: string) => {
  const [pvcs, pvcsLoaded] = usePVCs(namespace);

  const isoOptions: ISOOption[] = useMemo(() => {
    if (!pvcsLoaded || isEmpty(pvcs)) return [];

    return pvcs.map((pvc) => ({
      children: getName(pvc),
      value: getName(pvc),
    }));
  }, [pvcs, pvcsLoaded]);

  return {
    isoOptions,
    pvcsLoaded,
  };
};
