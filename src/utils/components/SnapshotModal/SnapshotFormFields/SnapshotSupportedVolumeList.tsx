import React, { FC, ReactNode, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, ExpandableSection, FormGroup } from '@patternfly/react-core';

type SupportedSnapshotVolumesListProps = {
  children: ReactNode;
  volumesCount: number;
};

const SnapshotSupportedVolumeList: FC<SupportedSnapshotVolumesListProps> = ({
  children,
  volumesCount,
}) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const volumeCountMsg = t('Disks included in this snapshot ({{volumes}})', {
    volumes: volumesCount,
  });

  return (
    <FormGroup fieldId="snapshot-supported-volume-list">
      {volumesCount > 0 ? (
        <ExpandableSection
          isExpanded={isExpanded}
          isIndented
          onClick={() => setIsExpanded((prev) => !prev)}
          toggleText={volumeCountMsg}
        >
          {children}
        </ExpandableSection>
      ) : (
        <Alert isInline isPlain title={t('No disks included in this snapshot')} variant="warning" />
      )}
    </FormGroup>
  );
};

export default SnapshotSupportedVolumeList;
