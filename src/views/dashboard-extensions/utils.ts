import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';

export const VirtualMachineModel = {
  label: 'Virtual Machine',
  labelPlural: 'Virtual Machines',
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  plural: 'virtualmachines',
  abbr: 'VM',
  namespaced: true,
  kind: 'VirtualMachine',
  id: 'virtualmachine',
  crd: true,
};

export const diskImportKindMapping = {
  [VirtualMachineModel.kind]: VirtualMachineModel,
  [VirtualMachineInstanceModel.kind]: VirtualMachineInstanceModel,
  [TemplateModel.kind]: TemplateModel,
};

export enum InventoryStatusGroup {
  WARN = 'WARN',
  ERROR = 'ERROR',
  PROGRESS = 'PROGRESS',
  NOT_MAPPED = 'NOT_MAPPED',
  UNKNOWN = 'UNKNOWN',
}

export const printableVmStatus = {
  Stopped: 'Stopped',
  Migrating: 'Migrating',
  Provisioning: 'Provisioning',
  Starting: 'Starting',
  Running: 'Running',
  Paused: 'Paused',
  Stopping: 'Stopping',
  Terminating: 'Terminating',
  Unknown: 'Unknown',
  CrashLoopBackOff: 'CrashLoopBackOff',
  FailedUnschedulable: 'FailedUnschedulable',
  ErrorUnschedulable: 'ErrorUnschedulable',
  ErrImagePull: 'ErrImagePull',
  ImagePullBackOff: 'ImagePullBackOff',
  ErrorPvcNotFound: 'ErrorPvcNotFound',
  ErrorDataVolumeNotFound: 'ErrorDataVolumeNotFound',
  DataVolumeError: 'DataVolumeError',
  WaitingForVolumeBinding: 'WaitingForVolumeBinding',
};

export enum VMStatusSimpleLabel {
  Starting = 'Starting',
  Paused = 'Paused',
  Migrating = 'Migrating',
  Stopping = 'Stopping',
  Running = 'Running',
  Stopped = 'Stopped',
  Deleting = 'Deleting',
}

export enum StatusSimpleLabel {
  Error = 'Error',
  Completed = 'Completed',
  Pending = 'Pending',
  Importing = 'Importing',
  InProgress = 'InProgress',
  Other = 'Other',
}

export const printableStatusToLabel = {
  [printableVmStatus.Stopped]: VMStatusSimpleLabel.Stopped,
  [printableVmStatus.Migrating]: VMStatusSimpleLabel.Migrating,
  [printableVmStatus.Provisioning]: VMStatusSimpleLabel.Starting,
  [printableVmStatus.Starting]: VMStatusSimpleLabel.Starting,
  [printableVmStatus.Running]: VMStatusSimpleLabel.Running,
  [printableVmStatus.Paused]: VMStatusSimpleLabel.Paused,
  [printableVmStatus.Stopping]: VMStatusSimpleLabel.Stopping,
  [printableVmStatus.Terminating]: VMStatusSimpleLabel.Deleting,
  [printableVmStatus.WaitingForVolumeBinding]: VMStatusSimpleLabel.Starting,
  [printableVmStatus.ErrImagePull]: StatusSimpleLabel.Error,
  [printableVmStatus.CrashLoopBackOff]: StatusSimpleLabel.Error,
  [printableVmStatus.FailedUnschedulable]: StatusSimpleLabel.Error,
  [printableVmStatus.ErrorUnschedulable]: StatusSimpleLabel.Error,
  [printableVmStatus.ImagePullBackOff]: StatusSimpleLabel.Error,
  [printableVmStatus.ErrorPvcNotFound]: StatusSimpleLabel.Error,
  [printableVmStatus.ErrorDataVolumeNotFound]: StatusSimpleLabel.Error,
  [printableVmStatus.DataVolumeError]: StatusSimpleLabel.Error,
  [printableVmStatus.Unknown]: StatusSimpleLabel.Other,
};

export const getVmStatusLabelFromPrintable = (printableStatus: string) =>
  printableStatusToLabel?.[printableStatus] || StatusSimpleLabel.Other;

export const VIRTUALMACHINES_TEMPLATES_BASE_URL = 'virtualmachinetemplates';

export const getTimestamp = (resource) => new Date(resource.metadata.creationTimestamp);

export const isDVActivity = (resource) =>
  resource?.status?.phase === 'ImportInProgress' &&
  Object.keys(diskImportKindMapping).includes(resource?.metadata?.ownerReferences?.[0]?.kind);

export const k8sDVResource = {
  isList: true,
  kind: DataVolumeModel,
  prop: 'dvs',
};
