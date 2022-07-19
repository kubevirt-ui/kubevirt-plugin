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
  url: string;
  importsToKeep: number;
  schedule: string;
};

type DataImportCronManageModalProps = {
  isOpen: boolean;
  dataSource: V1beta1DataSource;
  dataImportCron: V1beta1DataImportCron;
  onClose: () => void;
};

export const DataImportCronManageModal: React.FC<DataImportCronManageModalProps> = ({
  isOpen,
  dataImportCron,
  dataSource,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const [allowAutoUpdate, setAllowAutoUpdate] = React.useState(
    isDataImportCronAutoUpdated(dataSource, dataImportCron),
  );
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    handleSubmit,
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
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit()}
      headerText={t('Manage source for {{dataSource}}', {
        dataSource: dataImportCron?.spec?.managedDataSource,
      })}
    >
      <Stack hasGutter>
        <StackItem>
          <MutedTextSpan text={`DIC ${dataImportCron.metadata.name}`} />
        </StackItem>
        <StackItem>
          <Form>
            <FormGroup
              fieldId="dataimportcron-manage-source-url"
              label={t('Registry URL')}
              validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
              helperText={t('Example: {{exampleURL}}', {
                exampleURL: 'docker://quay.io/containerdisks/centos:7-2009',
              })}
              helperTextInvalid={t('This field is required')}
              helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
              isRequired
            >
              <FormTextInput
                {...register('url', { required: true })}
                id={'dataimportcron-manage-source-url'}
                type="text"
                aria-label={t('Registry URL')}
                data-test-id={'dataimportcron-manage-source-url'}
                validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
                defaultValue={dataImportCron?.spec?.template.spec?.source?.registry?.url}
              />
            </FormGroup>
            <Divider />
            <FormGroup fieldId="dataimportcron-manage-allow-checkbox">
              <Checkbox
                id={'dataimportcron-manage-allow-checkbox'}
                isChecked={allowAutoUpdate}
                onChange={() => setAllowAutoUpdate(!allowAutoUpdate)}
                label={t('Allow automatic update')}
              />
            </FormGroup>
            {allowAutoUpdate && (
              <>
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
                >
                  <NumberInput
                    value={importsToKeep}
                    id={'dataimportcron-manage-imports-to-keep'}
                    max={10}
                    min={0}
                    onMinus={() => setValue('importsToKeep', importsToKeep - 1)}
                    onPlus={() => setValue('importsToKeep', importsToKeep + 1)}
                  />
                </FormGroup>
                <FormGroup
                  fieldId="dataimportcron-manage-schedule"
                  label={t('Scheduling settings')}
                  helperText={
                    <>
                      {t(
                        'Schedule specifies in cron format when and how often to look for new imports.',
                      )}
                      <ExternalLink href={CRON_DOC_URL} text={t('Learn more')} />
                    </>
                  }
                />
                <FormGroup
                  fieldId="dataimportcron-manage-cron"
                  label={t('Cron expression')}
                  validated={
                    errors?.['schedule'] ? ValidatedOptions.error : ValidatedOptions.default
                  }
                  helperTextInvalid={t('This field is required')}
                  helperTextInvalidIcon={<RedExclamationCircleIcon title="Error" />}
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
                    id={'dataimportcron-manage-source-cron'}
                    type="text"
                    aria-label={t('Cron expression')}
                    data-test-id={'dataimportcron-manage-cron'}
                    validated={
                      errors?.['schedule'] ? ValidatedOptions.error : ValidatedOptions.default
                    }
                    defaultValue={dataImportCron?.spec?.schedule}
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
