export type Template = {
  metadataName?: string;
  name?: string;
};

export type DiskSource = {
  name?: string;
  pvcName?: string;
  pvcNS?: string;
  selectorID?: string;
  value?: string;
};

export type VirtualMachineData = {
  diskSource?: DiskSource;
  name?: string;
  namespace?: string;
  startOnCreation?: boolean;
  template?: Template;
  volume?: string;
};
