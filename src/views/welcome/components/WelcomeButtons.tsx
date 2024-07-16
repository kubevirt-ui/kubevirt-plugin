import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { startTour } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Split, SplitItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type WelcomeButtonsProps = {
  onClose: () => Promise<void> | void;
};

const WelcomeButtons: FC<WelcomeButtonsProps> = ({ onClose }) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const navigate = useNavigate();
  const namespace =
    activeNamespace === ALL_NAMESPACES_SESSION_KEY ? ALL_NAMESPACES : `ns/${activeNamespace}`;

  return (
    <Split hasGutter>
      <SplitItem>
        <Button
          onClick={() => {
            navigate(`/k8s/${namespace}/catalog`);
            onClose();
          }}
          className="WelcomeModal__button"
          variant={ButtonVariant.primary}
        >
          {t('Create VirtualMachine')}
        </Button>
      </SplitItem>
      <SplitItem>
        <Button
          onClick={() => {
            startTour();
            onClose();
          }}
          className="WelcomeModal__button"
          variant={ButtonVariant.secondary}
        >
          {t('Start Tour')}
        </Button>
      </SplitItem>
      <SplitItem isFilled />
      <SplitItem>
        <Button
          onClick={() => {
            navigate(`/k8s/${namespace}/virtualization-overview`);
            onClose();
          }}
          className="WelcomeModal__button"
          icon={<ExternalLinkAltIcon />}
          iconPosition="end"
          variant={ButtonVariant.link}
        >
          {t('Getting started resources')}
        </Button>
      </SplitItem>
    </Split>
  );
};

export default WelcomeButtons;
