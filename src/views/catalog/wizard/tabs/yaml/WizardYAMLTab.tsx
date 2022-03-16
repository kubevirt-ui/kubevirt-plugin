import * as React from 'react';

import { WizardVMContextType } from '@catalog/utils/WizardVMContext';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import YAMLEditor from '@kubevirt-utils/components/YAMLEditor/YAMLEditor';
import { Bullseye } from '@patternfly/react-core';

const WizardYAMLTab: React.FC<WizardVMContextType> = ({ vm, updateVM, setDisableVmCreate }) => {
  const onChange = React.useCallback(() => {
    setDisableVmCreate(true);
  }, [setDisableVmCreate]);

  const onSave = React.useCallback(
    async (newObject) => {
      await updateVM(newObject);
      setDisableVmCreate(false);
    },
    [setDisableVmCreate, updateVM],
  );

  return (
    <React.Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      <YAMLEditor object={vm} onSave={onSave} onChange={onChange} />
    </React.Suspense>
  );
};

export default WizardYAMLTab;
