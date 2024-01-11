import React, { FC, useState } from 'react';
import produce from 'immer';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { k8sCreate, K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

type CloneResourceModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  headerText?: string;
  isOpen: boolean;
  model: K8sModel;
  namespace?: string;
  object: T;
  onClose: () => void;
};

const CloneResourceModal: FC<CloneResourceModalProps> = ({
  headerText,
  model,
  namespace,
  object,
  ...modalProps
}) => {
  const { t } = useKubevirtTranslation();
  const [newName, setNewName] = useState(`${getName(object)}-clone-${getRandomChars(5)}`);

  const onSubmit = () => {
    const newObject = produce(object, (draftObject) => {
      draftObject.metadata = {};
      draftObject.metadata.name = newName;
      if (namespace) draftObject.metadata.namespace = namespace;
    });

    return k8sCreate({
      data: newObject,
      model,
    });
  };

  return (
    <TabModal
      {...modalProps}
      headerText={headerText || t('Clone {{kind}}', { kind: model?.kind })}
      onSubmit={onSubmit}
    >
      <Form>
        <FormGroup isRequired label={t('Name')}>
          <TextInput onChange={setNewName} value={newName} />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default CloneResourceModal;
