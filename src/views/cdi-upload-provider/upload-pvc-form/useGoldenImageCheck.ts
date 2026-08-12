import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { type V1beta1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getName, getNamespace } from '../utils/selectors';
import { type OperatingSystemRecord } from '../utils/types';

type GoldenImageCheckParams = {
  goldenPvcs: V1beta1PersistentVolumeClaim[];
  handleOs: (newOs: string) => void;
  isLoading: boolean;
  osImageExists: boolean;
  osParam?: string;
  selectedOS: OperatingSystemRecord | undefined;
  setDisableFormSubmit: Dispatch<SetStateAction<boolean>>;
  setOsImageExists: Dispatch<SetStateAction<boolean>>;
};

export const useGoldenImageCheck = ({
  goldenPvcs,
  handleOs,
  isLoading,
  osImageExists,
  osParam,
  selectedOS,
  setDisableFormSubmit,
  setOsImageExists,
}: GoldenImageCheckParams): void => {
  useEffect(() => {
    !isLoading && osParam && handleOs(osParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    const goldenImagePVC = goldenPvcs?.find(
      (pvc) =>
        getName(pvc) === selectedOS?.baseImageName &&
        getNamespace(pvc) === selectedOS?.baseImageNamespace,
    );
    if (goldenImagePVC) {
      setOsImageExists(true);
      setDisableFormSubmit(true);
      return;
    }
    if (osImageExists) {
      setOsImageExists(false);
      setDisableFormSubmit(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goldenPvcs, selectedOS]);
};
