import React, { FC, Suspense, useState } from 'react';
import { dump, load } from 'js-yaml';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Bullseye } from '@patternfly/react-core';

import './YamlTab.scss';

const YamlTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const { setVM, vm } = useInstanceTypeVMStore();
  const [error, setError] = useState<Error>(null);

  const onSave = async (yaml: string) => {
    setError(null);
    try {
      await setVM(load(yaml) as V1VirtualMachine);
    } catch (apiError) {
      setError(apiError);
    }
  };

  if (isEmpty(vm))
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      <div className="yaml-body">
        <ResourceYAMLEditor initialResource={dump(vm)} onSave={onSave} />
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

export default YamlTab;
