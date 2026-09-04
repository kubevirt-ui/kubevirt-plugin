import { type Location } from 'react-router';

import { type SearchItemWithTab } from '@kubevirt-utils/components/ConfigurationSearch/types';
import { COLON, HASH } from '@kubevirt-utils/constants/constants';

import { type TabConfig } from './constants';

export const getTargetTab = (location: Location): string => location.hash?.slice(1); // Remove '#'

export const getActiveTabFromLocation = (
  location: Location,
  searchItems: SearchItemWithTab[],
  tabs: TabConfig[],
): string | undefined => {
  const hash = getTargetTab(location);
  if (!hash) return undefined;

  const [tabFromHash, elementId] = hash.includes(COLON) ? hash.split(COLON) : [null, hash];
  const targetTab = tabFromHash ?? searchItems.find((item) => item.element.id === elementId)?.tab;

  if (!targetTab || !tabs.some((tab) => tab.name === targetTab)) {
    return undefined;
  }

  return targetTab;
};

export const getWizardSearchUrlPath = (tab: string, elementId: string, pathname: string): string =>
  `${pathname}${HASH}${tab}${COLON}${elementId}`;
