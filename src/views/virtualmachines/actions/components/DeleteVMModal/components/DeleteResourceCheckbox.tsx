import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, Flex, FlexItem, Label, StackItem, Tooltip } from '@patternfly/react-core';

import { getResourceGroupVersionKind } from '../utils/helpers';

type DeleteResourceCheckboxProps = {
  isShareable?: boolean;
  onToggle: () => void;
  resource: K8sResourceCommon;
  willDelete: boolean;
};

const DeleteResourceCheckbox: FCC<DeleteResourceCheckboxProps> = ({
  isShareable,
  onToggle,
  resource,
  willDelete,
}) => {
  const { t } = useKubevirtTranslation();
  const resourceName = getName(resource);

  return (
    <StackItem>
      <Checkbox
        label={
          <Flex
            alignItems={{ default: 'alignItemsFlexStart' }}
            flexWrap={{ default: 'nowrap' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FlexItem>
              <ResourceIcon groupVersionKind={getResourceGroupVersionKind(resource)} />
            </FlexItem>
            <FlexItem>{resourceName}</FlexItem>
            {isShareable && (
              <FlexItem>
                <Tooltip
                  content={t(
                    'This disk is shared. We recommend keeping it unless you are sure no other VMs need this data.',
                  )}
                >
                  <span tabIndex={0}>
                    <Label color="grey" isCompact variant="outline">
                      {t('Shareable')}
                    </Label>
                  </span>
                </Tooltip>
              </FlexItem>
            )}
          </Flex>
        }
        id={`${resource.kind}-${resourceName}`}
        isChecked={willDelete}
        onChange={onToggle}
      />
    </StackItem>
  );
};

export default DeleteResourceCheckbox;
