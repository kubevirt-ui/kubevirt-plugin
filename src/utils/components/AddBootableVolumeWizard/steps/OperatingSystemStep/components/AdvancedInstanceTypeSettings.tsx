import { type FC, useState } from 'react';

import { InstanceTypeDrilldownSelect } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/InstanceTypeDrilldownSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

type AdvancedInstanceTypeSettingsProps = {
  cluster?: string;
  deleteLabel: (labelKey: string) => void;
  labels: Record<string, string>;
  namespace: string;
  setLabel: (labelKey: string, value: string) => void;
};

const AdvancedInstanceTypeSettings: FC<AdvancedInstanceTypeSettingsProps> = ({
  cluster,
  deleteLabel,
  labels,
  namespace,
  setLabel,
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
        cluster={cluster}
        deleteLabel={deleteLabel}
        direction="down"
        labels={labels}
        namespace={namespace}
        setLabel={setLabel}
      />
    </ExpandableSection>
  );
};

export default AdvancedInstanceTypeSettings;
