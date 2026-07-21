import React, { FC, useMemo, useState } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { CONTROL_DEFAULT_VIRTUALIZATION_PERMISSIONS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getErrorMessage } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { getGeneralSettingsLabels } from '../consts/consts';

import { isAutomaticRoleGrantEnabled, setRoleAggregationStrategy } from './utils/utils';

type AutomaticallyGrantVirtualizationRolesProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
  newBadge?: boolean;
};

const AutomaticallyGrantVirtualizationRoles: FC<AutomaticallyGrantVirtualizationRolesProps> = ({
  hyperConvergeConfiguration,
  newBadge = false,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const isAdmin = useIsAdmin();
  const [hyperConverge, hyperLoaded, hyperError] = hyperConvergeConfiguration;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const { featureEnabled: previewFeatureEnabled } = useFeatures(
    CONTROL_DEFAULT_VIRTUALIZATION_PERMISSIONS,
    cluster,
  );

  const switchIsOn = useMemo(() => isAutomaticRoleGrantEnabled(hyperConverge), [hyperConverge]);
  const displayError = useMemo(() => error || hyperError?.message, [error, hyperError]);

  const isDisabled = useMemo(
    () => !isAdmin || !hyperLoaded || isLoading || Boolean(hyperError) || !previewFeatureEnabled,
    [isAdmin, hyperLoaded, isLoading, hyperError, previewFeatureEnabled],
  );

  const onChange = async (checked: boolean) => {
    if (!hyperConverge || !isAdmin) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await setRoleAggregationStrategy(hyperConverge, checked, cluster);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.automaticGrantVirtualizationRoles}
      toggleText={getGeneralSettingsLabels(t).automaticallyGrantVirtualizationRoles}
    >
      <SectionWithSwitch
        dataTestID="automatic-grant-virtualization-roles"
        helpTextIconContent={t(
          'When enabled, users get default Virtualization roles. When disabled, those roles must be assigned manually.',
        )}
        isDisabled={isDisabled}
        isLoading={!hyperLoaded || isLoading}
        newBadge={newBadge}
        switchIsOn={switchIsOn}
        title={getGeneralSettingsLabels(t).automaticallyGrantVirtualizationRoles}
        turnOnSwitch={onChange}
      />
      {displayError && (
        <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
          {displayError}
        </Alert>
      )}
    </ExpandSection>
  );
};

export default AutomaticallyGrantVirtualizationRoles;
