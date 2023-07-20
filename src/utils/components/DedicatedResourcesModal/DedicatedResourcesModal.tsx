import * as React from 'react';
import { Link } from 'react-router-dom';
import produce from 'immer';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { ensurePath } from '@kubevirt-utils/utils/utils';
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

import { cpuManagerLabel, cpuManagerLabelKey, cpuManagerLabelValue } from './utils/constants';

type DedicatedResourcesModalProps = {
  headerText: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DedicatedResourcesModal: React.FC<DedicatedResourcesModalProps> = ({
  headerText,
  isOpen,
  onClose,
  onSubmit,
  vm,
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

  const { hasNodes, qualifiedNodes } = React.useMemo(() => {
    const filteredNodes = nodes?.filter(
      (node) => node?.metadata?.labels?.[cpuManagerLabelKey] === cpuManagerLabelValue,
    );
    return {
      hasNodes: !!filteredNodes?.length,
      qualifiedNodes: filteredNodes,
    };
  }, [nodes]);

  const updatedVirtualMachine = React.useMemo(() => {
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
    >
      <Form>
        {vmi && <ModalPendingChangesAlert />}
        <FormGroup fieldId="dedicated-resources" isInline>
          <Checkbox
            description={
              <>
                {t('Available only on Nodes with labels')}{' '}
                <Label color="purple" variant="filled">
                  {!isEmpty(nodes) ? (
                    <Link
                      target="_blank"
                      to={`/search?kind=${NodeModel.kind}&q=${encodeURIComponent(cpuManagerLabel)}`}
                    >
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
            onChange={setChecked}
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
                        <ResourceLink
                          groupVersionKind={modelToGroupVersionKind(NodeModel)}
                          key={node.metadata.uid}
                          name={node.metadata.name}
                        />
                      ))}
                    </>
                  }
                  headerContent={t('{{qualifiedNodesCount}} nodes found', {
                    qualifiedNodesCount: qualifiedNodes?.length,
                  })}
                >
                  <Button isInline onClick={() => setChecked(false)} variant="link">
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
