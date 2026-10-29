import { type FC, useCallback } from 'react';
import { FormProvider, type Resolver, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PodModel } from '@kubevirt-utils/models';
import { createUserPasswordSecret } from '@kubevirt-utils/resources/secret/utils';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';

import { UPLOAD_PROGRESS_STATUS } from '../../hooks/useInFlightToast/constants';
import { useInFlightToastStore } from '../../hooks/useInFlightToast/inFlightToastStore';
import { getExportDiskUploadKey } from '../../hooks/useInFlightToast/keys/uploadKeys';
import TabModal from '../TabModal/TabModal';
import ExportModalForm from './components/ExportModalForm';
import { type ExportFormValues } from './types/types';
import { createSchema } from './utils/createSchema';
import { createServiceAccount, createUploaderPod } from './utils/uploaderPod';
import { deleteExportResources } from './utils/utils';

type ExportModalProps = {
  cluster: string;
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  pvcName: string;
  vmName?: string;
};

const ExportModal: FC<ExportModalProps> = ({
  cluster,
  isOpen,
  namespace,
  onClose,
  pvcName,
  vmName,
}) => {
  const { t } = useKubevirtTranslation();

  const form = useForm<ExportFormValues>({
    defaultValues: {
      destination: '',
      password: '',
      registryName: `registry-${getRandomChars()}`,
      username: '',
    },
    mode: 'onChange',
    resolver: yupResolver(createSchema()) as Resolver<ExportFormValues>,
  });

  const {
    formState: { isValid },
    handleSubmit,
  } = form;

  const exportUploadKey = getExportDiskUploadKey(cluster, namespace, pvcName);
  const hasActiveExport = useInFlightToastStore(
    (state) =>
      state?.exportDisk?.data?.[exportUploadKey]?.progressToastState?.status ===
      UPLOAD_PROGRESS_STATUS.UPLOADING,
  );

  const onSubmit = useCallback(
    async ({ destination, password, username }: ExportFormValues): Promise<void> => {
      const secretName = `registry-secret-${getRandomChars()}`;

      await createServiceAccount(cluster, namespace);
      await createUserPasswordSecret({ cluster, namespace, password, secretName, username });
      const pod = await createUploaderPod({
        cluster,
        destination,
        namespace,
        secretName,
        vmName,
        volumeName: pvcName,
      });

      const podLogsUrl = `${getResourceUrl({ model: PodModel, resource: pod })}/logs`;
      const uploadKey = getExportDiskUploadKey(cluster, namespace, pvcName);
      useInFlightToastStore.getState()?.exportDisk?.actions?.startUpload(uploadKey, {
        cluster,
        entry: {
          blockNavigation: true,
          cancelUpload: () => deleteExportResources(pod, secretName),
          contextLinks: [{ label: t('View pod logs'), url: podLogsUrl }],
          fileName: t('{{name}} to registry', { name: pvcName }),
        },
        pod,
        pvcName,
        secretName,
      });
    },
    [cluster, namespace, pvcName, t, vmName],
  );

  return (
    <TabModal
      headerText={t('Upload to registry')}
      isDisabled={hasActiveExport || !isValid}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => handleSubmit(onSubmit)()}
      shouldWrapInForm
      submitBtnText={t('Save')}
    >
      <Stack className="kv-exportmodal" hasGutter>
        {hasActiveExport && (
          <Alert
            isInline
            title={t(
              'An export is already in progress for this volume. Check the toast notification for status.',
            )}
            variant={AlertVariant.info}
          />
        )}
        <Alert
          isInline
          title={t(
            'Before uploading to a registry, it is recommended to remove any private information from the image',
          )}
          variant={AlertVariant.warning}
        />
        <FormProvider {...form}>
          <ExportModalForm isDisabled={hasActiveExport} />
        </FormProvider>
      </Stack>
    </TabModal>
  );
};

export default ExportModal;
