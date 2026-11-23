import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  ButtonVariant,
  Stack,
  useWizardContext,
  WizardFooterWrapper,
} from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../form/BootableVolumeWizardFormProvider';
import { BootableVolumeWizardStep } from '../form/stepValidation';
import type { BootableVolumeWizardFormValues } from '../form/types';
import { areRequiredReviewFieldsComplete } from '../steps/ReviewStep/utils/getReviewRows';
import type { BootableVolumeWizardNavItemConfig } from '../utils/types';

type BootableVolumeWizardReviewFooterProps = {
  error: unknown;
  isSubmitting: boolean;
  navigation: BootableVolumeWizardNavItemConfig;
  onSave: () => Promise<void>;
};

const BootableVolumeWizardReviewFooter: FC<BootableVolumeWizardReviewFooterProps> = ({
  error,
  isSubmitting,
  navigation,
  onSave,
}) => {
  const { t } = useKubevirtTranslation();
  const { control } = useBootableVolumeWizardForm();
  const formValues = useWatch({ control }) as BootableVolumeWizardFormValues;
  const { goToStepById } = useWizardContext();
  // formState.isValid can stay false with empty errors when using yup.lazy + resolver.
  // Review completeness is the user-facing gate; handleSubmit still validates on click.
  const canSave = areRequiredReviewFieldsComplete(formValues, t);

  return (
    <WizardFooterWrapper>
      <Stack hasGutter>
        {error ? <ErrorAlert error={error} /> : null}
        <ActionList>
          <ActionListGroup>
            <ActionListItem>
              <Button
                isDisabled={isSubmitting}
                onClick={() => goToStepById?.(BootableVolumeWizardStep.OPERATING_SYSTEM)}
                variant={ButtonVariant.secondary}
              >
                {t('Back')}
              </Button>
            </ActionListItem>
            <ActionListItem>
              <Button
                isDisabled={isSubmitting || !canSave}
                isLoading={isSubmitting}
                onClick={() => void onSave()}
                variant={ButtonVariant.primary}
              >
                {t('Save')}
              </Button>
            </ActionListItem>
          </ActionListGroup>
          <ActionListGroup>
            <ActionListItem>
              <Button
                isDisabled={isSubmitting}
                onClick={navigation.handleClose}
                variant={ButtonVariant.link}
              >
                {t('Cancel')}
              </Button>
            </ActionListItem>
          </ActionListGroup>
        </ActionList>
      </Stack>
    </WizardFooterWrapper>
  );
};

export default BootableVolumeWizardReviewFooter;
