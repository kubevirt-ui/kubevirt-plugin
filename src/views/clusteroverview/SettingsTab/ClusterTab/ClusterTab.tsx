import React, { FC, useEffect, useState } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { usePreviewFeatures } from '@kubevirt-utils/hooks/usePreviewFeatures/usePreviewFeatures';
import { Checkbox, Divider } from '@patternfly/react-core';

import LiveMigrationTab from '../LiveMigrationTab/LiveMigrationTab';
import TemplatesProjectTab from '../TemplatesProjectTab/TemplatesProjectTab';

import ExpandSection from './ExpandSection';

import './ClusterTab.scss';

const ClusterTab: FC = () => {
  const { t } = useKubevirtTranslation();

  const { instanceTypesEnabled, loading, toggleInstanceTypesFeature } = usePreviewFeatures();

  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsChecked(instanceTypesEnabled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const isAdmin = useIsAdmin();
  return (
    <>
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
            isDisabled={!isAdmin}
          />
        ) : (
          <Loading />
        )}
      </ExpandSection>
    </>
  );
};

export default ClusterTab;
