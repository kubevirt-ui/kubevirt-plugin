import React, { FC, useCallback, useEffect, useState } from 'react';
import instanceTypeTechPreviewModalImage from 'images/instance-type-tech-preview-modal-img.svg';

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

import EnableInstanceTypeContent from './components/EnableInstanceTypeContent';
import LinksList from './components/LinksList';

type EnableInstanceTypeTechPreviewModalProps = {
  navigateToCatalog: () => void;
};

const EnableInstanceTypeTechPreviewModal: FC<EnableInstanceTypeTechPreviewModalProps> = ({
  navigateToCatalog,
}) => {
  const { t } = useKubevirtTranslation();

  const {
    canEdit,
    error,
    featureEnabled: instanceTypesEnabled,
    loading,
    toggleFeature: toggleInstanceTypesFeature,
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
        <Title headingLevel="h1">{t('Creating a VirtualMachine from an InstanceType')}</Title>
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
            <LinksList />
            <StackItem isFilled />
            <StackItem>
              <Split hasGutter>
                <Button
                  onClick={() => {
                    toggleInstanceTypesFeature(true);
                  }}
                  isDisabled={!canEdit}
                  variant={ButtonVariant.primary}
                >
                  {t('Enable')}
                </Button>
                <Button onClick={onClose} variant={ButtonVariant.link}>
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
            height={320}
            src={instanceTypeTechPreviewModalImage}
            width={320}
          />
        </SplitItem>
      </Split>
    </Modal>
  );
};

export default EnableInstanceTypeTechPreviewModal;
