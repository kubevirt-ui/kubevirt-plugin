import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection, Text, TextVariants } from '@patternfly/react-core';

import { BootableDeviceType } from '../../utils/bootOrderHelper';
import BootableDevicesList from '../BootableDevicesList/BootableDevicesList';
import MutedTextDiv from '../MutedTextDiv/MutedTextDiv';

type BootOrderSummaryProps = {
  devices: BootableDeviceType[];
};

const EmptyBootOrderSummary: React.FC<BootOrderSummaryProps> = ({ devices }) => {
  const { t } = useKubevirtTranslation();
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const options = devices?.filter((device) => !device?.value?.bootOrder);

  console.log(devices);
  return (
    <>
      <Text component={TextVariants.p}>{t('No resource selected')}</Text>
      <MutedTextDiv
        text={t(
          'Virtual Machine will attempt to boot from disks by order of apearance in YAML file',
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
