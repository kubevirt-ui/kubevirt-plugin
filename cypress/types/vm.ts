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
  applyKey?: boolean;
  bootMode?: string;
  description?: string;
  diskSource?: DiskSource;
  headless?: boolean;
  hostname?: string;
  iType?: string;
  name: string;
  namespace: string;
  newSecret?: string;
  password?: string;
  startOnCreation?: boolean;
  template?: Template;
  username?: string;
  volume?: string;
};
