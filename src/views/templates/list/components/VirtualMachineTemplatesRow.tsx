import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import ArchitectureLabel from '@kubevirt-utils/components/ArchitectureLabel/ArchitectureLabel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClusterNamespacedResourceMap } from '@kubevirt-utils/resources/shared';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getName } from '@kubevirt-utils/resources/shared';
import { getTemplateURL, isDeprecatedTemplate } from '@kubevirt-utils/resources/template';
import { ARCHITECTURE_ID, getArchitecture } from '@kubevirt-utils/utils/architecture';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  ResourceIcon,
  ResourceLink,
  RowProps,
  TableData,
} from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { FleetResourceLink, useHubClusterName } from '@stolostron/multicluster-sdk';

import VirtualMachineTemplatesActions from '../../actions/VirtualMachineTemplatesActions';
import { getWorkloadProfile } from '../../utils/selectors';
import { useVirtualMachineTemplatesCPUMemory } from '../hooks/useVirtualMachineTemplatesCPUMemory';

import VirtualMachineTemplatesSource from './VirtualMachineTemplatesSource/VirtualMachineTemplatesSource';

const VirtualMachineTemplatesRow: React.FC<
  RowProps<
    V1Template,
    {
      availableDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
      availableTemplatesUID: Set<string>;
      cloneInProgressDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
    }
  >
> = ({
  activeColumnIDs,
  obj,
  rowData: { availableDataSources, availableTemplatesUID, cloneInProgressDataSources },
}) => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();

  const namespace = getNamespace(obj);
  const cluster = getCluster(obj) || hubClusterName;
  const name = getName(obj);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id="name">
        <Link
          data-test={name}
          data-test-id={name}
          to={getTemplateURL(name, namespace, isACMPage ? cluster : undefined)}
        >
          <ResourceIcon groupVersionKind={modelToGroupVersionKind(TemplateModel)} />
          {name}
        </Link>

        {isDeprecatedTemplate(obj) && <Label isCompact>{t('Deprecated')}</Label>}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-10" id="cluster">
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(ManagedClusterModel)}
          name={cluster}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-10" id={ARCHITECTURE_ID}>
        <ArchitectureLabel architecture={getArchitecture(obj)} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="namespace">
        <FleetResourceLink cluster={cluster} kind="Namespace" name={namespace} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15" id="workload">
        {t(getWorkloadProfile(obj))}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-30" id="availability">
        <VirtualMachineTemplatesSource
          availableDataSources={availableDataSources}
          availableTemplatesUID={availableTemplatesUID}
          cloneInProgressDataSources={cloneInProgressDataSources}
          template={obj}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="cpu">
        {useVirtualMachineTemplatesCPUMemory(obj)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <VirtualMachineTemplatesActions isKebabToggle template={obj} />
      </TableData>
    </>
  );
};

export default VirtualMachineTemplatesRow;
