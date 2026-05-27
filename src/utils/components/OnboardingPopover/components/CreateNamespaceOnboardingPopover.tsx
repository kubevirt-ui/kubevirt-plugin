import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import OnboardingPopover from '../OnboardingPopover';
import { OnboardingPopoverKey } from '../types';

type CreateNamespaceOnboardingPopoverProps = {
  triggerElement?: HTMLElement;
};

const CreateNamespaceOnboardingPopover: FC<CreateNamespaceOnboardingPopoverProps> = ({
  triggerElement,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <OnboardingPopover
      bodyContent={t(
        'Right-click a cluster in the navigation tree to create a new namespace and start organizing your workspace.',
      )}
      coveredByTourSteps={[0]}
      headerContent={t('Create a new namespace')}
      popoverKey={OnboardingPopoverKey.CreateNamespace}
      triggerElement={triggerElement}
    />
  );
};

export default CreateNamespaceOnboardingPopover;
