import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { VIRTUALIZATION_PATHS } from '@kubevirt-utils/constants/constants';
import { getNamespacePathSegment } from '@kubevirt-utils/utils/utils';

export const MIGRATIONS_DURATION = DurationOption.ONE_DAY.toString();

const MIGRATIONS_TAB_HREF = 'migrations';

export const buildMigrationsSpokePath = (activeNamespace: string): string => {
  const nsPath = getNamespacePathSegment(activeNamespace);
  return `/k8s/${nsPath}/${VIRTUALIZATION_PATHS.OVERVIEW}/${MIGRATIONS_TAB_HREF}`;
};

export const getMigrationsTabPath = (
  isACMPage: boolean,
  cluster: string,
  activeNamespace: string,
): string => {
  const nsPath = getNamespacePathSegment(activeNamespace);
  const overviewPath = VIRTUALIZATION_PATHS.OVERVIEW;

  if (isACMPage) {
    return `/k8s/cluster/${cluster}/${nsPath}/${overviewPath}/${MIGRATIONS_TAB_HREF}`;
  }

  return `/k8s/${nsPath}/${overviewPath}/${MIGRATIONS_TAB_HREF}`;
};
