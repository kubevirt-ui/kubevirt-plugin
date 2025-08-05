import { useMemo } from 'react';

import { ISO_FILTER_KEYWORDS } from '@kubevirt-utils/components/DiskModal/utils/constants';
import usePVCs from '@kubevirt-utils/hooks/usePVCs';
import { getName } from '@kubevirt-utils/resources/shared';

type ISOOption = {
  children: string;
  value: string;
};

export const useISOOptions = (namespace: string) => {
  const [pvcs, pvcsLoaded] = usePVCs(namespace);

  const isoOptions: ISOOption[] = useMemo(() => {
    if (!pvcsLoaded || !pvcs) return [];

    return pvcs
      .filter((pvc) => {
        const name = getName(pvc).toLowerCase();
        return ISO_FILTER_KEYWORDS.some((keyword) => name.includes(keyword));
      })
      .map((pvc) => ({
        children: getName(pvc),
        value: getName(pvc),
      }));
  }, [pvcs, pvcsLoaded]);

  return {
    isoOptions,
    pvcsLoaded,
  };
};
