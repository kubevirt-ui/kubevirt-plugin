import React, { FC, useCallback, useEffect, useState } from 'react';
import instanceTypeTechPreviewModalImage from 'images/instance-type-tech-preview-modal-img.svg';

import DeveloperPreviewLabel from '@kubevirt-utils/components/DeveloperPreviewLabel/DeveloperPreviewLabel';
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
  Title,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import EnableInstanceTypeContent from './components/EnableInstanceTypeContent';

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
        <Title headingLevel="h1">
          {t('Creating a VirtualMachine from an InstanceType')} <DeveloperPreviewLabel />
        </Title>
      }
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.medium}
    >
      <EnableInstanceTypeContent />
      <br />
      <Split>
        <SplitItem>
          <Stack hasGutter>
            <StackItem>
              <Button
                variant={ButtonVariant.link}
                icon={<ExternalLinkAltIcon />}
                href="https://kubevirt.io/user-guide/virtual_machines/instancetypes/"
                target="_blank"
                component="a"
                iconPosition="right"
                isInline
              >
                {t('Learn more about InstanceTypes')}
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
                  {t('Go to Catalog')}
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
