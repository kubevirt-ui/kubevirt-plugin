import * as React from 'react';
import { Trans } from 'react-i18next';

import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sCreate, k8sDelete, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Checkbox, ModalVariant, Stack, StackItem } from '@patternfly/react-core';

import ExternalLink from '../ExternalLink/ExternalLink';
import TabModal from '../TabModal/TabModal';

import { NODE_PORTS_LINK } from './constants';
import { getSSHServiceFromVM } from './utils';

type SSHAccessModalProps = {
  name: string;
  namespace: string;
  resouceLabels: { [key: string]: string };
  isOpen: boolean;
  onClose: () => void;
  sshService: IoK8sApiCoreV1Service;
};

const SSHAccessModal: React.FC<SSHAccessModalProps> = ({
  name,
  namespace,
  resouceLabels,
  isOpen,
  onClose,
  sshService,
}) => {
  const { t } = useKubevirtTranslation();
  const initiallyEnabled = !!sshService;
  const [isEnabled, setEnabled] = React.useState<boolean>(initiallyEnabled);

  const onSubmit = async () => {
    const serviceResource = getSSHServiceFromVM(name, namespace, resouceLabels);

    if (initiallyEnabled === isEnabled) return;

    if (isEnabled) {
      await k8sCreate({
        model: ServiceModel,
        data: serviceResource,
        ns: namespace,
      });
    } else {
      await k8sDelete({
        model: ServiceModel,
        resource: serviceResource,
        name: sshService?.metadata?.name,
        ns: namespace,
      });

      window.location.reload();
    }
  };

  return (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={t('SSH Access')}
      submitBtnText={t('Save')}
      modalVariant={ModalVariant.medium}
    >
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            id="ssh-service-checkbox"
            className="kv-ssh-service-checkbox--main"
            label={
              <Trans ns="kubevirt-plugin" t={t}>
                Expose SSH access for{' '}
                <ResourceLink
                  inline
                  linkTo={false}
                  kind={VirtualMachineModel.kind}
                  name={name}
                  namespace={namespace}
                />
              </Trans>
            }
            isChecked={isEnabled}
            data-checked-state={isEnabled}
            onChange={setEnabled}
          />
        </StackItem>
        <StackItem>
          <Alert variant="info" isInline title={t('Node port')}>
            <div>
              {t('SSH access is using a node port. Node port requires additional port resources.')}
              <div>
                <ExternalLink text={t('Learn more')} href={NODE_PORTS_LINK} />
              </div>
            </div>
          </Alert>
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default SSHAccessModal;
