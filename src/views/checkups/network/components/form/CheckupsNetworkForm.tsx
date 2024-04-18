import React, { useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { generatePrettyName } from '@kubevirt-utils/utils/utils';
import { Form, FormGroup, FormSection, Grid, GridItem, TextInput } from '@patternfly/react-core';

import CheckupsNetworkFormActions from './CheckupsNetworkFormActions';
import CheckupsNetworkFormLatency from './CheckupsNetworkFormLatency';
import CheckupsNetworkFormNADS from './CheckupsNetworkFormNADS';
import CheckupsNetworkFormNodes from './CheckupsNetworkFormNodes';

import './checkups-network-form.scss';

const CheckupsNetworkForm = () => {
  const { t } = useKubevirtTranslation();

  const [isDesiredLatency, setIsDesiredLatency] = useState<boolean>(false);
  const [isNodesChecked, setIsNodesChecked] = useState<boolean>(false);

  const [name, setName] = useState<string>(generatePrettyName('kubevirt-vm-latency-checkup'));
  const [sampleDuration, setSampleDuration] = useState<string>('5');
  const [desiredLatency, setDesiredLatency] = useState<string>();
  const [selectedNAD, setSelectedNAD] = useState<string>();

  const [nodeTarget, setNodeTarget] = useState<string>();
  const [nodeSource, setNodeSource] = useState<string>();

  return (
    <Grid>
      <GridItem span={6}>
        <Form className={'CheckupsNetworkForm--main'}>
          <FormSection title={t('Run network latency checkup')} titleElement="h1">
            {t(
              `Network latency checkup verifies network connectivity and measures the latency between two 
          VirtualMachines attached to a secondary network interface by using the ping utility`,
            )}

            <FormGroup fieldId="name" isRequired label={t('Name')}>
              <TextInput
                id="name"
                isRequired
                name="name"
                onChange={(_event, value) => setName(value)}
                value={name}
              />
            </FormGroup>
            <CheckupsNetworkFormNADS selectedNAD={selectedNAD} setSelectedNAD={setSelectedNAD} />
            <FormGroup fieldId="sample-duration" label={t('Sample duration (seconds)')}>
              <TextInput
                className="CheckupsNetworkForm--main__number-input"
                id="sample-duration"
                name="sample-duration"
                onChange={(_event, val) => setSampleDuration(val)}
                type="number"
                value={sampleDuration}
              />
            </FormGroup>
            <CheckupsNetworkFormLatency
              desiredLatency={desiredLatency}
              isDesiredLatency={isDesiredLatency}
              setDesiredLatency={setDesiredLatency}
              setIsDesiredLatency={setIsDesiredLatency}
            />
            <CheckupsNetworkFormNodes
              isNodesChecked={isNodesChecked}
              nodeSource={nodeSource}
              nodeTarget={nodeTarget}
              setIsNodesChecked={setIsNodesChecked}
              setNodeSource={setNodeSource}
              setNodeTarget={setNodeTarget}
            />
            <CheckupsNetworkFormActions
              desiredLatency={desiredLatency}
              isNodesChecked={isNodesChecked}
              name={name}
              nodeSource={nodeSource}
              nodeTarget={nodeTarget}
              sampleDuration={sampleDuration}
              selectedNAD={selectedNAD}
            />
          </FormSection>
        </Form>
      </GridItem>
    </Grid>
  );
};

export default CheckupsNetworkForm;
