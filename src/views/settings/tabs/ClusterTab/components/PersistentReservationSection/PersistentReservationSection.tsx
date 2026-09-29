import { type FC, useState } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import {
  FEATURE_HCO_PERSISTENT_RESERVATION,
  FEATURE_PERSISTENT_RESERVATION,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { buildFeatureGatePatches } from '@kubevirt-utils/resources/hyperconverged/featureGates';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import { isFeatureGateEnabled } from '@kubevirt-utils/resources/hyperconverged/selectors';
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
  const persistentReservation = isFeatureGateEnabled(hyperConverge, FEATURE_PERSISTENT_RESERVATION);

  const [error, setError] = useState<string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toggleFeature } = useFeatures(FEATURE_HCO_PERSISTENT_RESERVATION, cluster);

  const onChange = async (checked: boolean): Promise<void> => {
    if (!hyperConverge) return;
    setError(null);
    setIsLoading(true);
    try {
      await kubevirtK8sPatch<HyperConverged>({
        cluster,
        data: buildFeatureGatePatches(hyperConverge, FEATURE_PERSISTENT_RESERVATION, checked),
        model: getHyperConvergedModelFromResource(hyperConverge),
        resource: hyperConverge,
      });

      await toggleFeature(checked);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ExpandSection
      dataTestID="persistent-reservation-section"
      searchItemId={CLUSTER_TAB_IDS.persistentReservation}
      toggleText={t('SCSI persistent reservation')}
    >
      <SectionWithSwitch
        dataTestID="persistent-reservation"
        helpTextIconContent={t(
          'The SCSI reservation for disk makes the disk attached to the VirtualMachine as a SCSI LUN. This option should only be used for cluster-aware applications',
        )}
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
