import React, { FC } from 'react';

import EnableFeatureCheckbox from '@kubevirt-utils/components/EnableFeatureCheckbox/EnableFeatureCheckbox';
import {
  CPU_HOT_PLUG_USER_GUIDE_LINK,
  INSTANCE_TYPES_USER_GUIDE_LINK,
} from '@kubevirt-utils/constants/url-constants';
import {
  CPU_HOT_PLUG_ENABLED,
  INSTANCE_TYPE_ENABLED,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';
import PreviewFeaturesPopover from '../../../PreviewFeaturesTab/PreviewFeaturesPopover';

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
            externalLink={INSTANCE_TYPES_USER_GUIDE_LINK}
            featureName={INSTANCE_TYPE_ENABLED}
            id={INSTANCE_TYPE_ENABLED}
            label={t('Enable create VirtualMachine from InstanceType')}
          />
        </StackItem>
        <StackItem isFilled>
          <EnableFeatureCheckbox
            externalLink={CPU_HOT_PLUG_USER_GUIDE_LINK}
            featureName={CPU_HOT_PLUG_ENABLED}
            id={CPU_HOT_PLUG_ENABLED}
            label={t('Enable CPU hot-plug')}
          />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};

export default EnablePreviewFeaturesSection;
