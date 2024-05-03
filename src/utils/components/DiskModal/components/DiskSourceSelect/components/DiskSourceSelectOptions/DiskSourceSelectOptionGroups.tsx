import React, { FC, useMemo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Divider, SelectGroup } from '@patternfly/react-core';

import { getDiskSourceOptionGroups } from '../../utils/utils';

import DiskSourceSelectOptions from './DiskSourceSelectOptions';

type DiskSourceSelectOptionGroupsProps = {
  isEditingCreatedDisk?: boolean;
  isTemplate?: boolean;
  isVMRunning: boolean;
};

const DiskSourceSelectOptionGroups: FC<DiskSourceSelectOptionGroupsProps> = ({
  isEditingCreatedDisk,
  isTemplate,
  isVMRunning,
}) => {
  const optionGroups = useMemo(() => getDiskSourceOptionGroups(isTemplate), [isTemplate]);
  return (
    <>
      {optionGroups.map((option, index) => {
        const { groupLabel, items } = option;
        const isLast = index === optionGroups.length - 1;

        const children = (
          <DiskSourceSelectOptions
            isEditingCreatedDisk={isEditingCreatedDisk}
            isTemplate={isTemplate}
            isVMRunning={isVMRunning}
            items={items}
          />
        );

        if (isEmpty(groupLabel)) {
          return (
            <>
              {children}
              {!isLast && <Divider />}
            </>
          );
        }

        return (
          <>
            <SelectGroup label={groupLabel}>{children}</SelectGroup>
            {!isLast && <Divider />}
          </>
        );
      })}
    </>
  );
};

export default DiskSourceSelectOptionGroups;
