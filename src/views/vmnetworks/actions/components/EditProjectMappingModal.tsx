import React, { FC, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClusterUserDefinedNetworkModel } from '@kubevirt-utils/models';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import ProjectMapping from '../../form/components/ProjectMapping';
import { VMNetworkForm } from '../../form/constants';
import { isValidProjectMapping } from '../../utils';
import { getDefaultProjectMappingOption } from '../utils/utils';

export type EditProjectMappingModalProps = {
  closeModal?: () => void;
  obj: ClusterUserDefinedNetworkKind;
};

const EditProjectMappingModal: FC<EditProjectMappingModalProps> = ({ closeModal, obj }) => {
  const { t } = useKubevirtTranslation();
  const [apiError, setError] = useState<Error>(null);

  const methods = useForm<VMNetworkForm>({
    defaultValues: {
      network: obj,
      projectMappingOption: getDefaultProjectMappingOption(obj?.spec?.namespaceSelector),
    },
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
    watch,
  } = methods;

  const namespaceSelector = watch('network.spec.namespaceSelector');
  const projectMappingOption = watch('projectMappingOption');

  const isSubmitDisabled =
    isSubmitting || !isValidProjectMapping(projectMappingOption, namespaceSelector);

  const onSubmit = async (data: VMNetworkForm) => {
    try {
      await k8sUpdate({
        data: data.network,
        model: ClusterUserDefinedNetworkModel,
      });
      closeModal();
    } catch (error) {
      setError(error);
    }
  };

  return (
    <Modal
      id="edit-project-mapping-modal"
      isOpen
      onClose={closeModal}
      position="top"
      variant={ModalVariant.small}
    >
      <ModalHeader
        description={t('Use the list of projects or the labels to specify qualifying projects.')}
        title={t('Edit projects mapping')}
      />
      <ModalBody>
        <FormProvider {...methods}>
          <Form id="edit-project-mapping-form">
            <Alert
              title={t(
                'Virtual machines in projects that are no longer enrolled will lose connectivity',
              )}
              isInline
              variant="warning"
            />
            <ProjectMapping isEditModal />
            {apiError && (
              <FormGroup>
                <ErrorAlert error={apiError} />
              </FormGroup>
            )}
          </Form>
        </FormProvider>
      </ModalBody>
      <ModalFooter>
        <Button isDisabled={isSubmitDisabled} onClick={handleSubmit(onSubmit)}>
          {t('Save')}
        </Button>
        <Button onClick={closeModal} variant="link">
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditProjectMappingModal;
