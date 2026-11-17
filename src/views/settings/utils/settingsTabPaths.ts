import { VIRTUALIZATION_PATHS } from '@kubevirt-utils/constants/constants';

const settingsPathPattern = (suffix: string): RegExp =>
  new RegExp(`/${VIRTUALIZATION_PATHS.SETTINGS}${suffix}`);

export const getSettingsTabFromPathname = (
  pathname: string,
  tabNames: readonly string[],
): string | null => {
  if (settingsPathPattern('/?$').test(pathname)) {
    return null;
  }

  return tabNames.find((name) => settingsPathPattern(`/${name}/?$`).test(pathname)) ?? null;
};

export const buildSettingsTabPath = (pathname: string, tabName: string): string => {
  const basePath = pathname.replace(
    settingsPathPattern('.*$'),
    `/${VIRTUALIZATION_PATHS.SETTINGS}`,
  );
  return `${basePath}/${tabName}`;
};
