import React, { FC, useCallback, useState } from 'react';
import { Trans } from 'react-i18next';
import openCulture from 'images/openCulture.svg';

import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import {
  Checkbox,
  Content,
  ContentVariants,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalVariant,
  Stack,
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
      <ModalBody>
        <Grid className="WelcomeModal__grid" hasGutter>
          <GridItem span={4}>
            <img className="WelcomeModal__image" src={openCulture} />
          </GridItem>

          <GridItem span={8}>
            <Stack>
              <Trans ns="plugin__kubevirt-plugin" t={t}>
                <Title headingLevel="h2">Welcome to</Title>
                <Title headingLevel="h1">OpenShift Virtualization</Title>

                <Content
                  className="pf-v6-u-text-color-subtle WelcomeModal__text"
                  component={ContentVariants.p}
                >
                  Use OpenShift Virtualization to run and manage virtualized workloads alongside
                  container workloads. You can manage both Linux and Windows virtual machines.
                </Content>

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
      </ModalBody>
    </Modal>
  );
};

export default WelcomeModal;
