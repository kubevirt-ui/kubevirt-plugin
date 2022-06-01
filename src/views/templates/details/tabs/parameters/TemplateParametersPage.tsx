import * as React from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { useImmer } from 'use-immer';

import { TemplateModel, TemplateParameter, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { ActionGroup, Alert, AlertVariant, Button, Divider } from '@patternfly/react-core';

import { isCommonVMTemplate } from '../../../utils';

import ParameterEditor from './ParameterEditor';

import './template-parameters-page.scss';

type TemplateParametersPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1Template;
};

const TemplateParametersPage: React.FC<TemplateParametersPageProps> = ({ obj: template }) => {
  const { t } = useKubevirtTranslation();
  const isEditDisabled = isCommonVMTemplate(template);
  const history = useHistory();
  const [parameters, updateParameters] = useImmer<TemplateParameter[]>(template.parameters);
  const [error, setError] = React.useState();
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const isSaveDisabled =
    JSON.stringify(template.parameters) === JSON.stringify(parameters) || isEditDisabled;

  const onParameterChange = (parameter: TemplateParameter) => {
    updateParameters((draftParameters) => {
      const parameterIndex = draftParameters.findIndex((p) => p.name === parameter.name);
      draftParameters[parameterIndex] = parameter;
    });
  };

  const goBack = React.useCallback(() => {
    history.goBack();
  }, [history]);

  const onSave = async () => {
    setLoading(true);
    try {
      await k8sPatch({
        model: TemplateModel,
        resource: template,
        data: [
          {
            op: 'replace',
            path: '/parameters',
            value: parameters,
          },
        ],
      });
      setSuccess(true);
    } catch (apiError) {
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="co-m-pane__body template-parameters-page">
      <div className="row">
        <div className="col-md-7">
          {parameters.map((parameter, index) => (
            <>
              <ParameterEditor
                key={parameter.name}
                parameter={parameter}
                onChange={onParameterChange}
                isEditDisabled={isEditDisabled}
              />
              {index !== parameters.length - 1 && <Divider />}
            </>
          ))}
        </div>
      </div>
      {error && (
        <Alert variant={AlertVariant.danger} isInline title={t('Error')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant={AlertVariant.info} isInline title={t('Success')}>
          {t('Parameters successfully edited')}
        </Alert>
      )}
      <ActionGroup className="pf-c-form">
        <Button
          isDisabled={isSaveDisabled}
          type="submit"
          variant="primary"
          onClick={onSave}
          isLoading={loading}
        >
          {t('Save')}
        </Button>
        <Button type="button" variant="secondary" onClick={goBack}>
          {t('Cancel')}
        </Button>
      </ActionGroup>
    </div>
  );
};

export default TemplateParametersPage;
