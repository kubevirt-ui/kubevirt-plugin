import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Operator, type Selector } from '@openshift-console/dynamic-plugin-sdk';

import { selectorToString } from '../ServicesList/Selector/utils';
import { requirementFromString } from './selectorRequirements';
import { type FromRequirementsOptions, type Requirement } from './types';

export const arrayify = (obj: Record<string, unknown>): string[] =>
  Object.entries(obj).map(([key, value]) => (value ? `${key}=${String(value)}` : key));

export const objectify = (arr: string[]): Record<string, null | string> =>
  arr.reduce(
    (acc, item) => {
      const [key, value = null] = item.split('=');
      acc[key] = value;

      return acc;
    },
    {} as Record<string, null | string>,
  );

export const split = (str: string): string[] => (str.trim() ? str.split(/,(?![^(]*\))/) : []);

export const cleanSelectorStr = (tag: string): string => selectorToString(selectorFromString(tag));
export const cleanTags = (currentTags: string[]): string[] =>
  split(cleanSelectorStr(currentTags.join(',')));

export const isTagValid = (tag: string, isBasic: boolean): boolean => {
  const requirement = requirementFromString(tag);
  return !!(requirement && (!isBasic || requirement.operator === Operator.Equals));
};

export const fromRequirements = (
  requirements: Requirement[],
  options: FromRequirementsOptions = {},
): Selector => {
  if (options.undefinedWhenEmpty && isEmpty(requirements)) {
    return;
  }

  const selector = requirements.reduce(
    (acc, requirement) => {
      if (requirement.operator === Operator.Equals) {
        acc.matchLabels[requirement.key] = requirement.values?.[0];
        return acc;
      }

      acc.matchExpressions.push(requirement);
      return acc;
    },
    {
      matchExpressions: [],
      matchLabels: {},
    } as Selector,
  );

  // old selector format?
  if (options.basic) {
    return selector.matchLabels;
  }

  return selector;
};

export const selectorFromString = (str: string): Selector => {
  const requirements = split(str || '').map(requirementFromString);
  return fromRequirements(requirements);
};
