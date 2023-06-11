import { V1VirtualMachineCondition } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { V1VolumeSnapshotStatus } from '@kubevirt-ui/kubevirt-api/kubevirt';

export interface VirtualizationVolumeSnapshotStatus extends V1VolumeSnapshotStatus {
  id?: string;
  message?: string;
  metadata: { [key: string]: string };
  status?: boolean;
}

export interface VirtualizationStatusCondition extends V1VirtualMachineCondition {
  id?: string;
  message?: string;
  metadata: { [key: string]: string };
}

export type DiagnosticSort = {
  column: string;
  direction: string;
  sortIndex: number;
};
