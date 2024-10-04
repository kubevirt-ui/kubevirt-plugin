import { WatchK8sResource, WatchK8sResources } from '@openshift-console/dynamic-plugin-sdk';

export type WatchNamespacedResources = WatchK8sResources<{ [project in string]: WatchK8sResource }>;
