import { useMemo } from 'react';

import { DiagnosticCategory, SEVERITY_TO_CONDITION } from '../utils/constants';
import {
  DiagnosticData,
  DiagnosticFilterCounts,
  DiagnosticSeverity,
  DiagnosticSeverityCounts,
} from '../utils/types';

type DiagnosticCounts = {
  filterCounts: DiagnosticFilterCounts;
  severityCounts: DiagnosticSeverityCounts;
};

const useDiagnosticCounts = ({
  conditions,
  dataVolumesStatuses,
  volumeSnapshotStatuses,
}: DiagnosticData): DiagnosticCounts => {
  return useMemo(() => {
    let critical = 0;
    let warnings = 0;
    let healthy = 0;

    const allItems: DiagnosticSeverity[] = [
      ...conditions.map((c) => c.severity),
      ...volumeSnapshotStatuses.map((v) => v.severity),
      ...dataVolumesStatuses.map((d) => d.severity),
    ];

    for (const severity of allItems) {
      if (severity === 'critical') critical++;
      else if (severity === 'warning') warnings++;
      else healthy++;
    }

    return {
      filterCounts: {
        categories: {
          [DiagnosticCategory.Storage]: volumeSnapshotStatuses.length + dataVolumesStatuses.length,
          [DiagnosticCategory.VirtualMachines]: conditions.length,
        },
        conditions: {
          [SEVERITY_TO_CONDITION.critical]: critical,
          [SEVERITY_TO_CONDITION.healthy]: healthy,
          [SEVERITY_TO_CONDITION.warning]: warnings,
        },
      },
      severityCounts: { all: allItems.length, critical, healthy, warnings },
    };
  }, [conditions, dataVolumesStatuses, volumeSnapshotStatuses]);
};

export default useDiagnosticCounts;
