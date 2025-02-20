import React, { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import './VMsByNamespacePopover.scss';

type VMsByNamespaceListProps = {
  vmsByNamespace: { [p: string]: string[] };
};

const VMsByNamespacePopover: FC<VMsByNamespaceListProps> = ({ vmsByNamespace }) => (
  <div className="vm-by-namespace-popover">
    <Stack>
      {Object.keys(vmsByNamespace)
        ?.sort()
        ?.map((namespace, index) => {
          const vmNames = vmsByNamespace?.[namespace];
          return (
            <div className="vm-by-namespace-popover--namespace-group" key={`${namespace}-${index}`}>
              <StackItem>
                <b>{namespace}</b>
              </StackItem>
              {vmNames?.map((vmName, idx) => (
                <StackItem className="vm-by-namespace-popover--vmName" key={`${vmName}-${idx}`}>
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
