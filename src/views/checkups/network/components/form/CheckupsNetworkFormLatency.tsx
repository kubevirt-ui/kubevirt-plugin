import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Flex,
  FormGroup,
  Popover,
  PopoverPosition,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type CheckupsNetworkFormLatencyProps = {
  desiredLatency: string;
  isDesiredLatency: boolean;
  setDesiredLatency: Dispatch<SetStateAction<string>>;
  setIsDesiredLatency: Dispatch<SetStateAction<boolean>>;
};

const CheckupsNetworkFormLatency: FC<CheckupsNetworkFormLatencyProps> = ({
  desiredLatency,
  isDesiredLatency,
  setDesiredLatency,
  setIsDesiredLatency,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <FormGroup fieldId="desired-latency">
      <Flex>
        <Checkbox
          id="desired-latency"
          isChecked={isDesiredLatency}
          label={t('Set maximum desired latency (milliseconds)')}
          name="desired-latency"
          onChange={(_event, check) => setIsDesiredLatency(check)}
        />
        <Popover
          bodyContent={t('If the measured latency exceeds this value, the checkup fails.')}
          position={PopoverPosition.right}
        >
          <Button variant={ButtonVariant.plain}>
            <HelpIcon />
          </Button>
        </Popover>
      </Flex>

      {isDesiredLatency && (
        <TextInput
          className="CheckupsNetworkForm--main__number-input"
          id="desired-latency-value"
          name="desired-latency-value"
          onChange={(_event, value) => setDesiredLatency(value)}
          type="number"
          value={desiredLatency}
        />
      )}
    </FormGroup>
  );
};

export default CheckupsNetworkFormLatency;
