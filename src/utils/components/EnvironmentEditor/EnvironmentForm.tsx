import React, { FC, useEffect, useMemo } from 'react';
import { useImmer } from 'use-immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, ButtonVariant, Form } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import EnvironmentEditor from './components/EnvironmentEditor';
import EnvironmentFormActions from './components/EnvironmentFormActions';
import EnvironmentFormSkeleton from './components/EnvironmentFormSkeleton';
import EnvironmentFormTitle from './components/EnvironmentFormTitle';
import useEnvironments from './hooks/useEnvironments';

import './EnvironmentForm.scss';

type EnvironmentFormProps = {
  onEditChange?: (edited: boolean) => void;
  updateVM: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
};

const EnvironmentForm: FC<EnvironmentFormProps> = ({ onEditChange, updateVM, vm }) => {
  const [temporaryVM, setTemporaryVM] = useImmer(vm);

  const { t } = useKubevirtTranslation();

  const {
    edited,
    environments,
    error: formError,
    onEnvironmentAdd,
    onEnvironmentChange,
    onEnvironmentRemove,
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

  if (isEmpty(vm)) return <EnvironmentFormSkeleton />;

  return (
    <>
      <EnvironmentFormTitle />
      <Form className="environment-form__form">
        {environments.length !== 0 && (
          <div className="row pairs-list__heading">
            <div
              className="col-xs-5 pf-v6-u-text-color-subtle text-uppercase"
              id="environment-name-header"
            >
              {t('config map / secret / service account')}
            </div>
            <div
              className="col-xs-5 pf-v6-u-text-color-subtle text-uppercase"
              id="environment-serial-header"
            >
              {t('Serial Number')}
            </div>
            <div className="col-xs-1 co-empty__header" />
          </div>
        )}

        {environments.map((environment, index) => (
          <EnvironmentEditor
            diskName={environment.diskName}
            environmentName={environment.name}
            environmentNamesSelected={environmentNamesSelected}
            id={index}
            key={environment.name}
            kind={environment.kind}
            namespace={getNamespace(vm)}
            onChange={onEnvironmentChange}
            onRemove={onEnvironmentRemove}
            serial={environment?.serial}
          />
        ))}

        <div className="row">
          <div className="col-xs-12">
            <Button
              className="pf-m-link--align-left"
              icon={<PlusCircleIcon />}
              onClick={onEnvironmentAdd}
              type="button"
              variant={ButtonVariant.link}
            >
              {t('Add Config Map, Secret or Service Account')}
            </Button>
          </div>
        </div>

        <EnvironmentFormActions
          onReload={() =>
            setTemporaryVM((draftVM) => {
              draftVM.spec = vm.spec;
            })
          }
          closeError={() => setFormError(null)}
          error={formError}
          isSaveDisabled={!edited || !environments.every((env) => env.name)}
          onSave={() => updateVM(temporaryVM)}
        />
      </Form>
    </>
  );
};

export default EnvironmentForm;
