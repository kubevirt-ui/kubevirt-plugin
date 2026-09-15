import { renderHook } from '@testing-library/react';

import { type DiagnosticData } from '../utils/types';
import useDiagnosticCounts from './useDiagnosticCounts';

describe('useDiagnosticCounts', () => {
  it('excludes marked snapshot warnings only from the warning count', () => {
    const diagnosticData: DiagnosticData = {
      conditions: [],
      dataVolumesStatuses: [],
      volumeSnapshotStatuses: [
        {
          enabled: false,
          excludeFromWarningCount: true,
          metadata: {},
          name: 'container-disk',
          severity: 'warning',
          status: false,
        },
      ],
    };

    const { result } = renderHook(() => useDiagnosticCounts(diagnosticData));

    expect(result.current.severityCounts).toEqual({
      all: 0,
      critical: 0,
      healthy: 0,
      warnings: 0,
    });
  });
});
