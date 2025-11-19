import { ReplaceProperties } from '@kubevirt-utils/types/common';
import { HorizontalNavTab } from '@openshift-console/dynamic-plugin-sdk';
import { CodeRef, Extension } from '@openshift-console/dynamic-plugin-sdk/lib/types';

/**
 * Expansion of Console `console.tab/horizontalNav` extension, providing control over
 * the tab's visibility.
 */
// TODO: consider adding the additional properties to the above Console extension type
export type KubevirtHorizontalNavTab = ReplaceProperties<
  HorizontalNavTab,
  {
    type: 'kubevirt.tab/horizontalNav';
  }
> & {
  properties: {
    // TODO add arguments as necessary
    isVisible: CodeRef<() => boolean>;
  };
};

export const isKubevirtHorizontalNavTab = (e: Extension): e is KubevirtHorizontalNavTab =>
  e.type === 'kubevirt.tab/horizontalNav';
