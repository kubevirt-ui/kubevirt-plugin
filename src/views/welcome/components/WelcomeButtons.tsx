import React, { FC } from 'react';
import { useNavigate } from 'react-router';

import CreateNamespaceModal from '@kubevirt-utils/components/CreateNamespaceModal/CreateNamespaceModal';
import useTour from '@kubevirt-utils/components/GuidedTour/hooks/useTour';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaces from '@kubevirt-utils/hooks/useNamespaces';
import { getName } from '@kubevirt-utils/resources/shared';
import { getVMWizardURL } from '@multicluster/urls';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Split, SplitItem } from '@patternfly/react-core';


type WelcomeButtonsProps = {
  onClose: () => Promise<void> | void;
};

const WelcomeButtons: FC<WelcomeButtonsProps> = ({ onClose }) => {
  const { t } = useKubevirtTranslation();
  const [, setActiveNamespace] = useActiveNamespace();
  const navigate = useNavigate();
  const { createModal } = useModal();

  const { startTour } = useTour();
  const [namespaces, namespacesLoaded, namespacesError] = useNamespaces(undefined, true);
  const hasNoNamespaces = namespacesLoaded && !namespacesError && (!namespaces || namespaces.length === 0);

  const onCreateVM = () => {
    navigate(getVMWizardURL(''));
    onClose();
  };

  const onCreateNamespace = () => {
    onClose();
    createModal?.((props) => (
      <CreateNamespaceModal
        {...props}
        createdNamespace={(newNamespace) => {
          const name = getName(newNamespace);
          if (name) setActiveNamespace(name);
        }}
      />
    ));
  };

  return (
    <Split hasGutter>
      <SplitItem>
        <Button
          className="WelcomeModal__button"
          isDisabled={!namespacesLoaded}
          isLoading={!namespacesLoaded}
          onClick={hasNoNamespaces ? onCreateNamespace : onCreateVM}
          variant={ButtonVariant.primary}
        >
          {hasNoNamespaces ? t('Create first namespace') : t('Create virtual machine')}
        </Button>
      </SplitItem>
      <SplitItem>
        <Button
          onClick={() => {
            startTour();
            onClose();
          }}
          className="WelcomeModal__button"
          variant={ButtonVariant.link}
        >
          {t('Start tour')}
        </Button>
      </SplitItem>
      <SplitItem isFilled />
    </Split>
  );
};

export default WelcomeButtons;
