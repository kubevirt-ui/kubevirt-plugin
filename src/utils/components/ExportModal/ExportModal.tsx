import React, { type FC, useState } from 'react';

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
import { persistExportPod, useExportUploadStore } from './exportUploadStore';
import {
  createServiceAccount,
  createUploaderPod,
  deleteExportResources,
  isExportFormIncomplete,
} from './utils';

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

  const [registryName, setRegistryName] = useState(() => `registry-${getRandomChars()}`);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [destination, setDestination] = useState('');

  const hasActiveExport = useExportUploadStore(
    (state) => !!state.getUpload(cluster, namespace, pvcName),
  );

  const isFormIncomplete = isExportFormIncomplete([destination, username, password, registryName]);

  return (
    <TabModal
      headerText={t('Upload to registry')}
      isDisabled={hasActiveExport || isFormIncomplete}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={async () => {
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
      }}
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
        <ExportModalForm
          destination={destination}
          isDisabled={hasActiveExport}
          password={password}
          registryName={registryName}
          setDestination={setDestination}
          setPassword={setPassword}
          setRegistryName={setRegistryName}
          setUsername={setUsername}
          username={username}
        />
      </Stack>
    </TabModal>
  );
};

export default ExportModal;
