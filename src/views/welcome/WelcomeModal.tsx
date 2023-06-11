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
      aria-label={t('Welcome modal')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.large}
    >
      <Grid className="WelcomeModal__grid" hasGutter>
        <GridItem span={4}>
          <img className="WelcomeModal__image" src={openCulture} />
        </GridItem>

        <GridItem span={8}>
          <Stack>
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              <Title headingLevel="h2">Welcome to</Title>
              <Title headingLevel="h1">OpenShift Virtualization</Title>

              <Text className="text-muted WelcomeModal__text" component={TextVariants.p}>
                Use OpenShift Virtualization to run and manage virtualized workloads alongside
                container workloads. You can use it to manage both Linux and Windows virtual
                machines.
              </Text>

              <Title headingLevel="h3">What do you want to do next?</Title>

              <WelcomeButtons onClose={onClose} />

              <Checkbox
                onChange={(value) =>
                  setQuickStarts({ ...quickStarts, dontShowWelcomeModal: value })
                }
                className="WelcomeModal__checkbox"
                id="welcome-modal-checkbox"
                isChecked={quickStarts?.dontShowWelcomeModal}
                label={'Do not show this again'}
              />
            </Trans>
          </Stack>
        </GridItem>
      </Grid>
    </Modal>
  );
};

export default WelcomeModal;
