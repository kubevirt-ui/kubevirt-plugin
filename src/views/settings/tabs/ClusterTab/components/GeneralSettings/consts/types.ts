import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';

export type HyperConvergeConfigurationWatch = [
  hyperConvergeConfig: HyperConverged,
  loaded: boolean,
  error: Error,
];

export type GeneralSettingsSectionProps = {
  hyperConvergeConfiguration: HyperConvergeConfigurationWatch;
  newBadge?: boolean;
};
