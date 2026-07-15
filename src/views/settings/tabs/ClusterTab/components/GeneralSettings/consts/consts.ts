import { ComponentType } from 'react';

import { TFunction } from 'i18next';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import TemplatesAndImagesManagement from '@settings/tabs/ClusterTab/components/GeneralSettings/TemplatesAndImagesManagement/TemplatesAndImagesManagement';
import VMActionsConfirmation from '@settings/tabs/ClusterTab/components/GeneralSettings/VMActionsConfirmation/VMActionsConfirmation';

import AdvancedCDROMFeatures from '../AdvancedCDROMFeatures/AdvancedCDROMFeatures';
import AutomaticallyGrantVirtualizationRoles from '../AutomaticallyGrantVirtualizationRoles/AutomaticallyGrantVirtualizationRoles';
import HideYamlTab from '../HideYamlTab/HideYamlTab';
import LiveMigrationSection from '../LiveMigrationSection/LiveMigrationSection';
import MemoryDensity from '../MemoryDensity/MemoryDensity';
import KernelSamepageMerging from '../MemoryDensity/components/KernelSamepageMerging/KernelSamepageMerging';
import SSHConfiguration from '../SSHConfiguration/SSHConfiguration';

export const getGeneralSettingsLabels = (t: TFunction) => ({
  advancedCDROMFeatures: t('Advanced CD-ROM features'),
  automaticallyGrantVirtualizationRoles: t('Automatically grant Virtualization roles'),
  kernelSamepageMerging: t('Kernel Samepage Merging (KSM)'),
  liveMigration: t('Live migration'),
  memoryRequestRatio: t('Memory request ratio'),
  sshConfigurations: t('SSH configurations'),
  templatesAndImagesManagement: t('Templates and images management'),
  virtualMachineActionsConfirmation: t('VirtualMachine actions confirmation'),
  yamlTabVisibility: t('YAML tab visibility'),
});

export type GeneralSettingsSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
  newBadge?: boolean;
};

type GeneralSettingsSection = {
  Component: ComponentType<Partial<GeneralSettingsSectionProps>>;
  label: string;
};

export const getGeneralSettingsSections = (t: TFunction): GeneralSettingsSection[] => {
  const labels = getGeneralSettingsLabels(t);
  return [
    { Component: AdvancedCDROMFeatures, label: labels.advancedCDROMFeatures },
    {
      Component: AutomaticallyGrantVirtualizationRoles,
      label: labels.automaticallyGrantVirtualizationRoles,
    },
    { Component: KernelSamepageMerging, label: labels.kernelSamepageMerging },
    { Component: LiveMigrationSection, label: labels.liveMigration },
    { Component: MemoryDensity, label: labels.memoryRequestRatio },
    { Component: SSHConfiguration, label: labels.sshConfigurations },
    { Component: TemplatesAndImagesManagement, label: labels.templatesAndImagesManagement },
    { Component: VMActionsConfirmation, label: labels.virtualMachineActionsConfirmation },
    { Component: HideYamlTab, label: labels.yamlTabVisibility },
  ].sort((a, b) => a.label.localeCompare(b.label));
};
