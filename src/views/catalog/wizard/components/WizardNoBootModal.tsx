import * as React from 'react';
import { Trans } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Stack, StackItem } from '@patternfly/react-core';

export const WizardNoBootModal: React.VFC<{
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}> = ({ isOpen, namespace, onClose, onSubmit }) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const goToDisksTab = () => {
    onClose();
    history.push(`/k8s/ns/${namespace}/templatescatalog/review/disks`);
  };

  return (
    <TabModal
      headerText={t('No available boot source')}
      isOpen={isOpen}
      obj={null}
      onClose={onClose}
      onSubmit={onSubmit}
      positionTop={false}
      submitBtnText={t('Create with no available boot source')}
      titleIconVariant="warning"
    >
      <Stack hasGutter>
        <StackItem>
          <p>
            {t(
              'The VirtualMachine you are creating does not have an available boot source. We recommended that you select a boot source to create the VirtualMachine.',
            )}
          </p>
        </StackItem>
        <StackItem>
          <Trans ns="plugin__kubevirt-plugin">
            You can select the boot source in the{' '}
            <Button isInline onClick={goToDisksTab} variant="link">
              Disks
            </Button>{' '}
            tab.
          </Trans>
        </StackItem>
      </Stack>
    </TabModal>
  );
};
