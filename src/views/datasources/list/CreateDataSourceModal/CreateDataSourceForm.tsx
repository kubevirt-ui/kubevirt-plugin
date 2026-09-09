import React, { type FC } from 'react';
import { type FieldError, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';

import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';
import {
  Form,
  FormGroup,
  NumberInput,
  Stack,
  StackItem,
  ValidatedOptions,
} from '@patternfly/react-core';

import CreateDataSourceFormIdentityFields from './CreateDataSourceFormIdentityFields';
import { type CreateDataSourceModalFormType } from './CreateDataSourceModal';

type CreateDataSourceFormProps = {
  errors: {
    [Property in keyof CreateDataSourceModalFormType]?: FieldError;
  };
  importsToKeep: number;
  register: UseFormRegister<CreateDataSourceModalFormType>;
  setValue: UseFormSetValue<CreateDataSourceModalFormType>;
  size: string;
};

export const CreateDataSourceForm: FC<CreateDataSourceFormProps> = ({
  errors,
  importsToKeep,
  register,
  setValue,
  size,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Form>
      <CreateDataSourceFormIdentityFields errors={errors} register={register} />
      <CapacityInput
        label={t('Disk size')}
        onChange={(value) => setValue('size', value)}
        size={size}
      />
      <FormGroup
        fieldId="retain-revision-info"
        isRequired
        label={t('Retain revisions')}
        labelHelp={
          <HelpTextIcon
            bodyContent={t(
              'As new versions of a DataSource become available older versions will be replaced',
            )}
            buttonAriaLabel={t('More info for retain revisions field')}
          />
        }
      >
        <NumberInput
          id={'datasource-create-imports-to-keep'}
          max={10}
          min={0}
          onMinus={(): void => setValue('importsToKeep', importsToKeep - 1)}
          onPlus={(): void => setValue('importsToKeep', importsToKeep + 1)}
          value={importsToKeep}
        />
        <FormGroupHelperText>
          <Stack>
            <StackItem>
              <MutedTextSpan text={t('Specify the number of revisions that should be retained.')} />
            </StackItem>
            <StackItem>
              <MutedTextSpan
                text={t('A value of X means that the X latest versions will be kept')}
              />
            </StackItem>
          </Stack>
        </FormGroupHelperText>
      </FormGroup>
      <FormGroup fieldId="datasource-create-schedule" label={t('Scheduling settings')}>
        <FormGroupHelperText>
          <>
            {t('Schedule specifies in cron format when and how often to look for new imports.')}
            <ExternalLink href={documentationURL.CRON_INFO} text={t('Learn more')} />
          </>
        </FormGroupHelperText>
      </FormGroup>
      <FormGroup fieldId="datasource-create-cron" isRequired label={t('Cron expression')}>
        <FormTextInput
          {...register('schedule', {
            validate: {
              required: (value) => {
                if (!value) {
                  return t('Required when automatic update is enabled');
                }
                return true;
              },
            },
          })}
          aria-label={t('Cron expression')}
          data-test={'datasource-create-cron'}
          id={'datasource-create-source-cron'}
          isRequired
          type="text"
          validated={errors?.['schedule'] ? ValidatedOptions.error : ValidatedOptions.default}
        />
        <FormGroupHelperText
          validated={errors?.['schedule'] ? ValidatedOptions.error : ValidatedOptions.default}
        >
          {errors?.['schedule']
            ? getFieldRequiredMessage(t)
            : t('Example (At 00:00 on Tuesday): {{exampleCron}}', {
                exampleCron: '0 0 * * 2',
              })}
        </FormGroupHelperText>
      </FormGroup>
    </Form>
  );
};
