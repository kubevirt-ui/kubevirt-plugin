import React, { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { load } from 'js-yaml';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import {
  TELEMETRY_RESOURCE_CREATION_METHOD,
  TELEMETRY_RESOURCE_TYPE,
  TELEMETRY_VM_CREATION_METHOD,
} from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import {
  logVMCreated,
  logVMCreationFailed,
} from '@kubevirt-utils/extensions/telemetry/vm-creation';
import { logResourceCreated } from '@kubevirt-utils/extensions/telemetry/yaml-vs-ui';
import useIsIPv6SingleStackCluster from '@kubevirt-utils/hooks/useIPStackType/useIsIPv6SingleStackCluster';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getVMListPath } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { getVMURL } from '@multicluster/urls';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import { defaultVMYamlTemplate } from '../../../templates';

const VirtualMachineYAMLCreatePage: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { cluster, ns: namespace } = useParams<{ cluster?: string; ns: string }>();
  const isIPv6SingleStack = useIsIPv6SingleStackCluster(cluster);
  const [error, setError] = useState<Error | null>(null);

  const onSave = async (yaml: string) => {
    setError(null);
    try {
      const vm = load(yaml) as V1VirtualMachine;
      const createdVM = await kubevirtK8sCreate({
        cluster,
        data: vm,
        model: VirtualMachineModel,
        ns: namespace,
      });

      logResourceCreated(TELEMETRY_RESOURCE_TYPE.VM, TELEMETRY_RESOURCE_CREATION_METHOD.YAML);
      logVMCreated(TELEMETRY_VM_CREATION_METHOD.SCRATCH);

      const vmCluster = getCluster(createdVM) || cluster;
      navigate(
        vmCluster
          ? getVMURL(vmCluster, namespace, getName(createdVM))
          : `${getVMListPath(namespace)}/${getName(createdVM)}`,
      );
    } catch (apiError) {
      logVMCreationFailed(TELEMETRY_VM_CREATION_METHOD.SCRATCH, apiError);
      setError(apiError as Error);
    }
  };

  return (
    <>
      <ResourceYAMLEditor
        create
        header={t('Create VirtualMachine')}
        initialResource={defaultVMYamlTemplate(isIPv6SingleStack)}
        onSave={onSave}
      />
      {error && <ErrorAlert error={error} />}
    </>
  );
};

export default VirtualMachineYAMLCreatePage;
