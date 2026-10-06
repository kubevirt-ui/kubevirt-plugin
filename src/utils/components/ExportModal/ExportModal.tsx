import { type FC, useCallback } from 'react';
import { FormProvider, type Resolver, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PodModel } from '@kubevirt-utils/models';
import { createUserPasswordSecret } from '@kubevirt-utils/resources/secret/utils';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';

import { getExportDiskUploadKey } from '../../hooks/useUploadProgressToast/keys/uploadKeys';
import { useUploadProgressStore } from '../../hooks/useUploadProgressToast/uploadProgressStore';
import TabModal from '../TabModal/TabModal';
import ExportModalForm from './components/ExportModalForm';
import { type ExportFormValues } from './types/types';
import { createSchema } from './utils/createSchema';
import { persistExportPod, useExportUploadStore } from './utils/exportUploadStore';
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

  const hasActiveExport = useExportUploadStore(
    (state) => !!state.getUpload(cluster, namespace, pvcName),
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

      persistExportPod(pod, cluster, pvcName, secretName);

      const podLogsUrl = `${getResourceUrl({ model: PodModel, resource: pod })}/logs`;
      const uploadKey = getExportDiskUploadKey(cluster, namespace, pvcName);
      useUploadProgressStore.getState().startUpload(uploadKey, {
        blockNavigation: false,
        cancelUpload: () => deleteExportResources(pod, secretName),
        contextLinks: [{ label: t('View pod logs'), url: podLogsUrl }],
        fileName: t('{{name}} to registry', { name: pvcName }),
        onCancelCleanup: async () =>
          useExportUploadStore.getState().clearUpload(cluster, namespace, pvcName),
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
