import React, { FC, useState } from 'react';

import { NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import useIsACMPage from '@multicluster/useIsACMPage';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

import TabModal from '../TabModal/TabModal';

import SelectCluster from './components/SelectCluster';

type CreateNamespaceModalProps = {
  createdNamespace?: (value: K8sResourceCommon) => void;
  initialCluster?: string;
  isOpen: boolean;
  onClose: () => void;
};

const CreateNamespaceModal: FC<CreateNamespaceModalProps> = ({
  createdNamespace,
  initialCluster,
  isOpen,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const [name, setName] = useState<string>();
  const [cluster, setCluster] = useState<string>(initialCluster);

  const isACMPage = useIsACMPage();

  return (
    <TabModal<K8sResourceCommon>
      onSubmit={(data) =>
        kubevirtK8sCreate({
          cluster,
          data,
          model: NamespaceModel,
        }).then((value) => createdNamespace?.(value))
      }
      headerText={t('Create namespace')}
      isDisabled={isEmpty(name)}
      isOpen={isOpen}
      obj={{ metadata: { name } }}
      onClose={onClose}
      submitBtnText={t('Create')}
    >
      <Form>
        <FormGroup
          fieldId="namespace-name"
          isRequired
          label={t('Name')}
        >
          <TextInput
            id="namespace-name"
            isRequired
            name="namespace-name"
            onChange={(_event, value) => setName(value)}
            type="text"
            value={name}
          />
        </FormGroup>
        {isACMPage && (
          <FormGroup fieldId="cluster-name" label={t('Cluster')}>
            <SelectCluster selectedCluster={cluster} setSelectedCluster={setCluster} />
          </FormGroup>
        )}
      </Form>
    </TabModal>
  );
};

export default CreateNamespaceModal;
