import React, { FC } from 'react';

import EnableFeatureCheckbox from '@kubevirt-utils/components/EnableFeatureCheckbox/EnableFeatureCheckbox';
import {
  INSTANCE_TYPE_ENABLED,
  KUBEVIRT_APISERVER_PROXY,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

const EnablePreviewFeaturesSection: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('Preview features')}>
      <Stack hasGutter>
        <StackItem isFilled>
          <EnableFeatureCheckbox
            featureName={INSTANCE_TYPE_ENABLED}
            id={INSTANCE_TYPE_ENABLED}
            label={t('Enable create VirtualMachine from InstanceType')}
          />
        </StackItem>
        <StackItem isFilled>
          <EnableFeatureCheckbox
            featureName={KUBEVIRT_APISERVER_PROXY}
            id={KUBEVIRT_APISERVER_PROXY}
            label={t('Enable Kubevirt proxy')}
          />
        </StackItem>
      </Stack>
    </ExpandSection>
  );
};

export default EnablePreviewFeaturesSection;
