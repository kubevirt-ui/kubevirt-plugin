import React, { FC, Suspense, useState } from 'react';
import { dump, load } from 'js-yaml';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
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

  if (!vm) {
    return <Loading />;
  }

  const onSave = async (yaml: string) => {
    setError(null);
    try {
      updateCustomizeInstanceType([{ data: load(yaml) as V1VirtualMachine }]);
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

export default CustomizeInstanceTypeYamlTab;
