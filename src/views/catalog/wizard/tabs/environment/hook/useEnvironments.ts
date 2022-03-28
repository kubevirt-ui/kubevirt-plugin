import * as React from 'react';

import { UpdateValidatedVM } from '@catalog/utils/WizardVMContext';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { EnvironmentKind, EnvironmentVariable } from '../constants';
import { addEnvironmentsToVM, getRandomSerial, getVMEnvironmentsVariables } from '../utils';

type UseEnvironmentsType = {
  onSave: () => void;
  onReload: () => void;
  onEnvironmentRemove: (index: number) => void;
  onEnvironmentChange: (
    index: number,
    value: string,
    serial: string,
    kind: EnvironmentKind,
  ) => void;
  onEnvironmentAdd: () => void;
  edited: boolean;
  environments: EnvironmentVariable[];
  error: Error;
  setError: (error: Error | undefined) => void;
};

const useEnvironments = (
  vm: V1VirtualMachine,
  updateVM: UpdateValidatedVM,
): UseEnvironmentsType => {
  const initialEnvironments = React.useMemo(() => getVMEnvironmentsVariables(vm), [vm]);
  const [environments, setEnvironments] = React.useState(initialEnvironments);
  const [environmentsEdited, setEnvironmentsEdited] = React.useState(false);
  const [error, setError] = React.useState<Error>();

  const onEnvironmentAdd = React.useCallback(() => {
    setEnvironments((envs) =>
      envs.concat([{ name: undefined, serial: getRandomSerial().toUpperCase(), kind: undefined }]),
    );
  }, []);

  const onEnvironmentChange = React.useCallback(
    (environmentIndex: number, name: string, serial: string, kind: EnvironmentKind) => {
      if (environments.find((env, index) => env.name === name && index !== environmentIndex)) {
        return setError(new Error('Resource already selected'));
      }

      setEnvironments((envs) => {
        const newEnvironments = [...envs];
        newEnvironments.splice(environmentIndex, 1, { name, serial: serial || '', kind });
        return newEnvironments;
      });
    },
    [environments],
  );

  const onEnvironmentRemove = React.useCallback((environmentIndex: number) => {
    setEnvironments((envs) => envs.filter((_, index) => index !== environmentIndex));
  }, []);

  const onReload = React.useCallback(() => {
    setEnvironments(initialEnvironments);
  }, [initialEnvironments]);

  const onSave = React.useCallback(async () => {
    await updateVM(addEnvironmentsToVM(vm, environments));
  }, [environments, updateVM, vm]);

  React.useEffect(() => {
    const unchanged = environments.every(
      ({ name, serial }, index) =>
        initialEnvironments?.[index]?.name === name &&
        initialEnvironments?.[index]?.serial === serial,
    );
    setEnvironmentsEdited(!unchanged || environments.length !== initialEnvironments.length);
  }, [environments, initialEnvironments]);

  return {
    onSave,
    onReload,
    onEnvironmentRemove,
    onEnvironmentChange,
    onEnvironmentAdd,
    edited: environmentsEdited,
    environments,
    error,
    setError,
  };
};

export default useEnvironments;
