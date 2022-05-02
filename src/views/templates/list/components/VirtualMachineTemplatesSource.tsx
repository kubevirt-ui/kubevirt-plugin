import * as React from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { CheckIcon } from '@patternfly/react-icons';

type VirtualMachineTemplatesSourceProps = {
  isBootSourceAvailable: boolean;
};

// Component for VM Template's Boot source availability column
const VirtualMachineTemplatesSource: React.FC<VirtualMachineTemplatesSourceProps> = ({
  isBootSourceAvailable,
}) => {
  return isBootSourceAvailable ? <CheckIcon /> : <>{NO_DATA_DASH}</>;
};

export default VirtualMachineTemplatesSource;
