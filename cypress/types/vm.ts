export type Template = {
  name?: string;
  metadataName?: string;
};

export type DiskSource = {
  name?: string;
  selectorID?: string;
  value?: string;
  pvcName?: string;
  pvcNS?: string;
};

export type VirtualMachineData = {
  name?: string;
  namespace?: string;
  template?: Template;
  diskSource?: DiskSource;
  startOnCreation?: boolean;
};
