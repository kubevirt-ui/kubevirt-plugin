import React, { FC, useEffect, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { INSTANCE_TYPE_ENABLED } from '@kubevirt-utils/hooks/usePreviewFeatures/constants';
import { usePreviewFeatures } from '@kubevirt-utils/hooks/usePreviewFeatures/usePreviewFeatures';
import { Loading } from '@patternfly/quickstarts';
import { Checkbox } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

const EnableInstanceTypeSection: FC = () => {
  const { t } = useKubevirtTranslation();

  const {
    canEdit,
    featureEnabled: instanceTypesEnabled,
    loading,
    toggleFeature: toggleInstanceTypesFeature,
  } = usePreviewFeatures(INSTANCE_TYPE_ENABLED);

  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsChecked(instanceTypesEnabled);
    }
  }, [loading, instanceTypesEnabled]);
  return (
    <ExpandSection toggleText={t('Preview features')}>
      {!loading ? (
        <Checkbox
          onClick={(event) => {
            toggleInstanceTypesFeature(event.currentTarget.checked);
            setIsChecked(event.currentTarget.checked);
          }}
          id="tp-instance-type"
          isChecked={isChecked}
          isDisabled={!canEdit}
          label={t('Enable create VirtualMachine from InstanceType')}
        />
      ) : (
        <Loading />
      )}
    </ExpandSection>
  );
};

export default EnableInstanceTypeSection;
