import { matchPath } from 'react-router';

import { VirtualMachineModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';

import {
  FLEET_BASE_PATH,
  FLEET_BOOTABLE_VOLUMES_PATH,
  FLEET_CHECKUPS_PATH,
  FLEET_MIGRATION_POLICIES_PATH,
  FLEET_TEMPLATES_PATH,
  FLEET_VIRTUAL_MACHINES_PATH,
} from '../constants';

export const getFleetCheckupsURL = (cluster: string, namespace: string): string =>
  `${FLEET_CHECKUPS_PATH}/cluster/${cluster}/ns/${namespace}`;

export const getFleetTemplatesURL = (cluster: string, namespace: string): string =>
  `${FLEET_TEMPLATES_PATH}/cluster/${cluster}/ns/${namespace}`;

export const getFleetBootableVolumesURL = (cluster: string, namespace: string): string =>
  `${FLEET_BOOTABLE_VOLUMES_PATH}/cluster/${cluster}/ns/${namespace}`;

export const getFleetMigrationPoliciesListURL = (cluster?: string): string => {
  if (!cluster || cluster === ALL_CLUSTERS_KEY) {
    return `${FLEET_MIGRATION_POLICIES_PATH}/${ALL_CLUSTERS_KEY}`;
  }
  return `${FLEET_MIGRATION_POLICIES_PATH}/cluster/${cluster}`;
};

export const isVMDetailsPage = (pathname: string): boolean =>
  !!matchPath(`${FLEET_VIRTUAL_MACHINES_PATH}/cluster/:cluster/ns/:ns/:name/*`, pathname) ||
  !!matchPath(`/k8s/ns/:ns/${VirtualMachineModelRef}/:name/*`, pathname);

/**
 * Extract the cluster param from a fleet-virtualization URL.
 * Works across all page types since cluster always follows /:page/cluster/:cluster pattern.
 */
export const extractClusterFromPath = (pathname: string): null | string => {
  const allClustersMatch = matchPath(`${FLEET_BASE_PATH}/:page/${ALL_CLUSTERS_KEY}/*`, pathname);
  if (allClustersMatch) return ALL_CLUSTERS_KEY;

  const clusterMatch = matchPath(`${FLEET_BASE_PATH}/:page/cluster/:cluster/*`, pathname);
  return clusterMatch?.params?.cluster ?? null;
};
