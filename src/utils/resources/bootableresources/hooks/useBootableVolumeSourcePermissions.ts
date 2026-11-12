import { useCallback, useMemo } from 'react';

import { DROPDOWN_FORM_SELECTION } from '@kubevirt-utils/components/AddBootableVolumeModal/consts';
import usePermissions from '@kubevirt-utils/hooks/usePermissions/usePermissions';

import useCanCreateBootableVolume from './useCanCreateBootableVolume';

type BootableVolumeSourcePermissions = {
  canCreateDS: boolean;
  canCreatePVC: boolean;
  canCreateSnapshots: boolean;
  canUploadImage: boolean;
  defaultSource: DROPDOWN_FORM_SELECTION;
  isOptionDisabled: (value: DROPDOWN_FORM_SELECTION) => boolean;
  loading: boolean;
};

const useBootableVolumeSourcePermissions = (namespace: string): BootableVolumeSourcePermissions => {
  const { canCreateDS, canCreatePVC, canCreateSnapshots, loading } =
    useCanCreateBootableVolume(namespace);
  const { capabilitiesData, isLoading: permissionsLoading } = usePermissions();
  const canUploadImage = Boolean(capabilitiesData.uploadImage.allowed && canCreatePVC);

  const permissionBySource = useMemo(
    (): Record<DROPDOWN_FORM_SELECTION, boolean> => ({
      [DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME]: canUploadImage,
      [DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]: canCreatePVC,
      [DROPDOWN_FORM_SELECTION.USE_HTTP]: canCreateDS,
      [DROPDOWN_FORM_SELECTION.USE_REGISTRY]: canCreateDS,
      [DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]: canCreateSnapshots,
    }),
    [canCreateDS, canCreatePVC, canCreateSnapshots, canUploadImage],
  );

  const isOptionDisabled = useCallback(
    (value: DROPDOWN_FORM_SELECTION): boolean => !permissionBySource[value],
    [permissionBySource],
  );

  return {
    canCreateDS,
    canCreatePVC,
    canCreateSnapshots,
    canUploadImage,
    defaultSource: canUploadImage
      ? DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME
      : DROPDOWN_FORM_SELECTION.USE_REGISTRY,
    isOptionDisabled,
    loading: loading || permissionsLoading,
  };
};

export default useBootableVolumeSourcePermissions;
