import * as React from 'react';
import { Link } from 'react-router-dom';
import produce from 'immer';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  Checkbox,
  Form,
  FormGroup,
  Label,
  Popover,
} from '@patternfly/react-core';

import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedDedicatedResources } from '../PendingChanges/utils/helpers';

import { cpuManagerLabel, cpuManagerLabelKey, cpuManagerLabelValue } from './utils/constants';

type DedicatedResourcesModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  headerText: string;
  vmi?: V1VirtualMachineInstance;
};

const DedicatedResourcesModal: React.FC<DedicatedResourcesModalProps> = ({
  vm,
  isOpen,
  onClose,
  onSubmit,
  headerText,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [checked, setChecked] = React.useState<boolean>(
    !!vm?.spec?.template?.spec?.domain?.cpu?.dedicatedCpuPlacement,
  );

  const [nodes, loaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const { qualifiedNodes, hasNodes } = React.useMemo(() => {
    const filteredNodes = nodes?.filter(
      (node) => node?.metadata?.labels?.[cpuManagerLabelKey] === cpuManagerLabelValue,
    );
    return {
      qualifiedNodes: filteredNodes,
      hasNodes: !!filteredNodes?.length,
    };
  }, [nodes]);

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['vm.spec.template.spec.domain.cpu']);
      vmDraft.spec.template.spec.domain.cpu.dedicatedCpuPlacement = checked;
    });
    return updatedVM;
  }, [vm, checked]);
  return (
    <TabModal
      obj={updatedVirtualMachine}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={headerText}
    >
      <Form>
        {vmi && (
          <ModalPendingChangesAlert
            isChanged={getChangedDedicatedResources(updatedVirtualMachine, vmi, checked)}
          />
        )}
        <FormGroup fieldId="dedicated-resources" isInline>
          <Checkbox
            id="dedicated-resources"
            isChecked={checked}
            onChange={setChecked}
            label={t('Schedule this workload with dedicated resources (guaranteed policy)')}
            description={
              <>
                {t('Available only on Nodes with labels')}{' '}
                <Label variant="filled" color="purple">
                  {!isEmpty(nodes) ? (
                    <Link
                      to={`/search?kind=${NodeModel.kind}&q=${encodeURIComponent(cpuManagerLabel)}`}
                      target="_blank"
                    >
                      {cpuManagerLabel}
                    </Link>
                  ) : (
                    cpuManagerLabel
                  )}
                </Label>
              </>
            }
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
              variant={hasNodes ? AlertVariant.success : AlertVariant.warning}
              isInline
            >
              {hasNodes ? (
                <Popover
                  headerContent={t('{{qualifiedNodesCount}} nodes found', {
                    qualifiedNodesCount: qualifiedNodes?.length,
                  })}
                  bodyContent={
                    <>
                      {qualifiedNodes?.map((node) => (
                        <ResourceLink
                          key={node.metadata.uid}
                          groupVersionKind={modelToGroupVersionKind(NodeModel)}
                          name={node.metadata.name}
                        />
                      ))}
                    </>
                  }
                >
                  <Button variant="link" isInline onClick={() => setChecked(false)}>
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
      </Form>
    </TabModal>
  );
};

export default DedicatedResourcesModal;
