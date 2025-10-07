import React, { FC } from 'react';

import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title } from '@patternfly/react-core';

import { PREVIEW_FEATURES_TAB_IDS } from '../search/constants';

import usePreviewFeaturesData from './hooks/usePreviewFeaturesData';
import PreviewFeaturesPopover from './PreviewFeaturesPopover';

import './PreviewFeatures.scss';

const PreviewFeaturesTab: FC = () => {
  const { t } = useKubevirtTranslation();

  const { features } = usePreviewFeaturesData();

  return (
    <>
      <Title headingLevel="h5">
        <SearchItem id={PREVIEW_FEATURES_TAB_IDS.previewFeatures}>
          {t('Preview features')}
        </SearchItem>
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
              helpTextIconContent={feature?.helpPopoverContent}
              id={feature.id}
              isDisabled={!feature.canEdit}
              isLoading={feature.loading}
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
