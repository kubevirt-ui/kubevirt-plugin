import React, { FC } from 'react';
import instanceTypeTechPreviewModalImage from 'images/instance-type-tech-preview-modal-img.svg';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  canEdit: boolean;
  isOpen: boolean;
  onClose: () => void;
  onEnableInstanceTypeFeature: () => void;
};

const EnableInstanceTypeTechPreviewModal: FC<EnableInstanceTypeTechPreviewModalProps> = ({
  canEdit,
  isOpen,
  onClose,
  onEnableInstanceTypeFeature,
}) => {
  const { t } = useKubevirtTranslation();

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
                {canEdit && (
                  <Button onClick={onEnableInstanceTypeFeature} variant={ButtonVariant.primary}>
                    {t('Enable')}
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant={canEdit ? ButtonVariant.link : ButtonVariant.primary}
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
