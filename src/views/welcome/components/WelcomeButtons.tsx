import React, { FC } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Button, ButtonVariant, StackItem } from '@patternfly/react-core';

import { WelcomeModalButtonsData } from '../utils/types';
import { welcomeModalButtons } from '../utils/utils';

type WelcomeButtonsProps = {
  onClose: () => Promise<void> | void;
};

const WelcomeButtons: FC<WelcomeButtonsProps> = ({ onClose }) => {
  const history = useHistory();
  const { ns } = useParams<{ ns: string }>();

  return (
    <>
      {welcomeModalButtons(ns).map((modalButton: WelcomeModalButtonsData) => (
        <StackItem key={modalButton.name}>
          <Button
            variant={modalButton?.variant || ButtonVariant.link}
            onClick={() => {
              history.push(modalButton.url);
              onClose();
            }}
            className={modalButton?.className || 'WelcomeModal__button-link'}
          >
            {modalButton.name}
          </Button>
        </StackItem>
      ))}
    </>
  );
};

export default WelcomeButtons;
