import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { getNamespacePathSegment } from '@kubevirt-utils/utils/utils';
import { FLEET_OVERVIEW_PATH } from '@multicluster/constants';

export const MIGRATIONS_DURATION = DurationOption.ONE_DAY.toString();

const MIGRATIONS_PAGE_PATH = 'virtualization-migrations';

export const buildMigrationsSpokePath = (activeNamespace: string): string => {
  const nsPath = getNamespacePathSegment(activeNamespace);
  return `/k8s/${nsPath}/${MIGRATIONS_PAGE_PATH}`;
};

export const getMigrationsTabPath = (
  isACMPage: boolean,
  cluster: string,
  activeNamespace: string,
): string => {
  const nsPath = getNamespacePathSegment(activeNamespace);

  if (isACMPage) {
    return `${FLEET_OVERVIEW_PATH}/cluster/${cluster}/${nsPath}/${MIGRATIONS_PAGE_PATH}`;
  }

  return `/k8s/${nsPath}/${MIGRATIONS_PAGE_PATH}`;
};
