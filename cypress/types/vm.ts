// data types used by UI wizard or modal

// diskSource could be used by catalog and disk modal
export type DiskSource = {
  catalogInput?: string; // input selector in catalog
  catalogSelector?: string; // source selector in catalog
  dsRegPwd?: string;
  dsRegUname?: string; // username and passwd for registry
  input?: string; // input selector in disk modal
  name?: string;
  pvcName?: string;
  pvcNS?: string;
  selector?: string; // source selector in disk modal
  selectPVCName?: string;
  selectPVCNS?: string;
  value?: string; // image value for url and registry
};

// diskSource could be used by catalog and disk modal
export type CDSource = {
  catalogInput?: string; // input selector in catalog
  catalogSelector?: string; // source selector in catalog
  input?: string; // input selector in disk modal
  name?: string;
  pvcName?: string;
  pvcNS?: string;
  selector?: string; // source selector in disk modal
  selectPVCName?: string;
  selectPVCNS?: string;
  value?: string; // image value for url and registry
};

export type Disk = {
  diskSource?: DiskSource;
  diskType?: string;
  name?: string;
  scsiReservation?: boolean;
  shareDisk?: boolean;
  size?: string;
  storageClass?: string;
  type?: string;
};

export type bootCD = {
  cdSource?: CDSource;
  name?: string;
  size?: string;
};

export type NIC = {
  model?: string;
  name?: string;
  network?: string;
  type?: string;
};

export type kvPair = {
  key?: string;
  value?: string;
};

export type detailsData = {
  annotations?: kvPair[];
  bootDiskSize?: string;
  bootMode?: string;
  cpu?: string;
  description?: string;
  gpu?: boolean;
  headless?: boolean;
  hostname?: string;
  labels?: string[];
  mem?: string;
  nodeSelector?: kvPair;
  sshOverLB?: boolean;
  sshOverNodeport?: boolean;
  workload?: string;
};

export type schedulingData = {
  dedicatedResources?: boolean;
  descheduler?: boolean;
  evictionStrategy?: boolean;
};

export type cloudInitData = {
  cloudInitPwd?: string;
  cloudInitUname?: string;
  ethName?: string;
  gateway?: string;
  ipAddr?: string;
};

export type scriptsData = cloudInitData & {
  sshKey?: string;
  sysprepFile?: string;
  sysprepName?: string;
};

export type secretData = {
  applyKey?: boolean;
  existSecret?: string;
  newSecret?: string;
  newSecretName?: string;
  secretProject?: string;
};

export type TemplateData = detailsData &
  secretData &
  schedulingData &
  scriptsData & {
    disks?: Disk[];
    dvName?: string;
    metadataName?: string;
    name?: string;
    namespace?: string;
    nics?: NIC[];
    provider?: string;
    tRegPwd?: string;
    tRegUname?: string; // username and passwd for registry
  };

export type instanceTypeData = {
  iType?: string;
  volume?: string;
};

export type VirtualMachineData = TemplateData &
  instanceTypeData & {
    addEnvDisk?: boolean;
    bootFromCD?: boolean;
    cdSource?: CDSource;
    diskSource?: DiskSource;
    folder?: string;
    guestlog?: boolean;
    mountWinDriver?: boolean;
    startInPause?: boolean;
    startOnCreation?: boolean;
    storageClass?: string;
    template?: TemplateData;
    userTemplate?: boolean;
  };
