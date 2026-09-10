import { useMemo } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import type { TabBadge } from '@kubevirt-utils/components/HorizontalNavbar/utils/utils';
import {
  TAB_BADGE_COLOR_RED,
  TAB_BADGE_COLOR_YELLOW,
} from '@kubevirt-utils/components/HorizontalNavbar/utils/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import useDiagnosticCounts from './useDiagnosticCounts';
import useDiagnosticData from './useDiagnosticData';

const useDiagnosticBadges = (vm: V1VirtualMachine): TabBadge[] => {
  const diagnosticData = useDiagnosticData(vm);
  const { severityCounts } = useDiagnosticCounts(diagnosticData);

  return useMemo(() => {
    const badges: TabBadge[] = [];
    if (!isEmpty(severityCounts.critical))
      badges.push({ color: TAB_BADGE_COLOR_RED, count: severityCounts.critical });
    if (!isEmpty(severityCounts.warnings))
      badges.push({ color: TAB_BADGE_COLOR_YELLOW, count: severityCounts.warnings });
    return badges;
  }, [severityCounts.critical, severityCounts.warnings]);
};

export default useDiagnosticBadges;
