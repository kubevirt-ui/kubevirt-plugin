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

import NamespaceMapping from '../../form/components/NamespaceMapping';
import { VMNetworkForm } from '../../form/constants';
import { isValidNamespaceMapping } from '../../utils';
import { getDefaultNamespaceMappingOption } from '../utils/utils';

export type EditNamespaceMappingModalProps = {
  closeModal?: () => void;
  obj: ClusterUserDefinedNetworkKind;
};

const EditNamespaceMappingModal: FC<EditNamespaceMappingModalProps> = ({ closeModal, obj }) => {
  const { t } = useKubevirtTranslation();
  const [apiError, setError] = useState<Error>(null);

  const methods = useForm<VMNetworkForm>({
    defaultValues: {
      network: obj,
      namespaceMappingOption: getDefaultNamespaceMappingOption(obj?.spec?.namespaceSelector),
    },
  });

  const {
    formState: { isSubmitting },
    handleSubmit,
    watch,
  } = methods;

  const namespaceSelector = watch('network.spec.namespaceSelector');
  const namespaceMappingOption = watch('namespaceMappingOption');

  const isSubmitDisabled =
    isSubmitting || !isValidNamespaceMapping(namespaceMappingOption, namespaceSelector);

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
      id="edit-namespace-mapping-modal"
      isOpen
      onClose={closeModal}
      position="top"
      variant={ModalVariant.small}
    >
      <ModalHeader
        description={t('Use the list of namespaces or the labels to specify qualifying namespaces.')}
        title={t('Edit namespaces mapping')}
      />
      <ModalBody>
        <FormProvider {...methods}>
          <Form id="edit-namespace-mapping-form">
            <Alert
              title={t(
                'Virtual machines in namespaces that are no longer enrolled will lose connectivity',
              )}
              isInline
              variant="warning"
            />
            <NamespaceMapping isEditModal />
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

export default EditNamespaceMappingModal;
