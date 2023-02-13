export type BootableVolumeMetadata = {
  labels: { [key: string]: string };
  annotations: { [key: string]: string };
};

export type InstanceTypesToSizesMap = {
  [key: string]: string[];
};
