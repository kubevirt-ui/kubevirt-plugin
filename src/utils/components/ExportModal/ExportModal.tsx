import React, { FC, useState } from 'react';

import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, PodModel } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
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
import { createSecret, createServiceAccount, createUploaderPod, exportInProgress } from './utils';
import ViewPodLogLink from './ViewPodLogLink';

import './export-modal.scss';

type ExportModalProps = {
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  pvcName: string;
  vmName?: string;
};

const ExportModal: FC<ExportModalProps> = ({ isOpen, namespace, onClose, pvcName, vmName }) => {
  const { t } = useKubevirtTranslation();

  const [registryName, setRegistryName] = useState(() => `registry-${getRandomChars()}`);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [destination, setDestination] = useState('');

  const [createdPod, setCreatedPod] = useState<IoK8sApiCoreV1Pod>();

  const [uploadPod] = useK8sWatchResource<IoK8sApiCoreV1Pod>(
    createdPod
      ? {
          groupVersionKind: modelToGroupVersionKind(PodModel),
          name: getName(createdPod),
          namespace: getNamespace(createdPod),
        }
      : null,
  );

  const uploadInProgress = exportInProgress(uploadPod || createdPod);

  return (
    <TabModal
      onSubmit={async () => {
        const secretName = `registry-secret-${getRandomChars()}`;

        try {
          await createServiceAccount(namespace);
        } catch (error) {
          if (error.code !== ALREADY_CREATED_ERROR_CODE) throw error;
        }

        await createSecret({ namespace, password, secretName, username });
        const pod = await createUploaderPod({
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
      submitBtnText={t('Upload')}
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
