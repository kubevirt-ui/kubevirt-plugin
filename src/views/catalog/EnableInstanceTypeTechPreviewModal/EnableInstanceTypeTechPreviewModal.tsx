import React, { FC, useCallback, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import instanceTypeTechPreviewModalImage from 'images/instance-type-tech-preview-modal-img.svg';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { usePreviewFeatures } from '@kubevirt-utils/hooks/usePreviewFeatures/usePreviewFeatures';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalVariant,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Text,
  TextVariants,
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type EnableInstanceTypeTechPreviewModalProps = {
  navigateToCatalog: () => void;
};

const EnableInstanceTypeTechPreviewModal: FC<EnableInstanceTypeTechPreviewModalProps> = ({
  navigateToCatalog,
}) => {
  const { t } = useKubevirtTranslation();

  const { instanceTypesEnabled, loading, toggleInstanceTypesFeature, error } = usePreviewFeatures();

  const isAdmin = useIsAdmin();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isEmpty(error)) {
      setIsOpen(true);
      return;
    }
    if (!loading) {
      setIsOpen(!instanceTypesEnabled);
    }
  }, [loading, instanceTypesEnabled, error]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    navigateToCatalog();
  }, [navigateToCatalog]);

  return (
    <Modal
      header={
        <Title headingLevel="h1">{t('Creating a VirtualMachine from an InstanceType')}</Title>
      }
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.medium}
    >
      <Trans t={t} ns="plugin__kubevirt-plugin">
        <Stack hasGutter>
          <StackItem>
            <Text component={TextVariants.p} className="pf-u-font-size-xl pf-u-danger-color-100">
              Creating VirtualMachines is easier than ever!
            </Text>
          </StackItem>
          <StackItem>
            <Text component={TextVariants.p}>
              This{' '}
              <Text
                component={TextVariants.a}
                href="https://access.redhat.com/support/offerings/techpreview"
                target="_blank"
              >
                Developer Preview feature
              </Text>{' '}
              provides a simple and quick way to create VirtualMachines.{' '}
              <Text component={TextVariants.p}>
                You must have cluster admin permissions to enable it. You can disable this feature
                by going
              </Text>{' '}
              <Text component={TextVariants.p}>to the settings tab in the overview page.</Text>
            </Text>
          </StackItem>
        </Stack>
      </Trans>
      <br />
      <Split>
        <SplitItem>
          <Stack hasGutter>
            <StackItem>
              <Button
                variant={ButtonVariant.link}
                icon={<ExternalLinkAltIcon />}
                //   href={}
                target="_blank"
                component="a"
                iconPosition="right"
                isInline
              >
                {t('Learn more about InstanceTypes')}
              </Button>
            </StackItem>
            <StackItem>
              <Button
                variant={ButtonVariant.link}
                component="a"
                href="/quickstart?quickstart=creating-virtual-machine-from-volume"
                isInline
              >
                {t('Quick start: Create a VirtualMachine from a volume')}
              </Button>
            </StackItem>
            <StackItem isFilled />
            <StackItem>
              <Split hasGutter>
                <Button
                  variant={ButtonVariant.primary}
                  isDisabled={!isAdmin}
                  onClick={() => {
                    toggleInstanceTypesFeature(true);
                  }}
                >
                  {t('Enable')}
                </Button>
                <Button variant={ButtonVariant.link} onClick={onClose}>
                  {t('Go to catalog')}
                </Button>
              </Split>
            </StackItem>
          </Stack>
        </SplitItem>
        <SplitItem isFilled />
        <SplitItem>
          <img
            className="pf-u-pr-lg pf-u-pb-lg"
            src={instanceTypeTechPreviewModalImage}
            width={320}
          />
        </SplitItem>
      </Split>
    </Modal>
  );
};

export default EnableInstanceTypeTechPreviewModal;
