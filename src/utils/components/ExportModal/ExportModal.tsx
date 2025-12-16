import React, { FC, useState } from 'react';

import { IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { modelToGroupVersionKind, PodModel } from '@kubevirt-utils/models';
import { createUserPasswordSecret } from '@kubevirt-utils/resources/secret/utils';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  AlertVariant,
  FormGroup,
  Stack,
  StackItem,
  TextInput,
} from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

import { ALREADY_CREATED_ERROR_CODE } from './constants';
import ShowProgress from './ShowProgress';
import {
  createServiceAccount,
  createUploaderPod,
  exportInProgress,
  exportSucceeded,
} from './utils';
import ViewPodLogLink from './ViewPodLogLink';

import './export-modal.scss';

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

  const [createdPod, setCreatedPod] = useState<IoK8sApiCoreV1Pod>();

  const [uploadPod] = useKubevirtWatchResource<IoK8sApiCoreV1Pod>(
    createdPod
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(PodModel),
          name: getName(createdPod),
          namespace: getNamespace(createdPod),
        }
      : {},
  );

  const uploadInProgress = exportInProgress(uploadPod || createdPod);
  const isUploadSucceeded = exportSucceeded(uploadPod || createdPod);

  return (
    <TabModal
      onSubmit={async () => {
        if (isUploadSucceeded) {
          return onClose();
        }

        const secretName = `registry-secret-${getRandomChars()}`;

        try {
          await createServiceAccount(cluster, namespace);
        } catch (error) {
          if (error.code !== ALREADY_CREATED_ERROR_CODE) throw error;
        }

        await createUserPasswordSecret({ cluster, namespace, password, secretName, username });
        const pod = await createUploaderPod({
          cluster,
          destination,
          namespace,
          secretName,
          vmName,
          volumeName: pvcName,
        });

        setCreatedPod(pod);
      }}
      actionItemLink={<ViewPodLogLink pod={uploadPod} />}
      closeOnSubmit={false}
      headerText={t('Upload to registry')}
      isDisabled={uploadInProgress}
      isLoading={uploadInProgress}
      isOpen={isOpen}
      onClose={onClose}
      shouldWrapInForm
      submitBtnText={isUploadSucceeded ? t('Close') : t('Upload')}
    >
      <Stack className="kv-exportmodal" hasGutter>
        <Alert
          title={t(
            'Before uploading to a registry, it is recommended to remove any private information from the image',
          )}
          isInline
          variant={AlertVariant.warning}
        ></Alert>
        <StackItem>
          <FormGroup fieldId="registryName" isRequired label={t('Name')}>
            <TextInput
              id="registryName"
              isDisabled={uploadInProgress}
              onChange={(_, value: string) => setRegistryName(value)}
              type="text"
              value={registryName}
            />
          </FormGroup>
        </StackItem>
        <StackItem>
          <FormGroup fieldId="destination" isRequired label={t('Destination')}>
            <TextInput
              id="destination"
              isDisabled={uploadInProgress}
              onChange={(_, value: string) => setDestination(value)}
              type="text"
              value={destination}
            />
          </FormGroup>
        </StackItem>
        <StackItem>
          <FormGroup fieldId="username" isRequired label={t('Username')}>
            <TextInput
              id="username"
              isDisabled={uploadInProgress}
              onChange={(_, value: string) => setUsername(value)}
              type="text"
              value={username}
            />
          </FormGroup>
        </StackItem>
        <StackItem>
          <FormGroup fieldId="password" isRequired label={t('Password')}>
            <TextInput
              id="password"
              isDisabled={uploadInProgress}
              onChange={(_, value: string) => setPassword(value)}
              type="password"
              value={password}
            />
          </FormGroup>
        </StackItem>
        <StackItem>
          <ShowProgress uploadPod={uploadPod} />
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default ExportModal;
