import React, { FC, Suspense } from 'react';
import { Trans } from 'react-i18next';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type K8sResourceCommon, YAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Content, ContentVariants, Grid, GridItem, ModalVariant } from '@patternfly/react-core';

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
  const { currentYAML, onSubmit } = useApplyRecommendation(managedCR, registryEntry);

  return (
    <TabModal
      headerDescription={
        <Content component={ContentVariants.p}>
          <Trans t={t}>
            Review the settings for this operator. Click <strong>Apply</strong> to use the
            recommended configuration, or <strong>Cancel</strong> to keep your current setup.
          </Trans>
        </Content>
      }
      headerText={t('Recommended settings for {{name}}', { name: operatorDisplayName })}
      isOpen={isOpen}
      modalVariant={ModalVariant.large}
      onClose={onClose}
      onSubmit={onSubmit}
      submitBtnText={t('Apply')}
    >
      <hr className="review-recommendation-modal__separator" />
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
          <Content component={ContentVariants.h4}>{t('Recommended configuration')}</Content>
          <div className="review-recommendation-modal__editor">
            <Suspense fallback={<Loading />}>
              <YAMLEditor minHeight="350px" options={EDITOR_OPTIONS} value={recommendedYAML} />
            </Suspense>
          </div>
        </GridItem>
      </Grid>
    </TabModal>
  );
};

export default ReviewRecommendationModal;
