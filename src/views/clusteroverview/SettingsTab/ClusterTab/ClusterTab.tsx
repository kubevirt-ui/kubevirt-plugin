import React, { FC } from 'react';

import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, Divider } from '@patternfly/react-core';

import { useKubevirtCSVDetails } from '../../utils/hooks/useKubevirtCSVDetails';
import { isNewBadgeNeeded } from '../../utils/utils';

import GeneralInformation from './components/GeneralInformation/GeneralInformation';
import GeneralSettings from './components/GeneralSettings/GeneralSettings';
import GuestManagementSection from './components/GuestManagmentSection/GuestManagementSection';
import PersistentReservationSection from './components/PersistentReservationSection/PersistentReservationSection';
import ResourceManagementSection from './components/ResourceManagementSection/ResourceManagementSection';

const ClusterTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const hyperConvergeConfiguration = useHyperConvergeConfiguration();
  const error = hyperConvergeConfiguration?.[2];
  const { installedCSV, ...CSVDetails } = useKubevirtCSVDetails();
  const newBadge = isNewBadgeNeeded(installedCSV);
  return (
    <>
      <GeneralInformation {...CSVDetails} />
      <GeneralSettings
        hyperConvergeConfiguration={hyperConvergeConfiguration}
        newBadge={newBadge}
      />
      <Divider className="section-divider" />
      <GuestManagementSection
        hyperConvergeConfiguration={hyperConvergeConfiguration}
        newBadge={newBadge}
      />
      <Divider className="section-divider" />
      <ResourceManagementSection
        hyperConvergeConfiguration={hyperConvergeConfiguration}
        newBadge={newBadge}
      />
      <Divider className="section-divider" />

      <PersistentReservationSection hyperConvergeConfiguration={hyperConvergeConfiguration} />
      {error && (
        <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
          {error}
        </Alert>
      )}
    </>
  );
};

export default ClusterTab;
