import * as React from 'react';
import { useParams } from 'react-router-dom';

import { WizardVMContextType } from '@catalog/utils/WizardVMContext';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, Button } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import EnvironmentEditor from './components/EnvironmentEditor';
import WizardEnvironmentTabFooter from './components/WizardEnvironmentTabFooter';
import WizardEnvironmentTabTitle from './components/WizardEnvironmentTabTitle';
import useEnvironments from './hook/useEnvironments';
import useEnvironmentsResources from './hook/useEnvironmentsResources';

const WizardEnvironmentTab: React.FC<WizardVMContextType> = ({
  vm,
  updateVM,
  setDisableVmCreate,
}) => {
  const { ns } = useParams<{ ns: string }>();
  const { t } = useKubevirtTranslation();

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

  React.useEffect(() => {
    setDisableVmCreate(edited);
    return () => setDisableVmCreate(false);
  }, [edited, setDisableVmCreate]);

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
      <WizardEnvironmentTabTitle />

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

      <WizardEnvironmentTabFooter
        error={loadError || formError}
        onSave={onSave}
        onReload={onReload}
        closeError={closeError}
        isSaveDisabled={!edited || !environments.every((env) => env.name)}
      />
    </div>
  );
};

export default WizardEnvironmentTab;
