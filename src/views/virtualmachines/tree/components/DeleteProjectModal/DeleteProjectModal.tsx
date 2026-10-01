import { type FC, useCallback } from 'react';
import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ProjectModel, VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtK8sDelete, kubevirtK8sListItems } from '@multicluster/k8sRequests';
import { getVMListURL } from '@multicluster/urls';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Content } from '@patternfly/react-core';

type DeleteProjectModalProps = {
  cluster?: string;
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  resource: K8sResourceCommon & { cluster?: string };
};

const DeleteProjectModal: FC<DeleteProjectModalProps> = ({
  cluster,
  isOpen,
  namespace,
  onClose,
  resource,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  const onDeleteSubmit = useCallback(async (): Promise<void> => {
    const vms = await kubevirtK8sListItems({
      cluster,
      model: VirtualMachineModel,
      queryParams: { ns: namespace },
    });

    if (vms.length > 0) {
      throw new Error(t('The project contains VirtualMachines and cannot be deleted.'));
    }

    await kubevirtK8sDelete({ cluster, model: ProjectModel, resource });
    navigate(getVMListURL(cluster));
  }, [cluster, namespace, navigate, resource, t]);

  return (
    <DeleteModal
      body={
        <Content component="p">
          <Trans t={t}>
            This action cannot be undone. It will destroy all pods, services and other objects in
            the project <strong>{{ name: namespace }}</strong>.
          </Trans>
        </Content>
      }
      headerText={t('Delete project?')}
      isOpen={isOpen}
      obj={resource}
      onClose={onClose}
      onDeleteSubmit={onDeleteSubmit}
      requireNameConfirmation
      shouldRedirect={false}
    />
  );
};

export default DeleteProjectModal;
