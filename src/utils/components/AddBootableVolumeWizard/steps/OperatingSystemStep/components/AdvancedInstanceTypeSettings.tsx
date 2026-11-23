import { type FC, useState } from 'react';

import { InstanceTypeDrilldownSelect } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/InstanceTypeDrilldownSelect';
import type {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

type AdvancedInstanceTypeSettingsProps = {
  bootableVolume: AddBootableVolumeState;
  deleteLabel: (labelKey: string) => void;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const AdvancedInstanceTypeSettings: FC<AdvancedInstanceTypeSettingsProps> = ({
  bootableVolume,
  deleteLabel,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ExpandableSection
      isExpanded={isExpanded}
      isIndented
      onToggle={(_event, expanded) => setIsExpanded(expanded)}
      toggleText={t('Advanced (optional)')}
    >
      <InstanceTypeDrilldownSelect
        bootableVolume={bootableVolume}
        deleteLabel={deleteLabel}
        direction="down"
        setBootableVolumeField={setBootableVolumeField}
      />
    </ExpandableSection>
  );
};

export default AdvancedInstanceTypeSettings;
