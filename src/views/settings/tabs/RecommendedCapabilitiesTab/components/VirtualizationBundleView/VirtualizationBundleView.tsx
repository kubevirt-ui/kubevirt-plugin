import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  Content,
  ContentVariants,
  ExpandableSection,
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Gallery,
  Skeleton,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { useCapabilitiesData } from '../../context/useCapabilitiesData';
import { countInstalledCapabilities, getBundleFeatures } from '../../utils/utils';
import CapabilityCard from '../CapabilityCard/CapabilityCard';

const BUNDLE_TOGGLE_ID = 'bundle-capabilities-toggle';
const BUNDLE_CONTENT_ID = 'bundle-capabilities-content';

const VirtualizationBundleView: FC = () => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const { detailsMap, features, loadErrors, resourcesLoaded } = useCapabilitiesData();

  const bundleFeatures = getBundleFeatures(features);
  const totalBundleCapabilities = bundleFeatures.length;
  const installedBundleCapabilities = countInstalledCapabilities(bundleFeatures, detailsMap);

  return (
    <Stack hasGutter>
      {resourcesLoaded && !isEmpty(loadErrors) && (
        <StackItem>
          <Alert isInline title={t('Failed to load operator resource status')} variant="danger">
            {t('Some capability statuses may be incorrect. Try refreshing the page.')}
          </Alert>
        </StackItem>
      )}
      <StackItem>
        <ExpandableSectionToggle
          contentId={BUNDLE_CONTENT_ID}
          isExpanded={isExpanded}
          onToggle={setIsExpanded}
          toggleId={BUNDLE_TOGGLE_ID}
        >
          {t('Learn more about included capabilities')}
        </ExpandableSectionToggle>
      </StackItem>
      <StackItem>
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Content>
              {t(
                'Installs the Virtualization bundle with capabilities to support VM workloads, high availability, networking, and migration.',
              )}
            </Content>
          </FlexItem>
          <FlexItem>
            {resourcesLoaded ? (
              <Content component={ContentVariants.small}>
                {t('{{installed}} out of {{total}} capabilities installed', {
                  installed: installedBundleCapabilities,
                  total: totalBundleCapabilities,
                })}
              </Content>
            ) : (
              <Skeleton width="160px" />
            )}
          </FlexItem>
        </Flex>
      </StackItem>
      <ExpandableSection
        contentId={BUNDLE_CONTENT_ID}
        isDetached
        isExpanded={isExpanded}
        toggleId={BUNDLE_TOGGLE_ID}
      >
        <Gallery hasGutter minWidths={{ default: '280px' }}>
          {bundleFeatures.map((feature) => (
            <CapabilityCard key={feature.id} feature={feature} />
          ))}
        </Gallery>
      </ExpandableSection>
    </Stack>
  );
};

export default VirtualizationBundleView;
