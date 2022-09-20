import React, { FC, useEffect, useMemo } from 'react';
import { useImmer } from 'use-immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Form } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import SidebarEditor from '../SidebarEditor/SidebarEditor';

import EnvironmentEditor from './components/EnvironmentEditor';
import EnvironmentFormActions from './components/EnvironmentFormActions';
import EnvironmentFormSkeleton from './components/EnvironmentFormSkeleton';
import EnvironmentFormTitle from './components/EnvironmentFormTitle';
import useEnvironments from './hooks/useEnvironments';
import useEnvironmentsResources from './hooks/useEnvironmentsResources';

type EnvironmentFormProps = {
  vm: V1VirtualMachine;
  onEditChange?: (edited: boolean) => void;
  updateVM: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
};

const EnvironmentForm: FC<EnvironmentFormProps> = ({ vm, onEditChange, updateVM }) => {
  const [temporaryVM, setTemporaryVM] = useImmer(vm);

  const { t } = useKubevirtTranslation();
  const ns = vm?.metadata?.namespace;

  const {
    secrets,
    configMaps,
    serviceAccounts,
    loaded,
    error: loadError,
  } = useEnvironmentsResources(ns);

  const {
    environments,
    onEnvironmentAdd,
    onEnvironmentChange,
    onEnvironmentRemove,
    edited,
    error: formError,
    setError: setFormError,
  } = useEnvironments(temporaryVM, vm, setTemporaryVM, onEditChange);

  useEffect(() => {
    setTemporaryVM(vm);
    setFormError(null);
  }, [setFormError, setTemporaryVM, vm]);

  const environmentNamesSelected = useMemo(
    () => environments.map((env) => env.name),
    [environments],
  );

  if (!loaded) return <EnvironmentFormSkeleton />;

  return (
    <SidebarEditor<V1VirtualMachine> resource={temporaryVM} onChange={setTemporaryVM}>
      <Form>
        <EnvironmentFormTitle />
        {environments.length !== 0 && (
          <div className="row pairs-list__heading">
            <div className="col-xs-5 text-secondary text-uppercase" id="environment-name-header">
              {t('config map / secret / service account')}
            </div>
            <div className="col-xs-5 text-secondary text-uppercase" id="environment-serial-header">
              {t('Serial Number')}
            </div>
            <div className="col-xs-1 co-empty__header" />
          </div>
        )}

        {environments.map((environment, index) => (
          <EnvironmentEditor
            key={environment.name}
            environmentName={environment.name}
            serial={environment?.serial}
            kind={environment.kind}
            diskName={environment.diskName}
            secrets={secrets}
            configMaps={configMaps}
            serviceAccounts={serviceAccounts}
            onChange={onEnvironmentChange}
            onRemove={onEnvironmentRemove}
            id={index}
            environmentNamesSelected={environmentNamesSelected}
          />
        ))}

        <div className="row">
          <div className="col-xs-12">
            <Button
              className="pf-m-link--align-left"
              onClick={onEnvironmentAdd}
              type="button"
              variant="link"
            >
              <PlusCircleIcon /> {t('Add Config Map, Secret or Service Account')}
            </Button>
          </div>
        </div>

        <EnvironmentFormActions
          error={loadError || formError}
          onSave={() => updateVM(temporaryVM)}
          onReload={() =>
            setTemporaryVM((draftVM) => {
              draftVM.spec = vm.spec;
            })
          }
          closeError={() => setFormError(null)}
          isSaveDisabled={!edited || !environments.every((env) => env.name)}
        />
      </Form>
    </SidebarEditor>
  );
};

export default EnvironmentForm;
