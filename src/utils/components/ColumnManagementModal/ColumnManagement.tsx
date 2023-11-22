import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ToolbarGroup, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ColumnsIcon } from '@patternfly/react-icons';

import { ColumnManagementModal } from '../ColumnManagementModal/ColumnManagementModal';
import { useModal } from '../ModalProvider/ModalProvider';

type ColumnManagementProps = {
  columnLayout: ColumnLayout;
  hideColumnManagement?: boolean;
};

const ColumnManagement: FC<ColumnManagementProps> = ({ columnLayout, hideColumnManagement }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  if (isEmpty(columnLayout) || !columnLayout?.id || hideColumnManagement) {
    return null;
  }

  return (
    <ToolbarGroup>
      <ToolbarItem>
        <Tooltip content={t('Manage columns')} trigger="mouseenter">
          <Button
            onClick={() =>
              createModal((props) => (
                <ColumnManagementModal {...props} columnLayout={columnLayout} />
              ))
            }
            aria-label={t('Column management')}
            data-test="manage-columns"
            variant="plain"
          >
            <ColumnsIcon />
          </Button>
        </Tooltip>
      </ToolbarItem>
    </ToolbarGroup>
  );
};

export default ColumnManagement;
