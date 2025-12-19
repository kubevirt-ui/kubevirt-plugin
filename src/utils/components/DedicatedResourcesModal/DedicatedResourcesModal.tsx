import React, { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import produce from 'immer';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDedicatedResourcesSearchHREF } from '@kubevirt-utils/components/DedicatedResourcesModal/utils/utils';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { getName, getUID } from '@kubevirt-utils/resources/shared';
import { getCPU } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Checkbox,
  FormGroup,
  Label,
  Popover,
} from '@patternfly/react-core';

import { cpuManagerLabel, cpuManagerLabelKey, cpuManagerLabelValue } from './utils/constants';

type DedicatedResourcesModalProps = {
  headerText: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DedicatedResourcesModal: FC<DedicatedResourcesModalProps> = ({
  headerText,
  isOpen,
  onClose,
  onSubmit,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = getCluster(vm);
  const [checked, setChecked] = useState<boolean>(!!getCPU(vm)?.dedicatedCpuPlacement);

  const [nodes, loaded, loadError] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster: cluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const { hasNodes, qualifiedNodes } = useMemo(() => {
    const filteredNodes = nodes?.filter(
      (node) => node?.metadata?.labels?.[cpuManagerLabelKey] === cpuManagerLabelValue,
    );
    return {
      hasNodes: !!filteredNodes?.length,
      qualifiedNodes: filteredNodes,
    };
  }, [nodes]);

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec.domain.cpu']);
      vmDraft.spec.template.spec.domain.cpu.dedicatedCpuPlacement = checked;
    });
    return updatedVM;
  }, [vm, checked]);
  return (
    <TabModal
      headerText={headerText}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
    >
      {vmi && <ModalPendingChangesAlert />}
      <FormGroup fieldId="dedicated-resources" isInline>
        <Checkbox
          description={
            <>
              {t('Available only on Nodes with labels')}{' '}
              <Label className="pf-v6-u-ml-xs" color="purple" variant="outline">
                {!isEmpty(nodes) ? (
                  <Link target="_blank" to={getDedicatedResourcesSearchHREF(cluster)}>
                    {cpuManagerLabel}
                  </Link>
                ) : (
                  cpuManagerLabel
                )}
              </Label>
            </>
          }
          id="dedicated-resources"
          isChecked={checked}
          label={t('Schedule this workload with dedicated resources (guaranteed policy)')}
          onChange={(_event, val) => setChecked(val)}
        />
      </FormGroup>
      <FormGroup fieldId="dedicated-resources-node">
        {!isEmpty(nodes) ? (
          <Alert
            title={
              hasNodes
                ? t('{{qualifiedNodesCount}} matching nodes found', {
                    qualifiedNodesCount: qualifiedNodes?.length,
                  })
                : t('No matching nodes found for the {{cpuManagerLabel}} label', {
                    cpuManagerLabel,
                  })
            }
            isInline
            variant={hasNodes ? AlertVariant.success : AlertVariant.warning}
          >
            {hasNodes ? (
              <Popover
                bodyContent={
                  <>
                    {qualifiedNodes?.map((node) => (
                      <MulticlusterResourceLink
                        cluster={getCluster(node)}
                        groupVersionKind={modelToGroupVersionKind(NodeModel)}
                        key={getUID(node)}
                        name={getName(node)}
                      />
                    ))}
                  </>
                }
                headerContent={t('{{qualifiedNodesCount}} nodes found', {
                  qualifiedNodesCount: qualifiedNodes?.length,
                })}
              >
                <Button isInline onClick={() => setChecked(false)} variant={ButtonVariant.link}>
                  {t('view {{qualifiedNodesCount}} matching nodes', {
                    qualifiedNodesCount: qualifiedNodes?.length,
                  })}
                </Button>
              </Popover>
            ) : (
              t('Scheduling will not be possible at this state')
            )}
          </Alert>
        ) : (
          !loaded && !loadError && <Loading />
        )}
      </FormGroup>
    </TabModal>
  );
};

export default DedicatedResourcesModal;
