import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ClusterNamespacedResourceMap,
  getResourceFromClusterMap,
} from '@kubevirt-utils/resources/shared';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getVMBootSourceLabel } from '@kubevirt-utils/resources/vm/utils/source';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { Badge, Label, Split, SplitItem } from '@patternfly/react-core';

import './VirtualMachineTemplatesSource.scss';

type VirtualMachineTemplatesSourceProps = {
  availableDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  cloneInProgressDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
  template: V1Template;
};

const VirtualMachineTemplatesSource: React.FC<VirtualMachineTemplatesSourceProps> = ({
  availableDataSources,
  availableTemplatesUID,
  cloneInProgressDataSources,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const bootSource = getTemplateBootSourceType(template);
  const dataSource = getResourceFromClusterMap(
    availableDataSources,
    getCluster(template),
    bootSource?.source?.sourceRef?.namespace,
    bootSource?.source?.sourceRef?.name,
  );
  const bootSourceLabel = getVMBootSourceLabel(bootSource?.type, dataSource);
  const isBootSourceAvailable = availableTemplatesUID.has(template?.metadata?.uid);

  const isCloningSource = !isEmpty(
    getResourceFromClusterMap(
      cloneInProgressDataSources,
      getCluster(template),
      bootSource?.source?.sourceRef?.namespace,
      bootSource?.source?.sourceRef?.name,
    ),
  );

  return (
    <Split hasGutter>
      <SplitItem className="virtual-machine-templates-source__boot-source-label">
        {bootSourceLabel}
      </SplitItem>
      {isBootSourceAvailable && (
        <SplitItem>
          <Badge key="available-boot">{t('Source available')}</Badge>
        </SplitItem>
      )}
      {isCloningSource && (
        <SplitItem>
          <Label>{t('Clone in progress')}</Label>
        </SplitItem>
      )}
    </Split>
  );
};

export default VirtualMachineTemplatesSource;
