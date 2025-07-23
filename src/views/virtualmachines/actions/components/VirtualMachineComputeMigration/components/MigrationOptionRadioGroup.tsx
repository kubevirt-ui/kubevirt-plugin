import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Radio, Stack, StackItem } from '@patternfly/react-core';
import { MigrationOptions } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

type MigrationOptionRadioGroupProps = {
  migrationOption: MigrationOptions;
  setMigrationOption: (migrationOption: MigrationOptions) => void;
};

const MigrationOptionRadioGroup: FC<MigrationOptionRadioGroupProps> = ({
  migrationOption,
  setMigrationOption,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Radio
          id="automatic-migration-option-selection"
          isChecked={migrationOption === MigrationOptions.AUTOMATIC}
          label={t('Automatically selected Node')}
          name="migration-option-selection"
          onChange={() => setMigrationOption(MigrationOptions.AUTOMATIC)}
        />
      </StackItem>
      <StackItem>
        <Radio
          id="manual-migration-option-selection"
          isChecked={migrationOption === MigrationOptions.MANUAL}
          label={t('Specific Node')}
          name="migration-option-selection"
          onChange={() => setMigrationOption(MigrationOptions.MANUAL)}
        />
      </StackItem>
    </Stack>
  );
};

export default MigrationOptionRadioGroup;
