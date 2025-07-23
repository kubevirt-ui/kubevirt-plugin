import ClusterServiceVersionModel from '@kubevirt-ui/kubevirt-api/console/models/ClusterServiceVersionModel';
import {
  OperatorGroupModel,
  PackageManifestModel,
  SubscriptionModel,
} from '@kubevirt-utils/models';
import { getGroupVersionKindForModel, Operator } from '@openshift-console/dynamic-plugin-sdk';

export const watchedOperatorResources = {
  clusterServiceVersions: {
    groupVersionKind: getGroupVersionKindForModel(ClusterServiceVersionModel),
    isList: true,
  },
  marketplacePackageManifests: {
    groupVersionKind: getGroupVersionKindForModel(PackageManifestModel),
    isList: true,
    // selector: { matchLabels: { 'openshift-marketplace': 'true' } },
  },
  operatorGroups: {
    groupVersionKind: getGroupVersionKindForModel(OperatorGroupModel),
    isList: true,
  },
  packageManifests: {
    groupVersionKind: getGroupVersionKindForModel(PackageManifestModel),
    isList: true,
    selector: {
      matchExpressions: [
        {
          key: 'opsrc-owner-name',
          operator: Operator.DoesNotExist,
        },
        { key: 'csc-owner-name', operator: Operator.DoesNotExist },
      ],
    },
  },
  subscriptions: {
    groupVersionKind: getGroupVersionKindForModel(SubscriptionModel),
    isList: true,
  },
};
