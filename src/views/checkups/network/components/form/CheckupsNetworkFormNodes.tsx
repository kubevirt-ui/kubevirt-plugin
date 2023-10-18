import React, { ChangeEvent, Dispatch, MouseEvent, SetStateAction, useMemo, useState } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Flex,
  FormGroup,
  Popover,
  PopoverPosition,
  Select,
  SelectOption,
  SelectVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { V1Node } from '../../utils/types';

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
  const [isNodeSourceOpen, setIsNodeSourceOpen] = useState<boolean>(false);
  const [isNodeTargetOpen, setIsNodeTargetOpen] = useState<boolean>(false);

  const [nodes] = useK8sWatchResource<V1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const nodesDropdownItems = useMemo(
    () =>
      nodes?.map((node) => <SelectOption key={node?.metadata?.uid} value={node?.metadata?.name} />),
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
          onChange={(checked) => setIsNodesChecked(checked)}
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
              <Select
                onSelect={(_: ChangeEvent | MouseEvent, value: string) => {
                  setNodeSource(value);
                  setIsNodeSourceOpen(false);
                }}
                isOpen={isNodeSourceOpen}
                onToggle={(value) => setIsNodeSourceOpen(value)}
                placeholderText="Select source node"
                selections={nodeSource}
                variant={SelectVariant.typeahead}
              >
                {nodesDropdownItems}
              </Select>
            </FormGroup>
          </StackItem>
          <StackItem>
            <FormGroup fieldId="target-nodes" isRequired label={t('Target node')}>
              <Select
                onSelect={(_: ChangeEvent | MouseEvent, value: string) => {
                  setNodeTarget(value);
                  setIsNodeTargetOpen(false);
                }}
                isOpen={isNodeTargetOpen}
                onToggle={(value) => setIsNodeTargetOpen(value)}
                placeholderText="Select target node"
                selections={nodeTarget}
                variant={SelectVariant.typeahead}
              >
                {nodesDropdownItems}
              </Select>
            </FormGroup>
          </StackItem>
        </Stack>
      )}
    </>
  );
};

export default CheckupsNetworkFormNodes;
