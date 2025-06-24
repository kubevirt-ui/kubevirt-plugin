import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { List, ListItem } from '@patternfly/react-core';

import { describeNetworkState } from './utils';

type StateTextProps = {
  configuredState: NetworkInterfaceState;
  details?: string;
  runtimeState?: NetworkInterfaceState;
};

const StateText: FC<StateTextProps> = ({ configuredState, details, runtimeState }) => {
  const { t } = useKubevirtTranslation();
  return (
    <List isPlain>
      {runtimeState && (
        <ListItem>
          {t('Link state: {{runtimeState}}', {
            runtimeState: describeNetworkState(t, runtimeState),
          })}
        </ListItem>
      )}
      <ListItem>
        {t('Configured state: {{ configuredState}}', {
          configuredState: describeNetworkState(t, configuredState),
        })}
      </ListItem>
      {details && <ListItem>{details}</ListItem>}
    </List>
  );
};

export default StateText;
