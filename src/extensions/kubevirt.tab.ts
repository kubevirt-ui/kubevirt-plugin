import { HorizontalNavTab } from '@openshift-console/dynamic-plugin-sdk';
import { CodeRef, ExtensionDeclaration } from '@openshift-console/dynamic-plugin-sdk/lib/types';

/**
 * Expands Console `console.tab/horizontalNav` to allow controlling tab visibility.
 */
export type KubevirtHorizontalNavTab = ExtensionDeclaration<
  'kubevirt.tab/horizontalNav',
  HorizontalNavTab['properties'] & {
    /** Control tab visibility based on the k8s resource. */
    isVisible: CodeRef<
      (resourceData: { created: boolean; obj: K8sResourceCommon & { cluster?: string } }) => boolean
    >;
  }
>;

export const isKubevirtHorizontalNavTab = (
  e: ExtensionDeclaration,
): e is KubevirtHorizontalNavTab => e.type === 'kubevirt.tab/horizontalNav';
