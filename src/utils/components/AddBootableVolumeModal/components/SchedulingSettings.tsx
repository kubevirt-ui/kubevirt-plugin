import React, { ChangeEvent, FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useRequiredFieldValidation } from '@kubevirt-utils/hooks/useRequiredFieldValidation';
import { validateCronExpression } from '@kubevirt-utils/utils/validation';
import {
  Content,
  FormGroup,
  NumberInput,
  TextInput,
  Title,
  ValidatedOptions,
} from '@patternfly/react-core';

import { AddBootableVolumeState, SetBootableVolumeFieldType } from '../types';
import { getCronHelperText } from '../utils';

type SchedulingSettingsProps = {
  bootableVolume: AddBootableVolumeState;
  isDisabled?: boolean;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const SchedulingSettings: FC<SchedulingSettingsProps> = ({
  bootableVolume,
  isDisabled,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();

  const { cronExpression, retainRevisions } = bootableVolume || {};

  const {
    isInvalid: isCronRequiredInvalid,
    onBlur: onCronBlur,
    validated: cronRequiredValidated,
  } = useRequiredFieldValidation(cronExpression);

  const cronFormatError = validateCronExpression(t, cronExpression);
  const isCronFormatInvalid = Boolean(cronFormatError);
  const cronValidated = isCronFormatInvalid ? ValidatedOptions.error : cronRequiredValidated;

  return (
    <>
      <FormGroup
        fieldId="volume-registry-retain-revisions"
        isRequired
        label={t('Retain revisions')}
      >
        <NumberInput
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setBootableVolumeField('retainRevisions')(event.currentTarget.valueAsNumber)
          }
          id="volume-registry-retain-revisions"
          isDisabled={isDisabled}
          min={0}
          minusBtnAriaLabel={t('Decrement')}
          onMinus={() => setBootableVolumeField('retainRevisions')(retainRevisions - 1)}
          onPlus={() => setBootableVolumeField('retainRevisions')(retainRevisions + 1)}
          plusBtnAriaLabel={t('Increment')}
          value={retainRevisions}
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
          data-test-id="volume-registry-retain-cron-expression"
          id="volume-registry-retain-cron-expression"
          isDisabled={isDisabled}
          onBlur={onCronBlur}
          onChange={(_, value: string) => setBootableVolumeField('cronExpression')(value)}
          type="text"
          validated={cronValidated}
          value={cronExpression ?? ''}
        />
        <FormGroupHelperText validated={cronValidated}>
          {getCronHelperText(t, isCronFormatInvalid, isCronRequiredInvalid, cronFormatError)}
        </FormGroupHelperText>
      </FormGroup>
    </>
  );
};

export default SchedulingSettings;
