import type { FC } from 'react';

import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/utils/constants';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';

import { getSystemDiskSizeHelpText } from '../utils/isoBootSourceHelpers';

type SystemDiskSizeSectionProps = {
  onChange: (size: string) => void;
  size?: string;
};

const SystemDiskSizeSection: FC<SystemDiskSizeSectionProps> = ({ onChange, size }) => {
  const { t } = useKubevirtTranslation();
  const label = t('System disk size');

  return (
    <Stack hasGutter>
      <StackItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>{label}</FlexItem>
          <FlexItem>
            <HelpTextIcon bodyContent={getSystemDiskSizeHelpText(t)} headerContent={label} />
          </FlexItem>
        </Flex>
      </StackItem>
      <StackItem>
        <CapacityInput isRequired={false} onChange={onChange} size={size ?? DEFAULT_DISK_SIZE} />
      </StackItem>
    </Stack>
  );
};

export default SystemDiskSizeSection;
