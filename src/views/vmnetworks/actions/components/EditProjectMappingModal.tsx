import React, { type FC, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClusterUserDefinedNetworkModel } from '@kubevirt-utils/models';
import { type ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
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
import { type VMNetworkForm } from '../../form/constants';
import { isValidProjectMapping } from '../../utils';
import { getDefaultProjectMappingOption } from '../utils/utils';

export type EditProjectMappingModalProps = {
  closeModal?: () => void;
  obj: ClusterUserDefinedNetworkKind;
};

const EditProjectMappingModal: FC<EditProjectMappingModalProps> = ({ closeModal, obj }) => {
  const { t } = useKubevirtTranslation();
  const [apiError, setApiError] = useState<Error>(null);

  const methods = useForm<VMNetworkForm>({
    defaultValues: {
      network: obj,
      projectMappingOption: getDefaultProjectMappingOption(obj?.spec?.namespaceSelector),
    },
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
  } = methods;

  const namespaceSelector = useWatch({
    control: methods.control,
    name: 'network.spec.namespaceSelector',
  });
  const projectMappingOption = useWatch({
    control: methods.control,
    name: 'projectMappingOption',
  });

  const isSubmitDisabled =
    isSubmitting || !isValidProjectMapping(projectMappingOption, namespaceSelector);

  const onSubmit = async (data: VMNetworkForm): Promise<void> => {
    try {
      await k8sUpdate({
        data: data.network,
        model: ClusterUserDefinedNetworkModel,
      });
      closeModal();
    } catch (error) {
      setApiError(error as Error);
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
              isInline
              title={t(
                'Virtual machines in projects that are no longer enrolled will lose connectivity',
              )}
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
