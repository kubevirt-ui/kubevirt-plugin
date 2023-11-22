import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ExpandableSection, FormGroup, Stack, StackItem } from '@patternfly/react-core';

type SupportedSnapshotVolumesListProps = {
  supportedVolumes: any[];
};

const SnapshotSupportedVolumeList: React.FC<SupportedSnapshotVolumesListProps> = ({
  supportedVolumes,
}) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const volumesCount = !isEmpty(supportedVolumes) ? supportedVolumes?.length : 0;
  const volumeCountMsg = t('Disks included in this snapshot ({{count}})', {
    count: volumesCount,
  });

  return (
    <FormGroup fieldId="snapshot-supported-volume-list">
      {volumesCount > 0 ? (
        <ExpandableSection
          isExpanded={isExpanded}
          onClick={() => setIsExpanded((prev) => !prev)}
          toggleText={volumeCountMsg}
        >
          <Stack>
            {supportedVolumes?.map((vol) => (
              <StackItem key={vol.name}>{vol.name}</StackItem>
            ))}
          </Stack>
        </ExpandableSection>
      ) : (
        <b>{volumeCountMsg}</b>
      )}
    </FormGroup>
  );
};

export default SnapshotSupportedVolumeList;
