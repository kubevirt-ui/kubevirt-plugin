import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const getDisabledSwitchTooltipMsg = (nhcInstalled: boolean, farInstalled: boolean) => {
  const nhcTooltipMsg = nhcInstalled ? t('NHC is installed.') : t('Install NHC.');
  const farTooltipMsg = farInstalled ? t('FAR is installed.') : t('Install FAR.');
  const disabledTooltipMsg = t(
    `To use the High Availability feature both NHC and FAR need to be installed and enabled.`,
  );

  return [disabledTooltipMsg, nhcTooltipMsg, farTooltipMsg].join(' ');
};

export const getInstalledStatusMessage = (isInstalled: boolean) =>
  isInstalled ? t('Installed') : t('Not installed');
