import React, { FC, Suspense, useState } from 'react';
import { dump, load } from 'js-yaml';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { updateCustomizeInstanceType, vmSignal } from '@kubevirt-utils/store/customizeInstanceType';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Bullseye } from '@patternfly/react-core';

import './CustomizeInstanceTypeYamlTab.scss';

const CustomizeInstanceTypeYamlTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const [error, setError] = useState<Error>(null);

  const vm = vmSignal.value;

  if (isEmpty(vm)) {
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );
  }

  const onSave = async (yaml: string) => {
    setError(null);
    try {
      updateCustomizeInstanceType([{ data: load(yaml) as V1VirtualMachine }]);
    } catch (apiError) {
      setError(apiError);
    }
  };

  // Parse the VM object to a YAML string and back to remove undefined values
  const parsedVM = load(dump(vm)) as V1VirtualMachine;

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      <div className="yaml-body">
        <ResourceYAMLEditor initialResource={parsedVM} onSave={onSave} />
      </div>
      {error && (
        <div className="yaml-alert">
          <Alert
            title={t(
              'An error occured, The VirtualMachine was not updated. Click "Reload" to go back to the last valid state',
            )}
            isInline
            variant={AlertVariant.danger}
          >
            {error.message}
          </Alert>
        </div>
      )}
    </Suspense>
  );
};

export default CustomizeInstanceTypeYamlTab;
