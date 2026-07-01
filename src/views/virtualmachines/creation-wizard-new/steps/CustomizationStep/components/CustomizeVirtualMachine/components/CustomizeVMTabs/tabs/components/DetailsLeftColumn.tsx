import React, { Dispatch, FC, SetStateAction } from 'react';

import { DescriptionList, GridItem } from '@patternfly/react-core';

import DetailsEditableItems from './DetailsEditableItems';
import DetailsToggleItems from './DetailsToggleItems';

type DetailsLeftColumnProps = {
  deletionProtectionEnabled: boolean;
  isCheckedGuestSystemAccessLog: boolean;
  isGuestSystemLogsDisabled: boolean;
  setIsCheckedGuestSystemAccessLog: Dispatch<SetStateAction<boolean>>;
  treeViewFoldersEnabled: boolean;
};

const DetailsLeftColumn: FC<DetailsLeftColumnProps> = ({
  deletionProtectionEnabled,
  isCheckedGuestSystemAccessLog,
  isGuestSystemLogsDisabled,
  setIsCheckedGuestSystemAccessLog,
  treeViewFoldersEnabled,
}) => {
  return (
    <GridItem span={5}>
      <DescriptionList>
        <DetailsEditableItems treeViewFoldersEnabled={treeViewFoldersEnabled} />
        <DetailsToggleItems
          deletionProtectionEnabled={deletionProtectionEnabled}
          isCheckedGuestSystemAccessLog={isCheckedGuestSystemAccessLog}
          isGuestSystemLogsDisabled={isGuestSystemLogsDisabled}
          setIsCheckedGuestSystemAccessLog={setIsCheckedGuestSystemAccessLog}
        />
      </DescriptionList>
    </GridItem>
  );
};

export default DetailsLeftColumn;
