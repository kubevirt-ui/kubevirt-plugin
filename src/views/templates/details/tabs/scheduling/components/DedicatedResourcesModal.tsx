import * as React from 'react';
import { Link } from 'react-router-dom';
import produce from 'immer';
import { isDedicatedCPUPlacement } from 'src/views/templates/utils';

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

type DedicatedResourcesModalProps = {
  template: V1Template;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedTemplate: V1Template) => Promise<V1Template | void>;
};

const DedicatedResourcesModal: React.FC<DedicatedResourcesModalProps> = ({
  template,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const [checked, setChecked] = React.useState<boolean>(isDedicatedCPUPlacement(template));
  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
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

  const updatedTemplate = React.useMemo(() => {
    return produce<V1Template>(template, (templateDraft: V1Template) => {
      templateDraft.objects[0].spec.template.spec.domain.cpu.dedicatedCpuPlacement = checked;
    });
  }, [checked, template]);

  return (
    <TabModal
      obj={updatedTemplate}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      headerText={t('Dedicated resources')}
      isDisabled={!nodesLoaded}
    >
      <Form>
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
                  <Link
                    to={`/search?kind=${NodeModel.kind}&q=${encodeURIComponent(cpuManagerLabel)}`}
                    target="_blank"
                  >
                    {cpuManagerLabel}
                  </Link>
                </Label>
              </>
            }
          />
        </FormGroup>
        <FormGroup fieldId="dedicated-resources-node">
          {nodesLoaded ? (
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
            <Loading />
          )}
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default DedicatedResourcesModal;
