import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { BinaryUnit } from '@kubevirt-utils/utils/unitConstants';

import { updateDV } from '../utils/resourceUtils';
import { type OperatingSystemRecord } from '../utils/types';
import { getGiBUploadPVCSizeByImage } from '../utils/uploadSize';

type EffectsParams = {
  accessMode: string;
  applySP: boolean;
  defaultSCName: string;
  fileValue: File | string;
  mountAsCDROM: boolean;
  namespace: string;
  onChange: (K8sResourceKind) => void;
  pvcName: string;
  requestSizeUnit: string;
  requestSizeValue: string;
  selectedOS: OperatingSystemRecord | undefined;
  setAccessMode: Dispatch<SetStateAction<string>>;
  setMountAsCDROM: Dispatch<SetStateAction<boolean>>;
  setPvcSizeFromTemplate: Dispatch<SetStateAction<boolean>>;
  setRequestSizeUnit: Dispatch<SetStateAction<string>>;
  setRequestSizeValue: Dispatch<SetStateAction<string>>;
  setStorageClassName: Dispatch<SetStateAction<string>>;
  setVolumeMode: Dispatch<SetStateAction<string>>;
  spAccessMode: string[] | undefined;
  spLoaded: boolean;
  spVolumeMode: string | undefined;
  storageClasses: { metadata?: { name?: string } }[];
  storageClassName: string;
  volumeMode: string | undefined;
};

export const useUploadPVCFormEffects = ({
  accessMode,
  applySP,
  defaultSCName,
  fileValue,
  mountAsCDROM,
  namespace,
  onChange,
  pvcName,
  requestSizeUnit,
  requestSizeValue,
  selectedOS,
  setAccessMode,
  setMountAsCDROM,
  setPvcSizeFromTemplate,
  setRequestSizeUnit,
  setRequestSizeValue,
  setStorageClassName,
  setVolumeMode,
  spAccessMode,
  spLoaded,
  spVolumeMode,
  storageClasses,
  storageClassName,
  volumeMode,
}: EffectsParams): void => {
  useEffect(() => {
    !storageClassName && setStorageClassName(defaultSCName ?? storageClasses?.[0]?.metadata?.name);
  }, [defaultSCName, storageClassName, storageClasses, setStorageClassName]);

  useEffect(() => {
    const value = getGiBUploadPVCSizeByImage((fileValue as File)?.size);
    const isIso = (fileValue as File)?.name?.toLowerCase().endsWith('.iso');
    setMountAsCDROM(isIso);
    setPvcSizeFromTemplate(!isIso);
    setRequestSizeValue(
      isIso ? value?.toString() : (selectedOS?.baseImageRecomendedSize?.[0] ?? ''),
    );
    setRequestSizeUnit(selectedOS?.baseImageRecomendedSize?.[1] ?? BinaryUnit.Gi);
  }, [
    fileValue,
    selectedOS,
    setMountAsCDROM,
    setPvcSizeFromTemplate,
    setRequestSizeValue,
    setRequestSizeUnit,
  ]);

  useEffect(() => {
    if (storageClassName && spLoaded && applySP) {
      spAccessMode?.[0] !== accessMode && setAccessMode(spAccessMode?.[0]);
      spVolumeMode !== volumeMode && setVolumeMode(spVolumeMode);
    }
  }, [
    spLoaded,
    spAccessMode,
    spVolumeMode,
    accessMode,
    volumeMode,
    storageClassName,
    applySP,
    setAccessMode,
    setVolumeMode,
  ]);

  useEffect(() => {
    onChange(
      updateDV({
        accessMode,
        mountAsCDROM,
        namespace,
        pvcName,
        requestSizeUnit,
        requestSizeValue,
        storageClassName,
        volumeMode,
      }),
    );
  }, [
    accessMode,
    volumeMode,
    namespace,
    pvcName,
    onChange,
    mountAsCDROM,
    storageClassName,
    requestSizeValue,
    requestSizeUnit,
  ]);
};
