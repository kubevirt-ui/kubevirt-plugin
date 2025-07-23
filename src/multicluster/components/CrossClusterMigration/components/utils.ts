import { TFunction } from 'react-i18next';

export const getSubtitleChecks = (t: TFunction, checks: boolean[], checksLoaded: boolean[]) => {
  const subtitle = [];

  const errorChecks = checks.filter((check, index) => !check && checksLoaded[index]).length;
  const successChecks = checks.filter((check, index) => check && checksLoaded[index]).length;
  const loadingChecks = checksLoaded.filter((loaded) => !loaded).length;

  if (errorChecks > 0) {
    subtitle.push(t('{{count}} failed checks', { count: errorChecks }));
  }

  if (successChecks > 0) {
    subtitle.push(t('{{count}} successful checks', { count: successChecks }));
  }

  if (loadingChecks > 0) {
    subtitle.push(t('{{count}} in progress checks', { count: loadingChecks }));
  }

  return subtitle.join(', ');
};
