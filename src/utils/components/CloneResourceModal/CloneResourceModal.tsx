import React, { FC, useState } from 'react';
import produce from 'immer';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { k8sCreate, K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

type CloneResourceModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  isOpen: boolean;
  onClose: () => void;
  object: T;
  model: K8sModel;
  headerText?: string;
};

const CloneResourceModal: FC<CloneResourceModalProps> = ({
  object,
  model,
  headerText,
  ...modalProps
}) => {
  const { t } = useKubevirtTranslation();
  const [newName, setNewName] = useState(`${getName(object)}-clone-${getRandomChars(5)}`);

  const onSubmit = () => {
    const newObject = produce(object, (draftObject) => {
      draftObject.metadata = {};
      draftObject.metadata.name = newName;
    });

    return k8sCreate({
      model,
      data: newObject,
    });
  };

  return (
    <TabModal
      {...modalProps}
      headerText={headerText || t('Clone {{kind}}', { kind: model?.kind })}
      onSubmit={onSubmit}
    >
      <Form>
        <FormGroup label={t('Name')} isRequired>
          <TextInput value={newName} onChange={setNewName} />
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default CloneResourceModal;
