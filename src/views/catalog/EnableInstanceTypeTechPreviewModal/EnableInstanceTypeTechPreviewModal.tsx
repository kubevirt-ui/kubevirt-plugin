import React, { FC, useCallback, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import instanceTypeTechPreviewModalImage from 'images/instance-type-tech-preview-modal-img.svg';

import DeveloperPreviewLabel from '@kubevirt-utils/components/DeveloperPreviewLabel/DeveloperPreviewLabel';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { usePreviewFeatures } from '@kubevirt-utils/hooks/usePreviewFeatures/usePreviewFeatures';
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
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type EnableInstanceTypeTechPreviewModalProps = {
  goBack?: () => void;
};

const EnableInstanceTypeTechPreviewModal: FC<EnableInstanceTypeTechPreviewModalProps> = ({
  goBack,
}) => {
  const { t } = useKubevirtTranslation();

  const [isOpen, setIsOpen] = useState(true);
  const [isFeatureDisabled, setIsFeatureDisabled] = useState(false);

  const { instanceTypesEnabled, loading, toggleInstanceTypesFeature } = usePreviewFeatures();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    if (!loading) {
      setIsFeatureDisabled(!instanceTypesEnabled);
    }
  }, [loading, instanceTypesEnabled]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    goBack?.();
  }, [goBack]);

  return (
    isFeatureDisabled && (
      <Modal
        header={
          <Text component={TextVariants.p} className="pf-u-font-size-3xl">
            {t('Creating a VirtualMachine from an InstanceType')} <DeveloperPreviewLabel />
          </Text>
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
                  //   href="#"
                >
                  Developer preview feature
                </Text>{' '}
                provides a simple and quick way to create VirtualMachines. You must have cluster
                admin permissions to enable it.
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
                <Button variant={ButtonVariant.link} target="_blank" component="a" isInline>
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
                      setIsFeatureDisabled(false);
                    }}
                  >
                    {t('Enable')}
                  </Button>
                  <Button variant={ButtonVariant.link} onClick={onClose}>
                    {t('Cancel')}
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
    )
  );
};

export default EnableInstanceTypeTechPreviewModal;
