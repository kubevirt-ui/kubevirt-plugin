import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getBestMatch,
  groupQuickStartsByName,
} from '@kubevirt-utils/hooks/useQuickStarts/utils/utils';
import { QuickStartModel } from '@kubevirt-utils/models';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
  type WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';
import { getDisabledQuickStarts, type QuickStart } from '@patternfly/quickstarts';

const useQuickStarts = (filterDisabledQuickStarts = true): WatchK8sResult<QuickStart[]> => {
  const preferredLanguage = useTranslation().i18n.language;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [quickStarts, quickStartsLoaded, quickStartsError] = useK8sWatchResource<QuickStart[]>({
    groupVersionKind: getGroupVersionKindForModel(QuickStartModel),
    isList: true,
  });

  const bestMatchQuickStarts = useMemo(() => {
    if (!quickStartsLoaded) {
      return [];
    }
    const groupedQuickStarts = groupQuickStartsByName(quickStarts);

    if (filterDisabledQuickStarts) {
      const disabledQuickStarts = getDisabledQuickStarts();
      for (const quickStartName of disabledQuickStarts) delete groupedQuickStarts[quickStartName];
    }

    return Object.values(groupedQuickStarts).map((quickStartsByName) =>
      getBestMatch(quickStartsByName, preferredLanguage),
    );
  }, [quickStarts, quickStartsLoaded, filterDisabledQuickStarts, preferredLanguage]);

  return [bestMatchQuickStarts, quickStartsLoaded, quickStartsError];
};

export default useQuickStarts;
