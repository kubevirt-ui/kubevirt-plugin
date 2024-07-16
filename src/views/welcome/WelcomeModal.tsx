import React, { FC, useCallback, useState } from 'react';
import { Trans } from 'react-i18next';
import openCulture from 'images/openCulture.svg';

import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/constants';
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

const WelcomeModal: FC = () => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [quickStarts, setQuickStarts, loaded] = useKubevirtUserSettings('quickStart');

  const onClose = useCallback(() => setIsOpen(false), []);

  if (runningTourSignal.value || !loaded || quickStarts?.dontShowWelcomeModal) return null;

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
                container workloads. You can manage both Linux and Windows virtual machines.
              </Text>

              <Title headingLevel="h3">What do you want to do next?</Title>

              <WelcomeButtons onClose={onClose} />

              <Checkbox
                onChange={(_event, value) =>
                  setQuickStarts({ ...quickStarts, dontShowWelcomeModal: value })
                }
                className="WelcomeModal__checkbox"
                id="welcome-modal-checkbox"
                isChecked={quickStarts?.dontShowWelcomeModal}
                label={t('Do not show this again')}
              />
            </Trans>
          </Stack>
        </GridItem>
      </Grid>
    </Modal>
  );
};

export default WelcomeModal;
