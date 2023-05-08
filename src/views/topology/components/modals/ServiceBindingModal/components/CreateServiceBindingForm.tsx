import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { FormikProps, FormikValues } from 'formik';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { FormSection, TextInputTypes, Title } from '@patternfly/react-core';

import { K8sResourceKind } from '../../../../../clusteroverview/utils/types';

import BindableServices from './BindableServices/BindableServices';

export type CreateServiceBindingFormProps = {
  source: K8sResourceKind;
  target?: K8sResourceKind;
  cancel?: () => void;
};

const CreateServiceBindingForm: React.FC<
  FormikProps<FormikValues> & CreateServiceBindingFormProps
> = ({ source, target, handleSubmit, isSubmitting, cancel, status, errors }) => {
  const { t } = useKubevirtTranslation();

  const sourceName = source.metadata.name;
  const targetName = target?.metadata?.name;

  const title = target ? (
    <Trans t={t} ns="console-app">
      Connect <b>{{ sourceName }}</b> to service <b>{{ targetName }}</b>.
    </Trans>
  ) : (
    t('console-app~Select a service to connect to.')
  );

  return (
    <form onSubmit={handleSubmit} className="modal-content">
      <ModalTitle>{t('console-app~Create Service Binding')}</ModalTitle>
      <ModalBody>
        <Title headingLevel="h2" size="md" className="co-m-form-row">
          {title}
        </Title>
        <FormSection fullWidth>
          <InputField
            type={TextInputTypes.text}
            name="name"
            label={t('console-app~Name')}
            required
          />
          {!target && <BindableServices resource={source} />}
        </FormSection>
      </ModalBody>
      <ModalSubmitFooter
        submitText={t('console-app~Create')}
        submitDisabled={isSubmitting || !isEmpty(errors)}
        cancel={cancel}
        inProgress={isSubmitting}
        errorMessage={status?.submitError}
      />
    </form>
  );
};

export default CreateServiceBindingForm;
