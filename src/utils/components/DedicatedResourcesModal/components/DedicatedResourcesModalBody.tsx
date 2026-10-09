import { type FC, useMemo } from 'react';
import { Link } from 'react-router';

import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { getName, getUID } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
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

import { cpuManagerLabel, cpuManagerLabelKey, cpuManagerLabelValue } from '../utils/constants';
import { getDedicatedResourcesSearchHREF } from '../utils/utils';

type DedicatedResourcesModalBodyProps = {
  checked: boolean;
  cluster?: string;
  loadError: Error | undefined;
  nodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
  onCheckedChange: (checked: boolean) => void;
};

const DedicatedResourcesModalBody: FC<DedicatedResourcesModalBodyProps> = ({
  checked,
  cluster,
  loadError,
  nodes,
  nodesLoaded,
  onCheckedChange,
}) => {
  const { t } = useKubevirtTranslation();

  const { hasNodes, qualifiedNodes } = useMemo(() => {
    const filteredNodes = nodes?.filter(
      (node) => node?.metadata?.labels?.[cpuManagerLabelKey] === cpuManagerLabelValue,
    );
    return {
      hasNodes: !!filteredNodes?.length,
      qualifiedNodes: filteredNodes,
    };
  }, [nodes]);

  return (
    <>
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
          onChange={(_event, val) => onCheckedChange(val)}
        />
      </FormGroup>
      <FormGroup fieldId="dedicated-resources-node">
        {!isEmpty(nodes) ? (
          <Alert
            isInline
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
                <Button
                  isInline
                  onClick={() => onCheckedChange(false)}
                  variant={ButtonVariant.link}
                >
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
    </>
  );
};

export default DedicatedResourcesModalBody;
