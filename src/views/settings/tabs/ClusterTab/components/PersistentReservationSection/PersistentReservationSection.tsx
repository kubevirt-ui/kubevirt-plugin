import React, { FC, useState } from 'react';

import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import {
  FEATURE_HCO_PERSISTENT_RESERVATION,
  FEATURE_PERSISTENT_RESERVATION,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

type PersistentReservationSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
};

const PersistentReservationSection: FC<PersistentReservationSectionProps> = ({
  hyperConvergeConfiguration,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const persistentReservation = Boolean(
    hyperConverge?.spec?.featureGates?.[FEATURE_PERSISTENT_RESERVATION],
  );

  const [error, setError] = useState<string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toggleFeature } = useFeatures(FEATURE_HCO_PERSISTENT_RESERVATION, cluster);

  const onChange = async (checked: boolean) => {
    if (!hyperConverge) return;
    setError(null);
    setIsLoading(true);
    const featureGates = hyperConverge.spec?.featureGates;
    const hasGate = featureGates?.hasOwnProperty(FEATURE_PERSISTENT_RESERVATION);
    try {
      await kubevirtK8sPatch<HyperConverged>({
        cluster,
        data: [
          ...(!featureGates ? [{ op: 'add' as const, path: '/spec/featureGates', value: {} }] : []),
          {
            op: hasGate ? 'replace' : 'add',
            path: `/spec/featureGates/${FEATURE_PERSISTENT_RESERVATION}`,
            value: checked,
          },
        ],
        model: HyperConvergedModel,
        resource: hyperConverge,
      });

      await toggleFeature(checked);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.persistentReservation}
      toggleText={t('SCSI persistent reservation')}
    >
      <SectionWithSwitch
        helpTextIconContent={t(
          'The SCSI reservation for disk makes the disk attached to the VirtualMachine as a SCSI LUN. This option should only be used for cluster-aware applications',
        )}
        dataTestID="persistent-reservation"
        isDisabled={!hyperLoaded || !hyperConverge}
        isLoading={isLoading}
        olsObj={hyperConvergeConfiguration?.[0]}
        olsPromptType={OLSPromptType.ENABLE_PERSISTENT_RESERVATION}
        switchIsOn={persistentReservation}
        title={t('Enable persistent reservation')}
        turnOnSwitch={onChange}
      />
      {error && (
        <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
          {error}
        </Alert>
      )}
    </ExpandSection>
  );
};

export default PersistentReservationSection;
