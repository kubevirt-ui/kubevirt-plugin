import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection, FormGroup, Stack, StackItem } from '@patternfly/react-core';

type SupportedSnapshotVolumesListProps = {
  supportedVolumes: any[];
};

const SnapshotSupportedVolumeList: React.FC<SupportedSnapshotVolumesListProps> = ({
  supportedVolumes,
}) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = React.useState<boolean>(true);
  if (supportedVolumes?.length === 0) {
    return null;
  }

  return (
    <FormGroup fieldId="snapshot-supported-volume-list">
      <ExpandableSection
        isExpanded={isExpanded}
        onClick={() => setIsExpanded((prev) => !prev)}
        toggleText={t('Disks included in this snapshot ({{count}})', {
          count: supportedVolumes?.length,
        })}
      >
        <Stack>
          {supportedVolumes?.map((vol) => (
            <StackItem key={vol.name}>{vol.name}</StackItem>
          ))}
        </Stack>
      </ExpandableSection>
    </FormGroup>
  );
};

export default SnapshotSupportedVolumeList;
