import React, { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import produce from 'immer';
import { isDedicatedCPUPlacement } from 'src/views/templates/utils/utils';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  cpuManagerLabel,
  cpuManagerLabelKey,
  cpuManagerLabelValue,
} from '@kubevirt-utils/components/DedicatedResourcesModal/utils/constants';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel, V1Template } from '@kubevirt-utils/models';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Checkbox,
  Form,
  FormGroup,
  Label,
  Popover,
} from '@patternfly/react-core';

type DedicatedResourcesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedTemplate: V1Template) => Promise<V1Template | void>;
  template: V1Template;
};

const DedicatedResourcesModal: FC<DedicatedResourcesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const [checked, setChecked] = useState<boolean>(isDedicatedCPUPlacement(template));
  const [nodes, nodesLoaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
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

  const updatedTemplate = useMemo(() => {
    return produce<V1Template>(template, (templateDraft: V1Template) => {
      const draftVM = getTemplateVirtualMachineObject(templateDraft);
      ensurePath(draftVM, ['spec.template.spec.domain.cpu']);
      draftVM.spec.template.spec.domain.cpu.dedicatedCpuPlacement = checked;
    });
  }, [checked, template]);

  return (
    <TabModal
      headerText={t('Dedicated resources')}
      isOpen={isOpen}
      obj={updatedTemplate}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        <FormGroup fieldId="dedicated-resources" isInline>
          <Checkbox
            description={
              <>
                {t('Available only on Nodes with labels')}{' '}
                <Label className="pf-v6-u-ml-xs" color="purple" variant="outline">
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
            onChange={(_, check: boolean) => setChecked(check)}
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
            !loadError && !nodesLoaded && <Loading />
          )}
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default DedicatedResourcesModal;
