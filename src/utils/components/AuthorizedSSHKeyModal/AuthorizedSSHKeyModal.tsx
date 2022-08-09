import React from 'react';
import { useParams } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { validateSSHPublicKey } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  ExpandableSection,
  FileUpload,
  FormGroup,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

import SelectSecret from './SelectSecret';

import './auth-ssh-key-modal.scss';

export const AuthorizedSSHKeyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  sshKey?: string;
  vmSecretName: string;
  enableCreation?: boolean;
  onSubmit: (secretName: string, sshKey?: string) => Promise<void | any>;
}> = ({ sshKey, vmSecretName, onSubmit, onClose, isOpen, enableCreation = true }) => {
  const { ns: namespace } = useParams<{ ns: string }>();
  const { t } = useKubevirtTranslation();
  const [value, setValue] = React.useState(sshKey);
  const [createSecretOpen, setCreateSecretOpen] = React.useState(vmSecretName ? false : true);
  const [selectedSecretName, setSelectedSecretName] = React.useState(vmSecretName);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isValidatedKey, setIsValidatedKey] = React.useState<boolean>(true);

  const submitHandler = React.useCallback(async () => {
    createSecretOpen ? await onSubmit(undefined, value) : await onSubmit(selectedSecretName);
  }, [createSecretOpen, onSubmit, selectedSecretName, value]);

  if (!enableCreation) {
    return (
      <TabModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={submitHandler}
        headerText={t('Authorized SSH Key')}
        isDisabled={!isValidatedKey}
      >
        <div className="auth-ssh-key-modal">
          <FormGroup fieldId="auth-ssh-service-select" label={t('Attach an existing secret')}>
            <SelectSecret
              selectedSecretName={selectedSecretName}
              onSelectSecret={setSelectedSecretName}
              namespace={namespace}
              id="auth-ssh-service-select"
            />
          </FormGroup>
          {selectedSecretName && (
            <Button
              variant={ButtonVariant.link}
              isDanger
              onClick={() => setSelectedSecretName(undefined)}
            >
              {t('Detach secret')}
            </Button>
          )}
        </div>
      </TabModal>
    );
  }

  return (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={submitHandler}
      headerText={t('Authorized SSH Key')}
      isDisabled={!isValidatedKey}
    >
      <div className="auth-ssh-key-modal">
        <ExpandableSection
          toggleText={t('Create new secret')}
          data-test-id="expandable-new-secret-section"
          onToggle={() => setCreateSecretOpen(!createSecretOpen)}
          isExpanded={createSecretOpen}
          isIndented
        >
          <FileUpload
            id={'ssh-key-modal'}
            type="text"
            value={value}
            onChange={(v: string) => {
              setIsValidatedKey(validateSSHPublicKey(v));
              setValue(v?.trim());
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
                <HelperTextItem variant="error">{t('SSH Key is invalid')}</HelperTextItem>
              </HelperText>
            )}
          </FileUpload>

          {value && (
            <Button variant={ButtonVariant.link} isDanger onClick={() => setValue('')}>
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
    </TabModal>
  );
};
