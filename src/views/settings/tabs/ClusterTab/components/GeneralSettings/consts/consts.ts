import { type ComponentType } from 'react';
import { type TFunction } from 'i18next';

import TemplatesAndImagesManagement from '@settings/tabs/ClusterTab/components/GeneralSettings/TemplatesAndImagesManagement/TemplatesAndImagesManagement';
import VMActionsConfirmation from '@settings/tabs/ClusterTab/components/GeneralSettings/VMActionsConfirmation/VMActionsConfirmation';

import AdvancedCDROMFeatures from '../AdvancedCDROMFeatures/AdvancedCDROMFeatures';
import AutomaticallyGrantVirtualizationRoles from '../AutomaticallyGrantVirtualizationRoles/AutomaticallyGrantVirtualizationRoles';
import HideYamlTab from '../HideYamlTab/HideYamlTab';
import LiveMigrationSection from '../LiveMigrationSection/LiveMigrationSection';
import KernelSamepageMerging from '../MemoryDensity/components/KernelSamepageMerging/KernelSamepageMerging';
import MemoryDensity from '../MemoryDensity/MemoryDensity';
import SSHConfiguration from '../SSHConfiguration/SSHConfiguration';
import { type GeneralSettingsSectionProps } from './types';

export type { GeneralSettingsSectionProps, HyperConvergeConfigurationWatch } from './types';

type GeneralSettingsSection = {
  Component: ComponentType<Partial<GeneralSettingsSectionProps>>;
  label: string;
};

type GeneralSettingsLabels = {
  advancedCDROMFeatures: string;
  automaticallyGrantVirtualizationRoles: string;
  kernelSamepageMerging: string;
  liveMigration: string;
  memoryRequestRatio: string;
  sshConfigurations: string;
  templatesAndImagesManagement: string;
  virtualMachineActionsConfirmation: string;
  yamlTabVisibility: string;
};

export const getGeneralSettingsLabels = (t: TFunction): GeneralSettingsLabels => ({
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
