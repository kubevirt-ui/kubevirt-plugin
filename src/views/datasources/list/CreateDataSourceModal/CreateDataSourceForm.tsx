import React, { FC } from 'react';
import { FieldError, UseFormRegister, UseFormSetValue } from 'react-hook-form';

import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Form,
  FormGroup,
  Icon,
  NumberInput,
  Popover,
  Stack,
  StackItem,
  ValidatedOptions,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { CRON_DOC_URL } from '../../dataimportcron/details/DataImportCronManageModal/utils';

import { CreateDataSourceModalFormType } from './CreateDataSourceModal';

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
      <FormGroup fieldId="datasource-create-name" isRequired label={t('Name')}>
        <FormTextInput
          {...register('name', { required: true })}
          aria-label={t('Name')}
          data-test-id="datasource-create-name"
          id="datasource-create-name"
          type="text"
          validated={errors?.['name'] ? ValidatedOptions.error : ValidatedOptions.default}
        />
        <FormGroupHelperText
          validated={errors?.['name'] ? ValidatedOptions.error : ValidatedOptions.default}
        >
          {errors?.['name'] && t('This field is required')}
        </FormGroupHelperText>
      </FormGroup>
      <FormGroup
        aria-label={t('Registry URL')}
        fieldId="datasource-create-source-url"
        isRequired
        label={t('Registry URL')}
      >
        <FormTextInput
          {...register('url', { required: true })}
          aria-label={t('Registry URL')}
          data-test-id={'datasource-create-source-url'}
          id={'datasource-create-source-url'}
          type="text"
          validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
        />
        <FormGroupHelperText
          validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
        >
          {errors?.['url']
            ? t('This field is required')
            : t('Example: {{exampleURL}}', {
                exampleURL: 'quay.io/containerdisks/centos:7-2009',
              })}
        </FormGroupHelperText>
      </FormGroup>
      <CapacityInput
        label={t('Disk size')}
        onChange={(value) => setValue('size', value)}
        size={size}
      />
      <FormGroup
        labelIcon={
          <Popover
            bodyContent={t(
              'As new versions of a DataSource become available older versions will be replaced',
            )}
          >
            <button
              aria-describedby="retain-revision-info"
              aria-label="More info for retain revisions field"
              className="pf-c-form__group-label-help"
              onClick={(e) => e.preventDefault()}
              type="button"
            >
              <Icon>
                <HelpIcon />
              </Icon>
            </button>
          </Popover>
        }
        fieldId="retain-revision-info"
        isRequired
        label={t('Retain revisions')}
      >
        <NumberInput
          id={'datasource-create-imports-to-keep'}
          max={10}
          min={0}
          onMinus={() => setValue('importsToKeep', importsToKeep - 1)}
          onPlus={() => setValue('importsToKeep', importsToKeep + 1)}
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
            <ExternalLink href={CRON_DOC_URL} text={t('Learn more')} />
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
          data-test-id={'datasource-create-cron'}
          id={'datasource-create-source-cron'}
          isRequired
          type="text"
          validated={errors?.['schedule'] ? ValidatedOptions.error : ValidatedOptions.default}
        />
        <FormGroupHelperText
          validated={errors?.['schedule'] ? ValidatedOptions.error : ValidatedOptions.default}
        >
          {errors?.['schedule']
            ? t('This field is required')
            : t('Example (At 00:00 on Tuesday): {{exampleCron}}', {
                exampleCron: '0 0 * * 2',
              })}
        </FormGroupHelperText>
      </FormGroup>
    </Form>
  );
};
