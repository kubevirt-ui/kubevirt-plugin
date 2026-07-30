import React, { FC, Suspense } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type K8sResourceCommon, YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  Button,
  Content,
  ContentVariants,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { type AutopilotRegistryEntry } from '../../utils/autopilotRegistry';

import useApplyRecommendation from './useApplyRecommendation';

import './review-recommendation-modal.scss';

const EDITOR_OPTIONS = { automaticLayout: true, readOnly: true };

type ReviewRecommendationModalProps = {
  isOpen: boolean;
  managedCR: K8sResourceCommon | undefined;
  onClose: () => void;
  operatorDisplayName: string;
  recommendedYAML: string;
  registryEntry: AutopilotRegistryEntry;
};

const ReviewRecommendationModal: FC<ReviewRecommendationModalProps> = ({
  isOpen,
  managedCR,
  onClose,
  operatorDisplayName,
  recommendedYAML,
  registryEntry,
}) => {
  const { t } = useKubevirtTranslation();
  const { currentYAML, handleSubmit, isSubmitting, submitError } = useApplyRecommendation(
    managedCR,
    registryEntry,
    onClose,
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="large">
      <ModalHeader title={t('Recommended settings for {{name}}', { name: operatorDisplayName })} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>
            <Content
              className="review-recommendation-modal__description"
              component={ContentVariants.p}
            >
              {t(
                'Review the recommended settings for this operator. Apply to switch to recommended configuration, or close to keep your manual configuration.',
              )}
            </Content>
          </StackItem>
          <StackItem>
            <hr className="review-recommendation-modal__separator" />
          </StackItem>
          <StackItem>
            <Grid hasGutter>
              <GridItem span={6}>
                <Content component={ContentVariants.h4}>{t('Current configuration')}</Content>
                <div className="review-recommendation-modal__editor">
                  <Suspense fallback={<Loading />}>
                    <YAMLEditor minHeight="350px" options={EDITOR_OPTIONS} value={currentYAML} />
                  </Suspense>
                </div>
              </GridItem>
              <GridItem span={6}>
                <Content component={ContentVariants.h4}>{t('Managed by autopilot')}</Content>
                <div className="review-recommendation-modal__editor">
                  <Suspense fallback={<Loading />}>
                    <YAMLEditor
                      minHeight="350px"
                      options={EDITOR_OPTIONS}
                      value={recommendedYAML}
                    />
                  </Suspense>
                </div>
              </GridItem>
            </Grid>
          </StackItem>
          {submitError && (
            <StackItem>
              <Alert isInline title={submitError.message} variant="danger" />
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <div className="review-recommendation-modal__footer">
          <Button
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            onClick={handleSubmit}
            variant="primary"
          >
            {t('Apply')}
          </Button>
          <Button onClick={onClose} variant="link">
            {t('Close')}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ReviewRecommendationModal;
