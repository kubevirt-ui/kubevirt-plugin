import { TFunction } from 'i18next';

export const getPipelinesPrerequisiteTitle = (t: TFunction): string =>
  t('Prerequisite: OpenShift Pipelines must be installed on the cluster.');

export const getPipelinesPrerequisiteDescription = (t: TFunction): string =>
  t('The tool uses a Tekton pipeline to build the windows golden image.');

export const getPipelinesInstallLinkText = (t: TFunction): string =>
  t('Learn how to install OpenShift Pipelines');

export const getWindowsImageCreationTitle = (t: TFunction): string =>
  t('Initial Windows image creation may take 60-90 minutes.');

export const getWindowsImageCreationDescription = (t: TFunction): string =>
  t('Subsequent runs will skip this step if the golden image already exists.');
