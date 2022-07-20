import React from 'react';
import { FieldError, UseFormRegister, UseFormSetValue } from 'react-hook-form';

import DiskSizeNumberInput from '@kubevirt-utils/components/DiskModal/DiskFormFields/DiskSizeInput/DiskSizeNumberInput';
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
  size: string;
  importsToKeep: number;
  register: UseFormRegister<CreateDataSourceModalFormType>;
  setValue: UseFormSetValue<CreateDataSourceModalFormType>;
  errors: {
    [Property in keyof CreateDataSourceModalFormType]?: FieldError;
  };
};

export const CreateDataSourceForm: React.FC<CreateDataSourceFormProps> = ({
  size,
  importsToKeep,
  register,
  setValue,
  errors,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Form>
      <FormGroup
        fieldId="datasource-create-name"
        label={t('Name')}
        validated={errors?.['name'] ? ValidatedOptions.error : ValidatedOptions.default}
        helperTextInvalid={t('This field is required')}
        helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
        isRequired
      >
        <FormTextInput
          {...register('name', { required: true })}
          id="datasource-create-name"
          type="text"
          aria-label={t('Name')}
          data-test-id="datasource-create-name"
          validated={errors?.['name'] ? ValidatedOptions.error : ValidatedOptions.default}
        />
      </FormGroup>
      <FormGroup
        fieldId="datasource-create-source-url"
        label={t('Registry URL')}
        validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
        helperText={t('Example: {{exampleURL}}', {
          exampleURL: 'docker://quay.io/containerdisks/centos:7-2009',
        })}
        aria-label={t('Registry URL')}
        helperTextInvalid={t('This field is required')}
        helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
        isRequired
      >
        <FormTextInput
          {...register('url', { required: true })}
          id={'datasource-create-source-url'}
          type="text"
          aria-label={t('Registry URL')}
          data-test-id={'datasource-create-source-url'}
          validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
        />
      </FormGroup>
      <DiskSizeNumberInput
        diskSize={size}
        onChange={(value) => setValue('size', value)}
        label={t('Disk size')}
      />
      <FormGroup
        label={t('Retain revisions')}
        labelIcon={
          <Popover
            bodyContent={t(
              'As new versions of a DataSource become available older versions will be replaced',
            )}
          >
            <button
              type="button"
              aria-label="More info for retain revisions field"
              onClick={(e) => e.preventDefault()}
              aria-describedby="retain-revision-info"
              className="pf-c-form__group-label-help"
            >
              <HelpIcon noVerticalAlign />
            </button>
          </Popover>
        }
        isRequired
        fieldId="retain-revision-info"
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
      >
        <NumberInput
          value={importsToKeep}
          id={'datasource-create-imports-to-keep'}
          max={10}
          min={0}
          onMinus={() => setValue('importsToKeep', importsToKeep - 1)}
          onPlus={() => setValue('importsToKeep', importsToKeep + 1)}
        />
      </FormGroup>
      <FormGroup
        fieldId="datasource-create-schedule"
        label={t('Scheduling settings')}
        helperText={
          <>
            {t('Schedule specifies in cron format when and how often to look for new imports.')}
            <ExternalLink href={CRON_DOC_URL} text={t('Learn more')} />
          </>
        }
      />
      <FormGroup
        fieldId="datasource-create-cron"
        label={t('Cron expression')}
        validated={errors?.['schedule'] ? ValidatedOptions.error : ValidatedOptions.default}
        helperText={t('Example (At 00:00 on Tuesday): {{exampleCron}}', {
          exampleCron: '0 0 * * 2',
        })}
        helperTextInvalid={t('This field is required')}
        helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
        isRequired
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
          isRequired
          id={'datasource-create-source-cron'}
          type="text"
          aria-label={t('Cron expression')}
          data-test-id={'datasource-create-cron'}
          validated={errors?.['schedule'] ? ValidatedOptions.error : ValidatedOptions.default}
        />
      </FormGroup>
    </Form>
  );
};
