import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import OnboardingPopover from '../OnboardingPopover';
import { OnboardingPopoverKey } from '../types';

type CreateProjectOnboardingPopoverProps = {
  triggerElement?: HTMLElement;
};

const CreateProjectOnboardingPopover: FCC<CreateProjectOnboardingPopoverProps> = ({
  triggerElement,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <OnboardingPopover
      bodyContent={t(
        'Right-click a cluster in the navigation tree to create a new project and start organizing your workspace.',
      )}
      coveredByTourSteps={[0]}
      headerContent={t('Create a new project')}
      popoverKey={OnboardingPopoverKey.CreateProject}
      triggerElement={triggerElement}
    />
  );
};

export default CreateProjectOnboardingPopover;
