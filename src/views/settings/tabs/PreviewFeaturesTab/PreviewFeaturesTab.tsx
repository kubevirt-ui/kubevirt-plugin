import React, { FC } from 'react';

import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Content, ContentVariants, Title } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import { PREVIEW_FEATURES_TAB_IDS } from '@settings/search/constants';

import usePreviewFeaturesData from './hooks/usePreviewFeaturesData';
import PreviewFeaturesPopover from './PreviewFeaturesPopover';

import './PreviewFeatures.scss';

const PreviewFeaturesTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const { features } = usePreviewFeaturesData(cluster);

  return (
    <div className="preview-features-tab">
      <div className="preview-features-tab__header">
        <Title headingLevel="h5">
          <SearchItem id={PREVIEW_FEATURES_TAB_IDS.previewFeatures}>
            {t('Preview features')}
          </SearchItem>
        </Title>
        <PreviewFeaturesPopover />
      </div>
      <Content component={ContentVariants.p}>
        <div>
          {t(
            'Preview features are for testing purposes and should not be used in production environments.',
          )}
        </div>
        <div>{t('Preview features apply to the entire cluster.')}</div>
      </Content>
      <div className="preview-features-tab__features">
        {features.map((feature) => (
          <SectionWithSwitch
            dataTestID={feature.id}
            externalLink={feature.externalLink}
            helpTextIconContent={feature?.helpPopoverContent}
            id={feature.searchItemId}
            isDisabled={!feature.canEdit}
            isLoading={feature.loading}
            key={feature.id}
            olsPromptType={OLSPromptType.PREVIEW_FEATURES}
            switchIsOn={feature.featureEnabled}
            title={<SearchItem id={feature.searchItemId}>{feature.label}</SearchItem>}
            turnOnSwitch={feature.toggleFeature}
          />
        ))}
      </div>
    </div>
  );
};

export default PreviewFeaturesTab;
