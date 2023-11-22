import React from 'react';
import { useForm } from 'react-hook-form';
import { isDataImportCronAutoUpdated } from 'src/views/datasources/utils';

import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Checkbox,
  Divider,
  Form,
  FormGroup,
  NumberInput,
  Popover,
  Stack,
  StackItem,
  ValidatedOptions,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { CRON_DOC_URL, onDataImportCronManageSubmit } from './utils';

export type DataImportCronManageFormType = {
  importsToKeep: number;
  schedule: string;
  url: string;
};

type DataImportCronManageModalProps = {
  dataImportCron: V1beta1DataImportCron;
  dataSource: V1beta1DataSource;
  isOpen: boolean;
  onClose: () => void;
};

export const DataImportCronManageModal: React.FC<DataImportCronManageModalProps> = ({
  dataImportCron,
  dataSource,
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const [allowAutoUpdate, setAllowAutoUpdate] = React.useState(
    isDataImportCronAutoUpdated(dataSource, dataImportCron),
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<DataImportCronManageFormType>({
    defaultValues: {
      importsToKeep: dataImportCron?.spec?.importsToKeep || 3,
    },
  });
  const importsToKeep = watch('importsToKeep');

  const onSubmit = handleSubmit(
    (data) =>
      onDataImportCronManageSubmit({
        data: {
          ...data,
          allowAutoUpdate,
        },
        resources: {
          dataImportCron,
          dataSource,
        },
      }),
    () => Promise.reject(t('Missing required fields')),
  );

  return (
    <TabModal
      headerText={t('Manage source for {{dataSource}}', {
        dataSource: dataImportCron?.spec?.managedDataSource,
      })}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit()}
    >
      <Stack hasGutter>
        <StackItem>
          <MutedTextSpan text={`DIC ${dataImportCron.metadata.name}`} />
        </StackItem>
        <StackItem>
          <Form>
            <FormGroup
              helperText={t('Example: {{exampleURL}}', {
                exampleURL: 'docker://quay.io/containerdisks/centos:7-2009',
              })}
              fieldId="dataimportcron-manage-source-url"
              helperTextInvalid={t('This field is required')}
              helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
              isRequired
              label={t('Registry URL')}
              validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
            >
              <FormTextInput
                {...register('url', { required: true })}
                aria-label={t('Registry URL')}
                data-test-id={'dataimportcron-manage-source-url'}
                defaultValue={dataImportCron?.spec?.template.spec?.source?.registry?.url}
                id={'dataimportcron-manage-source-url'}
                type="text"
                validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
              />
            </FormGroup>
            <Divider />
            <FormGroup fieldId="dataimportcron-manage-allow-checkbox">
              <Checkbox
                id={'dataimportcron-manage-allow-checkbox'}
                isChecked={allowAutoUpdate}
                label={t('Allow automatic update')}
                onChange={() => setAllowAutoUpdate(!allowAutoUpdate)}
              />
            </FormGroup>
            {allowAutoUpdate && (
              <>
                <FormGroup
                  helperText={
                    <Stack>
                      <StackItem>
                        <MutedTextSpan
                          text={t('Specify the number of revisions that should be retained.')}
                        />
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
                    id={'dataimportcron-manage-imports-to-keep'}
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
                      {t(
                        'Schedule specifies in cron format when and how often to look for new imports.',
                      )}
                      <ExternalLink href={CRON_DOC_URL} text={t('Learn more')} />
                    </>
                  }
                  fieldId="dataimportcron-manage-schedule"
                  label={t('Scheduling settings')}
                />
                <FormGroup
                  helperText={t('Example (At 00:00 on Tuesday): {{exampleCron}}', {
                    exampleCron: '0 0 * * 2',
                  })}
                  validated={
                    errors?.['schedule'] ? ValidatedOptions.error : ValidatedOptions.default
                  }
                  fieldId="dataimportcron-manage-cron"
                  helperTextInvalid={t('This field is required')}
                  helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
                  label={t('Cron expression')}
                >
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
                    validated={
                      errors?.['schedule'] ? ValidatedOptions.error : ValidatedOptions.default
                    }
                    aria-label={t('Cron expression')}
                    data-test-id={'dataimportcron-manage-cron'}
                    defaultValue={dataImportCron?.spec?.schedule}
                    id={'dataimportcron-manage-source-cron'}
                    type="text"
                  />
                </FormGroup>
              </>
            )}
          </Form>
        </StackItem>
      </Stack>
    </TabModal>
  );
};
