import openCulture from 'images/openCulture.svg';
import React, { FC } from 'react';

import useIsWindowsSupportedArchitecture from '@kubevirt-utils/hooks/useIsWindowsSupportedArchitecture';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
import useWelcomeModal from './hooks/useWelcomeModal';

import './WelcomeModal.scss';

const WelcomeModal: FC = () => {
  const { t } = useKubevirtTranslation();
  const isWindowsSupported = useIsWindowsSupportedArchitecture();
  const { isOpen, onClose, quickStarts, onDontShowAgainCheckboxChange } = useWelcomeModal();

  return (
    <Modal
      aria-label={t('Welcome modal')}
      data-test="welcome-modal"
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
              <Title headingLevel="h2">{t('Welcome to')}</Title>
              <Title headingLevel="h1">{t('OpenShift Virtualization')}</Title>

              <Content
                className="pf-v6-u-text-color-subtle WelcomeModal__text"
                component={ContentVariants.p}
              >
                {isWindowsSupported
                  ? t(
                      'Use OpenShift Virtualization to run and manage virtualized workloads alongside container workloads. You can manage both Linux and Windows virtual machines.',
                    )
                  : t(
                      'Use OpenShift Virtualization to run and manage virtualized workloads alongside container workloads. You can manage Linux virtual machines.',
                    )}
              </Content>

              <Title headingLevel="h3">{t('What do you want to do next?')}</Title>

              <WelcomeButtons onClose={onClose} />

              <Checkbox
                onChange={onDontShowAgainCheckboxChange}
                className="WelcomeModal__checkbox"
                id="welcome-modal-checkbox"
                isChecked={quickStarts?.dontShowWelcomeModal}
                label={t('Do not show this again')}
              />
            </Stack>
          </GridItem>
        </Grid>
      </ModalBody>
    </Modal>
  );
};

export default WelcomeModal;
