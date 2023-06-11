import React from 'react';
import { FieldError, UseFormRegister, UseFormSetValue } from 'react-hook-form';

import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Form,
  FormGroup,
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

export const CreateDataSourceForm: React.FC<CreateDataSourceFormProps> = ({
  errors,
  importsToKeep,
  register,
  setValue,
  size,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Form>
      <FormGroup
        fieldId="datasource-create-name"
        helperTextInvalid={t('This field is required')}
        helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
        isRequired
        label={t('Name')}
        validated={errors?.['name'] ? ValidatedOptions.error : ValidatedOptions.default}
      >
        <FormTextInput
          {...register('name', { required: true })}
          aria-label={t('Name')}
          data-test-id="datasource-create-name"
          id="datasource-create-name"
          type="text"
          validated={errors?.['name'] ? ValidatedOptions.error : ValidatedOptions.default}
        />
      </FormGroup>
      <FormGroup
        helperText={t('Example: {{exampleURL}}', {
          exampleURL: 'quay.io/containerdisks/centos:7-2009',
        })}
        aria-label={t('Registry URL')}
        fieldId="datasource-create-source-url"
        helperTextInvalid={t('This field is required')}
        helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
        isRequired
        label={t('Registry URL')}
        validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
      >
        <FormTextInput
          {...register('url', { required: true })}
          aria-label={t('Registry URL')}
          data-test-id={'datasource-create-source-url'}
          id={'datasource-create-source-url'}
          type="text"
          validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
        />
      </FormGroup>
      <CapacityInput
        label={t('Disk size')}
        onChange={(value) => setValue('size', value)}
        size={size}
      />
      <FormGroup
        helperText={
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
        }
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
              <HelpIcon noVerticalAlign />
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
      </FormGroup>
      <FormGroup
        helperText={
          <>
            {t('Schedule specifies in cron format when and how often to look for new imports.')}
            <ExternalLink href={CRON_DOC_URL} text={t('Learn more')} />
          </>
        }
        fieldId="datasource-create-schedule"
        label={t('Scheduling settings')}
      />
      <FormGroup
        helperText={t('Example (At 00:00 on Tuesday): {{exampleCron}}', {
          exampleCron: '0 0 * * 2',
        })}
        fieldId="datasource-create-cron"
        helperTextInvalid={t('This field is required')}
        helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
        isRequired
        label={t('Cron expression')}
        validated={errors?.['schedule'] ? ValidatedOptions.error : ValidatedOptions.default}
      >
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
      </FormGroup>
    </Form>
  );
};
