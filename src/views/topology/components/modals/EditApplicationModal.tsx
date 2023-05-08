import React, { FC } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Formik, FormikProps, FormikValues } from 'formik';

import {
  createModalLauncher,
  ModalBody,
  ModalSubmitFooter,
  ModalTitle,
} from '@console/internal/components/factory/modal';
import { K8sKind } from '@openshift-console/dynamic-plugin-sdk';
import { Title } from '@patternfly/react-core';

import { K8sResourceKind } from '../../../clusteroverview/utils/types';
import { UNASSIGNED_KEY } from '../../const';
import { updateResourceApplication } from '../../utils';
import ApplicationSelector from '../dropdowns/ApplicationSelector';
import PromiseComponent from '../utils/PromiseComponent';

type EditApplicationFormProps = {
  resource: K8sResourceKind;
  initialApplication: string;
  cancel?: () => void;
};

type EditApplicationModalState = {
  inProgress: boolean;
  errorMessage: string;
};

type EditApplicationModalProps = EditApplicationFormProps & {
  resourceKind: K8sKind;
  close?: () => void;
};

const EditApplicationForm: FC<FormikProps<FormikValues> & EditApplicationFormProps> = ({
  resource,
  handleSubmit,
  isSubmitting,
  cancel,
  values,
  initialApplication,
  status,
}) => {
  const { t } = useTranslation();
  const dirty = values?.application?.selectedKey !== initialApplication;
  return (
    <form onSubmit={handleSubmit} className="modal-content">
      <ModalTitle>{t('kubevirt-plugin~Edit application grouping')}</ModalTitle>
      <ModalBody>
        <Title headingLevel="h2" size="md" className="co-m-form-row">
          <Trans ns="topology">
            Select an Application group to add the component{' '}
            <strong>{{ resourceName: resource.metadata.name }}</strong> to
          </Trans>
        </Title>
        <div className="pf-c-form">
          <ApplicationSelector namespace={resource.metadata.namespace} />
        </div>
      </ModalBody>
      <ModalSubmitFooter
        submitText={t('kubevirt-plugin~Save')}
        submitDisabled={!dirty || isSubmitting}
        cancel={cancel}
        inProgress={isSubmitting}
        errorMessage={status && status.submitError}
      />
    </form>
  );
};

class EditApplicationModal extends PromiseComponent<
  EditApplicationModalProps,
  EditApplicationModalState
> {
  private handleSubmit = (values, actions) => {
    const { resourceKind, resource } = this.props;
    const applicationKey = values.application.selectedKey;
    const application = applicationKey === UNASSIGNED_KEY ? undefined : values.application.name;

    return this.handlePromise(updateResourceApplication(resourceKind, resource, application))
      .then(() => {
        this.props.close();
      })
      .catch((errorMessage) => {
        actions.setStatus({ submitError: errorMessage });
      });
  };

  render() {
    const { resource } = this.props;
    const application = resource?.metadata?.labels?.['app.kubernetes.io/part-of'];

    const initialValues = {
      application: {
        name: application,
        selectedKey: application || UNASSIGNED_KEY,
      },
    };
    return (
      <Formik initialValues={initialValues} onSubmit={this.handleSubmit}>
        {(formikProps) => (
          <EditApplicationForm {...formikProps} {...this.props} initialApplication={application} />
        )}
      </Formik>
    );
  }
}

export const editApplicationModal = createModalLauncher((props: EditApplicationModalProps) => (
  <EditApplicationModal {...props} />
));
