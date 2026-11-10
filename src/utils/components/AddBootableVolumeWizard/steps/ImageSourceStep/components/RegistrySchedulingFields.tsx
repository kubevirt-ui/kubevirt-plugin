import { type ChangeEvent, type FC } from 'react';
import { useController } from 'react-hook-form';

import { getCronHelperText } from '@kubevirt-utils/components/AddBootableVolumeModal/utils';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFieldValidationState } from '@kubevirt-utils/utils/getFieldValidationState';
import { validateCronExpression } from '@kubevirt-utils/utils/validation';
import {
  Content,
  FormGroup,
  NumberInput,
  TextInput,
  Title,
  ValidatedOptions,
} from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';

const RegistrySchedulingFields: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useBootableVolumeWizardForm();

  const { field: retainRevisionsField } = useController({
    control,
    name: 'imageSource.registry.retainRevisions',
  });
  const {
    field: cronField,
    fieldState: { error: cronError },
  } = useController({ control, name: 'imageSource.registry.cronExpression' });

  const cronFormatError = validateCronExpression(t, cronField.value);
  const isCronFormatInvalid = Boolean(cronFormatError);
  const { message: cronRequiredMessage, validated: cronRequiredValidated } =
    getFieldValidationState(cronError);
  const cronValidated = isCronFormatInvalid ? ValidatedOptions.error : cronRequiredValidated;

  return (
    <>
      <FormGroup
        fieldId="volume-registry-retain-revisions"
        isRequired
        label={t('Retain revisions')}
      >
        <NumberInput
          id="volume-registry-retain-revisions"
          min={1}
          minusBtnAriaLabel={t('Decrement')}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            retainRevisionsField.onChange(event.currentTarget.valueAsNumber)
          }
          onMinus={() =>
            retainRevisionsField.onChange(Math.max(1, (retainRevisionsField.value ?? 1) - 1))
          }
          onPlus={() => retainRevisionsField.onChange((retainRevisionsField.value ?? 0) + 1)}
          plusBtnAriaLabel={t('Increment')}
          value={retainRevisionsField.value}
        />
        <FormGroupHelperText>
          {t(
            'Specify the number of revisions that should be retained. A value of X means that the X latest versions will be kept.',
          )}
        </FormGroupHelperText>
      </FormGroup>

      <div>
        <Title headingLevel="h2" size="md">
          {t('Scheduling settings')}
        </Title>
        <Content component="p">
          {t('Use cron formatting to set when and how often to look for new imports.')}{' '}
          <ExternalLink href={documentationURL.CRON_INFO} text={t('Learn more')} />
        </Content>
      </div>

      <FormGroup
        fieldId="volume-registry-retain-cron-expression"
        isRequired
        label={t('Cron expression')}
      >
        <TextInput
          data-test="volume-registry-retain-cron-expression"
          id="volume-registry-retain-cron-expression"
          onChange={(_event, value: string) => cronField.onChange(value)}
          type="text"
          validated={cronValidated}
          value={cronField.value ?? ''}
        />
        <FormGroupHelperText validated={cronValidated}>
          {getCronHelperText(t, isCronFormatInvalid, Boolean(cronRequiredMessage), cronFormatError)}
        </FormGroupHelperText>
      </FormGroup>
    </>
  );
};

export default RegistrySchedulingFields;
