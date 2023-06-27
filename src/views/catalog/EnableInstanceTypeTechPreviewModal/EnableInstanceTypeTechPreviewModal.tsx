import React, { FC, useCallback, useEffect, useState } from 'react';
import instanceTypeTechPreviewModalImage from 'images/instance-type-tech-preview-modal-img.svg';

import DeveloperPreviewLabel from '@kubevirt-utils/components/DeveloperPreviewLabel/DeveloperPreviewLabel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { INSTANCE_TYPE_ENABLED } from '@kubevirt-utils/hooks/usePreviewFeatures/constants';
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

  const {
    featureEnabled: instanceTypesEnabled,
    loading,
    toggleFeature: toggleInstanceTypesFeature,
    error,
    canEdit,
  } = usePreviewFeatures(INSTANCE_TYPE_ENABLED);

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
                {canEdit && (
                  <Button
                    onClick={() => {
                      toggleInstanceTypesFeature(true);
                    }}
                    variant={ButtonVariant.primary}
                  >
                    {t('Enable')}
                  </Button>
                )}
                <Button
                  variant={canEdit ? ButtonVariant.link : ButtonVariant.primary}
                  onClick={onClose}
                >
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
