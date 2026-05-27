import { WizardFooterProps } from '@patternfly/react-core';

import { useKubevirtTranslation } from './useKubevirtTranslation';

const useWizardFooterProps = (): Partial<WizardFooterProps> => {
  const { t } = useKubevirtTranslation();

  return {
    backButtonText: t('Back'),
    cancelButtonText: t('Cancel'),
    nextButtonText: t('Next'),
  };
};

export default useWizardFooterProps;
