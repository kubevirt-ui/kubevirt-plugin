import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ButtonVariant } from '@patternfly/react-core';

import { createVMQuickUrl, uploadBootUrl } from './constants';
import { WelcomeModalButtonsData } from './types';

export const welcomeModalButtons = (ns: string): WelcomeModalButtonsData[] => {
  const namespace = ns ? `ns/${ns}` : ALL_NAMESPACES;

  return [
    {
      className: 'WelcomeModal__button',
      name: t('Create VirtualMachine'),
      url: `/k8s/${namespace}/catalog`,
      variant: ButtonVariant.primary,
    },
    {
      name: t('Create a virtual machine from a template (Quick start)'),
      url: createVMQuickUrl,
    },
    { name: t('Upload a boot source (Quick start)'), url: uploadBootUrl },
  ];
};
