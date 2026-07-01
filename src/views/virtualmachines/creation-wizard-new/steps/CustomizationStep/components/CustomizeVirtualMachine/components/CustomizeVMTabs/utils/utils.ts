import { Location } from 'react-router';

import { COLON, HASH } from '@kubevirt-utils/constants/constants';
import { SearchItemWithTab } from '@virtualmachines/details/tabs/configuration/utils/search';

import { TabConfig } from './constants';

export const getTargetTab = (location: Location<any>) => location.hash?.slice(1); // Remove '#'

export const getActiveTabFromLocation = (
  location: Location<any>,
  searchItems: SearchItemWithTab[],
  tabs: TabConfig[],
): string | undefined => {
  const hash = getTargetTab(location);
  if (!hash) return;

  const [tabFromHash, elementId] = hash.includes(COLON) ? hash.split(COLON) : [null, hash];
  const targetTab = tabFromHash || searchItems.find((item) => item.element.id === elementId)?.tab;

  if (!targetTab || !tabs.some((tab) => tab.name === targetTab)) {
    return;
  }

  return targetTab;
};

// For wizard, we just use hash-based navigation without changing the path
export const getWizardSearchUrlPath = (
  tab: string,
  elementId: string,
  pathname: string,
): string => {
  return `${pathname}${HASH}${tab}${COLON}${elementId}`;
};
