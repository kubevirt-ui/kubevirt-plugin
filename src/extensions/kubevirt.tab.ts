import { HorizontalNavTab } from '@openshift-console/dynamic-plugin-sdk';
import { CodeRef, Extension } from '@openshift-console/dynamic-plugin-sdk/lib/types';

/**
 * Expands Console `console.tab/horizontalNav` to allow controlling tab visibility.
 */
export type KubevirtHorizontalNavTab = Omit<HorizontalNavTab, 'type'> & {
  properties: {
    /** Control tab visibility based on the k8s resource. */
    isVisible: CodeRef<
      (resourceData: { created: boolean; obj: K8sResourceCommon & { cluster?: string } }) => boolean
    >;
  };
  type: 'kubevirt.tab/horizontalNav';
};

export const isKubevirtHorizontalNavTab = (e: Extension): e is KubevirtHorizontalNavTab =>
  e.type === 'kubevirt.tab/horizontalNav';
