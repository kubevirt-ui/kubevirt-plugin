import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import openCulture from 'images/openCulture.svg';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import {
  Checkbox,
  Grid,
  GridItem,
  Modal,
  ModalVariant,
  Stack,
  Text,
  TextVariants,
  Title,
} from '@patternfly/react-core';

import WelcomeButtons from './components/WelcomeButtons';

import './WelcomeModal.scss';

type WelcomeModalProps = {
  isOpen: boolean;
  onClose: () => Promise<void> | void;
};

const WelcomeModal: FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();
  const [quickStarts, setQuickStarts] = useKubevirtUserSettings('quickStart');

  return (
    <Modal
      variant={ModalVariant.large}
      onClose={onClose}
      isOpen={isOpen}
      aria-label={t('Welcome modal')}
    >
      <Grid hasGutter className="WelcomeModal__grid">
        <GridItem span={4}>
          <img src={openCulture} className="WelcomeModal__image" />
        </GridItem>

        <GridItem span={8}>
          <Stack>
            <Trans t={t} ns="plugin__kubevirt-plugin">
              <Title headingLevel="h2">Welcome to</Title>
              <Title headingLevel="h1">OpenShift Virtualization</Title>

              <Text className="text-muted WelcomeModal__text" component={TextVariants.p}>
                OpenShift Virtualization allows you to run and manage virtualized workloads
                alongside container workloads. You can use it to manage both Linux and Windows
                virtual machines.
              </Text>

              <Title headingLevel="h3">What do you want to do next?</Title>

              <WelcomeButtons onClose={onClose} />

              <Checkbox
                className="WelcomeModal__checkbox"
                id="welcome-modal-checkbox"
                label={'Do not show this again'}
                isChecked={quickStarts?.dontShowWelcomeModal}
                onChange={(value) =>
                  setQuickStarts({ ...quickStarts, dontShowWelcomeModal: value })
                }
              />
            </Trans>
          </Stack>
        </GridItem>
      </Grid>
    </Modal>
  );
};

export default WelcomeModal;
