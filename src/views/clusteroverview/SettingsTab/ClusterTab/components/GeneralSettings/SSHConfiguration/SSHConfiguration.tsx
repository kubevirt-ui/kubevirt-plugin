import React, { FC, useCallback, useState } from 'react';
import { useDebounceCallback } from 'src/views/clusteroverview/utils/hooks/useDebounceCallback';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import {
  LOAD_BALANCER_ENABLED,
  NODE_PORT_ADDRESS,
  NODE_PORT_ENABLED,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import ExpandSection from '../../../../ExpandSection/ExpandSection';

type SSHConfigurationProps = { newBadge: boolean };

const SSHConfiguration: FC<SSHConfigurationProps> = ({ newBadge }) => {
  const { t } = useKubevirtTranslation();
  const [url, setUrl] = useState<string>(null);
  const {
    featuresConfigMapData: [featureConfigMap, loaded],
    isAdmin,
  } = useFeaturesConfigMap();

  const onChange = useCallback(
    (val: string, field: string) => {
      k8sPatch({
        data: [
          {
            op: 'replace',
            path: `/data/${field}`,
            value: val,
          },
        ],
        model: ConfigMapModel,
        resource: featureConfigMap,
      });
    },
    [featureConfigMap],
  );

  const onTextChange = useDebounceCallback((val: string, field) => {
    onChange(val, field);
  }, 700);

  return (
    <ExpandSection toggleText={t('SSH configurations')}>
      <SectionWithSwitch
        helpTextIconContent={t(
          'Enable the creation of LoadBalancer services for SSH connections to VirtualMachines. A load balancer must be configured',
        )}
        id="load-balancer-feature"
        isDisabled={!loaded || !isAdmin}
        newBadge={newBadge}
        switchIsOn={featureConfigMap?.data?.[LOAD_BALANCER_ENABLED] === 'true'}
        title={t('SSH over LoadBalancer service')}
        turnOnSwitch={(checked) => onChange(checked.toString(), LOAD_BALANCER_ENABLED)}
      />
      <SectionWithSwitch
        helpTextIconContent={t(
          'Allow the creation of NodePort services for SSH connections to VirtualMachines. An address of a publicly available Node must be provided.',
        )}
        switchIsOn={
          featureConfigMap?.data?.[NODE_PORT_ENABLED] === 'true' &&
          !isEmpty(featureConfigMap?.data?.[NODE_PORT_ADDRESS])
        }
        id="node-port-feature"
        inlineCheckbox
        isDisabled={!loaded || !isAdmin || isEmpty(featureConfigMap?.data?.[NODE_PORT_ADDRESS])}
        newBadge={newBadge}
        title={t('SSH over NodePort service')}
        turnOnSwitch={(checked) => onChange(checked.toString(), NODE_PORT_ENABLED)}
      >
        <Form isHorizontal>
          <FormGroup
            fieldId="node-address"
            isRequired
            label={t('Node address')}
            placeholder={t('Enter node address to access the cluster')}
          >
            <TextInput
              onChange={(value: string) => {
                setUrl(value);
                onTextChange(value, NODE_PORT_ADDRESS);
              }}
              id="node-address"
              isRequired
              name="node-address"
              value={url ?? featureConfigMap?.data?.[NODE_PORT_ADDRESS]}
            />
          </FormGroup>
        </Form>
      </SectionWithSwitch>
    </ExpandSection>
  );
};

export default SSHConfiguration;
