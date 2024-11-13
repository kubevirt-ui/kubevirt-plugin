import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { FormGroup, Stack, StackItem, TextInput } from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

import { ALREADY_CREATED_ERROR_CODE } from './constants';
import { createSecret, createServiceAccount, createUploaderPod } from './utils';

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
        await createUploaderPod({
          destination,
          namespace,
          secretName,
          vmName,
          volumeName: pvcName,
        });
      }}
      headerText={t('Upload to registry')}
      isOpen={isOpen}
      onClose={onClose}
      submitBtnText={t('Upload')}
    >
      <Stack hasGutter>
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
      </Stack>
    </TabModal>
  );
};

export default ExportModal;
