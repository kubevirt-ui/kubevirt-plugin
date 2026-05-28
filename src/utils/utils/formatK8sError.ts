import { TFunction } from 'i18next';

import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { getCronScheduleFormatError } from './validation';

export type K8sLikeError = Error & {
  href?: string;
};

export const formatK8sError = (error: K8sLikeError | undefined, t: TFunction): string => {
  if (!error) {
    return '';
  }

  const message = error?.message || String(error);

  if (/legal cron schedule/i.test(message)) {
    return getCronScheduleFormatError(t);
  }

  if (/missing required fields/i.test(message)) {
    return t('Missing required fields. Complete all required fields before saving.');
  }

  if (/invalid certificate/i.test(message)) {
    return t(
      'Invalid certificate. Open the link below in a new tab to approve the certificate, then try again.',
    );
  }

  if (/^[45]\d{2}\s/.test(message) || /status\s*:\s*[45]\d{2}/i.test(message)) {
    kubevirtConsole.warn('K8s API error:', message);
    return t(
      'The operation could not be completed. Please try again or contact your administrator.',
    );
  }

  return message;
};

export const getK8sErrorHref = (error: K8sLikeError | undefined): string | undefined => error?.href;
