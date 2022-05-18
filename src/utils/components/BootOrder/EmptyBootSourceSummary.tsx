import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection, Text, TextVariants } from '@patternfly/react-core';

import { BootableDeviceType } from '../../resources/vm/utils/boot-order/bootOrder';
import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';

import BootableDevicesList from './BootableDevicesList';

type BootOrderSummaryProps = {
  devices: BootableDeviceType[];
};

const EmptyBootOrderSummary: React.FC<BootOrderSummaryProps> = ({ devices }) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const options = devices?.filter((device) => !device?.value?.bootOrder);

  return (
    <>
      <Text component={TextVariants.p}>{t('No resource selected')}</Text>
      <MutedTextSpan
        text={t(
          'VirtualMachine will attempt to boot from disks by order of appearance in YAML file',
        )}
      />
      {options?.length > 0 && (
        <ExpandableSection
          toggleText={isExpanded ? t('Hide default boot disks') : t('Show default boot disks')}
          onToggle={setIsExpanded}
          isExpanded={isExpanded}
        >
          <BootableDevicesList devices={options} />
        </ExpandableSection>
      )}
    </>
  );
};

export default EmptyBootOrderSummary;
