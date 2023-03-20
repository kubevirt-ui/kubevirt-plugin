import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';

import { SSHSecretCredentials } from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/components/SSHKeySection/utils/types';
import SelectSecret from '@kubevirt-utils/components/AuthorizedSSHKeyModal/SelectSecret';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getRandomChars, validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';
import {
  Button,
  ButtonVariant,
  ExpandableSection,
  FileUpload,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import './SSHKeySection.scss';

type SSHKeySectionProps = {
  vmName: string;
  sshSecretCredentials: SSHSecretCredentials;
  setSSHSecretCredentials: Dispatch<SetStateAction<SSHSecretCredentials>>;
};

const SSHKeySection: FC<SSHKeySectionProps> = ({
  vmName,
  sshSecretCredentials,
  setSSHSecretCredentials,
}) => {
  const { sshSecretName, sshSecretKey } = sshSecretCredentials;
  const { t } = useKubevirtTranslation();
  const [namespace] = useActiveNamespace();
  const [newKeyValue, setNewKeyValue] = useState(sshSecretKey);
  const [createSecretOpen, setCreateSecretOpen] = useState(false);
  const [selectedSecretName, setSelectedSecretName] = useState(sshSecretName);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidatedKey, setIsValidatedKey] = useState<boolean>(true);

  useEffect(() => {
    const secretName = createSecretOpen
      ? `${vmName}-sshkey-${getRandomChars()}`
      : selectedSecretName;
    const secretKey = createSecretOpen ? newKeyValue : undefined;
    setSSHSecretCredentials({ sshSecretName: secretName, sshSecretKey: secretKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newKeyValue, selectedSecretName, createSecretOpen]);

  return (
    <div className="ssh-key-section">
      <ExpandableSection
        toggleText={t('Create new secret')}
        data-test-id="expandable-new-secret-section"
        onToggle={() => setCreateSecretOpen(!createSecretOpen)}
        isExpanded={createSecretOpen}
        isIndented
      >
        <FileUpload
          id={'ssh-key-upload'}
          type="text"
          value={newKeyValue}
          onChange={(v: string) => {
            setIsValidatedKey(validateSSHPublicKey(v));
            setNewKeyValue(v?.trim());
          }}
          onReadStarted={() => setIsLoading(true)}
          onReadFinished={() => setIsLoading(false)}
          isLoading={isLoading}
          allowEditingUploadedText
          isReadOnly={false}
          validated={isValidatedKey ? 'default' : 'error'}
        >
          {!isValidatedKey && (
            <HelperText>
              <HelperTextItem variant="error">{t('SSH key is invalid')}</HelperTextItem>
            </HelperText>
          )}
        </FileUpload>

        {newKeyValue && (
          <Button variant={ButtonVariant.link} isDanger onClick={() => setNewKeyValue('')}>
            {t('Delete secret')}
          </Button>
        )}
      </ExpandableSection>

      <ExpandableSection
        toggleText={t('Attach an existing secret')}
        data-test-id="expandable-attach-secret-section"
        onToggle={() => setCreateSecretOpen(!createSecretOpen)}
        isExpanded={!createSecretOpen}
        isIndented
      >
        <SelectSecret
          selectedSecretName={selectedSecretName}
          onSelectSecret={setSelectedSecretName}
          namespace={namespace}
        />
        {selectedSecretName && (
          <Button
            variant={ButtonVariant.link}
            isDanger
            onClick={() => setSelectedSecretName(undefined)}
          >
            {t('Detach secret')}
          </Button>
        )}
      </ExpandableSection>
    </div>
  );
};

export default SSHKeySection;
