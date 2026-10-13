import { type FC } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { isDataImportCronAutoUpdated } from 'src/views/datasources/utils';

import {
  type V1beta1DataImportCron,
  type V1beta1DataSource,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { getFieldRequiredMessage } from '@kubevirt-utils/utils/validation';
import {
  Checkbox,
  Divider,
  Form,
  FormGroup,
  Stack,
  StackItem,
  ValidatedOptions,
} from '@patternfly/react-core';

import AutoUpdateFormFields from './components/AutoUpdateFormFields';
import { onDataImportCronManageSubmit } from './utils';

export type DataImportCronManageFormType = {
  allowAutoUpdate: boolean;
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

export const DataImportCronManageModal: FC<DataImportCronManageModalProps> = ({
  dataImportCron,
  dataSource,
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    register,
    setValue,
  } = useForm<DataImportCronManageFormType>({
    defaultValues: {
      allowAutoUpdate: isDataImportCronAutoUpdated(dataSource, dataImportCron),
      importsToKeep: dataImportCron?.spec?.importsToKeep ?? 3,
      schedule: dataImportCron?.spec?.schedule ?? '',
      url: dataImportCron?.spec?.template.spec?.source?.registry?.url ?? '',
    },
  });
  const allowAutoUpdate = useWatch({ control, name: 'allowAutoUpdate' });
  const importsToKeep = useWatch({ control, name: 'importsToKeep' });

  const onSubmit = handleSubmit(
    (data) =>
      onDataImportCronManageSubmit({
        data,
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
      isDisabled={!isDirty}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit()}
      submitDisabledTooltip={getNoModalChangesTooltip(t)}
    >
      <Stack hasGutter>
        <StackItem>
          <MutedTextSpan text={`DIC ${dataImportCron.metadata.name}`} />
        </StackItem>
        <StackItem>
          <Form>
            <FormGroup
              fieldId="dataimportcron-manage-source-url"
              isRequired
              label={t('Registry URL')}
            >
              <FormTextInput
                {...register('url', { required: true })}
                aria-label={t('Registry URL')}
                data-test={'dataimportcron-manage-source-url'}
                id={'dataimportcron-manage-source-url'}
                type="text"
                validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
              />
              <FormGroupHelperText
                validated={errors?.['url'] ? ValidatedOptions.error : ValidatedOptions.default}
              >
                {errors?.['url']
                  ? getFieldRequiredMessage(t)
                  : t('Example: {{exampleURL}}', {
                      exampleURL: 'docker://quay.io/containerdisks/centos:7-2009',
                    })}
              </FormGroupHelperText>
            </FormGroup>
            <Divider />
            <FormGroup fieldId="dataimportcron-manage-allow-checkbox">
              <Checkbox
                id={'dataimportcron-manage-allow-checkbox'}
                isChecked={allowAutoUpdate}
                label={t('Allow automatic update')}
                onChange={() =>
                  setValue('allowAutoUpdate', !allowAutoUpdate, { shouldDirty: true })
                }
              />
            </FormGroup>
            {allowAutoUpdate && (
              <AutoUpdateFormFields
                allowAutoUpdate={allowAutoUpdate}
                errors={errors}
                importsToKeep={importsToKeep}
                register={register}
                setValue={setValue}
              />
            )}
          </Form>
        </StackItem>
      </Stack>
    </TabModal>
  );
};
