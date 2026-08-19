import React, { type FC } from 'react';
import { type FieldErrors, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';

import { type V1beta1DataImportCron } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';
import { FormGroup, NumberInput, Stack, StackItem, ValidatedOptions } from '@patternfly/react-core';

import { type DataImportCronManageFormType } from '../DataImportCronManageModal';

type AutoUpdateFormFieldsProps = {
  allowAutoUpdate: boolean;
  dataImportCron: V1beta1DataImportCron;
  errors: FieldErrors<DataImportCronManageFormType>;
  importsToKeep: number;
  register: UseFormRegister<DataImportCronManageFormType>;
  setValue: UseFormSetValue<DataImportCronManageFormType>;
};

const AutoUpdateFormFields: FC<AutoUpdateFormFieldsProps> = ({
  allowAutoUpdate,
  dataImportCron,
  errors,
  importsToKeep,
  register,
  setValue,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
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
          id={'dataimportcron-manage-imports-to-keep'}
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
      <FormGroup fieldId="dataimportcron-manage-schedule" label={t('Scheduling settings')}>
        <FormGroupHelperText>
          <>
            {t('Schedule specifies in cron format when and how often to look for new imports.')}
            <ExternalLink href={documentationURL.CRON_INFO} text={t('Learn more')} />
          </>
        </FormGroupHelperText>
      </FormGroup>
      <FormGroup fieldId="dataimportcron-manage-cron" label={t('Cron expression')}>
        <FormTextInput
          {...register('schedule', {
            validate: {
              required: (value) => {
                if (!value && allowAutoUpdate) {
                  return t('Required when automatic update is enabled');
                }
                return true;
              },
            },
          })}
          aria-label={t('Cron expression')}
          data-test={'dataimportcron-manage-cron'}
          defaultValue={dataImportCron?.spec?.schedule}
          id={'dataimportcron-manage-source-cron'}
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
    </>
  );
};

export default AutoUpdateFormFields;
