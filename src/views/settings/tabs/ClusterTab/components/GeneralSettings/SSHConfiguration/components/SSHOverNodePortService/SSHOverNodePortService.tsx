import React, { type FC, useEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';

import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { NODE_PORT_ADDRESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TextInput } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import useUpdateSSHConfiguration from '../../hooks/useUpdateSSHConfiguration';
import { NodePortSwitch } from './NodePortSwitch';

import './ssh-over-node-port-service.scss';

type SSHOverNodePortServiceProps = { newBadge: boolean };

const SSHOverNodePortService: FC<SSHOverNodePortServiceProps> = ({ newBadge }) => {
  const { t } = useKubevirtTranslation();
  const [url, setUrl] = useState<string | null>(null);
  const cluster = useSettingsCluster();
  const { updateSSHConfiguration } = useUpdateSSHConfiguration(NODE_PORT_ADDRESS);

  const {
    featuresConfigMapData: [featureConfigMap, loaded],
    isAdmin,
  } = useFeaturesConfigMap(cluster);

  const onTextChange = useMemo(
    () =>
      debounce((value: string) => {
        void updateSSHConfiguration(value);
      }, 700),
    [updateSSHConfiguration],
  );

  useEffect(() => {
    setUrl(null);

    return (): void => onTextChange.cancel();
  }, [cluster, onTextChange]);

  return (
    <ExpandSectionWithCustomToggle
      customContent={newBadge ? <NewBadge /> : null}
      helpTextContent={t(
        'Allow the creation of NodePort services for SSH connections to VirtualMachines. An address of a publicly available Node must be provided.',
      )}
      id="ssh-over-node-port-service"
      isIndented
      searchItemId={CLUSTER_TAB_IDS.sshOverNodePortService}
      toggleClassname="ExpandSection"
      toggleContent={t('SSH over NodePort service')}
    >
      <div className="ssh-over-node-port-service-container" id="node-port-feature">
        <TextInput
          className="pf-v6-u-mr-md"
          id="node-address"
          isDisabled={!loaded || !isAdmin}
          isRequired
          name="node-address"
          onChange={(_event, value: string) => {
            setUrl(value);
            onTextChange(value);
          }}
          placeholder={t('Enter node address')}
          value={url ?? featureConfigMap?.data?.[NODE_PORT_ADDRESS]}
        />

        <NodePortSwitch />
      </div>
    </ExpandSectionWithCustomToggle>
  );
};

export default SSHOverNodePortService;
