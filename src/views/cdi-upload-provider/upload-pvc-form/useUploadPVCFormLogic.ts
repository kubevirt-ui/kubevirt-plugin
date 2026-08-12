/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type Dispatch, type SetStateAction, useState } from 'react';

import { type V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1beta1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDefaultStorageClass } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';

import { getTemplateOperatingSystems } from '../utils/selectors';
import { type OperatingSystemRecord } from '../utils/types';
import { getGiBUploadPVCSizeByImage } from '../utils/uploadSize';
import { useGoldenImageCheck } from './useGoldenImageCheck';
import { useUploadPVCFormEffects } from './useUploadPVCFormEffects';

type UseUploadPVCFormLogicArgs = {
  commonTemplates: V1Template[];
  fileValue: File | string;
  goldenPvcs: V1beta1PersistentVolumeClaim[];
  isLoading: boolean;
  ns: string;
  onChange: (K8sResourceKind) => void;
  osParam?: string;
  setDisableFormSubmit: Dispatch<SetStateAction<boolean>>;
  storageClasses: IoK8sApiStorageV1StorageClass[];
};

export const useUploadPVCFormLogic = ({
  commonTemplates,
  fileValue,
  goldenPvcs,
  isLoading,
  ns,
  onChange,
  osParam,
  setDisableFormSubmit,
  storageClasses,
}: UseUploadPVCFormLogicArgs) => {
  const operatingSystems = getTemplateOperatingSystems(commonTemplates).filter(
    (osItem) => !osItem?.isSourceRef,
  );
  const operatingSystemHaveDV = operatingSystems?.find(
    (osItem) => osItem?.baseImageName && osItem?.baseImageNamespace,
  );

  const [storageClassName, setStorageClassName] = useState<string>('');
  const [pvcName, setPvcName] = useState<string>('');
  const [namespace, setNamespace] = useState<string>(ns);
  const [accessMode, setAccessMode] = useState<string>('');
  const [volumeMode, setVolumeMode] = useState<string>();
  const [requestSizeValue, setRequestSizeValue] = useState<string>('');
  const [requestSizeUnit, setRequestSizeUnit] = useState<string>('Gi');
  const [isGolden, setIsGolden] = useState<boolean>(!!osParam);
  const [selectedOS, setSelectedOS] = useState<OperatingSystemRecord>();
  const [pvcSizeFromTemplate, setPvcSizeFromTemplate] = useState<boolean>(false);
  const [mountAsCDROM, setMountAsCDROM] = useState<boolean>(false);
  const [osImageExists, setOsImageExists] = useState<boolean>(false);
  const defaultSCName = getDefaultStorageClass(storageClasses)?.metadata?.name;
  const [applySP, setApplySP] = useState<boolean>(true);

  const spResult = useStorageProfileClaimPropertySets(storageClassName ?? defaultSCName);
  const loadError = spResult.error as Error | undefined;
  const spLoaded = spResult.loaded as boolean;
  type ClaimSet = { accessModes?: string[]; volumeMode?: string };
  const spClaim = (spResult.claimPropertySets?.[0] ?? {}) as ClaimSet;
  const { accessModes: spAccessMode, volumeMode: spVolumeMode } = spClaim;

  const handleGoldenCheckbox = (checked: boolean): void => {
    setIsGolden(checked);
    if (checked) {
      setNamespace(selectedOS?.baseImageNamespace);
      setPvcName(pvcName && !selectedOS ? '' : selectedOS?.baseImageName);
      return;
    }
    setNamespace(ns);
  };

  const handleOs = (newOs: string): void => {
    const osRecord = operatingSystems?.find((item) => item.id === newOs);
    setSelectedOS(osRecord);
    setPvcName(osRecord?.baseImageName);
    osRecord?.baseImageNamespace && setNamespace(osRecord.baseImageNamespace);
  };

  const handlePvcSizeTemplate = (checked: boolean): void => {
    setPvcSizeFromTemplate(checked);
    setRequestSizeValue(
      checked
        ? (selectedOS?.baseImageRecomendedSize?.[0] ?? '')
        : getGiBUploadPVCSizeByImage((fileValue as File)?.size)?.toString(),
    );
  };

  useUploadPVCFormEffects({
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
  });

  useGoldenImageCheck({
    goldenPvcs,
    handleOs,
    isLoading,
    osImageExists,
    osParam,
    selectedOS,
    setDisableFormSubmit,
    setOsImageExists,
  });

  return {
    applySP,
    handleGoldenCheckbox,
    handleOs,
    handlePvcSizeTemplate,
    isGolden,
    loadError,
    mountAsCDROM,
    namespace,
    operatingSystemHaveDV,
    operatingSystems,
    osImageExists,
    pvcName,
    pvcSizeFromTemplate,
    requestSizeUnit,
    requestSizeValue,
    selectedOS,
    setAccessMode,
    setApplySP,
    setMountAsCDROM,
    setPvcName,
    setRequestSizeUnit,
    setRequestSizeValue,
    setStorageClassName,
    setVolumeMode,
    spAccessMode,
    spLoaded,
    spVolumeMode,
    storageClassName,
    volumeMode,
  };
};
