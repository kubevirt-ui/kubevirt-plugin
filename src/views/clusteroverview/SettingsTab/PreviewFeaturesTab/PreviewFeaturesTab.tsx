import React, { FC } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title } from '@patternfly/react-core';

import usePreviewFeaturesData from './hooks/usePreviewFeaturesData';
import PreviewFeaturesPopover from './PreviewFeaturesPopover';

import './PreviewFeatures.scss';

const PreviewFeaturesTab: FC = () => {
  const { t } = useKubevirtTranslation();

  const { features } = usePreviewFeaturesData();

  return (
    <>
      <Title headingLevel="h5">
        {t('Preview features')}
        <PreviewFeaturesPopover />
      </Title>
      <Stack hasGutter>
        <StackItem isFilled>
          {t(
            'Preview features are for testing purposes and should not be used in production environments.',
          )}
        </StackItem>
        {features.map((feature) => (
          <StackItem isFilled key={feature.id}>
            <SectionWithSwitch
              externalLink={feature.externalLink}
              id={feature.id}
              maxWidth="350px"
              switchIsOn={feature.featureEnabled}
              title={feature.label}
              turnOnSwitch={feature.toggleFeature}
            />
          </StackItem>
        ))}
      </Stack>
    </>
  );
};

export default PreviewFeaturesTab;
