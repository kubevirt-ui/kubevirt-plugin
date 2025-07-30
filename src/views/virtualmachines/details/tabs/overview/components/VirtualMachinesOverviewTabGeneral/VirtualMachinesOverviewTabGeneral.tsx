import React, { FC } from 'react';

import {
  modelToGroupVersionKind,
  NamespaceModel,
  NodeModel,
  PodModel,
  VirtualMachineInstanceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
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
  const [canGetNode] = useFleetAccessReview({
    cluster: getCluster(vm),
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
            <VirtualMachineDescriptionItem
              bodyContent={t(
                'Namespace defines the space within which each name must be unique. An empty namespace is equivalent to the "default" namespace, but "default" is the canonical representation. Not all objects are required to be scoped to a namespace - the value of this field for those objects will be empty. Must be a DNS_LABEL. Cannot be updated. ',
              )}
              descriptionData={
                <FleetResourceLink
                  cluster={getCluster(vm)}
                  groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
                  name={getNamespace(vm)}
                />
              }
              breadcrumb="VirtualMachine.metadata.namespace"
              descriptionHeader={t('Namespace')}
              isPopover
              moreInfoURL={documentationURL.NAMESPACE_DOC}
            />
            {canGetNode && (
              <VirtualMachineDescriptionItem
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
            <VirtualMachineDescriptionItem
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

            <VirtualMachineDescriptionItem
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
