import React, { FC, useEffect, useState } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { INSTANCE_TYPE_ENABLED } from '@kubevirt-utils/hooks/usePreviewFeatures/constants';
import { usePreviewFeatures } from '@kubevirt-utils/hooks/usePreviewFeatures/usePreviewFeatures';
import { Checkbox, Divider } from '@patternfly/react-core';

import GeneralTab from '../GeneralTab/GeneralTab';
import LiveMigrationTab from '../LiveMigrationTab/LiveMigrationTab';
import TemplatesProjectTab from '../TemplatesProjectTab/TemplatesProjectTab';

import ExpandSection from './ExpandSection';

import './ClusterTab.scss';

const ClusterTab: FC = () => {
  const { t } = useKubevirtTranslation();

  const {
    featureEnabled: instanceTypesEnabled,
    toggleFeature: toggleInstanceTypesFeature,
    canEdit,
    loading,
  } = usePreviewFeatures(INSTANCE_TYPE_ENABLED);

  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsChecked(instanceTypesEnabled);
    }
  }, [loading, instanceTypesEnabled]);

  return (
    <>
      <GeneralTab />
      <ExpandSection toggleText={t('Live migration')}>
        <LiveMigrationTab />
      </ExpandSection>
      <Divider className="section-divider" />
      <ExpandSection toggleText={t('Templates project')}>
        <TemplatesProjectTab />
      </ExpandSection>
      <Divider className="section-divider" />
      <ExpandSection toggleText={t('Preview features')}>
        {!loading ? (
          <Checkbox
            id="tp-instance-type"
            isChecked={isChecked}
            onClick={(event) => {
              toggleInstanceTypesFeature(event.currentTarget.checked);
              setIsChecked(event.currentTarget.checked);
            }}
            label={t('Enable create VirtualMachine from InstanceType')}
            isDisabled={!canEdit}
          />
        ) : (
          <Loading />
        )}
      </ExpandSection>
    </>
  );
};

export default ClusterTab;
