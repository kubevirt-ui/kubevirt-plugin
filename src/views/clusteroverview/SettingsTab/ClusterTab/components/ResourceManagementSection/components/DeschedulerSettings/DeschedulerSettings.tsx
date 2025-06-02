import React, { FC, useState } from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import KubeDeschedulerModel from '@kubevirt-ui/kubevirt-api/console/models/KubeDeschedulerModel';
import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import ExpandSection from '@overview/SettingsTab/ExpandSection/ExpandSection';
import { Form, Split, SplitItem, Stack, Switch } from '@patternfly/react-core';

import DeschedulerCustomizations from './components/DeschedulerCustomizations';
import DeschedulerModeRadio from './components/DeschedulerModeRadio/DeschedulerModeRadio';
import DeschedulingInterval from './components/DeschedulingInterval/DeschedulingInterval';
import { defaultDescheduler } from './utils/constants';
import { createDefaultDescheduler, deleteDescheduler } from './utils/deschedulerAPI';
import { DeschedulerType } from './utils/types';

type DeschedulerSettingsProps = {
  newBadge?: boolean;
};

const DeschedulerSettings: FC<DeschedulerSettingsProps> = ({ newBadge }) => {
  const [isDeleted, setIsDeleted] = useState(false);

  const [deschedulerData] = useK8sWatchResource<DeschedulerType>({
    groupVersionKind: modelToGroupVersionKind(KubeDeschedulerModel),
    name: defaultDescheduler.metadata.name,
    namespace: defaultDescheduler.metadata.namespace,
  });

  const isDeschedulerEnabled =
    !isDeleted && deschedulerData?.metadata?.name === defaultDescheduler.metadata.name;

  const onSwitchChange = async (_, checked: boolean) => {
    if (checked) {
      // TODO:
      // IF not existing yet, create a openshift-kube-descheduler-operator namespace and install a Kube Descheduler Operator
      await createDefaultDescheduler();
      setIsDeleted(false);
    } else {
      await deleteDescheduler();
      setIsDeleted(true);
    }
  };

  return (
    <ExpandSection toggleText={t('Descheduler')}>
      <Stack hasGutter>
        <Split>
          <SplitItem isFilled>
            {t('Enable descheduler')} {newBadge && <NewBadge />}
          </SplitItem>
          <SplitItem>
            <Switch isChecked={isDeschedulerEnabled} onChange={onSwitchChange} />
          </SplitItem>
        </Split>
        {isDeschedulerEnabled && (
          <>
            <Form>
              <DeschedulerModeRadio mode={deschedulerData?.spec.mode} />
              <DeschedulingInterval
                initialInterval={deschedulerData?.spec.deschedulingIntervalSeconds}
              />
            </Form>
            <DeschedulerCustomizations deschedulerData={deschedulerData} />
          </>
        )}
      </Stack>
    </ExpandSection>
  );
};

export default DeschedulerSettings;
