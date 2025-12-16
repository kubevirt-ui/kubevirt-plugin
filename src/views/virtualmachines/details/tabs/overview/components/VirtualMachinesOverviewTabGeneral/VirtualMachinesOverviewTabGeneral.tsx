import React, { FC } from 'react';

import {
  modelToGroupVersionKind,
  NodeModel,
  PodModel,
  VirtualMachineInstanceModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItemNamespace from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemNamespace';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { K8sResourceCommon, K8sVerb } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardTitle, DescriptionList, Divider } from '@patternfly/react-core';
import { FleetResourceLink, useFleetAccessReview } from '@stolostron/multicluster-sdk';

import './virtual-machines-overview-tab-general.scss';

type VirtualMachinesOverviewTabGeneralProps = {
  pods: K8sResourceCommon[];
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabGeneral: FC<VirtualMachinesOverviewTabGeneralProps> = ({
  pods,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = getCluster(vm);
  const [canGetNode] = useFleetAccessReview({
    cluster,
    namespace: vm?.metadata?.namespace,
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });
  const pod = getVMIPod(vmi, pods);

  return (
    <div className="VirtualMachinesOverviewTabGeneral--main">
      <Card>
        <CardTitle className="pf-v6-u-text-color-subtle">{t('General')}</CardTitle>
        <Divider />
        <CardBody isFilled>
          <DescriptionList isHorizontal>
            {cluster && (
              <DescriptionItem
                descriptionData={
                  <MulticlusterResourceLink
                    cluster={cluster}
                    groupVersionKind={modelToGroupVersionKind(ManagedClusterModel)}
                    name={cluster}
                    truncate
                  />
                }
                data-test-id="virtual-machine-overview-general-cluster"
                descriptionHeader={t('Cluster')}
              />
            )}
            <DescriptionItemNamespace model={VirtualMachineModel} resource={vm} />
            {canGetNode && (
              <DescriptionItem
                descriptionData={
                  vmi?.status?.nodeName ? (
                    <FleetResourceLink
                      cluster={getCluster(vmi)}
                      groupVersionKind={modelToGroupVersionKind(NodeModel)}
                      name={vmi?.status?.nodeName}
                    />
                  ) : (
                    NO_DATA_DASH
                  )
                }
                descriptionHeader={t('Node')}
              />
            )}
            <DescriptionItem
              descriptionData={
                vmi?.metadata?.name ? (
                  <FleetResourceLink
                    cluster={getCluster(vmi)}
                    groupVersionKind={VirtualMachineInstanceModelGroupVersionKind}
                    name={getName(vmi)}
                    namespace={getNamespace(vmi)}
                  />
                ) : (
                  NO_DATA_DASH
                )
              }
              descriptionHeader={t('VirtualMachineInstance')}
            />

            <DescriptionItem
              descriptionData={
                pod?.metadata?.name ? (
                  <FleetResourceLink
                    cluster={getCluster(pod)}
                    groupVersionKind={modelToGroupVersionKind(PodModel)}
                    name={getName(pod)}
                    namespace={getNamespace(pod)}
                  />
                ) : (
                  NO_DATA_DASH
                )
              }
              descriptionHeader={t('Pod')}
            />
            <OwnerDetailsItem obj={vm} />
          </DescriptionList>
        </CardBody>
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabGeneral;
