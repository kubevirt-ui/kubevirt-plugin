import React, { FC } from 'react';

import EnableFeatureCheckbox from '@kubevirt-utils/components/EnableFeatureCheckbox/EnableFeatureCheckbox';
import {
  INSTANCE_TYPES_USER_GUIDE_LINK,
  NIC_HOT_PLUG_LINK,
} from '@kubevirt-utils/constants/url-constants';
import {
  AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED,
  BRIDGED_NIC_HOTPLUG_ENABLED,
  INSTANCE_TYPE_ENABLED,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import PreviewFeaturesPopover from './PreviewFeaturesPopover';

const EnablePreviewFeaturesSection: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection
      toggleContent={
        <>
          {t('Preview features')}
          <PreviewFeaturesPopover />
        </>
      }
    >
      <Stack hasGutter>
        <StackItem isFilled>
          <EnableFeatureCheckbox
            externalLink={NIC_HOT_PLUG_LINK}
            featureName={BRIDGED_NIC_HOTPLUG_ENABLED}
            id={BRIDGED_NIC_HOTPLUG_ENABLED}
            label={t('Enable bridged network interface hot plug')}
          />
        </StackItem>
        <StackItem isFilled>
          <EnableFeatureCheckbox
            externalLink={INSTANCE_TYPES_USER_GUIDE_LINK}
            featureName={INSTANCE_TYPE_ENABLED}
            id={INSTANCE_TYPE_ENABLED}
            label={t('Enable create VirtualMachine from InstanceType')}
          />
        </StackItem>
        <StackItem isFilled>
          <EnableFeatureCheckbox
            externalLink={INSTANCE_TYPES_USER_GUIDE_LINK}
            featureName={AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED}
            id={AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED}
            label={t('Enable CPU limit')}
          />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};

export default EnablePreviewFeaturesSection;
