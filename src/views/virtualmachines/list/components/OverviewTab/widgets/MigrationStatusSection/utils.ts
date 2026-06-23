import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { getNamespacePathSegment } from '@kubevirt-utils/utils/utils';
import {
  type VersionMajorMinor,
  versionMeetsMajorMinorThreshold,
} from '@kubevirt-utils/version/versionUtils';

export const MIGRATIONS_DURATION = DurationOption.ONE_DAY.toString();

export const STANDALONE_MIGRATIONS_PAGE_PATH = 'virtualization-migrations';
export const LEGACY_MIGRATIONS_PAGE_PATH = 'virtualization-overview/migrations';

/**
 * OpenShift 4.22+ uses the standalone compute migrations page.
 * This threshold uses the ClusterVersion (OCP platform version), NOT the CSV operator version.
 */
const COMPUTE_MIGRATIONS_STANDALONE_MIN_VERSION: VersionMajorMinor = {
  major: 4,
  minor: 22,
};

const getMigrationsPagePathSegment = (clusterVersion: string | undefined): string =>
  !clusterVersion ||
  versionMeetsMajorMinorThreshold(clusterVersion, COMPUTE_MIGRATIONS_STANDALONE_MIN_VERSION)
    ? STANDALONE_MIGRATIONS_PAGE_PATH
    : LEGACY_MIGRATIONS_PAGE_PATH;

export const buildMigrationsSpokePath = (
  activeNamespace: string,
  clusterVersion?: string,
  clusterVersionLoaded = false,
): string | undefined => {
  if (!clusterVersionLoaded) return undefined;
  const nsPath = getNamespacePathSegment(activeNamespace);
  return `/k8s/${nsPath}/${getMigrationsPagePathSegment(clusterVersion)}`;
};

export const getMigrationsTabPath = (
  _isACMPage: boolean,
  _cluster: string,
  activeNamespace: string,
  clusterVersion?: string,
  clusterVersionLoaded = false,
): string | undefined => {
  if (!clusterVersionLoaded) return undefined;
  const nsPath = getNamespacePathSegment(activeNamespace);
  return `/k8s/${nsPath}/${getMigrationsPagePathSegment(clusterVersion)}`;
};
