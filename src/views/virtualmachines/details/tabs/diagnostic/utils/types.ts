import { V1VirtualMachineCondition } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { V1VolumeSnapshotStatus } from '@kubevirt-ui/kubevirt-api/kubevirt';

export interface VirtualizationVolumeSnapshotStatus extends V1VolumeSnapshotStatus {
  status?: boolean;
  message?: string;
  id?: string;
  metadata: { [key: string]: string };
}

export interface VirtualizationStatusCondition extends V1VirtualMachineCondition {
  message?: string;
  id?: string;
  metadata: { [key: string]: string };
}

export type DiagnosticSort = {
  column: string;
  sortIndex: number;
  direction: string;
};
