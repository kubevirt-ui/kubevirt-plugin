import type { FC } from 'react';
import { memo } from 'react';

import type {
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import useIsVMEditable from '@kubevirt-utils/components/VMEditPermissionContext/useIsVMEditable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Grid, GridItem, Title } from '@patternfly/react-core';

import SchedulingSectionLeftGrid from './SchedulingSectionLeftGrid';
import SchedulingSectionRightGrid from './SchedulingSectionRightGrid';

type SchedulingSectionProps = {
  instanceTypeVM?: V1VirtualMachine;
  onSubmit?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const SchedulingSection: FC<SchedulingSectionProps> = ({ instanceTypeVM, onSubmit, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const canUpdateVM = useIsVMEditable();

  return (
    <>
      <Title headingLevel="h2">
        <SearchItem id="scheduling">{t('Scheduling and resource requirements')}</SearchItem>
      </Title>
      <Grid hasGutter>
        <SchedulingSectionLeftGrid
          canUpdateVM={canUpdateVM}
          onUpdateVM={onSubmit}
          vm={vm}
          vmi={vmi}
        />
        <GridItem span={1}>{/* Spacer */}</GridItem>
        <SchedulingSectionRightGrid
          canUpdateVM={canUpdateVM}
          instanceTypeVM={instanceTypeVM}
          onUpdateVM={onSubmit}
          vm={vm}
          vmi={vmi}
        />
      </Grid>
    </>
  );
};

export default memo(SchedulingSection);
