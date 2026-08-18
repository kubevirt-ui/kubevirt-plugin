import React, { type FC } from 'react';

import { universalComparator } from '@kubevirt-utils/utils/sortingUtils';
import { Stack, StackItem } from '@patternfly/react-core';

import './VMsByNamespacePopover.scss';

type VMsByNamespaceListProps = {
  vmsByNamespace: { [p: string]: string[] };
};

const VMsByNamespacePopover: FC<VMsByNamespaceListProps> = ({ vmsByNamespace }) => (
  <div className="vm-by-namespace-popover">
    <Stack>
      {Object.keys(vmsByNamespace)
        ?.sort((first, second) => universalComparator(first, second))
        ?.map((namespace) => {
          const vmNames = vmsByNamespace?.[namespace];
          return (
            <div className="vm-by-namespace-popover--namespace-group" key={namespace}>
              <StackItem>
                <b>{namespace}</b>
              </StackItem>
              {vmNames?.map((vmName) => (
                <StackItem
                  className="vm-by-namespace-popover--vmName"
                  key={`${namespace}-${vmName}`}
                >
                  {vmName}
                </StackItem>
              ))}
            </div>
          );
        })}
    </Stack>
  </div>
);

export default VMsByNamespacePopover;
