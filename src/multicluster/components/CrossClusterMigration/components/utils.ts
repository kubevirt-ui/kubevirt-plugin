import { TFunction } from 'react-i18next';

export const getSubtitleChecks = (t: TFunction, checks: boolean[], checksLoaded: boolean[]) => {
  const subtitle = [];

  const errorChecksCount = checks.filter((check, index) => !check && checksLoaded[index]).length;
  const successChecksCount = checks.filter((check, index) => check && checksLoaded[index]).length;
  const loadingChecksCount = checksLoaded.filter((loaded) => !loaded).length;

  if (errorChecksCount > 0) {
    subtitle.push(t('{{count}} failed checks', { count: errorChecksCount }));
  }

  if (successChecksCount > 0) {
    subtitle.push(t('{{count}} successful checks', { count: successChecksCount }));
  }

  if (loadingChecksCount > 0) {
    subtitle.push(t('{{count}} in progress checks', { count: loadingChecksCount }));
  }

  return subtitle.join(', ');
};
