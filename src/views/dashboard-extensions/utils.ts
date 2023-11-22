import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
export { default as VirtualMachineModel } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';

export const diskImportKindMapping = {
  [TemplateModel.kind]: TemplateModel,
  [VirtualMachineInstanceModel.kind]: VirtualMachineInstanceModel,
  [VirtualMachineModel.kind]: VirtualMachineModel,
};

export enum InventoryStatusGroup {
  ERROR = 'ERROR',
  NOT_MAPPED = 'NOT_MAPPED',
  PROGRESS = 'PROGRESS',
  UNKNOWN = 'UNKNOWN',
  WARN = 'WARN',
}

export const printableVmStatus = {
  CrashLoopBackOff: 'CrashLoopBackOff',
  DataVolumeError: 'DataVolumeError',
  ErrImagePull: 'ErrImagePull',
  ErrorDataVolumeNotFound: 'ErrorDataVolumeNotFound',
  ErrorPvcNotFound: 'ErrorPvcNotFound',
  ErrorUnschedulable: 'ErrorUnschedulable',
  FailedUnschedulable: 'FailedUnschedulable',
  ImagePullBackOff: 'ImagePullBackOff',
  Migrating: 'Migrating',
  Paused: 'Paused',
  Provisioning: 'Provisioning',
  Running: 'Running',
  Starting: 'Starting',
  Stopped: 'Stopped',
  Stopping: 'Stopping',
  Terminating: 'Terminating',
  Unknown: 'Unknown',
  WaitingForVolumeBinding: 'WaitingForVolumeBinding',
};

export enum VMStatusSimpleLabel {
  Deleting = 'Deleting',
  Migrating = 'Migrating',
  Paused = 'Paused',
  Running = 'Running',
  Starting = 'Starting',
  Stopped = 'Stopped',
  Stopping = 'Stopping',
}

export enum StatusSimpleLabel {
  Completed = 'Completed',
  Error = 'Error',
  Importing = 'Importing',
  InProgress = 'InProgress',
  Other = 'Other',
  Pending = 'Pending',
}

export const printableStatusToLabel = {
  [printableVmStatus.CrashLoopBackOff]: StatusSimpleLabel.Error,
  [printableVmStatus.DataVolumeError]: StatusSimpleLabel.Error,
  [printableVmStatus.ErrImagePull]: StatusSimpleLabel.Error,
  [printableVmStatus.ErrorDataVolumeNotFound]: StatusSimpleLabel.Error,
  [printableVmStatus.ErrorPvcNotFound]: StatusSimpleLabel.Error,
  [printableVmStatus.ErrorUnschedulable]: StatusSimpleLabel.Error,
  [printableVmStatus.FailedUnschedulable]: StatusSimpleLabel.Error,
  [printableVmStatus.ImagePullBackOff]: StatusSimpleLabel.Error,
  [printableVmStatus.Migrating]: VMStatusSimpleLabel.Migrating,
  [printableVmStatus.Paused]: VMStatusSimpleLabel.Paused,
  [printableVmStatus.Provisioning]: VMStatusSimpleLabel.Starting,
  [printableVmStatus.Running]: VMStatusSimpleLabel.Running,
  [printableVmStatus.Starting]: VMStatusSimpleLabel.Starting,
  [printableVmStatus.Stopped]: VMStatusSimpleLabel.Stopped,
  [printableVmStatus.Stopping]: VMStatusSimpleLabel.Stopping,
  [printableVmStatus.Terminating]: VMStatusSimpleLabel.Deleting,
  [printableVmStatus.Unknown]: StatusSimpleLabel.Other,
  [printableVmStatus.WaitingForVolumeBinding]: VMStatusSimpleLabel.Starting,
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
