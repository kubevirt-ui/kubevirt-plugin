import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { TabBadge } from '@kubevirt-utils/components/HorizontalNavbar/utils/utils';

import useDiagnosticCounts from './useDiagnosticCounts';
import useDiagnosticData from './useDiagnosticData';

const useDiagnosticBadges = (vm: V1VirtualMachine): TabBadge[] => {
  const diagnosticData = useDiagnosticData(vm);
  const { severityCounts } = useDiagnosticCounts(diagnosticData);

  return useMemo(() => {
    const badges: TabBadge[] = [];
    if (severityCounts.critical > 0) badges.push({ color: 'red', count: severityCounts.critical });
    if (severityCounts.warnings > 0)
      badges.push({ color: 'yellow', count: severityCounts.warnings });
    return badges;
  }, [severityCounts.critical, severityCounts.warnings]);
};

export default useDiagnosticBadges;
