import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';

import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, StackItem } from '@patternfly/react-core';

import { WelcomeModalButtonsData } from '../utils/types';
import { welcomeModalButtons } from '../utils/utils';

type WelcomeButtonsProps = {
  onClose: () => Promise<void> | void;
};

const WelcomeButtons: FC<WelcomeButtonsProps> = ({ onClose }) => {
  const history = useHistory();
  const [activeNamespace] = useActiveNamespace();

  return (
    <>
      {welcomeModalButtons(activeNamespace).map((modalButton: WelcomeModalButtonsData) => (
        <StackItem key={modalButton.name}>
          <Button
            onClick={() => {
              history.push(modalButton.url);
              onClose();
            }}
            className={modalButton?.className || 'WelcomeModal__button-link'}
            variant={modalButton?.variant || ButtonVariant.link}
          >
            {modalButton.name}
          </Button>
        </StackItem>
      ))}
    </>
  );
};

export default WelcomeButtons;
