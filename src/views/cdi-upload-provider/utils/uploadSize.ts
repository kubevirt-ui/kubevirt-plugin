import { multipliers } from '@kubevirt-utils/utils/unitConstants';

export const getGiBUploadPVCSizeByImage = (sizeInBytes: number): number => {
  const sizeGi = sizeInBytes / multipliers.Gi;

  if (sizeGi < 0.5) return 1;
  return Math.ceil(sizeGi) * 2;
};
