import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Button } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import EnvironmentEditor from './components/EnvironmentEditor';
import VirtualMachineEnvironmentTabFooter from './components/VirtualMachineEnvironmentTabFooter';
import VirtualMachineEnvironmentTabTitle from './components/VirtualMachineEnvironmentTabTitle';
import useEnvironments from './hooks/useEnvironments';
import useEnvironmentsResources from './hooks/useEnvironmentsResources';

type VirtualMachineEnvironmentPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1VirtualMachine;
};

const VirtualMachineEnvironmentPage: React.FC<VirtualMachineEnvironmentPageProps> = ({
  obj: vm,
}) => {
  const { t } = useKubevirtTranslation();
  const ns = vm?.metadata?.namespace;

  const updateVM = (updatedVM: V1VirtualMachine) =>
    k8sUpdate({
      model: VirtualMachineModel,
      data: updatedVM,
      ns: updatedVM.metadata.namespace,
      name: updatedVM.metadata.name,
    });

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
    onReload,
    onSave,
    edited,
    error: formError,
    setError,
  } = useEnvironments(vm, updateVM);

  if (!loaded)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  const environmentNamesSelected = environments.map((env) => env.name);

  const closeError = () => {
    setError(undefined);
  };

  return (
    <div className="co-m-pane__body">
      <VirtualMachineEnvironmentTabTitle />

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
          serial={environment.serial}
          kind={environment.kind}
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

      <VirtualMachineEnvironmentTabFooter
        error={loadError || formError}
        onSave={onSave}
        onReload={onReload}
        closeError={closeError}
        isSaveDisabled={!edited || !environments.every((env) => env.name)}
      />
    </div>
  );
};

export default VirtualMachineEnvironmentPage;
