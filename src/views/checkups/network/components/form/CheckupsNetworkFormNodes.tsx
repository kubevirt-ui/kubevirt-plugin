import React, { Dispatch, SetStateAction, useMemo } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Flex,
  FormGroup,
  Popover,
  PopoverPosition,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type CheckupsNetworkFormNodes = {
  isNodesChecked: boolean;
  nodeSource: string;
  nodeTarget: string;
  setIsNodesChecked: Dispatch<SetStateAction<boolean>>;
  setNodeSource: Dispatch<SetStateAction<string>>;
  setNodeTarget: Dispatch<SetStateAction<string>>;
};

const CheckupsNetworkFormNodes = ({
  isNodesChecked,
  nodeSource,
  nodeTarget,
  setIsNodesChecked,
  setNodeSource,
  setNodeTarget,
}) => {
  const { t } = useKubevirtTranslation();

  const [nodes] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const options: EnhancedSelectOptionProps[] = useMemo(
    () =>
      nodes?.map((node) => {
        const name = getName(node);
        return { children: name, value: name };
      }),
    [nodes],
  );

  return (
    <>
      <Flex>
        <Checkbox
          id="nodes"
          isChecked={isNodesChecked}
          label={t('Select nodes')}
          name="nodes"
          onChange={(_event, checked) => setIsNodesChecked(checked)}
        />
        <Popover
          bodyContent={t('If no nodes are specified, random nodes are selected.')}
          position={PopoverPosition.right}
        >
          <Button style={{ paddingLeft: 0 }} variant={ButtonVariant.plain}>
            <HelpIcon />
          </Button>
        </Popover>
      </Flex>
      {isNodesChecked && (
        <Stack hasGutter>
          <StackItem>
            <FormGroup fieldId="source-nodes" isRequired label={t('Source node')}>
              <InlineFilterSelect
                options={options}
                selected={nodeSource}
                setSelected={setNodeSource}
                toggleProps={{ placeholder: t('Select source node') }}
              />
            </FormGroup>
          </StackItem>
          <StackItem>
            <FormGroup fieldId="target-nodes" isRequired label={t('Target node')}>
              <InlineFilterSelect
                options={options}
                selected={nodeTarget}
                setSelected={setNodeTarget}
                toggleProps={{ placeholder: t('Select target node') }}
              />
            </FormGroup>
          </StackItem>
        </Stack>
      )}
    </>
  );
};

export default CheckupsNetworkFormNodes;
