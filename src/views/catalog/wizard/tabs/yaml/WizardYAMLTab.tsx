import * as React from 'react';
import { load } from 'js-yaml';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Bullseye } from '@patternfly/react-core';

import { WizardVMContextType } from '../../../utils/WizardVMContext';

import './WizardYAMLTab.scss';

const WizardYAMLTab: React.FC<WizardVMContextType> = ({ vm, updateVM, setDisableVmCreate }) => {
  const { t } = useKubevirtTranslation();
  const [error, setError] = React.useState<any>();

  const onSave = (yaml: string) => {
    setError(undefined);
    updateVM(load(yaml) as V1VirtualMachine).catch(setError);
  };

  React.useEffect(() => {
    setDisableVmCreate(!!error);
    return () => setDisableVmCreate(false);
  }, [error, setDisableVmCreate]);

  return (
    <React.Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      <ResourceYAMLEditor initialResource={vm} onSave={onSave} />
      {error && (
        <div className="wizard-yaml-error-alert">
          <Alert
            isInline
            variant={AlertVariant.danger}
            title={t(
              'An error occured, The VirtualMachine was not updated. Click "Reload" to go back to the last valid state',
            )}
          >
            {error.message}
          </Alert>
        </div>
      )}
    </React.Suspense>
  );
};

export default WizardYAMLTab;
