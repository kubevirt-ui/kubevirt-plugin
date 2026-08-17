import React, { type FC, useState } from 'react';
import produce from 'immer';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { truncateToK8sName } from '@kubevirt-utils/utils/nameGenerators';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup, TextInput } from '@patternfly/react-core';

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
  const [newName, setNewName] = useState(() => truncateToK8sName(`${getName(object)}-clone`));

  const onSubmit = (): ReturnType<typeof kubevirtK8sCreate> => {
    const newObject = produce(object, (draftObject) => {
      draftObject.metadata = {};
      draftObject.metadata.name = newName;
      if (namespace) draftObject.metadata.namespace = namespace;
    });

    return kubevirtK8sCreate({
      cluster: object?.cluster,
      data: newObject,
      model,
    });
  };

  return (
    <TabModal
      {...modalProps}
      headerText={headerText ?? t('Clone {{kind}}', { kind: model?.kind })}
      onSubmit={onSubmit}
      shouldWrapInForm
    >
      <FormGroup isRequired label={t('Name')}>
        <TextInput onChange={(_event, val) => setNewName(val)} value={newName} />
      </FormGroup>
    </TabModal>
  );
};

export default CloneResourceModal;
