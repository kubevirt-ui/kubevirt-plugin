import React, { FC } from 'react';

import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, Divider } from '@patternfly/react-core';

import EnableLoadBalancerSection from './components/EnableLoadBalancerSection/EnableLoadBalancerSection';
import EnablePreviewFeaturesSection from './components/EnablePreviewFeaturesSection/EnablePreviewFeaturesSection';
import GeneralInformation from './components/GeneralInformation/GeneralInformation';
import GuestManagementSection from './components/GuestManagmentSection/GuestManagementSection';
import LiveMigrationSection from './components/LiveMigrationSection/LiveMigrationSection';
import ResourceManagementSection from './components/ResourceManagementSection/ResourceManagementSection';
import TemplatesProjectSection from './components/TemplatesProjectSection/TemplatesProjectSection';

const ClusterTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const hyperConvergeConfiguration = useHyperConvergeConfiguration();
  const error = hyperConvergeConfiguration?.[2];

  return (
    <>
      <GeneralInformation />
      <EnablePreviewFeaturesSection />
      <Divider className="section-divider" />
      <LiveMigrationSection hyperConvergeConfiguration={hyperConvergeConfiguration} />
      <Divider className="section-divider" />
      <GuestManagementSection hyperConvergeConfiguration={hyperConvergeConfiguration} />
      <Divider className="section-divider" />
      <EnableLoadBalancerSection />
      <Divider className="section-divider" />
      <TemplatesProjectSection hyperConvergeConfiguration={hyperConvergeConfiguration} />
      <Divider className="section-divider" />
      <ResourceManagementSection hyperConvergeConfiguration={hyperConvergeConfiguration} />
      {error && (
        <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
          {error}
        </Alert>
      )}
    </>
  );
};

export default ClusterTab;
