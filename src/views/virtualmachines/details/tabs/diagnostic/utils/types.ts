import {
  V1VirtualMachineCondition,
  V1VolumeSnapshotStatus,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ThProps } from '@patternfly/react-table';

export type DiagnosticSeverity = 'critical' | 'healthy' | 'warning';

export interface VirtualizationVolumeSnapshotStatus extends V1VolumeSnapshotStatus {
  id?: string;
  message?: string;
  metadata: { [key: string]: string };
  severity?: DiagnosticSeverity;
  status?: boolean;
}

export interface VirtualizationStatusCondition extends V1VirtualMachineCondition {
  id?: string;
  lastTransitionTime?: string;
  message?: string;
  metadata: { [key: string]: string };
  severity?: DiagnosticSeverity;
}

export type DiagnosticSort = {
  column: string;
  direction: string;
  sortIndex: number;
};

export type VirtualizationDataVolumeStatus = {
  id: string;
  message: string;
  name: string;
  phase: string;
  progress: string;
  severity?: DiagnosticSeverity;
};

export type DiagnosticSeverityCounts = {
  all: number;
  critical: number;
  healthy: number;
  warnings: number;
};

export type DiagnosticFilters = {
  categories: Set<string>;
  conditions: Set<string>;
};

export type DiagnosticFilterCounts = {
  categories: Record<string, number>;
  conditions: Record<string, number>;
};

export type DiagnosticData = {
  conditions: VirtualizationStatusCondition[];
  dataVolumesStatuses: VirtualizationDataVolumeStatus[];
  volumeSnapshotStatuses: VirtualizationVolumeSnapshotStatus[];
};

export type DiagnosticColumn = {
  id: string;
  sort: (columnIndex: number) => ThProps['sort'];
  title: string;
};
